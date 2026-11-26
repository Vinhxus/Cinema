import * as paymentService from '../services/payment.service.js';
import { sendSuccess } from '../utils/response.js';

export const checkoutOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { phone, email, ageConfirmed } = req.body;
        const result = await paymentService.checkoutOrder(orderId, { phone, email, ageConfirmed });
        return sendSuccess(res, result, 'Cập nhật thông tin checkout thành công');
    } catch (error) {
        next(error);
    }
};

export const createMomoPayment = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        const paymentUrl = await paymentService.createMomoPayment(orderId);
        return sendSuccess(res, { paymentUrl }, 'Tạo URL thanh toán Momo thành công');
    } catch (error) {
        next(error);
    }
};

export const handleMomoReturn = async (req, res, next) => {
    try {
        const result = await paymentService.processMomoReturn(req.query);
        return sendSuccess(res, result, 'Xử lý kết quả trả về từ Momo thành công');
    } catch (error) {
        next(error);
    }
};

export const handleMomoIPN = async (req, res, next) => {
    try {
        await paymentService.processMomoIPN(req.body);
        // Momo yêu cầu phản hồi HTTP 204 No Content hoặc HTTP 200 tùy cấu hình IPN
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};