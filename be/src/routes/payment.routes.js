import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { validate } from '../middlewares/validate.js';
import { checkoutSchema, createPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

router.post('/orders/:orderId/checkout', validate(checkoutSchema), paymentController.checkoutOrder);
router.post('/momopay/create', validate(createPaymentSchema), paymentController.createMomoPayment);
router.get('/momopay/return', paymentController.handleMomoReturn);
router.post('/momopay/ipn', paymentController.handleMomoIPN);

export default router;