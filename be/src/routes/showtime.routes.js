import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { listShowtimesSchema, seatMapSchema } from '../validators/seat.validator.js';
import * as showtimeController from '../controllers/showtime.controller.js';

const router = Router();

router.get('/', validate(listShowtimesSchema), showtimeController.listUpcoming);
router.get('/:id/seat-map', validate(seatMapSchema), showtimeController.getSeatMap);

export default router;
