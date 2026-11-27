import * as paymentService from '../services/payment.service.js';
import { sendSuccess } from '../utils/response.js';

export const checkoutOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { name, phone, email, ageConfirmed } = req.body;
        const result = await paymentService.checkoutOrder(orderId, { name, phone, email, ageConfirmed });
        return sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};

export const createMomoPayment = async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        const payUrl = await paymentService.createMomoPayment(bookingId);
        return sendSuccess(res, { payUrl });
    } catch (error) {
        next(error);
    }
};

export const handleMomoReturn = async (req, res, next) => {
    try {
        const result = await paymentService.processMomoReturn(req.query);
        return sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};

export const handleMomoIPN = async (req, res, next) => {
    try {
        await paymentService.processMomoIPN(req.body);
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};
/* ------------------------------ SePay ------------------------------ */

export const createSepayPayment = async (req, res, next) => {
    try {
        const result = await paymentService.createSepayPayment(req.body);
        return sendSuccess(res, result, 201);
    } catch (error) {
        next(error);
    }
};

// SePay gọi (server -> server). KHÔNG gắn middleware đăng nhập của user.
export const handleSepayIPN = async (req, res, next) => {
    try {
        const result = await paymentService.processSepayIPN(req.get('X-Secret-Key'), req.body);
        // Docs SePay: trả HTTP 200 để xác nhận đã nhận
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        if (error.statusCode === 401) return res.status(401).json({ error: 'Unauthorized' });
        next(error); // lỗi 500 -> SePay coi như chưa nhận
    }
};

export const getPaymentStatus = async (req, res, next) => {
    try {
        const result = await paymentService.getPaymentStatus(req.params.ref);
        return sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};
