import { Router } from 'express';
import {
    createCompany, addBus, addRoute, addSchedule,
    getSchedules, getCompanies, getBuses, deleteBus,
    getRoutes, deleteRoute, getCompanyStats,
    deleteSchedule, updateSchedule,
    updateCompany, updateBus, toggleCheckIn,
    getScheduleById
} from '../controllers/companyController';
import { authenticateToken, isCompanyAdmin, isSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes de ce fichier nécessitent une authentification
router.use(authenticateToken);

// Création et Modification de compagnie
router.post('/', isSuperAdmin, createCompany);
router.put('/:id', isCompanyAdmin, updateCompany);
router.get('/', getCompanies);

// Gestion de la flotte (Bus)
router.get('/bus', getBuses);
router.post('/bus', isCompanyAdmin, addBus);
router.put('/bus/:id', isCompanyAdmin, updateBus);
router.delete('/bus/:id', isCompanyAdmin, deleteBus);

// Gestion des trajets (Lignes)
router.get('/routes', getRoutes);
router.post('/routes', isCompanyAdmin, addRoute);
router.delete('/routes/:id', isCompanyAdmin, deleteRoute);

// Planification des voyages
router.post('/schedules', isCompanyAdmin, addSchedule);
router.get('/schedules', getSchedules);
router.get('/schedules/:id', getScheduleById);
router.put('/schedules/:id', isCompanyAdmin, updateSchedule);
router.delete('/schedules/:id', isCompanyAdmin, deleteSchedule);

// Gestion des Embarquements (Check-in)
router.put('/bookings/:id/checkin', toggleCheckIn);

// Statistiques
router.get('/stats', getCompanyStats);

export default router;
