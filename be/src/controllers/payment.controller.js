import * as paymentService from '../services/payment.service.js';
import { sendSuccess } from '../utils/response.js';

export const checkoutOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { name, phone, email, ageConfirmed } = req.body;
        const result = await paymentService.checkoutOrder(orderId, { name, phone, email, ageConfirmed });
        return sendSuccess(res, result, 'Cập nhật thông tin khách hàng thành công');
    } catch (error) {
        next(error);
    }
};

export const createMomoPayment = async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        const payUrl = await paymentService.createMomoPayment(bookingId);
        return sendSuccess(res, { payUrl }, 'Tạo liên kết thanh toán MoMo thành công');
    } catch (error) {
        next(error);
    }
};

export const handleMomoReturn = async (req, res, next) => {
    try {
        const result = await paymentService.processMomoReturn(req.query);
        return sendSuccess(res, result, 'Xử lý phản hồi MoMo thành công');
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