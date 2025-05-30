import { Router } from 'express';
import { getGamesData } from '../controllers/gameController';

const router = Router();

router.get('/games', getGamesData);

export default router;
