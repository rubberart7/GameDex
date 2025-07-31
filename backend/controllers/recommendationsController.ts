// backend/controllers/recommendationsController.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';
import { getGamesLibraryFromDB } from './getGameLibraryController';
import { getWishlistFromDB } from './getWishListController';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai'; // NEW: Import Gemini SDK
import axios from 'axios'; 

dotenv.config();

const prisma = new PrismaClient();
const RAWG_API_KEY = process.env.RAWG_API_KEY; // Your existing RAWG API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // NEW: Your Gemini AI API key

interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

// Helper interface for lean Game data we get from our DB
interface LocalGameData {
  id: number;
  rawgId: number;
  name: string;
  background_image: string | null; // Correctly matches 'String?' in Prisma
  rating: number | null;         // Correctly matches 'Float?' in Prisma
  released: string | null;       // Correctly matches 'String?' in Prisma
}

// Helper interface for items returned by getGamesLibraryFromDB or getWishlistFromDB
interface UserCollectionItem {
    id: number;
    gameId: number;
    game: LocalGameData;
    status?: string;
}

// NEW: Interface for the AI's expected recommendation output
interface AiRecommendation {
    game_name: string;
    reason: string;
}

export const getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
      return;
    }
    const userId = req.user.userId;

    // 1. Fetch User's Library and Wishlist (Part 1: Data Preparation)
    const [ownedGames, wishedGames] = await Promise.all([
      getGamesLibraryFromDB(userId) as Promise<UserCollectionItem[]>,
      getWishlistFromDB(userId) as Promise<UserCollectionItem[]>,
    ]);

    const allUserGamesOfInterest = [...ownedGames, ...wishedGames];

    // A. List of game names to exclude from recommendations
    const gameNamesToExclude: string[] = allUserGamesOfInterest.map(item => item.game.name);

    // B. Build a summary of user's taste for the AI prompt
    const userTasteSummaryParts: string[] = [];
    const highlyRatedOwnedGames = allUserGamesOfInterest.filter(item => item.game.rating && item.game.rating >= 3.5);
    const topOwnedGameNames = highlyRatedOwnedGames.map(item => item.game.name).slice(0, 3); // Get names of top 3 highly rated games

    if (topOwnedGameNames.length > 0) {
        userTasteSummaryParts.push(`The user has enjoyed highly-rated games such as: ${topOwnedGameNames.join(', ')}.`);
    } else if (allUserGamesOfInterest.length > 0) {
        userTasteSummaryParts.push(`The user has games like: ${allUserGamesOfInterest.map(item => item.game.name).slice(0, 5).join(', ')}.`);
    }

    if (userTasteSummaryParts.length === 0) {
        userTasteSummaryParts.push('The user has an empty library and wishlist. Please suggest popular and critically acclaimed games across diverse genres.');
    } else {
        userTasteSummaryParts.push('Suggest 3-5 new games the user might enjoy based on these preferences.');
    }

    const compiledUserTaste = userTasteSummaryParts.join(' ');


    // 2. Prompt Engineering (Part 2: Crafting the AI Query)
    if (!GEMINI_API_KEY) {
        res.status(500).json({ message: 'Server configuration error: Gemini AI API Key is missing.', type: 'Error' });
        return;
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // Use the text-generation model

    const prompt = `
      You are a highly knowledgeable video game recommender AI.
      ${compiledUserTaste}
      Do NOT recommend any of these games, as the user already knows them: ${gameNamesToExclude.join(', ')}.
      For each recommendation, explain briefly why it matches their preferences (e.g., similar genre, gameplay loop, theme, or developer).
      Ensure all recommended games are real, existing titles.
      Format your response strictly as a JSON array of objects. Each object must have "game_name" (string) and "reason" (string) properties.
      Example: [{"game_name": "Game Title", "reason": "Reason for recommendation"}, ...]
      Strictly only output the JSON array. Do not include any other text or formatting.
    `;

    let aiRecommendationsText: string;
    try {
        const result = await model.generateContent(prompt);
        aiRecommendationsText = result.response.text();
    } catch (aiError: any) {
        console.error('Error calling Gemini AI API:', aiError);
        res.status(500).json({ message: 'AI recommendation service is currently unavailable.', type: 'Error' });
        return;
    }

    // 3. Parsing AI Response & Validation (Part 3: Backend Verification)
    let aiRecommendations: AiRecommendation[];
    try {
        // Attempt to parse the AI's response as JSON
        // Some LLMs might wrap JSON in markdown, e.g., ```json\n{...}\n```
        const cleanedText = aiRecommendationsText.replace(/```json\n|\n```/g, '').trim();
        aiRecommendations = JSON.parse(cleanedText);

        // Basic validation: ensure it's an array and has expected properties
        if (!Array.isArray(aiRecommendations) || aiRecommendations.some(r => !r.game_name || !r.reason)) {
            throw new Error('AI response format invalid.');
        }

    } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        res.status(500).json({ message: 'Could not process AI recommendations (invalid format).', type: 'Error' });
        return;
    }

    // Now, verify each AI recommendation against RAWG or local cache
    const validatedRecommendations: LocalGameData[] = [];
    const gamesAlreadyRecommended = new Set<string>(); // To prevent duplicates from AI

    for (const aiRec of aiRecommendations) {
        // Skip if AI recommended a game already in user's collection (double-check)
        if (gameNamesToExclude.includes(aiRec.game_name) || gamesAlreadyRecommended.has(aiRec.game_name)) {
            continue;
        }

        let verifiedGame: LocalGameData | null = null;

        // Try to find in local cache first
        verifiedGame = await prisma.game.findFirst({
            where: {
                name: aiRec.game_name,
            },
            // Select only fields from your lean Game model
            select: { id: true, rawgId: true, name: true, background_image: true, rating: true, released: true }
        });

        // If not in local cache, try to find on RAWG
        if (!verifiedGame && RAWG_API_KEY) {
            try {
                const rawgSearchResponse = await axios.get(`https://api.rawg.io/api/games?search=${encodeURIComponent(aiRec.game_name)}&key=${RAWG_API_KEY}`);
                const rawgSearchResults = rawgSearchResponse.data.results;

                if (rawgSearchResults && rawgSearchResults.length > 0) {
                    const bestMatch = rawgSearchResults[0]; // Take the first/best match
                    // If you want to store this newly found game in your local cache for future use:
                    verifiedGame = await prisma.game.create({
                        data: {
                            rawgId: bestMatch.id,
                            name: bestMatch.name,
                            background_image: bestMatch.background_image || null,
                            rating: bestMatch.rating || null,
                            released: bestMatch.released || null,
                        },
                    });
                }
            } catch (rawgSearchError) {
                console.warn(`Could not verify game "${aiRec.game_name}" against RAWG:`, rawgSearchError);
            }
        }

        if (verifiedGame) {
            // Add the AI's reason to the verified game object for frontend display
            (verifiedGame as any).recommendationReason = aiRec.reason; // Type assertion needed for adding new prop
            validatedRecommendations.push(verifiedGame);
            gamesAlreadyRecommended.add(verifiedGame.name);
        }
    }

    // 4. Return Filtered Recommendations (Backend to Frontend)
    if (validatedRecommendations.length > 0) {
      res.status(200).json({
        message: 'AI-powered recommendations generated successfully.',
        recommendations: validatedRecommendations,
        type: 'Success',
      });
    } else {
      res.status(200).json({
        message: 'Could not generate recommendations at this time. Please try again later or add more games to your library/wishlist.',
        recommendations: [],
        type: 'Info',
      });
    }
    return;

  } catch (error) {
    console.error('Unhandled error in getRecommendations controller:', error);
    res.status(500).json({ message: 'An unexpected server error occurred during recommendation generation.', type: 'Error' });
    return;
  }
};