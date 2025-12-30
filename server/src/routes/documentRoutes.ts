import { Router } from 'express';
import { getDocuments, createDocument, deleteDocument } from '../controllers/documentController';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public (ou protégé élève)
router.get('/', authenticateToken, getDocuments);

// Admin only
router.post('/', authenticateToken, isAdmin, createDocument);
router.delete('/:id', authenticateToken, isAdmin, deleteDocument);

export default router;
