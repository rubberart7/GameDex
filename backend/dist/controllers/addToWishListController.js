"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToWishlist = void 0;
const server_1 = __importDefault(require("../server"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const findOrCreateGame = (rawgId, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let localGame = yield server_1.default.game.findUnique({
        where: { rawgId: rawgId },
        include: {
            genres: true
        }
    });
    if (!localGame) {
        if (!RAWG_API_KEY) {
            res.status(500).json({ message: 'Server configuration error: RAWG API Key is missing.', type: 'Error' });
            return null;
        }
        try {
            const rawgResponse = yield axios_1.default.get(`https://api.rawg.io/api/games/${rawgId}`, {
                params: { key: RAWG_API_KEY },
            });
            const rawgGameData = rawgResponse.data;
            if (!rawgGameData || !rawgGameData.id || !rawgGameData.name) {
                res.status(404).json({ message: 'RAWG game data incomplete or not found for local storage.', type: 'Error' });
                return null;
            }
            localGame = yield server_1.default.game.create({
                data: {
                    rawgId: rawgGameData.id,
                    name: rawgGameData.name,
                    background_image: rawgGameData.background_image || null,
                    rating: rawgGameData.rating || null,
                    released: rawgGameData.released || null,
                    genres: {
                        create: ((_a = rawgGameData.genres) === null || _a === void 0 ? void 0 : _a.map(genre => ({
                            rawgGenreId: genre.id,
                            name: genre.name,
                            slug: genre.slug
                        }))) || []
                    }
                },
                include: {
                    genres: true
                }
            });
        }
        catch (rawgError) {
            if (axios_1.default.isAxiosError(rawgError) && ((_b = rawgError.response) === null || _b === void 0 ? void 0 : _b.status) === 404) {
                res.status(404).json({ message: 'Game not found on RAWG API. Cannot add to wishlist.', type: 'Error' });
                return null;
            }
            res.status(500).json({ message: 'Failed to get game details for local storage.', type: 'Error' });
            return null;
        }
    }
    return localGame;
});
const checkIfGameInWishlist = (userId, gameId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingWishlistItem = yield server_1.default.wishlist.findFirst({
        where: {
            userId: userId,
            gameId: gameId,
        },
    });
    return existingWishlistItem;
});
const createWishlistEntry = (userId, gameId) => __awaiter(void 0, void 0, void 0, function* () {
    const newWishlistItem = yield server_1.default.wishlist.create({
        data: {
            userId: userId,
            gameId: gameId,
        },
        include: {
            game: {
                include: {
                    genres: true
                }
            },
        },
    });
    return newWishlistItem;
});
const addToWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const localGame = yield findOrCreateGame(parsedRawgGameId, res);
        if (!localGame) {
            return;
        }
        const existingWishlistItem = yield checkIfGameInWishlist(userId, localGame.id);
        if (existingWishlistItem) {
            res.status(409).json({ message: 'Game already in your wishlist.', type: 'Info' });
            return;
        }
        const newWishlistItem = yield createWishlistEntry(userId, localGame.id);
        res.status(201).json({ message: 'Game added to wishlist successfully.', item: newWishlistItem, type: 'Success' });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error: could not add game to your wishlist.' });
        return;
    }
});
exports.addToWishlist = addToWishlist;
