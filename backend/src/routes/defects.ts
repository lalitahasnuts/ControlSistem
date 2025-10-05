import { Router } from 'express';
import { 
  getAllDefects, 
  getDefectById, 
  createDefect, 
  updateDefect, 
  deleteDefect,
  addComment,
  uploadAttachment,
  upload
} from '../controllers/defectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllDefects);
router.get('/:id', getDefectById);
router.post('/', createDefect);
router.put('/:id', updateDefect);
router.delete('/:id', deleteDefect);
router.post('/:id/comments', addComment);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);

export default router;