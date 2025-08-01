import { Request, Response, NextFunction } from 'express';
import prisma from '../server';
import dotenv from 'dotenv'; 
dotenv.config();


interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

const deleteLibraryEntry = async (userId: number, gameId: number) => {
    const result = await prisma.userGameLibrary.deleteMany({
        where: {
            userId: userId,
            gameId: gameId,
        },
    });
    return result;
};


export const deleteFromLibrary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
            return;
        }
        const userId = req.user.userId;
        console.log("Got the user id");

        const { gameId: rawgGameId } = req.body; 
        console.log("Got the gameID information")

        if (!rawgGameId) {
            res.status(400).json({ message: 'Game ID (rawgId) is required in the request body.', type: 'Error' });
            return;
        }

        const parsedRawgGameId = typeof rawgGameId === 'string' ? parseInt(rawgGameId, 10) : rawgGameId;
        if (isNaN(parsedRawgGameId)) {
            res.status(400).json({ message: 'Invalid Game ID provided.', type: 'Error' });
            return;
        }

        const localGame = await prisma.game.findUnique({ 
            where: { rawgId: parsedRawgGameId },
        });

        if (!localGame) {
            
            res.status(200).json({ message: 'Game not found in local cache or your library. Nothing to delete.', count: 0, type: 'Info' });
            return;
        }

        const deletionResult = await deleteLibraryEntry(userId, localGame.id);

        if (deletionResult.count > 0) {
            res.status(200).json({ message: 'Game successfully removed from library.', count: deletionResult.count, type: 'Success' });
        } else {
            res.status(200).json({ message: 'Game not found in your library. Nothing to delete.', count: 0, type: 'Info' });
        }
        return;

    } catch (error) {
        console.error("Error deleting game from library:", error);
        res.status(500).json({ message: 'Error: could not delete game from your library.', type: 'Error' });
        return;
    }
};