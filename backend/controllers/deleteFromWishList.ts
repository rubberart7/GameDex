import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

const deleteWishlistEntry = async (userId: number, gameId: number) => {
  const result = await prisma.wishlist.deleteMany({
    where: {
      userId: userId,
      gameId: gameId,
    },
  });
  return result;
};

export const deleteFromWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
      return;
    }
    const userId = req.user.userId;

    const { gameId: rawgGameId } = req.body;

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
      res.status(200).json({ message: 'Game not found in local cache or your wishlist. Nothing to delete.', count: 0, type: 'Info' });
      return;
    }

    const deletionResult = await deleteWishlistEntry(userId, localGame.id);

    if (deletionResult.count > 0) {
      res.status(200).json({ message: 'Game successfully removed from wishlist.', count: deletionResult.count, type: 'Success' });
    } else {
      res.status(200).json({ message: 'Game not found in your wishlist. Nothing to delete.', count: 0, type: 'Info' });
    }
    return;

  } catch (error) {
    console.error("Error deleting game from wishlist:", error);
    res.status(500).json({ message: 'Error: could not delete game from your wishlist.', type: 'Error' });
    return;
    
  }
};