import { Router } from 'express';
import { getStores } from '../controllers/storesController';

const router = Router();

router.get('/stores', getStores);

export default router;