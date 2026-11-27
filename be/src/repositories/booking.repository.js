import pool from '../config/db.js';

// Ngày/giờ được format NGAY TRONG SQL thành chuỗi.
// Nếu trả DATE thô, mysql2 đổi thành Date JS theo múi +07:00, JSON lại in theo UTC
// -> "2026-12-02" có thể thành "2026-12-01T17:00:00Z" và FE hiển thị lệch 1 ngày.
const BOOKING_COLUMNS = `
    b.BookingID, b.BookingCode, b.status AS bookingStatus,
    b.seats_subtotal, b.fb_subtotal, b.discount_amount, b.total_amount,
    DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i') AS createdAt,
    DATE_FORMAT(sh.ShowDate, '%Y-%m-%d') AS showDate,
    TIME_FORMAT(sh.StartTime, '%H:%i') AS startTime,
    TIME_FORMAT(sh.EndTime, '%H:%i') AS endTime,
    sh.Format AS format,
    m.MovieID, m.Title AS movieTitle, m.PosterUrl AS posterUrl, m.AgeRating AS ageRating, m.Duration AS duration,
    c.CinemaName AS cinemaName, c.Branch AS branch, c.Address AS address,
    r.RoomNumber AS roomNumber`;

const BOOKING_JOINS = `
    FROM booking b
    JOIN showtimes sh ON sh.ShowtimeID = b.ShowtimeID
    JOIN movies m     ON m.MovieID = sh.MovieID
    JOIN rooms r      ON r.RoomID = sh.RoomID
    JOIN cinemas c    ON c.CinemaID = r.CinemaID`;

/**
 * Lịch sử đặt vé của 1 trình duyệt (session_id = clientId trong localStorage).
 * Lấy đơn đã thanh toán / đã hoàn tiền, và cả đơn "tiền đã về nhưng cần hỗ trợ"
 * để khách không tưởng mình mất tiền.
 */
export async function findHistoryBySession(sessionId, limit = 50) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS},
            (SELECT GROUP_CONCAT(t.SeatLabel ORDER BY t.SeatLabel SEPARATOR ', ')
               FROM ticket t WHERE t.BookingID = b.BookingID) AS seatLabels,
            (SELECT COUNT(*) FROM ticket t WHERE t.BookingID = b.BookingID) AS ticketCount,
            EXISTS (SELECT 1 FROM payment p
                     WHERE p.BookingID = b.BookingID AND p.status = 'NEED_RECONCILE') AS needSupport
     ${BOOKING_JOINS}
     WHERE b.session_id = ?
       AND (b.status IN ('PAID', 'REFUNDED')
            OR EXISTS (SELECT 1 FROM payment p
                        WHERE p.BookingID = b.BookingID AND p.status = 'NEED_RECONCILE'))
     ORDER BY b.created_at DESC
     LIMIT ?`,
    [sessionId, limit]
  );
  return rows;
}

/** 1 đơn theo mã, CHỈ khi thuộc đúng trình duyệt này (khách vãng lai chưa có tài khoản) */
export async function findBookingByCode(bookingCode, sessionId) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS},
            b.customer_name AS customerName, b.customer_email AS customerEmail,
            b.customer_phone AS customerPhone
     ${BOOKING_JOINS}
     WHERE b.BookingCode = ? AND b.session_id = ?
     LIMIT 1`,
    [bookingCode, sessionId]
  );
  return rows[0] ?? null;
}

export async function findTicketsOfBooking(bookingId) {
  const [rows] = await pool.query(
    `SELECT TicketNo AS ticketNo, SeatLabel AS seatLabel, SeatRow AS seatRow, SeatNumber AS seatNumber,
            SeatType AS seatType, Price AS price, Barcode AS barcode, Gate AS gate,
            status, jwt_token AS jwtToken
       FROM ticket
      WHERE BookingID = ?
      ORDER BY SeatRow, SeatNumber`,
    [bookingId]
  );
  return rows;
}

/** Lần thanh toán quyết định của đơn: ưu tiên SUCCESS, rồi NEED_RECONCILE, rồi lần mới nhất */
export async function findMainPaymentOfBooking(bookingId) {
  const [rows] = await pool.query(
    `SELECT TransactionRef AS transactionRef, Partner AS partner, Method AS method,
            Amount AS amount, status,
            DATE_FORMAT(payment_time, '%Y-%m-%d %H:%i') AS paidAt
       FROM payment
      WHERE BookingID = ?
      ORDER BY FIELD(status, 'SUCCESS', 'NEED_RECONCILE', 'REFUNDED') DESC, PaymentID DESC
      LIMIT 1`,
    [bookingId]
  );
  return rows[0] ?? null;
}
