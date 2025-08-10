import { Request, Response, NextFunction } from 'express';
import prisma from '../server'; // Assuming this is your Prisma client instance
import { getGamesLibraryFromDB } from './getGameLibraryController';
import { getWishlistFromDB } from './getWishListController';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { createHash } from 'crypto';

// REMOVE or COMMENT OUT this line as Prisma.JsonArray is not directly exported
// import { Prisma } from '@prisma/client'; // <-- REMOVED/COMMENTED

dotenv.config();

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

interface LocalGameData {
  id: number;
  rawgId: number;
  name: string;
  background_image: string | null;
  rating: number | null;
  released: string | null;
  recommendationReason?: string; // Add this for AI response integration
}

interface UserCollectionItem {
  id: number;
  gameId: number;
  game: LocalGameData;
  status?: string;
}

interface AiRecommendation {
  game_name: string;
  reason: string;
}

const generateCollectionHash = (games: UserCollectionItem[]): string => {
  const sortedRawgIds = games.map(item => item.game.rawgId).sort((a, b) => a - b).join(',');
  const hash = createHash('sha256').update(sortedRawgIds).digest('hex');
  return hash;
};

export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
      return;
    }
    const userId = req.user.userId;

    

    const [ownedGames, wishedGames] = await Promise.all([
      getGamesLibraryFromDB(userId) as Promise<UserCollectionItem[]>,
      getWishlistFromDB(userId) as Promise<UserCollectionItem[]>,
    ]);

    const allUserGamesOfInterest = [...ownedGames, ...wishedGames];

    const currentCollectionHash = generateCollectionHash(allUserGamesOfInterest);

    const cachedEntry = await prisma.userRecommendationCache.findUnique({
      where: { userId: userId },
      select: { recommendations: true, collectionHash: true },
    });

    if (cachedEntry && cachedEntry.collectionHash === currentCollectionHash) {
      

      // --- FIX for read-side (image_7e4205.png) ---
      // Instead of casting to Prisma.JsonArray, cast to 'any' first
      // then to LocalGameData[]. This works around the import issue.
      const recommendationsFromCache: any = cachedEntry.recommendations;

      // Crucial runtime check: ensure the data is actually an array
      if (Array.isArray(recommendationsFromCache)) {
          res.status(200).json({
              message: 'AI-powered recommendations retrieved from cache.',
              // Final cast to your interface, now safer due to the Array.isArray check
              recommendations: recommendationsFromCache as LocalGameData[],
              type: 'Success',
          });
          return;
      } else {
          console.warn("Cached recommendations found but are not in expected array format, regenerating.");
          
          // Fall through to regeneration logic if cached data is malformed
      }
      // --- END FIX for read-side ---
    }

    

    const gameNamesToExclude: string[] = allUserGamesOfInterest.map(item => item.game.name);

    const userTasteSummaryParts: string[] = [];
    const highlyRatedOwnedGames = allUserGamesOfInterest.filter(item => item.game.rating && item.game.rating >= 4.0);
    const topOwnedGameNames = highlyRatedOwnedGames.map(item => item.game.name).slice(0, 3);

    if (topOwnedGameNames.length > 0) {
      userTasteSummaryParts.push(`The user has enjoyed highly-rated games such as: ${topOwnedGameNames.join(', ')}.`);
    } else {
      userTasteSummaryParts.push(`The user has games like: ${allUserGamesOfInterest.map(item => item.game.name).slice(0, 5).join(', ')}.`);
    }
    userTasteSummaryParts.push('Suggest 12 new games the user might enjoy based on these preferences.');

    const compiledUserTaste = userTasteSummaryParts.join(' ');

    if (!GEMINI_API_KEY) {
      res.status(500).json({ message: 'Server configuration error: Gemini AI API Key is missing.', type: 'Error' });
      return;
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a highly knowledgeable video game recommender AI.
      ${compiledUserTaste}
      Do NOT recommend any of these games, as the user already knows them: ${gameNamesToExclude.join(', ')}.
      For each recommendation, explain briefly why it matches their preferences (e.g., similar genre, gameplay loop, theme, or developer).
      Ensure all recommended games are real, existing titles.
      Format your response strictly as a JSON array of 12 objects. Each object must have "game_name" (string) and "reason" (string) properties.
      Example: [{"game_name": "Game Title", "reason": "Reason for recommendation"}, ...]
      Strictly only output the JSON array. Do not include any other text or formatting.
    `;

    let aiRecommendationsText: string;
    try {
      const result = await model.generateContent(prompt);
      aiRecommendationsText = result.response.text();
    } catch (aiError: any) {
      
      res.status(500).json({ message: 'AI recommendation service is currently unavailable.', type: 'Error' });
      return;
    }

    let aiRecommendations: AiRecommendation[];
    try {
      const cleanedText = aiRecommendationsText.replace(/```json\n|\n```/g, '').trim();
      aiRecommendations = JSON.parse(cleanedText);

      if (!Array.isArray(aiRecommendations) || aiRecommendations.some(r => !r.game_name || !r.reason)) {
        throw new Error('AI response format invalid.');
      }
    } catch (parseError) {
      
      res.status(500).json({ message: 'Could not process AI recommendations (invalid format).', type: 'Error' });
      return;
    }

    const validatedRecommendations: LocalGameData[] = [];
    const gamesAlreadyRecommended = new Set<string>();
    const rawgIdsAlreadyProcessed = new Set<number>();

    for (const aiRec of aiRecommendations) {
      if (gameNamesToExclude.includes(aiRec.game_name) || gamesAlreadyRecommended.has(aiRec.game_name)) {
        continue;
      }

      let verifiedGame: LocalGameData | null = null;
      let rawgIdFromSearch: number | null = null;

      verifiedGame = await prisma.game.findFirst({
        where: { name: aiRec.game_name },
        select: { id: true, rawgId: true, name: true, background_image: true, rating: true, released: true }
      });

      if (!verifiedGame && RAWG_API_KEY) {
        try {
          const rawgSearchResponse = await axios.get(`https://api.rawg.io/api/games?search=${encodeURIComponent(aiRec.game_name)}&key=${RAWG_API_KEY}`);
          const rawgSearchResults = rawgSearchResponse.data.results;

          if (rawgSearchResults && rawgSearchResults.length > 0) {
            const bestMatchFromRawgSearch = rawgSearchResults[0];
            rawgIdFromSearch = bestMatchFromRawgSearch.id;

            if (rawgIdFromSearch == null) {
              continue;
            }

            if (rawgIdsAlreadyProcessed.has(rawgIdFromSearch)) {
              continue;
            }

            const existingGameByRawgId = await prisma.game.findUnique({
              where: { rawgId: rawgIdFromSearch },
              select: { id: true, rawgId: true, name: true, background_image: true, rating: true, released: true }
            });

            if (existingGameByRawgId) {
              verifiedGame = existingGameByRawgId;

              if (verifiedGame && verifiedGame.name !== bestMatchFromRawgSearch.name) {
                await prisma.game.update({
                  where: { id: verifiedGame.id },
                  data: { name: bestMatchFromRawgSearch.name }
                });
                verifiedGame = {
                  ...verifiedGame,
                  name: bestMatchFromRawgSearch.name
                };
              }
            } else {
              verifiedGame = await prisma.game.create({
                data: {
                  rawgId: bestMatchFromRawgSearch.id,
                  name: bestMatchFromRawgSearch.name,
                  background_image: bestMatchFromRawgSearch.background_image || null,
                  rating: bestMatchFromRawgSearch.rating || null,
                  released: bestMatchFromRawgSearch.released || null,
                },
              });
            }

            if (rawgIdFromSearch) {
              rawgIdsAlreadyProcessed.add(rawgIdFromSearch);
            }
          }
        } catch (rawgSearchError) {
          
        }
      }

      if (verifiedGame) {
        const isAlreadyInUserCollection = allUserGamesOfInterest.some(item => item.game.rawgId === verifiedGame!.rawgId);
        if (isAlreadyInUserCollection) {
          continue;
        }

        (verifiedGame as any).recommendationReason = aiRec.reason;
        validatedRecommendations.push(verifiedGame);
        gamesAlreadyRecommended.add(verifiedGame.name);
      }
    }

    if (validatedRecommendations.length > 0) {
      // --- FIX for write-side (related to InputJsonValue not found if Prisma import removed) ---
      // Use 'any' here as well, because `Prisma.InputJsonValue` also depends on `import { Prisma } from '@prisma/client';`
      await prisma.userRecommendationCache.upsert({
        where: { userId: userId },
        update: {
          recommendations: validatedRecommendations as any, // Cast to any
          collectionHash: currentCollectionHash,
          cachedAt: new Date(),
        },
        create: {
          userId: userId,
          recommendations: validatedRecommendations as any, // Cast to any
          collectionHash: currentCollectionHash,
          cachedAt: new Date(),
        },
      });
      // --- END FIX for write-side ---

      res.status(200).json({
        message: 'AI-powered recommendations generated and cached successfully.',
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
    
    res.status(500).json({ message: 'An unexpected server error occurred during recommendation generation.', type: 'Error' });
    return;
  }
};