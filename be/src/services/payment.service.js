import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import pool, { withTransaction } from '../config/db.js';
import { MOMO, JWT_SECRET } from '../config/env.js';
import AppError from '../utils/AppError.js';
import * as paymentRepo from '../repositories/payment.repository.js';

const generateMomoSignature = (rawSignature, secretKey) => {
    return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
};

export const checkoutOrder = async (bookingId, { name, phone, email, ageConfirmed }) => {
    const booking = await paymentRepo.findBookingById(bookingId);
    if (!booking) throw new AppError('Không tìm thấy đơn đặt vé', 404);
    if (booking.status !== 'HOLDING' && booking.status !== 'CHECKOUT_PENDING') {
        throw new AppError('Trạng thái đơn hàng không hợp lệ để checkout', 400);
    }

    await paymentRepo.updateBookingCustomerInfo(bookingId, { name, phone, email, ageConfirmed });
    await paymentRepo.updateBookingStatus(bookingId, 'CHECKOUT_PENDING');

    return { bookingId, customerName: name, phone, email, status: 'CHECKOUT_PENDING' };
};

export const createMomoPayment = async (bookingId) => {
    const booking = await paymentRepo.findBookingById(bookingId);
    if (!booking) throw new AppError('Đơn hàng không tồn tại', 404);

    const requestId = `REQ_${bookingId}_${Date.now()}`;
    const orderId = `MOMO_BK_${bookingId}_${Date.now()}`;
    const orderInfo = `Thanh toan ve xem phim SENEMA đơn hàng #${booking.BookingCode}`;
    const amount = Math.round(Number(booking.total_amount)).toString();
    const extraData = '';

    const rawSignature = `accessKey=${MOMO.ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO.IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO.PARTNER_CODE}&redirectUrl=${MOMO.REDIRECT_URL}&requestId=${requestId}&requestType=captureWallet`;

    const signature = generateMomoSignature(rawSignature, MOMO.SECRET_KEY);

    const requestBody = {
        partnerCode: MOMO.PARTNER_CODE,
        partnerName: 'SENEMA Cinema',
        storeId: 'SENEMA_HQ',
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

    // Lưu record giao dịch mới vào bảng payment
    await paymentRepo.createPaymentRecord({
        bookingId,
        amount: booking.total_amount,
        transactionRef: orderId,
        status: 'CREATED',
    });

    const response = await fetch(MOMO.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (data.resultCode !== 0) {
        throw new AppError(`Lỗi khởi tạo cổng MoMo: ${data.message}`, 400);
    }

    return data.payUrl;
};

export const processMomoIPN = async (ipnBody) => {
    const { partnerCode, orderId, requestId, amount, resultCode, message, signature, transId } = ipnBody;

    // 1. Xác thực Chữ ký MoMo
    const rawSignature = `accessKey=${MOMO.ACCESS_KEY}&amount=${amount}&extraData=${ipnBody.extraData || ''}&message=${message}&orderId=${orderId}&orderType=${ipnBody.orderType || ''}&partnerCode=${partnerCode}&payType=${ipnBody.payType || ''}&requestId=${requestId}&responseTime=${ipnBody.responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = generateMomoSignature(rawSignature, MOMO.SECRET_KEY);
    if (signature !== expectedSignature) {
        throw new AppError('Chữ ký MoMo IPN không hợp lệ', 400);
    }

    // Lấy BookingID từ transactionRef (orderId = MOMO_BK_{bookingId}_{timestamp})
    const bookingId = orderId.split('_')[2];
    const booking = await paymentRepo.findBookingById(bookingId);
    if (!booking) throw new AppError('Không tìm thấy đơn hàng tương ứng', 404);

    // 2. Idempotency Check (Tránh trùng lặp webhook)
    if (booking.status === 'PAID') {
        return { status: 'ALREADY_PAID' };
    }

    // 3. Xử lý thành công / thất bại
    if (resultCode === 0) {
        await withTransaction(pool, async (connection) => {
            // Cập nhật trạng thái Booking & Payment
            await paymentRepo.updateBookingStatus(bookingId, 'PAID', connection);
            await paymentRepo.updatePaymentStatus(orderId, { momoTransId: transId, status: 'SUCCESS', log: ipnBody }, connection);

            // Chốt ghế BOOKED
            await paymentRepo.markSeatsBooked(bookingId, connection);

            // Lấy thông tin chi tiết các ghế để sinh Ticket
            const [seatDetails] = await connection.query(
                `SELECT os.SeatID, os.Price, s.SeatRow, s.SeatNumber, s.SeatLabel, st.TypeName as SeatType,
                sh.ShowtimeID, sh.ShowDate, sh.StartTime, r.RoomNumber, r.CinemaID
         FROM order_seats os
         JOIN seats s ON os.SeatID = s.SeatID
         JOIN seat_types st ON s.SeatTypeID = st.SeatTypeID
         JOIN showtimes sh ON os.ShowtimeID = sh.ShowtimeID
         JOIN rooms r ON sh.RoomID = r.RoomID
         WHERE os.BookingID = ?`,
                [bookingId]
            );

            const ticketsToCreate = seatDetails.map((s) => {
                const ticketNo = `SN-${Date.now().toString().slice(-6)}-${s.SeatID}`;
                const barcode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${s.SeatID}`;

                const jwtPayload = {
                    ticketNo,
                    bookingCode: booking.BookingCode,
                    showtimeId: s.ShowtimeID,
                    seatLabel: s.SeatLabel,
                    iss: 'SENEMA',
                };
                const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '30d' });

                return {
                    ticketNo,
                    bookingId,
                    showtimeId: s.ShowtimeID,
                    seatId: s.SeatID,
                    barcode,
                    jwtToken,
                    price: s.Price,
                    seatRow: s.SeatRow,
                    seatNumber: s.SeatNumber,
                    seatLabel: s.SeatLabel,
                    seatType: s.SeatType,
                    cinemaId: s.CinemaID,
                    roomNumber: s.RoomNumber,
                    date: s.ShowDate,
                    time: s.StartTime,
                };
            });

            await paymentRepo.createTicketsForBooking(ticketsToCreate, connection);
        });
    } else {
        await paymentRepo.updateBookingStatus(bookingId, 'CANCELED');
        await paymentRepo.updatePaymentStatus(orderId, { momoTransId: transId || requestId, status: 'FAILED', log: ipnBody });
    }

    return { status: 'PROCESSED' };
};

export const processMomoReturn = async (queryParams) => {
    const { orderId, resultCode, message } = queryParams;
    const isSuccess = Number(resultCode) === 0;

    return {
        orderId,
        success: isSuccess,
        message: isSuccess ? 'Thanh toán MoMo thành công' : message || 'Thanh toán thất bại',
    };
};