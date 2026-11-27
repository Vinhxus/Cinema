import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { validate } from '../middlewares/validate.js';
import {
    checkoutSchema,
    createPaymentSchema,
    createSepaySchema,
    paymentStatusSchema,
} from '../validators/payment.validator.js';

const router = Router();

router.post('/orders/:orderId/checkout', validate(checkoutSchema), paymentController.checkoutOrder);
router.post('/momopay/create', validate(createPaymentSchema), paymentController.createMomoPayment);
router.get('/momopay/return', paymentController.handleMomoReturn);
router.post('/momopay/ipn', paymentController.handleMomoIPN);

// SePay
router.post('/sepay/create', validate(createSepaySchema), paymentController.createSepayPayment);
router.post('/sepay/ipn', paymentController.handleSepayIPN); // SePay gọi, không auth user
router.get('/status/:ref', validate(paymentStatusSchema), paymentController.getPaymentStatus);

export default router;