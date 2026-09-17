import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../server'; 

dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;
const startDate = '2022-01-01';
const endDate = `2026-09-08`;

const MAX_GAME_PAGES = 25; 

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
            const pageSize = 100;
            const skipAmount = (page - 1) * pageSize;

            const [localGames, totalLocalGames] = await Promise.all([
                prisma.game.findMany({
                    skip: skipAmount,
                    take: pageSize,
                    orderBy: { rating: 'desc' }, 
                    include: { genres: true } 
                }),
                prisma.game.count()
            ]);

            const fallbackResults = localGames.map(game => {
                let formattedParentPlatforms: any[] = [];
                if (game.platforms) {
                    formattedParentPlatforms = game.platforms.split(', ').map((platformName, index) => ({
                        platform: { 
                            id: index, 
                            name: platformName,
                            slug: platformName.toLowerCase().replace(/\s+/g, '-')
                        }
                    }));
                }

                return {
                    id: game.rawgId, 
                    name: game.name,
                    background_image: game.background_image,
                    rating: game.rating,
                    released: game.released,
                    genres: game.genres || [],
                    parent_platforms: formattedParentPlatforms 
                };
            });

            
            const nextPageUrl = (skipAmount + pageSize < totalLocalGames)
                ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page + 1}`
                : null;

            const previousPageUrl = page > 1
                ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}`
                : null;

            console.log(`Fallback successful! Served ${localGames.length} games from local database.`);

            res.status(200).json({
                count: totalLocalGames,
                next: nextPageUrl,
                previous: previousPageUrl,
                results: fallbackResults,
                isDatabaseFallback: true 
            });
            return;

        } catch (dbError) {
            console.error("Database fallback also failed.", dbError);
        }

        res.status(500).json({ message: "Failed to fetch games data." });
        return;
    }
}