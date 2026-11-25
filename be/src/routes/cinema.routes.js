import { Router } from 'express';
import * as cinemaController from '../controllers/cinema.controller.js';

const router = Router();

router.get('/', cinemaController.getCinemas);

export default router;