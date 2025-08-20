import { Request, Response, NextFunction } from 'express';
import prisma from '../server';
import dotenv from 'dotenv';

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

export const getGamesLibraryFromDB = async (userId: number) => {
    const libraryItems = await prisma.userGameLibrary.findMany({
        where: {
            userId: userId,
        },
        include: {
            game: {
                include: {
                    genres: true 
                }
            }
        },
        orderBy: {
            addedAt: 'desc', 
        },
    });
    return libraryItems;
};

export const getUserLibrary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
            return;
        }
        const userId = req.user.userId; 

        const library = await getGamesLibraryFromDB(userId);

        if (library.length === 0) {
            res.status(200).json({ message: 'Your library is empty.', library: [] });
            return;
        }

        res.status(200).json({ message: 'Games in library retrieved successfully.', library: library });
        return;

    } catch (error) {
        
        res.status(500).json({ message: "Games from the library could not be retrieved."});
        return;
    }
};