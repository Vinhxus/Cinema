import pool from '../config/db.js';

export const findBookingById = async (bookingId) => {
    const [rows] = await pool.query(
        `SELECT b.*, TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) as elapsed_minutes 
     FROM booking b WHERE b.BookingID = ?`,
        [bookingId]
    );
    return rows[0] || null;
};

export const updateBookingCustomerInfo = async (bookingId, { name, phone, email, ageConfirmed }, connection = pool) => {
    await connection.query(
        `UPDATE booking 
     SET customer_name = ?, customer_phone = ?, customer_email = ?, age_confirmed = ?, age_confirmed_at = NOW() 
     WHERE BookingID = ?`,
        [name, phone, email, ageConfirmed, bookingId]
    );
};

export const updateBookingStatus = async (bookingId, status, connection = pool) => {
    await connection.query(`UPDATE booking SET status = ? WHERE BookingID = ?`, [status, bookingId]);
};

export const createPaymentRecord = async (
    { bookingId, amount, transactionRef, status, method = 'CAPTURE_WALLET', partner = 'MOMO' },
    connection = pool
) => {
    const [result] = await connection.query(
        `INSERT INTO payment (BookingID, Amount, Method, Partner, TransactionRef, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [bookingId, amount, method, partner, transactionRef, status]
    );
    return result.insertId;
};

export const updatePaymentStatus = async (transactionRef, { momoTransId, status, log }, connection = pool) => {
    await connection.query(
        `UPDATE payment 
     SET momo_trans_id = ?, status = ?, payment_time = NOW(), transaction_log = ? 
     WHERE TransactionRef = ?`,
        [momoTransId, status, JSON.stringify(log), transactionRef]
    );
};

/**
 * Chốt các ghế đang HELD của booking thành BOOKED, trả về danh sách SeatID đã chốt.
 * Chỉ đụng tới ghế HELD: ghế RELEASED (khách đã bỏ chọn) phải giữ nguyên, nếu không
 * sẽ "hồi sinh" ghế cũ và đụng unique key uk_active_showtime_seat.
 */
export const markSeatsBooked = async (bookingId, connection = pool) => {
    const [rows] = await connection.query(
        `SELECT SeatID FROM order_seats WHERE BookingID = ? AND SeatStatus = 'HELD' FOR UPDATE`,
        [bookingId]
    );
    await connection.query(
        `UPDATE order_seats SET SeatStatus = 'BOOKED' WHERE BookingID = ? AND SeatStatus = 'HELD'`,
        [bookingId]
    );
    return rows.map((r) => r.SeatID);
};

export const createTicketsForBooking = async (ticketsData, connection = pool) => {
    for (const t of ticketsData) {
        await connection.query(
            `INSERT INTO ticket 
       (TicketNo, BookingID, ShowtimeID, SeatID, Barcode, jwt_token, Price, SeatRow, SeatNumber, SeatLabel, SeatType, CinemaID, RoomNumber, Gate, Date, Time, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GATE 01', ?, ?, 'VALID', NOW())`,
            [
                t.ticketNo,
                t.bookingId,
                t.showtimeId,
                t.seatId,
                t.barcode,
                t.jwtToken,
                t.price,
                t.seatRow,
                t.seatNumber,
                t.seatLabel,
                t.seatType,
                t.cinemaId,
                t.roomNumber,
                t.date,
                t.time,
            ]
        );
    }
};
/* ------------------------------------------------------------------ */
/* Dùng cho SePay (và dùng chung được cho MoMo)                       */
/* ------------------------------------------------------------------ */

/**
 * Booking của phiên trình duyệt này cho suất này, còn trong hạn giữ ghế.
 * Nhận cả CHECKOUT_PENDING: khách bấm thanh toán, sang SePay rồi bấm hủy quay lại
 * -> vẫn được thử thanh toán lại trong thời gian còn lại.
 * FOR UPDATE: khóa dòng booking tới hết transaction (2 tab bấm thanh toán cùng lúc vẫn an toàn).
 */
