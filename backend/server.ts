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


const PORT = process.env.PORT || 4000;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const app = express();

const prisma = new PrismaClient(); 

const corsOptions = {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], 
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

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: Closing HTTP server.');
    server.close(async () => { 
        console.log('HTTP server closed.');
        await prisma.$disconnect(); 
        console.log('Prisma Client disconnected.');
        process.exit(0); 
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: Closing HTTP server.');
    server.close(async () => {
        console.log('HTTP server closed.');
        await prisma.$disconnect(); 
        console.log('Prisma Client disconnected.');
        process.exit(0);
    });
});

export default prisma;