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
exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("../server"));
const utils_1 = require("../libs/utils");
dotenv_1.default.config();
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield server_1.default.user.findUnique({
        where: { email },
    });
});
function createUser(fullName, email, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        yield server_1.default.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
            },
        });
    });
}
function associateRefreshToken(userId, refreshToken, expiresInMs) {
    return __awaiter(this, void 0, void 0, function* () {
        const expiresAt = new Date(Date.now() + expiresInMs);
        yield server_1.default.refreshToken.create({
            data: {
                token: refreshToken,
                userId: userId,
                expiresAt: expiresAt,
                revoked: false,
            },
        });
    });
}
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const saltRounds = 10;
    return yield bcrypt_1.default.hash(password, saltRounds);
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        res.status(400).json({ message: "Please fill all fields", type: "Error" });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ message: "Password must be at least 6 characters!", type: "Error" });
        return;
    }
    const emailExists = yield findUserByEmail(email);
    if (emailExists) {
        res.status(400).json({ message: "Email already exists!", type: "Error" });
        return;
    }
    const hashedPassword = yield hashPassword(password);
    yield createUser(fullName, email, hashedPassword);
    res.status(201).json({ message: "User registered successfully.", type: "Success" });
    return;
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Please enter all fields", type: "Error" });
        return;
    }
    const user = yield findUserByEmail(email);
    if (!user) {
        res.status(400).json({ message: "Fields are incorrect!", type: "Error" });
        return;
    }
    const isCorrectPassword = yield bcrypt_1.default.compare(password, user.password);
    if (!isCorrectPassword) {
        res.status(400).json({ message: "Fields are incorrect!", type: "Error" });
        return;
    }
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!accessTokenSecret || !refreshTokenSecret) {
        res.status(500).json({ message: "Server issue.", type: "Error" });
        return;
    }
    const accessToken = (0, utils_1.generateAccessToken)(user.id, user.email, accessTokenSecret);
    const refreshToken = (0, utils_1.generateRefreshToken)(user.id, user.email, refreshTokenSecret);
    const oneDayMs = 24 * 60 * 60 * 1000;
    yield associateRefreshToken(user.id, refreshToken, oneDayMs);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: oneDayMs,
        domain: isProduction ? undefined : 'localhost'
    });
    res.status(200).json({
        message: "User logged in successfully.",
        type: "Success",
        accessToken: accessToken
    });
    return;
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.jwt;
        if (refreshToken) {
            yield server_1.default.refreshToken.delete({
                where: { token: refreshToken },
            });
        }
        if (!refreshToken) {
            res.status(200).json({ message: "You are already logged out." });
            return;
        }
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            domain: isProduction ? undefined : 'localhost'
        });
        res.status(200).json({ message: "Logged out" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Could not logout successfully." });
    }
});
exports.logout = logout;
