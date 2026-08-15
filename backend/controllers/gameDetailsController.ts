import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../server'; // Added prisma import for the fallback

dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;

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
    console.error("🚨 RAWG GAME DETAILS API ERROR. Attempting database fallback...");

    try {
      // THE FALLBACK: Search the local PostgreSQL database using the requested rawgId
      const parsedId = parseInt(req.params.id, 10);
      
      if (!isNaN(parsedId)) {
        const localFallbackGame = await prisma.game.findFirst({
          where: { rawgId: parsedId },
          include: { genres: true } 
        });

        if (localFallbackGame) {
          console.log(`🟢 Fallback successful! Served details for ${localFallbackGame.name} from local database.`);
          
          // Mimic the exact JSON structure the Next.js frontend expects from RAWG
          res.status(200).json({
            id: localFallbackGame.rawgId,
            name: localFallbackGame.name,
            background_image: localFallbackGame.background_image,
            rating: localFallbackGame.rating,
            released: localFallbackGame.released,
            genres: localFallbackGame.genres || [],
            screenshots: [], // Return an empty array so map functions don't crash
            description: "<p>Description currently unavailable. The RAWG API is experiencing downtime, so this limited data was loaded from your local GameDex database.</p>",
            description_raw: "Description currently unavailable. The RAWG API is experiencing downtime, so this limited data was loaded from your local GameDex database.",
            isDatabaseFallback: true
          });
          return;
        }
      }
    } catch (dbError) {
      console.error("🚨 Database fallback also failed.", dbError);
    }

    // If completely absent from RAWG and local DB, return standard errors
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