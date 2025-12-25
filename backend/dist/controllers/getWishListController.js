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
exports.getUserWishlist = exports.getWishlistFromDB = void 0;
const server_1 = __importDefault(require("../server"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getWishlistFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wishlistItems = yield server_1.default.wishlist.findMany({
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
    return wishlistItems;
});
exports.getWishlistFromDB = getWishlistFromDB;
const getUserWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
            return;
        }
        const userId = req.user.userId;
        const wishlist = yield (0, exports.getWishlistFromDB)(userId);
        if (wishlist.length === 0) {
            res.status(200).json({ message: 'Your wishlist is empty.', wishlist: [] });
            return;
        }
        res.status(200).json({ message: 'Games in wishlist retrieved successfully.', wishlist: wishlist });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Games from the wishlist could not be retrieved." });
        return;
    }
});
exports.getUserWishlist = getUserWishlist;
