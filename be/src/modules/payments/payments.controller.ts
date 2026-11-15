import { Request, Response } from 'express';
import { MomoService } from './momo.service.js';

const momoService = new MomoService();

// Lịch sử giao dịch lưu tạm để kiểm tra Idempotent (Webhook lặp)
const processedTransactions = new Set<string>();

// 1. API POST /payments/momopay/create
export async function createMomoPayment(req: Request, res: Response) {
    try {
        const { bookingId, amount, bookingCode } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bookingId hoặc amount' });
        }

        const result = await momoService.createPaymentUrl(bookingId, amount, bookingCode || `BK_${bookingId}`);

        return res.status(200).json({
            success: true,
            data: { payUrl: result.payUrl, transactionRef: result.orderId }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// 2. API GET/POST /payments/momopay/ipn (Webhook từ MoMo)
export async function handleMomoIPN(req: Request, res: Response) {
    try {
        const ipnData = req.method === 'POST' ? req.body : req.query;
        const { orderId, resultCode, amount } = ipnData;

        // A. Xử lý Idempotent (Nếu Webhook đã xử lý rồi thì không sinh lại)
        if (processedTransactions.has(String(orderId))) {
            return res.status(200).json({ message: 'Idempotent: Giao dịch này đã xử lý thành công trước đó' });
        }

        // B. Kiểm tra kết quả giao dịch từ MoMo (resultCode === '0' hoặc 0 là thành công)
        if (String(resultCode) === '0') {
            // Đánh dấu đã xử lý
            processedTransactions.add(String(orderId));

            // TODO: Ở Tuần 7, gọi hàm chốt ghế của Vinh và đổi trạng thái booking sang PAID
            console.log(`[MoMo IPN] Thanh toán thành công cho đơn hàng: ${orderId}, Số tiền: ${amount}`);

            return res.status(204).send(); // Chuẩn HTTP 204 No Content trả về cho MoMo
        } else {
            return res.status(200).json({ success: false, message: 'Giao dịch MoMo thất bại' });
        }
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}