import { Router } from 'express';
import { checkoutSchema } from './checkout.validation.js';
import { MomoService } from '../payments/momo.service.js';

const router = Router();

const momoService = new MomoService({
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
    secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1wa8nGNV8ua3ux05AmOmjaCW',
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
});

/**
 * 1. POST /orders/:id/checkout
 * Lưu SĐT và Email (Zod validate), lưu thời điểm và nội dung xác nhận độ tuổi (T13/T16/T18)
 */
router.post('/orders/:id/checkout', async (req, res) => {
    const { id: bookingId } = req.params;

    const validation = checkoutSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            errors: validation.error.format(),
        });
    }

    const { customerName, customerEmail, customerPhone, ageConfirmed } = validation.data;

    try {
        // DB: Lưu thông tin checkout vào bảng orders / clients
        return res.status(200).json({
            success: true,
            message: 'Lưu thông tin checkout thành công!',
            data: { bookingId, customerName, customerEmail, customerPhone, ageConfirmed },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi checkout' });
    }
});

/**
 * 2. POST /payments/momopay/create
 * Tạo URL thanh toán kèm chữ ký SHA256/SHA512, hủy giao dịch cũ nếu khách đổi phương thức
 */
router.post('/payments/momopay/create', async (req, res) => {
    const { bookingId, amount, orderInfo } = req.body;

    if (!bookingId || !amount) {
        return res.status(400).json({ success: false, message: 'Thiếu bookingId hoặc amount' });
    }

    try {
        // DB: Hủy giao dịch cũ (Chuyển trạng thái transaction cũ sang 'canceled' nếu đổi phương thức)

        const orderId = `ORDER_${bookingId}_${Date.now()}`;
        const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/payment-return';
        const ipnUrl = process.env.MOMO_IPN_URL || 'https://your-domain.com/api/payments/momopay/ipn';

        const momoRes: any = await momoService.createPaymentUrl({
            orderId,
            amount,
            orderInfo: orderInfo || `Thanh toán vé phim đơn hàng ${bookingId}`,
            redirectUrl,
            ipnUrl,
        });

        if (momoRes.resultCode === 0 && momoRes.payUrl) {
            // DB: Lưu transaction với log status = 'created'

            return res.status(200).json({
                success: true,
                payUrl: momoRes.payUrl,
                orderId,
            });
        }

        return res.status(400).json({ success: false, message: momoRes.message || 'Tạo URL thanh toán thất bại' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server kết nối MoMo' });
    }
});

/**
 * 3. GET /payments/momopay/return
 * Return URL đón khách hàng chuyển hướng về trang web kết quả
 */
router.get('/payments/momopay/return', async (req, res) => {
    const { resultCode, orderId, amount, message } = req.query;

    return res.status(200).json({
        success: resultCode === '0',
        resultCode,
        orderId,
        amount,
        message: resultCode === '0' ? 'Thanh toán thành công!' : `Thanh toán thất bại: ${message}`,
    });
});

export default router;