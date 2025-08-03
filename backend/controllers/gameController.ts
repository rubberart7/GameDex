// backend/src/controllers/games.ts

import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;
const startDate = '2022-01-01';
const endDate = `2025-01-08`;

const MAX_GAME_PAGES = 3; // Set this to your desired limit

export const getGamesData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;

        if (page > MAX_GAME_PAGES) {
            console.log(`Frontend requested page ${page} for games, but maximum allowed pages is ${MAX_GAME_PAGES}. Returning empty data.`);

            // Construct the 'previous' URL dynamically for the page *before* the requested one
            // This is cleaner and aligns with how RAWG handles 'previous' links normally
            const previousPageUrl = page > 1
                ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}`
                : null; // If page is 1 or less (shouldn't happen with page > MAX_GAME_PAGES logic, but defensive)

            res.status(200).json({
                count: 0, // Indicate no results
                next: null,
                previous: previousPageUrl, // This will now point to page MAX_GAME_PAGES (e.g., page 3)
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