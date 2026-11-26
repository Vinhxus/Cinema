import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import pool, { withTransaction } from '../config/db.js';
import { MOMO, JWT_SECRET } from '../config/env.js';
import AppError from '../utils/AppError.js';
import * as paymentRepo from '../repositories/payment.repository.js';
import * as seatRepo from '../repositories/seat.repository.js';

// Hàm tính HMAC SHA512 theo chuẩn MoMo
const generateMomoSignature = (rawSignature, secretKey) => {
    return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
};

export const checkoutOrder = async (orderId, { phone, email, ageConfirmed }) => {
    const order = await paymentRepo.findOrderById(orderId);
    if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
    if (order.status !== 'HOLDING' && order.status !== 'PENDING') {
        throw new AppError('Trạng thái đơn hàng không hợp lệ để checkout', 400);
    }

    await paymentRepo.updateOrderCustomerInfo(orderId, { phone, email });
    return { orderId, phone, email, status: order.status };
};

export const createMomoPayment = async (orderId) => {
    const order = await paymentRepo.findOrderById(orderId);
    if (!order) throw new AppError('Đơn hàng không tồn tại', 404);

    const requestId = `${orderId}_${Date.now()}`;
    const orderInfo = `Thanh toan ve xem phim cho don hang #${orderId}`;
    const amount = order.total_amount.toString();
    const extraData = '';

    const rawSignature = `accessKey=${MOMO.ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO.IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO.PARTNER_CODE}&redirectUrl=${MOMO.REDIRECT_URL}&requestId=${requestId}&requestType=captureWallet`;

    const signature = generateMomoSignature(rawSignature, MOMO.SECRET_KEY);

    const requestBody = {
        partnerCode: MOMO.PARTNER_CODE,
        partnerName: 'Cinema Booking',
        storeId: 'CinemaHQ',
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: MOMO.REDIRECT_URL,
        ipnUrl: MOMO.IPN_URL,
        lang: 'vi',
        requestType: 'captureWallet',
        autoCapture: true,
        extraData,
        signature,
    };

    // Lưu log tạo giao dịch
    await paymentRepo.saveTransactionLog({
        orderId,
        transactionId: requestId,
        amount,
        status: 'CREATED',
        rawData: requestBody,
    });

    // Gửi request sang API MoMo Sandbox
    const response = await fetch(MOMO.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (data.resultCode !== 0) {
        throw new AppError(`Lỗi tạo giao dịch MoMo: ${data.message}`, 400);
    }

    return data.payUrl;
};

export const processMomoIPN = async (ipnBody) => {
    const { partnerCode, orderId, requestId, amount, resultCode, message, signature } = ipnBody;

    // 1. Xác thực chữ ký MoMo
    const rawSignature = `accessKey=${MOMO.ACCESS_KEY}&amount=${amount}&extraData=${ipnBody.extraData || ''}&message=${message}&orderId=${orderId}&orderType=${ipnBody.orderType || ''}&partnerCode=${partnerCode}&payType=${ipnBody.payType || ''}&requestId=${requestId}&responseTime=${ipnBody.responseTime}&resultCode=${resultCode}&transId=${ipnBody.transId}`;

    const expectedSignature = generateMomoSignature(rawSignature, MOMO.SECRET_KEY);
    if (signature !== expectedSignature) {
        throw new AppError('Chữ ký MoMo IPN không hợp lệ', 400);
    }

    // 2. Kiểm tra Idempotency (Tránh xử lý lại đơn hàng đã xử lý)
    const order = await paymentRepo.findOrderById(orderId);
    if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
    if (order.status === 'PAID') {
        return { status: 'ALREADY_PAID' }; // Bỏ qua nếu IPN lặp lại
    }

    // 3. Xử lý kết quả giao dịch
    if (resultCode === 0) {
        // Giao dịch thành công -> Chạy Database Transaction
        await withTransaction(pool, async (connection) => {
            // a. Cập nhật đơn hàng thành PAID
            await paymentRepo.updateOrderStatus(orderId, 'PAID', connection);

            // b. Đánh dấu chốt ghế trong MySQL
            if (seatRepo.markSeatsBookedByOrder) {
                await seatRepo.markSeatsBookedByOrder(orderId, connection);
            }

            // c. Sinh danh sách vé + mã JWT QR
            const [seats] = await connection.query(
                'SELECT seat_id, price FROM order_seats WHERE booking_id = ?',
                [orderId]
            );

            const ticketsToCreate = seats.map((s) => {
                const ticketId = `TK_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                const qrPayload = {
                    ticketId,
                    orderId,
                    seatId: s.seat_id,
                    iss: 'CinemaHQ',
                };
                const qrCode = jwt.sign(qrPayload, JWT_SECRET, { expiresIn: '30d' });

                return {
                    id: ticketId,
                    seatId: s.seat_id,
                    price: s.price,
                    qrCode,
                };
            });

            await paymentRepo.createTicketsForOrder(orderId, ticketsToCreate, connection);
        });

        await paymentRepo.saveTransactionLog({
            orderId,
            transactionId: ipnBody.transId,
            amount,
            status: 'PAID_SUCCESS',
            rawData: ipnBody,
        });
    } else {
        // Giao dịch thất bại / Khách hủy
        await paymentRepo.updateOrderStatus(orderId, 'CANCELLED');
        await paymentRepo.saveTransactionLog({
            orderId,
            transactionId: ipnBody.transId || requestId,
            amount,
            status: 'PAYMENT_FAILED',
            rawData: ipnBody,
        });
    }

    return { status: 'PROCESSED' };
};

export const processMomoReturn = async (queryParams) => {
    const { orderId, resultCode, message } = queryParams;
    const isSuccess = Number(resultCode) === 0;

    return {
        orderId,
        success: isSuccess,
        message: isSuccess ? 'Thanh toán thành công' : message || 'Thanh toán không thành công',
    };
};