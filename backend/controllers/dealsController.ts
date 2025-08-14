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
            }
        });

        
        res.status(200).json(response.data);
        return;

    } catch (error) {
        
        res.status(500).json({ message: "Failed to fetch deals data." });
        return;

    }
}

export const getStoresData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await axios.get(cheapSharkStoresBaseUrl);
        res.status(200).json(response.data);
        return;
    } catch (error) {
        
        res.status(500).json({ message: "Failed to fetch store data." });
        return;
    }
}