import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { listShowtimesQuerySchema } from '../validators/showtime.validator.js';
import * as showtimeController from '../controllers/showtime.controller.js';

const router = Router();

router.get(
  '/',
  validate({ query: listShowtimesQuerySchema }),
  showtimeController.listShowtimes
);

export default router;