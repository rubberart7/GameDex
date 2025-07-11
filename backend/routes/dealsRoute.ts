import { Router } from 'express';
import { getGenDeals } from '../controllers/dealsController';


const router = Router();

router.get('/deals', getGenDeals);

export default router;
