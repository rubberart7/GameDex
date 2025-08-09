// ========== ADD TO WISHLIST CONTROLLER ==========
import { Request, Response, NextFunction } from 'express';
import prisma from '../server';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAWG_API_KEY = process.env.RAWG_API_KEY;

interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

interface RawgGameData {
  id: number;
  name: string;
  background_image?: string;
  rating?: number;
  released?: string;
  genres?: RawgGenre[]; // Add genres to the RAWG response interface
}

const findOrCreateGame = async (rawgId: number, res: Response) => {
  let localGame = await prisma.game.findUnique({
    where: { rawgId: rawgId },
    include: {
      genres: true // Include genres when fetching existing games
    }
  });

  if (!localGame) {
    if (!RAWG_API_KEY) {
      res.status(500).json({ message: 'Server configuration error: RAWG API Key is missing.', type: 'Error' });
      return null;
    }

    try {
      const rawgResponse = await axios.get<RawgGameData>(`https://api.rawg.io/api/games/${rawgId}`, {
        params: { key: RAWG_API_KEY },
      });

      const rawgGameData = rawgResponse.data;

      if (!rawgGameData || !rawgGameData.id || !rawgGameData.name) {
        res.status(404).json({ message: 'RAWG game data incomplete or not found for local storage.', type: 'Error' });
        return null;
      }

      // Create the game with genres
      localGame = await prisma.game.create({
        data: {
          rawgId: rawgGameData.id,
          name: rawgGameData.name,
          background_image: rawgGameData.background_image || null,
          rating: rawgGameData.rating || null,
          released: rawgGameData.released || null,
          genres: {
            create: rawgGameData.genres?.map(genre => ({
              rawgGenreId: genre.id,
              name: genre.name,
              slug: genre.slug
            })) || []
          }
        },
        include: {
          genres: true
        }
      });
    } catch (rawgError: any) {
      console.error(rawgError.message);
      if (axios.isAxiosError(rawgError) && rawgError.response?.status === 404) {
        res.status(404).json({ message: 'Game not found on RAWG API. Cannot add to wishlist.', type: 'Error' });
        return null;
      }
      res.status(500).json({ message: 'Failed to get game details for local storage.', type: 'Error' });
      return null;
    }
  }
  return localGame;
};

const checkIfGameInWishlist = async (userId: number, gameId: number) => {
  const existingWishlistItem = await prisma.wishlist.findFirst({
    where: {
      userId: userId,
      gameId: gameId,
    },
  });
  return existingWishlistItem;
};

const createWishlistEntry = async (userId: number, gameId: number) => {
  const newWishlistItem = await prisma.wishlist.create({
    data: {
      userId: userId,
      gameId: gameId,
    },
    include: {
      game: {
        include: {
          genres: true // Include genres in the response
        }
      },
    },
  });
  return newWishlistItem;
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    if (typeof rawgGameId !== 'number' && typeof rawgGameId !== 'string') {
      res.status(400).json({ message: 'Game ID must be a number or string.', type: 'Error' });
      return;
    }
    const parsedRawgGameId = typeof rawgGameId === 'string' ? parseInt(rawgGameId, 10) : rawgGameId;
    if (isNaN(parsedRawgGameId)) {
      res.status(400).json({ message: 'Invalid Game ID provided.', type: 'Error' });
      return;
    }

    const localGame = await findOrCreateGame(parsedRawgGameId, res);
    if (!localGame) {
      return;
    }

    const existingWishlistItem = await checkIfGameInWishlist(userId, localGame.id);

    if (existingWishlistItem) {
      res.status(409).json({ message: 'Game already in your wishlist.', type: 'Info' });
      return;
    }

    const newWishlistItem = await createWishlistEntry(userId, localGame.id);

    res.status(201).json({ message: 'Game added to wishlist successfully.', item: newWishlistItem, type: 'Success' });
    return;

  } catch (error) {
    res.status(500).json({ message: 'Error: could not add game to your wishlist.' });
    return;
  }
};

