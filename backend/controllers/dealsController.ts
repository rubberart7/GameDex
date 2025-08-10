import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const cheapSharkDealsBaseUrl: string = "https://www.cheapshark.com/api/1.0/deals";
const cheapSharkStoresBaseUrl: string = "https://www.cheapshark.com/api/1.0/stores";


const MAX_DEAL_PAGES = 5;

export const getGenDeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Read the 'page' query parameter (CheapShark uses 'pageNumber')
        // Default to 0 as CheapShark is 0-indexed for pageNumber
        const pageNumber = parseInt(req.query.page as string) || 0;
        const pageSize = 60; // Keep this consistent with your frontend's ITEMS_PER_PAGE

        // --- NEW LOGIC: Enforce maximum page limit ---
        if (pageNumber >= MAX_DEAL_PAGES) {
            res.status(200).json([]); // Return an empty array or a specific message
            return;
        }
        // --- END NEW LOGIC ---

        const response = await axios.get(cheapSharkDealsBaseUrl, {
            params: {
                pageNumber: pageNumber, // Pass the page number to CheapShark
                pageSize: pageSize,      // Your desired page size
                sortBy: "Deal Rating",   // Your current sort
                upperPrice: 15           // Your current price filter
            }
        });

        // CheapShark API for 'deals' does not return a 'total' count or 'next/previous' links directly.
        // We will pass the data as is. The frontend will infer hasNextPage based on data length.
        res.status(200).json(response.data);
        return;

    } catch (error) {
        
        res.status(500).json({ message: "Failed to fetch deals data." });
        return;

    }
}

// Ensure you also have an endpoint for fetching stores, as used by your frontend
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