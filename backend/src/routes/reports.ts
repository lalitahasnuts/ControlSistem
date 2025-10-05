import { Router } from 'express';
import { 
  getDefectReport, 
  exportToCSV, 
  exportToExcel 
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/defects', getDefectReport);
router.get('/export/csv', exportToCSV);
router.get('/export/excel', exportToExcel);

export default router;