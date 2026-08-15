import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const cheapSharkDealsBaseUrl: string = "https://www.cheapshark.com/api/1.0/deals";
const cheapSharkStoresBaseUrl: string = "https://www.cheapshark.com/api/1.0/stores";


const MAX_DEAL_PAGES = 5;

export const getGenDeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pageNumber = parseInt(req.query.page as string) || 0;
        const pageSize = 60; 

        if (pageNumber >= MAX_DEAL_PAGES) {
            res.status(200).json([]); 
            return;
        }
        
        const response = await axios.get(cheapSharkDealsBaseUrl, {
            params: {
                pageNumber: pageNumber, 
                pageSize: pageSize,      
                sortBy: "Deal Rating",   
                upperPrice: 15           
            },

            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        res.status(200).json(response.data);
        return;

    } catch (error: any) {
        console.error("CheapShark API Error:", error.response?.data || error.message);
        
        res.status(500).json({ message: "Failed to fetch deals data." });
        return;
    }
}

export const getStoresData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await axios.get(cheapSharkStoresBaseUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });
        res.status(200).json(response.data);
        return;
    } catch (error: any) {
        console.error("CheapShark Stores API Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch store data." });
        return;
    }
}