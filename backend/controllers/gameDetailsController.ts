import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../server'; 
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const getGameDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id;

    // 1. Try fetching the primary game details from RAWG
    const gameDetailsResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
      params: { key: gamesApiKey },
      headers: {
        'User-Agent': 'GameDex/1.0 (contact@example.com)',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    const gameData = gameDetailsResponse.data; 

    // 2. Try fetching screenshots
    try {
      const screenshotsResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}/screenshots`, {
        params: { key: gamesApiKey },
        headers: {
          'User-Agent': 'GameDex/1.0 (contact@example.com)',
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });
      gameData.screenshots = screenshotsResponse.data.results;
    } catch (screenshotError: any) {
      gameData.screenshots = []; 
    }

    res.status(200).json(gameData);
    return;

  } catch (error: any) {
    console.error("🚨 RAWG GAME DETAILS API ERROR. Attempting database fallback & AI augmentation...");

    try {
      const parsedId = parseInt(req.params.id, 10);
      
      if (!isNaN(parsedId)) {
        let localGame = await prisma.game.findFirst({
          where: { rawgId: parsedId },
          include: { genres: true } 
        });

        if (localGame) {
          // If the game exists but is missing description/developer, ask Gemini to fill it in!
          if ((!localGame.description || !localGame.developer) && GEMINI_API_KEY) {
            console.log(`🤖 Using Gemini to generate missing details for ${localGame.name}...`);
            try {
              const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
              const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
              
              const prompt = `
                You are a video game database assistant. Provide missing details for the game "${localGame.name}".
                Return strictly a JSON object with the following keys:
                - "description": An engaging summary of the game (about 2-3 sentences).
                - "developer": The main development studio.
                - "publisher": The primary publisher.
                - "platforms": An array of strings containing at most 3 major platforms this game is on (e.g., ["PC", "PlayStation 5"]).
                Do not include markdown blocks or other text.
              `;

              const result = await model.generateContent(prompt);
              const cleanedText = result.response.text().replace(/```json\n|\n```/g, '').trim();
              const aiData = JSON.parse(cleanedText);

              // Update the database so we never have to ask Gemini for this game again
              localGame = await prisma.game.update({
                where: { id: localGame.id },
                data: {
                  description: aiData.description,
                  developer: aiData.developer,
                  publisher: aiData.publisher,
                  platforms: aiData.platforms.join(', ') // Save as "PC, PlayStation 5"
                },
                include: { genres: true }
              });
            } catch (aiError) {
              console.error("⚠️ Gemini failed to generate fallback data. Proceeding with limited data.");
            }
          }

          // Format the simple comma-separated platforms string into the nested object structure RAWG uses
          let formattedPlatforms: any[] = [];
          if (localGame.platforms) {
            formattedPlatforms = localGame.platforms.split(', ').map(platformName => ({
              platform: { name: platformName }
            }));
          }

          console.log(`🟢 Fallback successful! Served augmented details for ${localGame.name}.`);
          
          res.status(200).json({
            id: localGame.rawgId,
            name: localGame.name,
            background_image: localGame.background_image,
            rating: localGame.rating,
            released: localGame.released,
            genres: localGame.genres || [],
            screenshots: [], 
            
            // Newly populated AI fields!
            description: localGame.description || "Description currently unavailable.",
            description_raw: localGame.description || "Description currently unavailable.",
            developers: localGame.developer ? [{ name: localGame.developer }] : [],
            publishers: localGame.publisher ? [{ name: localGame.publisher }] : [],
            platforms: formattedPlatforms,
            
            isDatabaseFallback: true
          });
          return;
        }
      }
    } catch (dbError) {
      console.error("🚨 Database fallback also failed.", dbError);
    }

    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        res.status(404).json({ message: "Game not found from RAWG API or local database." });
        return;
      }
      res.status(error.response.status).json({ message: "Failed to fetch game details from external API." });
      return;
    }
    
    res.status(500).json({ message: "Failed to fetch game details from the API." });
  }
};