import { Router } from "express";
import { register, login, logout } from "../controllers/authController";
import { handleRefreshToken } from "../controllers/refreshTokenController";


const router = Router();


router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/refresh', handleRefreshToken);

export default router;