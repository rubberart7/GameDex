import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;
const startDate = '2022-01-01';
const endDate = `2025-01-08`; // Consider using dynamic dates if this is for current games

const MAX_GAME_PAGES = 3; // Set this to your desired limit

export const getGamesData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;

        if (page > MAX_GAME_PAGES) {
            console.log(`Frontend requested page ${page} for games, but maximum allowed pages is ${MAX_GAME_PAGES}. Returning empty data.`);
            
            // Construct the 'previous' URL to point to the MAX_GAME_PAGES
            const previousPageUrl = `http://localhost:4000/api/games?page=${MAX_GAME_PAGES}`; // Assuming your frontend URL structure
            // You might need to make this more dynamic if your API base URL or query params vary.
            // For example:
            // const previousPageUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${MAX_GAME_PAGES}`;

            res.status(200).json({
                count: 0, // Indicate no results
                next: null,
                previous: previousPageUrl, // <-- Changed this!
                results: []
            });

            return;
        }

        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: gamesApiKey,
                dates: `${startDate},${endDate}`,
                page_size: 100,
                page: page,
            }
        });
        res.status(200).json(response.data);
        return;

    } catch (error) {
        console.error("Error fetching games from RAWG API:", error);
        res.status(500).json({ message: "Failed to fetch games data." });
        return;
    }
}