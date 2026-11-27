import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { withTransaction } from '../config/db.js';
import { MOMO, SEPAY, JWT_SECRET, CLIENT_URL } from '../config/env.js';
import AppError from '../utils/AppError.js';
import * as paymentRepo from '../repositories/payment.repository.js';
import * as seatRepo from '../repositories/seat.repository.js';
import { notifyBooked, seatEvents } from './seatHold.service.js';
import { buildCheckout, findSepayOrder } from '../integrations/sepay.client.js';
import { computeVoucherDiscount } from '../config/vouchers.js';

const generateMomoSignature = (rawSignature, secretKey) => {
    return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
};

/** So sánh 2 chuỗi bí mật mà không lộ thông tin qua thời gian chạy (timing attack) */
const safeEqual = (a, b) => {
    const x = Buffer.from(String(a ?? ''));
    const y = Buffer.from(String(b ?? ''));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const checkoutOrder = async (bookingId, { name, phone, email, ageConfirmed }) => {
    const booking = await paymentRepo.findBookingById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status !== 'HOLDING' && booking.status !== 'CHECKOUT_PENDING') {
        throw new AppError('This booking cannot be checked out in its current status', 400);
    }

    await paymentRepo.updateBookingCustomerInfo(bookingId, { name, phone, email, ageConfirmed });
    await paymentRepo.updateBookingStatus(bookingId, 'CHECKOUT_PENDING');

    return { bookingId, customerName: name, phone, email, status: 'CHECKOUT_PENDING' };
};

/* ================================================================== */
/* PHẦN DÙNG CHUNG: chốt đơn sau khi cổng thanh toán báo đã trả tiền   */
/* ================================================================== */

