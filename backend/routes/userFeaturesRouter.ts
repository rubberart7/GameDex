import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT';
import { addToLibrary } from '../controllers/addToLibraryController';

const router = Router();

router.post('/library', verifyJWT, addToLibrary);

export default router;