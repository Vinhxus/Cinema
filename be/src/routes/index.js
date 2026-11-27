import { Router } from 'express';
import { testConnection } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import movieRoutes from './movie.routes.js';
import cinemaRoutes from './cinema.routes.js';
import showtimeRoutes from './showtime.routes.js';
import paymentRoutes from './payment.routes.js';
import ticketRoutes from './ticket.routes.js';
import bookingRoutes from './booking.routes.js';
//import authRoutes from './auth.routes.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await testConnection();
    return sendSuccess(res, {
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[health] database error:', err);
    // Không trả err.message ra ngoài: có thể lộ host/user của database
    return sendError(res, 'Database connection failed', 503);
  }
});

router.use('/movies', movieRoutes);
router.use('/cinemas', cinemaRoutes);
router.use('/showtimes', showtimeRoutes);
router.use('/payments', paymentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/bookings', bookingRoutes);

//router.use('/auth', authRoutes);

export default router;