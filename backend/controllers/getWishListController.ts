import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}


const getWishlistFromDB = async (userId: number) => {
    const wishlistItems = await prisma.wishlist.findMany({ 
        where: {
            userId: userId,
        },
        include: {
            game: true, 
        },
        orderBy: {
            addedAt: 'desc', 
        },
    });
    return wishlistItems;
};


export const getUserWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
            return;
        }
        const userId = req.user.userId; 

        const wishlist = await getWishlistFromDB(userId); 

        if (wishlist.length === 0) {
            res.status(200).json({ message: 'Your wishlist is empty.', wishlist: [] });
            return;
        }

        
        res.status(200).json({ message: 'Games in wishlist retrieved successfully.', wishlist: wishlist });
        return;

    } catch (error) {
        console.error("Error fetching user wishlist:", error);
        res.status(500).json({ message: "Games from the wishlist could not be retrieved."})
        return;
    }
};