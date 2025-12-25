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
exports.getUserLibrary = exports.getGamesLibraryFromDB = void 0;
const server_1 = __importDefault(require("../server"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getGamesLibraryFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const libraryItems = yield server_1.default.userGameLibrary.findMany({
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
});
exports.getGamesLibraryFromDB = getGamesLibraryFromDB;
const getUserLibrary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
            return;
        }
        const userId = req.user.userId;
        const library = yield (0, exports.getGamesLibraryFromDB)(userId);
        if (library.length === 0) {
            res.status(200).json({ message: 'Your library is empty.', library: [] });
            return;
        }
        res.status(200).json({ message: 'Games in library retrieved successfully.', library: library });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Games from the library could not be retrieved." });
        return;
    }
});
exports.getUserLibrary = getUserLibrary;
