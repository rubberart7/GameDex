import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config()

const cheapSharkStores: string = "https://www.cheapshark.com/api/1.0/stores";

export const getStores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await axios.get(cheapSharkStores, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });
        res.status(200).json(response.data);
        return;
    } catch (error: any) {
        console.error("REAL AXIOS ERROR:", error.message);
        if (error.response) {
             console.error("API RESPONSE DATA:", error.response.data);
        }
        
        res.status(500).json({message : "Could not retrieve stores information.", type: "Error"});
    }
}