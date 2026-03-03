import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController';
import { authenticateToken, isCompanyAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateToken, isCompanyAdmin, getDashboardStats);

export default router;
