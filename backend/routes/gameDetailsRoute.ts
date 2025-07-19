import { Router } from 'express';
import { getGameDetails } from '../controllers/gameDetailsController';

const router = Router();

router.get('/games/game/:id', getGameDetails);

export default router;
