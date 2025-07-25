import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT';
import { addToLibrary } from '../controllers/addToLibraryController';
import { addToWishlist } from '../controllers/addToWishListController';

const router = Router();

router.post('/add-to-library', verifyJWT, addToLibrary);
router.post('/add-to-wishlist', verifyJWT, addToWishlist);
// the next that executes is this addToLibrary function, the verifyJWT is the middleware

export default router;