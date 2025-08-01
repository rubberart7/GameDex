import express from 'express'
import cors from 'cors'
import gameRoutes from './routes/gamesRoute';
import authRouter from './routes/authRoute';
import dealsRouter from './routes/dealsRoute';
import storesRouter from './routes/storesRouter';
import userFeaturesRouter from './routes/userFeaturesRouter';
import gameDetailsRoute from './routes/gameDetailsRoute';
import errorHandler from './middleware/error';
import cookieParser from "cookie-parser";
import { PrismaClient } from './generated/prisma'; 


const PORT = 4000;

const CLIENT_URL = "http://localhost:3000";

const app = express();

const prisma = new PrismaClient(); // Prisma Client instance is already here, which is good for global management

const corsOptions = {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], // Ensure all methods you use are allowed
    credentials: true
}

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/api', gameRoutes);
app.use('/api', gameDetailsRoute)
app.use('/api', dealsRouter);
app.use('/api', storesRouter);
app.use('/api/auth', authRouter)
app.use('/api/user', userFeaturesRouter);

app.use(errorHandler);

// Capture the server instance returned by app.listen
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// --- NEW: Graceful Shutdown for Prisma Client ---
// Handles SIGTERM (e.g., sent by process managers like pm2, Kubernetes)
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: Closing HTTP server.');
    server.close(async () => { // Close the Express server
        console.log('HTTP server closed.');
        await prisma.$disconnect(); // Disconnect Prisma Client
        console.log('Prisma Client disconnected.');
        process.exit(0); // Exit the process
    });
});

// Handles SIGINT (e.g., Ctrl+C in the terminal)
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: Closing HTTP server.');
    server.close(async () => {
        console.log('HTTP server closed.');
        await prisma.$disconnect(); // Disconnect Prisma Client
        console.log('Prisma Client disconnected.');
        process.exit(0);
    });
});

export default prisma;