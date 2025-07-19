import { Router } from 'express';
import { getGameDetails } from '../controllers/gameDetailsController';

const router = Router();

router.get('/games', getGameDetails);

export default router;
