import { Router } from 'express';
import { initiatePayment, cinetPayWebhook } from '../controllers/paymentController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/initiate', authenticateToken, initiatePayment);
router.post('/webhook', cinetPayWebhook);

export default router;
