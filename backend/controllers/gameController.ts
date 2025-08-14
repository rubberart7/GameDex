
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const gamesApiKey = process.env.RAWG_API_KEY;
const startDate = '2022-01-01';
const endDate = `2025-01-08`;

const MAX_GAME_PAGES = 3; 

export const getGamesData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;

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
            }
        });
        res.status(200).json(response.data);
        return;

    } catch (error) {
        
        res.status(500).json({ message: "Failed to fetch games data." });
        return;
    }
}