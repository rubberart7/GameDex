import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config()

const cheapSharkStores: string = "https://www.cheapshark.com/api/1.0/stores";

export const getStores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await axios.get(cheapSharkStores);
        res.status(200).json(response.data);
    } catch (error) {
        next(error)
    }
}

