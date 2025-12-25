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
exports.getStoresData = exports.getGenDeals = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cheapSharkDealsBaseUrl = "https://www.cheapshark.com/api/1.0/deals";
const cheapSharkStoresBaseUrl = "https://www.cheapshark.com/api/1.0/stores";
const MAX_DEAL_PAGES = 5;
const getGenDeals = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pageNumber = parseInt(req.query.page) || 0;
        const pageSize = 60;
        if (pageNumber >= MAX_DEAL_PAGES) {
            res.status(200).json([]);
            return;
        }
        const response = yield axios_1.default.get(cheapSharkDealsBaseUrl, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sortBy: "Deal Rating",
                upperPrice: 15
            }
        });
        res.status(200).json(response.data);
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch deals data." });
        return;
    }
});
exports.getGenDeals = getGenDeals;
const getStoresData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(cheapSharkStoresBaseUrl);
        res.status(200).json(response.data);
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch store data." });
        return;
    }
});
exports.getStoresData = getStoresData;
