import express from 'express'
import cors from 'cors'
import gameRoutes from './routes/gamesRoute';
import authRouter from './routes/authRoute';
import dealsRoutes from './routes/dealsRoute';
import storesRouter from './routes/storesRouter';
import gameDetailsRoute from './routes/gameDetailsRoute'
import errorHandler from './middleware/error';
import cookieParser from "cookie-parser";

const PORT = 4000;

const CLIENT_URL = "http://localhost:3000";

const app = express();

const corsOptions = {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
}

// app.use(express.urlencoded({ extended: false }));

// If your frontend only sends JSON (like in your login/register fetch requests), you don't necessarily need express.urlencoded().

// But if you ever want to handle form submissions or POST requests with URL-encoded data, this middleware is necessary.

app.use(express.json());
app.use(cors(corsOptions));

app.use(cookieParser());



// Your backend (running at http://localhost:4000) is allowing cross-origin requests from your frontend (at http://localhost:3000).

// This is what lets your React (or other frontend) app make fetch() or axios calls to your backend without getting blocked by the browser's CORS policy.

app.use('/api', gameRoutes);
app.use('/api', gameDetailsRoute)
app.use('/api', dealsRoutes);
app.use('/api', storesRouter);
// this will end up being my localhost:4000/api/games
app.use('/api/auth', authRouter)


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

