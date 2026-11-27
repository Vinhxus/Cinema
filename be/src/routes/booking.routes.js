import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { validate } from '../middlewares/validate.js';
import { bookingCodeSchema } from '../validators/booking.validator.js';

const router = Router();

router.get('/history', bookingController.getHistory);
router.get('/:code', validate(bookingCodeSchema), bookingController.getBookingDetail);

export default router;
