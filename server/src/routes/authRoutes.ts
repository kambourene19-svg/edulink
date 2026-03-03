import { Router } from 'express';
import { login, register, getProfile, updateProfile, requestPasswordReset, resetPassword } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { error: 'Trop de tentatives, veuillez réessayer plus tard.' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/request-reset-password', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
