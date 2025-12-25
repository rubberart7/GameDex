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
exports.getGameDetails = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const gamesApiKey = process.env.RAWG_API_KEY;
const getGameDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gameId = req.params.id;
        const gameDetailsResponse = yield axios_1.default.get(`https://api.rawg.io/api/games/${gameId}`, {
            params: { key: gamesApiKey }
        });
        const gameData = gameDetailsResponse.data;
        try {
            const screenshotsResponse = yield axios_1.default.get(`https://api.rawg.io/api/games/${gameId}/screenshots`, {
                params: { key: gamesApiKey }
            });
            gameData.screenshots = screenshotsResponse.data.results;
        }
        catch (screenshotError) {
            gameData.screenshots = [];
        }
        res.status(200).json(gameData);
        return;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            if (error.response.status === 404) {
                res.status(404).json({ message: "Game not found from RAWG API." });
                return;
            }
            res.status(error.response.status).json({ message: "Failed to fetch game details from external API." });
            return;
        }
        res.status(error.response.status).json({ message: "Failed to fetch game details from the API." });
    }
});
exports.getGameDetails = getGameDetails;
