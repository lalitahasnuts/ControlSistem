import { Router } from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../controllers/projectController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { UserRole } from '../models/types.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', requireRole([UserRole.MANAGER, UserRole.ADMIN]), createProject);
router.put('/:id', requireRole([UserRole.MANAGER, UserRole.ADMIN]), updateProject);
router.delete('/:id', requireRole([UserRole.MANAGER, UserRole.ADMIN]), deleteProject);

export default router;