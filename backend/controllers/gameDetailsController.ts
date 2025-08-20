import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;

export const getGameDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id;

    
    const gameDetailsResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
      params: { key: gamesApiKey }
    });
    const gameData = gameDetailsResponse.data; 

    
    try {
      const screenshotsResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}/screenshots`, {
        params: { key: gamesApiKey }
      });
      gameData.screenshots = screenshotsResponse.data.results;

      


    } catch (screenshotError: any) {
      
      
      gameData.screenshots = []; 
    }


    
    res.status(200).json(gameData);
    return;

  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        res.status(404).json({ message: "Game not found from RAWG API." });
        return;
      }
      res.status(error.response.status).json({ message: "Failed to fetch game details from external API." });
      return;
    }
    res.status(error.response.status).json({ message: "Failed to fetch game details from the API." });
  }
};