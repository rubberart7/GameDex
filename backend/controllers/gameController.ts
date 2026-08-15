import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../server'; // Added prisma import for the fallback

dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;
const startDate = '2022-01-01';
const endDate = `2025-01-08`;

const MAX_GAME_PAGES = 3; 

export const getGamesData = async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;

    try {
        if (page > MAX_GAME_PAGES) {
            const previousPageUrl = page > 1
                ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}`
                : null; 

            res.status(200).json({
                count: 0, 
                next: null,
                previous: previousPageUrl, 
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
            },
            headers: {
                'User-Agent': 'GameDex/1.0 (contact@example.com)',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });
        res.status(200).json(response.data);
        return;

    } catch (error: any) {
        console.error("🚨 RAWG BROWSE GAMES API ERROR. Attempting database fallback...");

        try {
            // THE FALLBACK: Fetch games from local PostgreSQL database
            const pageSize = 100;
            const skipAmount = (page - 1) * pageSize;

            // Fetch the games and the total count concurrently
            const [localGames, totalLocalGames] = await Promise.all([
                prisma.game.findMany({
                    skip: skipAmount,
                    take: pageSize,
                    orderBy: { rating: 'desc' }, // Show highest rated games first
                    include: { genres: true } 
                }),
                prisma.game.count()
            ]);

            // Map the local database fields to match the RAWG API response structure exactly
            const fallbackResults = localGames.map(game => ({
                id: game.rawgId, // RAWG expects 'id', your DB stores it as 'rawgId'
                name: game.name,
                background_image: game.background_image,
                rating: game.rating,
                released: game.released,
                genres: game.genres || []
            }));

            // Reconstruct the pagination URLs
            const nextPageUrl = (skipAmount + pageSize < totalLocalGames)
                ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page + 1}`
                : null;

            const previousPageUrl = page > 1
                ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}`
                : null;

            console.log(`🟢 Fallback successful! Served ${localGames.length} games from local database.`);

            // Return the structured fallback response
            res.status(200).json({
                count: totalLocalGames,
                next: nextPageUrl,
                previous: previousPageUrl,
                results: fallbackResults,
                isDatabaseFallback: true // Optional flag so frontend knows it's local data
            });
            return;

        } catch (dbError) {
            console.error("🚨 Database fallback also failed.", dbError);
        }

        // If everything completely fails, return standard 500 error
        res.status(500).json({ message: "Failed to fetch games data." });
        return;
    }
}