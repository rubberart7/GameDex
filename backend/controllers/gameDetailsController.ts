// controllers/gameDetailsController.ts
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;

export const getGameDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id;

    // --- 1. Fetch primary game details ---
    const gameDetailsResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
      params: { key: gamesApiKey }
    });
    const gameData = gameDetailsResponse.data; // This will contain background_image, description, etc.

    // --- 2. Fetch game screenshots ---
    // Make a separate request to the screenshots endpoint
    try {
      const screenshotsResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}/screenshots`, {
        params: { key: gamesApiKey }
      });
      // Attach the results (array of screenshots) to your gameData object
      gameData.screenshots = screenshotsResponse.data.results;

      // Optional: You can also fetch trailers if you want to include them
      // For trailers, the endpoint is `https://api.rawg.io/api/games/${gameId}/movies`
      // and you'd add similar logic to fetch and attach it to gameData.
      // Example for trailers (add if needed):
      // const moviesResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}/movies`, {
      //   params: { key: gamesApiKey }
      // });
      // gameData.movies = moviesResponse.data.results;


    } catch (screenshotError: any) {
      // It's good to log this but not necessarily return an error to the user
      // if only screenshots fail. The main game details are usually more critical.
      
      gameData.screenshots = []; // Ensure 'screenshots' property exists, even if empty
    }


    // --- 3. Send the combined data back to the frontend ---
    res.status(200).json(gameData);

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