/** Sinh vé cho các ghế đã BOOKED của booking (chạy trong transaction) */
async function createTickets(connection, bookingId, bookingCode) {
    const [seatDetails] = await connection.query(
        `SELECT os.SeatID, os.Price, s.SeatRow, s.SeatNumber, s.SeatLabel, st.TypeName as SeatType,
                sh.ShowtimeID, sh.ShowDate, sh.StartTime, r.RoomNumber, r.CinemaID
         FROM order_seats os
         JOIN seats s ON os.SeatID = s.SeatID
         JOIN seat_types st ON s.SeatTypeID = st.SeatTypeID
         JOIN showtimes sh ON os.ShowtimeID = sh.ShowtimeID
         JOIN rooms r ON sh.RoomID = r.RoomID
         WHERE os.BookingID = ? AND os.SeatStatus = 'BOOKED'`,
        [bookingId]
    );

    const ticketsToCreate = seatDetails.map((s) => {
        const ticketNo = `SN-${Date.now().toString().slice(-6)}-${s.SeatID}`;
        const barcode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${s.SeatID}`;
        const jwtToken = jwt.sign(
            { ticketNo, bookingCode, showtimeId: s.ShowtimeID, seatLabel: s.SeatLabel, iss: 'SENEMA' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
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
}

/**
 * Chốt 1 payment thành công. Gọi bên trong withTransaction.
 * Trả về:
 *  - DUPLICATE       : IPN này đã xử lý rồi (cổng thanh toán gửi lại) -> không làm gì
 *  - NEED_RECONCILE  : tiền đã về nhưng booking không còn chờ (đã hết hạn / đã trả bằng lần thử khác)
 *  - PAID            : đã chốt vé, kèm seatIds để báo cho trang chọn ghế
 */
async function confirmPayment(connection, payment, { providerTransId, log }) {
    // Payment đã bị hủy (job hết hạn) hoặc báo lỗi trước đó, giờ cổng lại báo ĐÃ TRẢ TIỀN
    // -> không được im lặng bỏ qua, vì khách đã mất tiền mà không có vé.
    if (payment.status === 'CANCELED' || payment.status === 'FAILED') {
        await paymentRepo.markPaymentNeedReconcile(connection, payment.TransactionRef, log);
        return { outcome: 'NEED_RECONCILE' };
    }

    const changed = await paymentRepo.settlePayment(connection, payment.TransactionRef, {
        status: 'SUCCESS',
        providerTransId,
        log,
    });
    if (changed === 0) return { outcome: 'DUPLICATE' };

    const bookingChanged = await paymentRepo.markBookingPaid(connection, payment.BookingID);
    if (bookingChanged === 0) {
        await paymentRepo.markPaymentNeedReconcile(connection, payment.TransactionRef, log);
        return { outcome: 'NEED_RECONCILE' };
    }

    const seatIds = await paymentRepo.markSeatsBooked(payment.BookingID, connection);
    await createTickets(connection, payment.BookingID, payment.BookingCode);
    return { outcome: 'PAID', seatIds, showtimeId: payment.ShowtimeID };
}

/* ================================================================== */
/* MOMO                                                                */
/* ================================================================== */

export const createMomoPayment = async (bookingId) => {
    const booking = await paymentRepo.findBookingById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    const requestId = `REQ_${bookingId}_${Date.now()}`;
    const orderId = `MOMO_BK_${bookingId}_${Date.now()}`;
    const orderInfo = `SENEMA movie ticket payment #${booking.BookingCode}`;
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
        throw new AppError(`MoMo gateway error: ${data.message}`, 400);
    }

    return data.payUrl;
};

export const processMomoIPN = async (ipnBody) => {
    const { partnerCode, orderId, requestId, amount, resultCode, message, signature, transId } = ipnBody;

    // 1. Xác thực Chữ ký MoMo
    const rawSignature = `accessKey=${MOMO.ACCESS_KEY}&amount=${amount}&extraData=${ipnBody.extraData || ''}&message=${message}&orderId=${orderId}&orderType=${ipnBody.orderType || ''}&partnerCode=${partnerCode}&payType=${ipnBody.payType || ''}&requestId=${requestId}&responseTime=${ipnBody.responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = generateMomoSignature(rawSignature, MOMO.SECRET_KEY);
    if (signature !== expectedSignature) {
        throw new AppError('Invalid MoMo IPN signature', 400);
    }

    const payment = await paymentRepo.findPaymentByRef(orderId);
    if (!payment) throw new AppError('Matching transaction not found', 404);

    // 2. Xử lý thành công / thất bại
    if (resultCode === 0) {
        // (Bản cũ gọi withTransaction(pool, fn) -> sai chữ ký hàm, IPN thành công sẽ bị crash)
        const result = await withTransaction((connection) =>
            confirmPayment(connection, payment, { providerTransId: String(transId), log: ipnBody })
        );
        if (result.outcome === 'PAID') notifyBooked(result.showtimeId, result.seatIds);
        return { status: result.outcome };
    }

    await withTransaction(async (connection) => {
        await paymentRepo.settlePayment(connection, orderId, {
            status: 'FAILED',
            providerTransId: String(transId || requestId),
            log: ipnBody,
        });
    });
    return { status: 'FAILED' };
};

export const processMomoReturn = async (queryParams) => {
    const { orderId, resultCode, message } = queryParams;
    const isSuccess = Number(resultCode) === 0;

    return {
        orderId,
        success: isSuccess,
        message: isSuccess ? 'MoMo payment successful' : message || 'Payment failed',
    };
};

/* ================================================================== */
/* SEPAY (cổng thanh toán, khách quét VietQR)                          */
/* ================================================================== */

/**
 * Bước 1: FE bấm "Thanh toán".
 * FE chỉ gửi clientId + showtimeId + thông tin khách. Số tiền do server tự tính từ order_seats.
 */
export const createSepayPayment = async ({ clientId, showtimeId, customer, voucher }) => {
    return withTransaction(async (conn) => {
        const booking = await paymentRepo.lockPayableBooking(conn, { sessionId: clientId, showtimeId });
        if (!booking) throw new AppError('Your seat hold has expired or no seats are selected', 409);

        const { seatCount, total } = await paymentRepo.sumHeldSeats(conn, booking.BookingID);
        if (seatCount === 0 || total <= 0) throw new AppError('No seats in this order', 400);

        // Voucher: server tự tra số tiền giảm, không tin con số nào từ FE
        const applied = computeVoucherDiscount(voucher, total, SEPAY.MIN_AMOUNT);
        if (applied === null) throw new AppError('Invalid voucher code', 400);

        await paymentRepo.updateBookingCustomerInfo(
            booking.BookingID,
            { name: customer.name, phone: customer.phone, email: customer.email, ageConfirmed: customer.ageConfirmed ?? 'P' },
            conn
        );
        const updated = await paymentRepo.startCheckout(conn, booking.BookingID, {
            totalAmount: total,
            discount: applied.discount,
            minutes: SEPAY.PAYMENT_MINUTES,
        });
        const amount = Math.round(Number(updated.total_amount));

        // Mỗi lần bấm thanh toán = 1 mã mới (SePay yêu cầu order_invoice_number duy nhất).
        // Chỉ dùng chữ + số để an toàn khi đi qua ngân hàng.
        const transactionRef = `CINE${booking.BookingID}T${Date.now().toString(36).toUpperCase()}`;
        await paymentRepo.createPaymentRecord(
            {
                bookingId: booking.BookingID,
                amount,
                transactionRef,
                status: 'PENDING',
                method: 'BANK_TRANSFER',
                partner: 'SEPAY',
            },
            conn
        );

        // Ký form ngay trong transaction: nếu thiếu cấu hình -> ném lỗi -> rollback, không để lại rác
        const { checkoutUrl, fields } = buildCheckout({
            invoiceNumber: transactionRef,
            amount,
            description: `Movie ticket ${booking.BookingCode}`,
            returnUrl: `${CLIENT_URL}/payment/result?ref=${transactionRef}`,
        });

        return {
            transactionRef,
            amount,
            discount: applied.discount,
            voucher: applied.code,
            expiresAt: new Date(updated.hold_expires_at).getTime(),
            checkoutUrl,
            fields,
        };
    });
};

/**
 * Bước 2: SePay gọi IPN (server -> server). Đây là NGUỒN SỰ THẬT duy nhất về việc đã trả tiền.
 * Trả về object mô tả kết quả; controller luôn trả HTTP 200 nếu đã xác thực được,
 * để SePay không gửi lại mãi những thông báo mình cố ý bỏ qua.
 */
export const processSepayIPN = async (secretHeader, body) => {
    if (!SEPAY.IPN_SECRET) {
        console.error('[sepay ipn] chưa đặt SEPAY_IPN_SECRET trong .env -> từ chối mọi IPN');
        throw new AppError('IPN is not configured', 500);
    }
    if (!safeEqual(secretHeader, SEPAY.IPN_SECRET)) {
        throw new AppError('Unauthorized', 401);
    }

    const { notification_type: type, order, transaction } = body ?? {};
    if (type !== 'ORDER_PAID' || !order?.order_invoice_number) {
        console.warn('[sepay ipn] bỏ qua thông báo', type);
        return { outcome: 'IGNORED' };
    }

    return applyPaidSepayOrder(order.order_invoice_number, order, {
        source: 'IPN',
        providerTransId: transaction?.transaction_id ?? order.order_id ?? null,
        log: body,
    });
};

/**
 * Lõi xử lý "SePay xác nhận đơn này đã trả tiền". Dùng chung cho:
 *  - IPN (SePay chủ động gọi)
 *  - đối soát (mình chủ động hỏi SePay khi IPN không về)
 */
async function applyPaidSepayOrder(ref, order, { source, providerTransId, log }) {
    const payment = await paymentRepo.findPaymentByRef(ref);
    if (!payment || payment.Partner !== 'SEPAY') {
        console.warn(`[sepay ${source}] không có payment`, ref);
        return { outcome: 'UNKNOWN_ORDER' };
    }

    // order_amount là chuỗi "120000.00" -> đổi sang số rồi so với số tiền mình đã lưu
    const paidAmount = Math.round(Number(order.order_amount));
    if (paidAmount !== Math.round(Number(payment.Amount))) {
        console.error(`[sepay ${source}] sai số tiền ${ref}: nhận ${paidAmount}, cần ${payment.Amount}`);
        await withTransaction((conn) => paymentRepo.markPaymentNeedReconcile(conn, ref, log));
        return { outcome: 'AMOUNT_MISMATCH' };
    }

    const result = await withTransaction(async (conn) => {
        // Khóa dòng payment: 2 thông báo trùng tới cùng lúc thì cái thứ 2 phải đợi, rồi thấy status đã đổi
        let locked = await paymentRepo.findPaymentByRef(ref, conn, { forUpdate: true });

        // Đơn đã bị job hủy vì hết hạn nhưng tiền vẫn về -> thử lấy lại ghế cũ trước khi bó tay
        if (locked.status === 'CANCELED' && locked.bookingStatus === 'EXPIRED') {
            const revived = await paymentRepo.tryReviveExpiredBooking(conn, {
                bookingId: locked.BookingID,
                transactionRef: ref,
                paidAmount,
            });
            if (revived) {
                console.warn(`[sepay ${source}] ${ref}: đơn đã hết hạn nhưng ghế còn trống -> khôi phục`);
                locked = { ...locked, status: 'PENDING', bookingStatus: 'CHECKOUT_PENDING' };
            }
        }
        return confirmPayment(conn, locked, { providerTransId, log });
    });

    // Báo realtime SAU khi commit, để client không thấy "booked" rồi DB lại rollback
    if (result.outcome === 'PAID') {
        notifyBooked(result.showtimeId, result.seatIds);
        console.log(`[sepay ${source}] ${ref}: đã chốt vé`);
    }
    if (result.outcome === 'NEED_RECONCILE') {
        console.error(`[sepay ${source}] ${ref}: tiền đã về nhưng đơn không còn hiệu lực -> cần hoàn tiền thủ công`);
    }
    return { outcome: result.outcome };
}

/* ------------------------- Đối soát chủ động ------------------------- */

// Nhớ lần hỏi gần nhất của từng đơn để không spam API SePay (FE poll 3 giây/lần)
const lastReconcileAt = new Map();
const RECONCILE_EVERY_MS = 10_000;

/**
 * Hỏi SePay xem đơn đã được thanh toán chưa; nếu rồi thì chốt vé như khi nhận IPN.
 * force = true: bỏ qua giới hạn tần suất (dùng trong job trước khi nhả ghế).
 */
export async function reconcileSepayPayment(ref, { force = false } = {}) {
    if (!force) {
        // Chỉ giới hạn các lượt hỏi đến từ FE. Lượt của job (force) không tính,
        // để ngay sau khi job hủy đơn, trang kết quả vẫn được hỏi lại SePay ngay.
        const now = Date.now();
        if (now - (lastReconcileAt.get(ref) ?? 0) < RECONCILE_EVERY_MS) return null;
        lastReconcileAt.set(ref, now);
        if (lastReconcileAt.size > 1000) lastReconcileAt.clear(); // tránh Map phình mãi
    }

    let order;
    try {
        order = await findSepayOrder(ref);
    } catch (err) {
        console.warn(`[sepay reconcile] không hỏi được SePay cho ${ref}:`, err.response?.status ?? err.message);
        return null;
    }
    if (!order || order.order_status !== 'CAPTURED') return null;

    return applyPaidSepayOrder(ref, order, {
        source: 'RECONCILE',
        providerTransId: order.order_id ?? null,
        log: { source: 'RECONCILE', order },
    });
}

/**
 * Bước 3: FE quay về /payment/result?ref=... và hỏi trạng thái mỗi vài giây.
 * Không trả thông tin cá nhân của khách, chỉ trạng thái.
 */
export const getPaymentStatus = async (transactionRef) => {
    let p = await paymentRepo.findPaymentByRef(transactionRef);
    if (!p) throw new AppError('Transaction not found', 404);

    // Chưa thấy IPN? Tự hỏi SePay (tối đa 10 giây/lần). Hỏi cả đơn CANCELED:
    // có thể khách trả tiền đúng lúc job vừa hủy đơn vì hết hạn.
    if (p.Partner === 'SEPAY' && ['CREATED', 'PENDING', 'CANCELED'].includes(p.status)) {
        const r = await reconcileSepayPayment(transactionRef);
        if (r) p = await paymentRepo.findPaymentByRef(transactionRef);
    }

    let state;
    if (p.status === 'SUCCESS' && p.bookingStatus === 'PAID') state = 'PAID';
    else if (p.status === 'NEED_RECONCILE') state = 'NEED_SUPPORT';
    else if (p.status === 'CREATED' || p.status === 'PENDING') state = 'PENDING';
    else state = 'FAILED';

    return {
        transactionRef: p.TransactionRef,
        state,
        amount: Math.round(Number(p.Amount)),
        bookingCode: state === 'PAID' ? p.BookingCode : null,
    };
};

/**
 * Job dọn đơn CHECKOUT_PENDING quá hạn: khách mở trang SePay rồi bỏ đi.
 * (holdSweeper chỉ dọn HOLDING, nên thiếu job này ghế sẽ bị giữ mãi mãi.)
 */
export const expireStaleCheckouts = async () => {
    const grace = SEPAY.EXPIRE_GRACE_MINUTES;
    const stale = await paymentRepo.findStaleCheckouts(grace);

    for (const b of stale) {
        // Trước khi nhả ghế, hỏi SePay lần cuối: lỡ khách đã trả mà IPN chưa về
        let paid = false;
        for (const ref of await paymentRepo.findCheckableRefsOfBooking(b.BookingID)) {
            const r = await reconcileSepayPayment(ref, { force: true });
            if (r?.outcome === 'PAID') paid = true;
        }
        if (paid) continue;

        const seatIds = await withTransaction(async (conn) => {
            if (!(await paymentRepo.lockStaleCheckout(conn, b.BookingID, grace))) return null;
            const released = await seatRepo.releaseAllHeldSeats(conn, b.BookingID);
            await seatRepo.setBookingStatus(conn, b.BookingID, 'EXPIRED');
            await paymentRepo.cancelPendingPaymentsOfBooking(conn, b.BookingID);
            return released;
        });
        if (seatIds === null) continue; // IPN vừa chốt đơn này trong lúc mình đang xét

        if (seatIds.length) {
            seatEvents.emit('seats-changed', {
                showtimeId: String(b.ShowtimeID),
                seatIds: seatIds.map(String),
                status: 'available',
            });
        }
        if (b.SessionID) {
            seatEvents.emit('hold-expired', { sessionId: b.SessionID, showtimeId: String(b.ShowtimeID) });
        }
    }
};