export const lockPayableBooking = async (connection, { sessionId, showtimeId }) => {
    const [rows] = await connection.query(
        `SELECT BookingID, BookingCode, ShowtimeID, status, hold_expires_at
       FROM booking
      WHERE session_id = ? AND ShowtimeID = ?
        AND status IN ('HOLDING', 'CHECKOUT_PENDING')
        AND hold_expires_at > NOW()
      ORDER BY BookingID DESC
      LIMIT 1
      FOR UPDATE`,
        [sessionId, showtimeId]
    );
    return rows[0] || null;
};

/** Tổng tiền ghế đang HELD — server TỰ TÍNH, không tin số tiền FE gửi lên */
export const sumHeldSeats = async (connection, bookingId) => {
    const [rows] = await connection.query(
        `SELECT COUNT(*) AS seatCount, COALESCE(SUM(Price), 0) AS total
       FROM order_seats WHERE BookingID = ? AND SeatStatus = 'HELD'`,
        [bookingId]
    );
    return { seatCount: Number(rows[0].seatCount), total: Math.round(Number(rows[0].total)) };
};

/**
 * Chuyển booking sang CHECKOUT_PENDING và kéo dài hạn giữ ghế để khách kịp trả tiền.
 * GREATEST: nếu còn nhiều thời gian hơn PAYMENT_MINUTES thì giữ nguyên, không rút ngắn.
 * holdSweeper chỉ quét HOLDING nên sẽ không nhả ghế của đơn đang thanh toán;
 * đơn CHECKOUT_PENDING quá hạn do expireStaleCheckouts() dọn.
 */
export const startCheckout = async (connection, bookingId, { totalAmount, discount = 0, minutes }) => {
    await connection.query(
        `UPDATE booking
        SET status = 'CHECKOUT_PENDING',
            seats_subtotal = ?,
            discount_amount = ?,
            total_amount = ? + fb_subtotal - ?,
            hold_expires_at = GREATEST(hold_expires_at, NOW() + INTERVAL ? MINUTE)
      WHERE BookingID = ?`,
        [totalAmount, discount, totalAmount, discount, minutes, bookingId]
    );
    const [rows] = await connection.query(
        `SELECT total_amount, hold_expires_at FROM booking WHERE BookingID = ?`,
        [bookingId]
    );
    return rows[0];
};

export const findPaymentByRef = async (transactionRef, connection = pool, { forUpdate = false } = {}) => {
    const [rows] = await connection.query(
        `SELECT p.PaymentID, p.BookingID, p.Amount, p.Partner, p.TransactionRef, p.status,
            b.status AS bookingStatus, b.BookingCode, b.ShowtimeID
       FROM payment p
       JOIN booking b ON b.BookingID = p.BookingID
      WHERE p.TransactionRef = ?
      ${forUpdate ? 'FOR UPDATE' : ''}`,
        [transactionRef]
    );
    return rows[0] || null;
};

/**
 * Đổi trạng thái payment CHỈ KHI nó còn đang chờ (CREATED/PENDING).
 * Trả về số dòng bị đổi: 0 nghĩa là IPN này đã được xử lý rồi (SePay gửi lại) -> bỏ qua.
 * Đây là chỗ làm cho IPN "idempotent".
 * (Cột momo_trans_id được dùng chung để lưu mã giao dịch của cổng thanh toán.)
 */
export const settlePayment = async (connection, transactionRef, { status, providerTransId, log }) => {
    const [result] = await connection.query(
        `UPDATE payment
        SET status = ?, momo_trans_id = ?, payment_time = NOW(), transaction_log = ?
      WHERE TransactionRef = ? AND status IN ('CREATED', 'PENDING')`,
        [status, providerTransId, JSON.stringify(log), transactionRef]
    );
    return result.affectedRows;
};

/** Booking -> PAID nếu nó còn đang chờ. 0 dòng = booking đã PAID/EXPIRED/CANCELED trước đó */
export const markBookingPaid = async (connection, bookingId) => {
    const [result] = await connection.query(
        `UPDATE booking SET status = 'PAID'
      WHERE BookingID = ? AND status IN ('HOLDING', 'CHECKOUT_PENDING')`,
        [bookingId]
    );
    return result.affectedRows;
};

/** Đơn đang thanh toán nhưng đã quá hạn (+ thời gian chờ IPN đến trễ) */
export const findStaleCheckouts = async (graceMinutes, limit = 100) => {
    const [rows] = await pool.query(
        `SELECT BookingID, ShowtimeID, session_id AS SessionID
       FROM booking
      WHERE status = 'CHECKOUT_PENDING'
        AND hold_expires_at <= NOW() - INTERVAL ? MINUTE
      ORDER BY hold_expires_at
      LIMIT ?`,
        [graceMinutes, limit]
    );
    return rows;
};

