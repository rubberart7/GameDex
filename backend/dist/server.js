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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const gamesRoute_1 = __importDefault(require("./routes/gamesRoute"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const dealsRoute_1 = __importDefault(require("./routes/dealsRoute"));
const storesRouter_1 = __importDefault(require("./routes/storesRouter"));
const userFeaturesRouter_1 = __importDefault(require("./routes/userFeaturesRouter"));
const gameDetailsRoute_1 = __importDefault(require("./routes/gameDetailsRoute"));
const error_1 = __importDefault(require("./middleware/error"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const prisma_1 = require("./generated/prisma");
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const app = (0, express_1.default)();
const prisma = new prisma_1.PrismaClient();
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            CLIENT_URL,
            "http://localhost:3000",
        ];
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log('Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use('/api', gamesRoute_1.default);
app.use('/api', gameDetailsRoute_1.default);
app.use('/api', dealsRoute_1.default);
app.use('/api', storesRouter_1.default);
app.use('/api/auth', authRoute_1.default);
app.use('/api/user', userFeaturesRouter_1.default);
app.use(error_1.default);
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('SIGTERM signal received: Closing HTTP server.');
    server.close(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('HTTP server closed.');
        yield prisma.$disconnect();
        console.log('Prisma Client disconnected.');
        process.exit(0);
    }));
}));
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('SIGINT signal received: Closing HTTP server.');
    server.close(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('HTTP server closed.');
        yield prisma.$disconnect();
        console.log('Prisma Client disconnected.');
        process.exit(0);
    }));
}));
exports.default = prisma;
