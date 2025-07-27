import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT';
import { addToLibrary } from '../controllers/addToLibraryController';
import { addToWishlist } from '../controllers/addToWishListController';
import { getUserLibrary } from '../controllers/getGameLibraryController';
import { deleteFromLibrary } from '../controllers/deleteFromLibrary';

const router = Router();

router.post('/add-to-library', verifyJWT, addToLibrary);
router.post('/add-to-wishlist', verifyJWT, addToWishlist);

router.get('/library', verifyJWT, getUserLibrary);
router.delete('/delete-from-library', verifyJWT, deleteFromLibrary)

export default router;