/** Khóa lại và kiểm tra lần nữa trong transaction (giữa lúc SELECT và lúc xử lý, IPN có thể vừa tới) */
export const lockStaleCheckout = async (connection, bookingId, graceMinutes) => {
    const [rows] = await connection.query(
        `SELECT BookingID FROM booking
      WHERE BookingID = ? AND status = 'CHECKOUT_PENDING'
        AND hold_expires_at <= NOW() - INTERVAL ? MINUTE
      FOR UPDATE`,
        [bookingId, graceMinutes]
    );
    return rows.length > 0;
};

export const cancelPendingPaymentsOfBooking = async (connection, bookingId) => {
    await connection.query(
        `UPDATE payment SET status = 'CANCELED'
      WHERE BookingID = ? AND status IN ('CREATED', 'PENDING')`,
        [bookingId]
    );
};

/** Tiền đã về nhưng không chốt được vé (đơn hết hạn, sai số tiền...) -> cần người xử lý / hoàn tiền */
export const markPaymentNeedReconcile = async (connection, transactionRef, log) => {
    await connection.query(
        `UPDATE payment SET status = 'NEED_RECONCILE', transaction_log = ? WHERE TransactionRef = ?`,
        [JSON.stringify(log), transactionRef]
    );
};

/** Các payment SePay còn chờ (hoặc đã bị hủy do hết hạn) của 1 booking — để hỏi lại SePay trước khi nhả ghế */
export const findCheckableRefsOfBooking = async (bookingId) => {
    const [rows] = await pool.query(
        `SELECT TransactionRef FROM payment
      WHERE BookingID = ? AND Partner = 'SEPAY' AND status IN ('CREATED', 'PENDING')`,
        [bookingId]
    );
    return rows.map((r) => r.TransactionRef);
};

/**
 * Tiền đã về cho 1 đơn ĐÃ HẾT HẠN: thử lấy lại đúng các ghế cũ.
 * - Nếu ghế đã bị người khác giữ -> unique key uk_active_showtime_seat báo ER_DUP_ENTRY -> thất bại.
 * - Nếu tổng tiền ghế lấy lại không khớp số đã trả -> thất bại (có thể dính ghế khách đã bỏ chọn).
 * Dùng SAVEPOINT để thất bại thì chỉ quay lui phần này, transaction bên ngoài vẫn tiếp tục.
 * Trả về true nếu khôi phục được (booking về CHECKOUT_PENDING, payment về PENDING).
 */
export const tryReviveExpiredBooking = async (connection, { bookingId, transactionRef, paidAmount }) => {
    await connection.query('SAVEPOINT revive_booking');
    try {
        await connection.query(
            `UPDATE order_seats SET SeatStatus = 'HELD' WHERE BookingID = ? AND SeatStatus = 'RELEASED'`,
            [bookingId]
        );
        const [[row]] = await connection.query(
            `SELECT COALESCE(SUM(os.Price), 0) + b.fb_subtotal - b.discount_amount AS expected
           FROM booking b
           LEFT JOIN order_seats os ON os.BookingID = b.BookingID AND os.SeatStatus = 'HELD'
          WHERE b.BookingID = ?
          GROUP BY b.BookingID`,
            [bookingId]
        );
        if (!row || Math.round(Number(row.expected)) !== Math.round(Number(paidAmount))) {
            throw Object.assign(new Error('amount mismatch'), { code: 'REVIVE_MISMATCH' });
        }
        await connection.query(`UPDATE booking SET status = 'CHECKOUT_PENDING' WHERE BookingID = ?`, [bookingId]);
        await connection.query(`UPDATE payment SET status = 'PENDING' WHERE TransactionRef = ?`, [transactionRef]);
        await connection.query('RELEASE SAVEPOINT revive_booking');
        return true;
    } catch (err) {
        await connection.query('ROLLBACK TO SAVEPOINT revive_booking');
        if (err.code === 'ER_DUP_ENTRY' || err.code === 'REVIVE_MISMATCH') return false;
        throw err;
    }
};
