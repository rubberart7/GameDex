import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT';
import { addToLibrary } from '../controllers/addToLibraryController';
import { addToWishlist } from '../controllers/addToWishListController';
import { getUserLibrary } from '../controllers/getGameLibraryController';
import { deleteFromLibrary } from '../controllers/deleteFromLibrary';
import { getUserWishlist } from '../controllers/getWishListController';
import { deleteFromWishlist } from '../controllers/deleteFromWishList';
import { getRecommendations } from '../controllers/recommendationsController';


const router = Router();

router.post('/add-to-library', verifyJWT, addToLibrary);
router.post('/add-to-wishlist', verifyJWT, addToWishlist);

router.get('/library', verifyJWT, getUserLibrary);
router.get('/wishlist', verifyJWT, getUserWishlist);
router.delete('/delete-from-library', verifyJWT, deleteFromLibrary);
router.delete('/delete-from-wishlist', verifyJWT, deleteFromWishlist);

router.get('/game-recommendations', verifyJWT, getRecommendations);


export default router;