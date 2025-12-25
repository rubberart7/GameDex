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
exports.getRecommendations = void 0;
const server_1 = __importDefault(require("../server"));
const getGameLibraryController_1 = require("./getGameLibraryController");
const getWishListController_1 = require("./getWishListController");
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
dotenv_1.default.config();
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const generateCollectionHash = (games) => {
    const sortedRawgIds = games.map(item => item.game.rawgId).sort((a, b) => a - b).join(',');
    const hash = (0, crypto_1.createHash)('sha256').update(sortedRawgIds).digest('hex');
    return hash;
};
const getRecommendations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated.', type: 'Error' });
            return;
        }
        const userId = req.user.userId;
        const [ownedGames, wishedGames] = yield Promise.all([
            (0, getGameLibraryController_1.getGamesLibraryFromDB)(userId),
            (0, getWishListController_1.getWishlistFromDB)(userId),
        ]);
        const allUserGamesOfInterest = [...ownedGames, ...wishedGames];
        const currentCollectionHash = generateCollectionHash(allUserGamesOfInterest);
        const cachedEntry = yield server_1.default.userRecommendationCache.findUnique({
            where: { userId: userId },
            select: { recommendations: true, collectionHash: true },
        });
        if (cachedEntry && cachedEntry.collectionHash === currentCollectionHash) {
            const recommendationsFromCache = cachedEntry.recommendations;
            if (Array.isArray(recommendationsFromCache)) {
                res.status(200).json({
                    message: 'AI-powered recommendations retrieved from cache.',
                    recommendations: recommendationsFromCache,
                    type: 'Success',
                });
                return;
            }
            else {
                console.warn("Cached recommendations found but are not in expected array format, regenerating.");
            }
        }
        const gameNamesToExclude = allUserGamesOfInterest.map(item => item.game.name);
        const userTasteSummaryParts = [];
        const highlyRatedOwnedGames = allUserGamesOfInterest.filter(item => item.game.rating && item.game.rating >= 4.0);
        const topOwnedGameNames = highlyRatedOwnedGames.map(item => item.game.name).slice(0, 3);
        if (topOwnedGameNames.length > 0) {
            userTasteSummaryParts.push(`The user has enjoyed highly-rated games such as: ${topOwnedGameNames.join(', ')}.`);
        }
        else {
            userTasteSummaryParts.push(`The user has games like: ${allUserGamesOfInterest.map(item => item.game.name).slice(0, 5).join(', ')}.`);
        }
        userTasteSummaryParts.push('Suggest 12 new games the user might enjoy based on these preferences.');
        const compiledUserTaste = userTasteSummaryParts.join(' ');
        if (!GEMINI_API_KEY) {
            res.status(500).json({ message: 'Server configuration error: Gemini AI API Key is missing.', type: 'Error' });
            return;
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `
      You are a highly knowledgeable video game recommender AI.
      ${compiledUserTaste}
      Do NOT recommend any of these games, as the user already knows them: ${gameNamesToExclude.join(', ')}.
      For each recommendation, explain briefly why it matches their preferences (e.g., similar genre, gameplay loop, theme, or developer).
      Ensure all recommended games are real, existing titles.
      Format your response strictly as a JSON array of 12 objects. Each object must have "game_name" (string) and "reason" (string) properties.
      Example: [{"game_name": "Game Title", "reason": "Reason for recommendation"}, ...]
      Strictly only output the JSON array. Do not include any other text or formatting.
    `;
        let aiRecommendationsText;
        try {
            const result = yield model.generateContent(prompt);
            aiRecommendationsText = result.response.text();
        }
        catch (aiError) {
            res.status(500).json({ message: 'AI recommendation service is currently unavailable.', type: 'Error' });
            return;
        }
        let aiRecommendations;
        try {
            const cleanedText = aiRecommendationsText.replace(/```json\n|\n```/g, '').trim();
            aiRecommendations = JSON.parse(cleanedText);
            if (!Array.isArray(aiRecommendations) || aiRecommendations.some(r => !r.game_name || !r.reason)) {
                throw new Error('AI response format invalid.');
            }
        }
        catch (parseError) {
            res.status(500).json({ message: 'Could not process AI recommendations (invalid format).', type: 'Error' });
            return;
        }
        const validatedRecommendations = [];
        const gamesAlreadyRecommended = new Set();
        const rawgIdsAlreadyProcessed = new Set();
        for (const aiRec of aiRecommendations) {
            if (gameNamesToExclude.includes(aiRec.game_name) || gamesAlreadyRecommended.has(aiRec.game_name)) {
                continue;
            }
            let verifiedGame = null;
            let rawgIdFromSearch = null;
            verifiedGame = yield server_1.default.game.findFirst({
                where: { name: aiRec.game_name },
                select: { id: true, rawgId: true, name: true, background_image: true, rating: true, released: true }
            });
            if (!verifiedGame && RAWG_API_KEY) {
                try {
                    const rawgSearchResponse = yield axios_1.default.get(`https://api.rawg.io/api/games?search=${encodeURIComponent(aiRec.game_name)}&key=${RAWG_API_KEY}`);
                    const rawgSearchResults = rawgSearchResponse.data.results;
                    if (rawgSearchResults && rawgSearchResults.length > 0) {
                        const bestMatchFromRawgSearch = rawgSearchResults[0];
                        rawgIdFromSearch = bestMatchFromRawgSearch.id;
                        if (rawgIdFromSearch == null) {
                            continue;
                        }
                        if (rawgIdsAlreadyProcessed.has(rawgIdFromSearch)) {
                            continue;
                        }
                        const existingGameByRawgId = yield server_1.default.game.findUnique({
                            where: { rawgId: rawgIdFromSearch },
                            select: { id: true, rawgId: true, name: true, background_image: true, rating: true, released: true }
                        });
                        if (existingGameByRawgId) {
                            verifiedGame = existingGameByRawgId;
                            if (verifiedGame && verifiedGame.name !== bestMatchFromRawgSearch.name) {
                                yield server_1.default.game.update({
                                    where: { id: verifiedGame.id },
                                    data: { name: bestMatchFromRawgSearch.name }
                                });
                                verifiedGame = Object.assign(Object.assign({}, verifiedGame), { name: bestMatchFromRawgSearch.name });
                            }
                        }
                        else {
                            verifiedGame = yield server_1.default.game.create({
                                data: {
                                    rawgId: bestMatchFromRawgSearch.id,
                                    name: bestMatchFromRawgSearch.name,
                                    background_image: bestMatchFromRawgSearch.background_image || null,
                                    rating: bestMatchFromRawgSearch.rating || null,
                                    released: bestMatchFromRawgSearch.released || null,
                                },
                            });
                        }
                        if (rawgIdFromSearch) {
                            rawgIdsAlreadyProcessed.add(rawgIdFromSearch);
                        }
                    }
                }
                catch (rawgSearchError) {
                }
            }
            if (verifiedGame) {
                const isAlreadyInUserCollection = allUserGamesOfInterest.some(item => item.game.rawgId === verifiedGame.rawgId);
                if (isAlreadyInUserCollection) {
                    continue;
                }
                verifiedGame.recommendationReason = aiRec.reason;
                validatedRecommendations.push(verifiedGame);
                gamesAlreadyRecommended.add(verifiedGame.name);
            }
        }
        if (validatedRecommendations.length > 0) {
            yield server_1.default.userRecommendationCache.upsert({
                where: { userId: userId },
                update: {
                    recommendations: validatedRecommendations,
                    collectionHash: currentCollectionHash,
                    cachedAt: new Date(),
                },
                create: {
                    userId: userId,
                    recommendations: validatedRecommendations,
                    collectionHash: currentCollectionHash,
                    cachedAt: new Date(),
                },
            });
            res.status(200).json({
                message: 'AI-powered recommendations generated and cached successfully.',
                recommendations: validatedRecommendations,
                type: 'Success',
            });
        }
        else {
            res.status(200).json({
                message: 'Could not generate recommendations at this time. Please try again later or add more games to your library/wishlist.',
                recommendations: [],
                type: 'Info',
            });
        }
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected server error occurred during recommendation generation.', type: 'Error' });
        return;
    }
});
exports.getRecommendations = getRecommendations;
