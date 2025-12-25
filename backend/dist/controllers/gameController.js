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
exports.getGamesData = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const gamesApiKey = process.env.RAWG_API_KEY;
const startDate = '2022-01-01';
const endDate = `2025-01-08`;
const MAX_GAME_PAGES = 3;
const getGamesData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        if (page > MAX_GAME_PAGES) {
            const previousPageUrl = page > 1
                ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}`
                : null;
            res.status(200).json({
                count: 0,
                next: null,
                previous: previousPageUrl,
                results: []
            });
            return;
        }
        const response = yield axios_1.default.get(`https://api.rawg.io/api/games`, {
            params: {
                key: gamesApiKey,
                dates: `${startDate},${endDate}`,
                page_size: 100,
                page: page,
            }
        });
        res.status(200).json(response.data);
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch games data." });
        return;
    }
});
exports.getGamesData = getGamesData;
