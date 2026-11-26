import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller.js';

const router = Router();

router.get('/lookup', ticketController.lookupTicket);
router.get('/:id', ticketController.getTicketDetails);
router.post('/:id/cancel', ticketController.cancelTicket);

export default router;