import express from 'express'
import cors from 'cors'
import gameRoutes from './routes/gamesRoute';
import authRouter from './routes/authRoute'
import errorHandler from './middleware/error';

const PORT = 4000;

const app = express();

app.use(express.json());

app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST'],
    credentials: true}));

// Your backend (running at http://localhost:4000) is allowing cross-origin requests from your frontend (at http://localhost:3000).

// This is what lets your React (or other frontend) app make fetch() or axios calls to your backend without getting blocked by the browser's CORS policy.

app.use('/api', gameRoutes);
// this will end up being my localhost:4000/api/games
app.use('/api', authRouter)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

