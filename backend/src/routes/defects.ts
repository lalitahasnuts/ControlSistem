import express from 'express';
import defectController from '../controllers/defectController.js';
import { uploadMiddleware } from '../controllers/defectController.js';

const router = express.Router();

router.get('/', defectController.getAll);
router.get('/:id', defectController.getById);
router.post('/', defectController.create);
router.put('/:id', defectController.update);
router.delete('/:id', defectController.delete);
router.post('/:id/comments', defectController.addComment);
router.post('/:id/attachments', uploadMiddleware, defectController.uploadAttachment);
router.get('/:id/attachments', defectController.getAttachments);

export default router;