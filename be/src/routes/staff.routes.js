import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import * as staffController from '../controllers/staff.controller.js';
import {
  listCheckinsSchema,
  listStaffShowtimesSchema,
  lookupTicketSchema,
  checkinSchema,
} from '../validators/staff.validator.js';

const router = Router();

router.use(verifyToken, authorizeRoles('STAFF', 'ADMIN'));

router.get('/cinemas', staffController.listCinemas);
router.get(
  '/showtimes',
  validate(listStaffShowtimesSchema),
  staffController.listShowtimes
);
router.get(
  '/checkins',
  validate(listCheckinsSchema),
  staffController.listCheckins
);
router.get('/lookup', validate(lookupTicketSchema), staffController.lookup);
router.post('/checkin', validate(checkinSchema), staffController.checkin);

export default router;
