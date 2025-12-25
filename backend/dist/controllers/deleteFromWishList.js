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
exports.deleteFromWishlist = void 0;
const server_1 = __importDefault(require("../server"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const deleteWishlistEntry = (userId, gameId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield server_1.default.wishlist.deleteMany({
        where: {
            userId: userId,
            gameId: gameId,
        },
    });
    return result;
});
const deleteFromWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const localGame = yield server_1.default.game.findUnique({
            where: { rawgId: parsedRawgGameId },
        });
        if (!localGame) {
            res.status(200).json({ message: 'Game not found in local cache or your wishlist. Nothing to delete.', count: 0, type: 'Info' });
            return;
        }
        const deletionResult = yield deleteWishlistEntry(userId, localGame.id);
        if (deletionResult.count > 0) {
            res.status(200).json({ message: 'Game successfully removed from wishlist.', count: deletionResult.count, type: 'Success' });
        }
        else {
            res.status(200).json({ message: 'Game not found in your wishlist. Nothing to delete.', count: 0, type: 'Info' });
        }
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error: could not delete game from your wishlist.', type: 'Error' });
        return;
    }
});
exports.deleteFromWishlist = deleteFromWishlist;
