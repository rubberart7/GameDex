import express from 'express';
import cors from 'cors'
import gameRoutes from './routes/games';
import errorHandler from './middleware/error';

const PORT = 4000;

const app = express();

app.use(cors({ origin: 'http://localhost:3000'}));

app.use('/api', gameRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});