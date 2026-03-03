import { Router } from 'express';
import { searchSchedules, bookSeat, paymentWebhook, getUserBookings, getScheduleManifest, cancelBooking, validateTicket } from '../controllers/bookingController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/search', searchSchedules);
router.get('/my-bookings', authenticateToken, getUserBookings);
router.get('/schedule/:scheduleId/manifest', authenticateToken, getScheduleManifest);
router.post('/book', authenticateToken, bookSeat);
router.post('/payment-webhook', paymentWebhook);
router.post('/:bookingId/cancel', authenticateToken, cancelBooking);
router.post('/validate', authenticateToken, validateTicket);

export default router;
