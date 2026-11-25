import { Router } from 'express';
import { testConnection } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import staffRoutes from './staff.routes.js';

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
    return sendError(res, 'Database connection failed', 503, {
      message: err.message,
    });
  }
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/staff', staffRoutes);

export default router;
