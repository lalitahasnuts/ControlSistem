import { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { UserRole } from '../models/types.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', requireRole([UserRole.ADMIN]), createUser);
router.put('/:id', requireRole([UserRole.ADMIN]), updateUser);
router.delete('/:id', requireRole([UserRole.ADMIN]), deleteUser);

export default router;