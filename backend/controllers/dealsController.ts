import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const cheapSharkDeals: string = "https://www.cheapshark.com/api/1.0/deals?&upperPrice=15";

export const getGenDeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await axios.get(cheapSharkDeals, {
            params : {
                pageSize: 10,
                sortBy: "Deal Rating"
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        next(error)
    }
}