import { Router } from 'express';
import { login, register, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getCurrentUser);

export default router;