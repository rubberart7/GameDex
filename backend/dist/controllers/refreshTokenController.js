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
exports.handleRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("../server"));
const utils_1 = require("../libs/utils");
dotenv_1.default.config();
const handleRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt)) {
        res.status(401).json({ message: "No refresh token cookie." });
        return;
    }
    const refreshToken = cookies.jwt;
    try {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            console.error("REFRESH_TOKEN_SECRET not configured");
            res.status(500).json({ message: "Server configuration error" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const storedToken = yield server_1.default.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken || storedToken.revoked) {
            res.status(403).json({ message: "Invalid refresh token" });
            return;
        }
        if (storedToken.expiresAt < new Date()) {
            try {
                yield server_1.default.refreshToken.delete({
                    where: { token: refreshToken },
                });
            }
            catch (cleanupError) {
                console.error("Error cleaning up expired token:", cleanupError);
            }
            res.status(403).json({ message: "Refresh token expired" });
            return;
        }
        if (decoded.userId !== storedToken.userId || decoded.email !== storedToken.user.email) {
            console.error("Token data mismatch for user:", storedToken.userId);
            res.status(403).json({ message: "Token does not match user" });
            return;
        }
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        if (!accessTokenSecret) {
            console.error("ACCESS_TOKEN_SECRET not configured");
            res.status(500).json({ message: "Server configuration error" });
            return;
        }
        const newAccessToken = (0, utils_1.generateAccessToken)(storedToken.userId, storedToken.user.email, accessTokenSecret);
        res.json({ accessToken: newAccessToken });
        return;
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            console.error("JWT verification failed:", err.message);
            res.status(403).json({ message: "Invalid refresh token" });
            return;
        }
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            console.error("JWT token expired:", err.message);
            res.status(403).json({ message: "Refresh token expired" });
            return;
        }
        console.error("Refresh token error:", err);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.handleRefreshToken = handleRefreshToken;
