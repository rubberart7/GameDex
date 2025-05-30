import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()

const gamesApiKey = process.env.RAWG_API_KEY;
const startDate = '2024-01-01';
const endDate = `2024-06-30`;

export const getGamesData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: gamesApiKey,
                dates: `${startDate},${endDate}`,
                page_size: 5
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        return next(error)
    }
}

