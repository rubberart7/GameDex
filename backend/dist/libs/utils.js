"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (userId, email, secretKey) => {
    return jsonwebtoken_1.default.sign({ userId, email }, secretKey, {
        expiresIn: "15m",
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, email, secretKey) => {
    return jsonwebtoken_1.default.sign({ userId, email }, secretKey, {
        expiresIn: "1d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
