// REPOSITORY = chỉ chứa câu SQL, không có logic nghiệp vụ.
// Mọi hàm nhận `db` ở tham số đầu: có thể là `pool` (query lẻ)
// hoặc `conn` đang trong transaction (xem withTransaction ở config/db.js).
// Nhờ vậy service tự quyết định câu nào phải chạy chung 1 transaction.

/* ------------------------------------------------------------------ */
/* Suất chiếu + sơ đồ ghế                                              */
/* ------------------------------------------------------------------ */

export async function findShowtimeById(db, showtimeId, cutoffMinutes) {
  const [rows] = await db.query(
    `SELECT s.ShowtimeID, s.RoomID, s.ShowDate, s.StartTime, s.EndTime, s.Format,
            s.BaseTicketPrice, s.Status,
            TIMESTAMP(s.ShowDate, s.StartTime) AS StartsAt,
            -- FR-BK-04: còn bán online nếu giờ chiếu > bây giờ + cutoff
            (TIMESTAMP(s.ShowDate, s.StartTime) > NOW() + INTERVAL ? MINUTE
              AND s.Status IN ('SCHEDULED', 'CHECKIN_OPEN')) AS IsOnSale,
            m.MovieID, m.Title, m.AgeRating, m.PosterUrl, m.Duration,
            r.RoomNumber, r.RoomType,
            c.CinemaID, c.CinemaName, c.Branch
       FROM showtimes s
       JOIN movies  m ON m.MovieID  = s.MovieID
       JOIN rooms   r ON r.RoomID   = s.RoomID
       JOIN cinemas c ON c.CinemaID = r.CinemaID
      WHERE s.ShowtimeID = ?
      LIMIT 1`,
    [cutoffMinutes, showtimeId]
  );
  return rows[0] ?? null;
}

/** Danh sách suất chiếu sắp tới còn bán (dùng cho trang chọn suất tạm thời) */
export async function findUpcomingShowtimes(db, { date, cutoffMinutes, limit = 60 }) {
  const params = [cutoffMinutes];
  let dateFilter = '';
  if (date) {
    dateFilter = 'AND s.ShowDate = ?';
    params.push(date);
  }
  params.push(limit);

  const [rows] = await db.query(
    `SELECT s.ShowtimeID, DATE_FORMAT(s.ShowDate, '%Y-%m-%d') AS ShowDate,
            s.StartTime, s.Format, s.BaseTicketPrice,
            m.Title, r.RoomNumber, c.CinemaName, c.Branch
       FROM showtimes s
       JOIN movies  m ON m.MovieID  = s.MovieID
       JOIN rooms   r ON r.RoomID   = s.RoomID
       JOIN cinemas c ON c.CinemaID = r.CinemaID
      WHERE s.Status IN ('SCHEDULED', 'CHECKIN_OPEN')
        AND TIMESTAMP(s.ShowDate, s.StartTime) > NOW() + INTERVAL ? MINUTE
        ${dateFilter}
      ORDER BY s.ShowDate, s.StartTime
      LIMIT ?`,
    params
  );
  return rows;
}

/** Toàn bộ ghế của 1 phòng + loại ghế (để vẽ sơ đồ và tính giá) */
export async function findSeatsByRoom(db, roomId) {
  const [rows] = await db.query(
    `SELECT se.SeatID, se.SeatRow, se.SeatNumber, se.SeatLabel,
            st.TypeCode, st.Surcharge, st.SeatsPerUnit
       FROM seats se
       JOIN seat_types st ON st.SeatTypeID = se.SeatTypeID
      WHERE se.RoomID = ? AND se.IsActive = TRUE
      ORDER BY se.SeatRow, se.SeatNumber`,
    [roomId]
  );
  return rows;
}

/** 1 ghế, chỉ khi nó thuộc đúng phòng của suất chiếu (chặn client gửi SeatID phòng khác) */
export async function findSeatInRoom(db, seatId, roomId) {
  const [rows] = await db.query(
    `SELECT se.SeatID, se.SeatLabel, st.TypeCode, st.Surcharge, st.SeatsPerUnit
       FROM seats se
       JOIN seat_types st ON st.SeatTypeID = se.SeatTypeID
      WHERE se.SeatID = ? AND se.RoomID = ? AND se.IsActive = TRUE
      LIMIT 1`,
    [seatId, roomId]
  );
  return rows[0] ?? null;
}

/**
 * Các ghế đang bị chiếm của 1 suất: đã bán (BOOKED) hoặc đang giữ (HELD) còn hạn.
 * HELD đã quá hạn nhưng job chưa kịp dọn thì coi như trống.
 * CHECKOUT_PENDING (đang thanh toán) vẫn giữ -> FR-BK-15.
 */
export async function findTakenSeats(db, showtimeId) {
  const [rows] = await db.query(
    `SELECT os.SeatID, os.SeatStatus, b.session_id AS SessionID
       FROM order_seats os
       JOIN booking b ON b.BookingID = os.BookingID
      WHERE os.ShowtimeID = ?
        AND (
              os.SeatStatus = 'BOOKED'
           OR (os.SeatStatus = 'HELD'
               AND (b.status = 'CHECKOUT_PENDING'
                    OR (b.status = 'HOLDING' AND b.hold_expires_at > NOW())))
        )`,
    [showtimeId]
  );
  return rows;
}

/* ------------------------------------------------------------------ */
/* Booking HOLDING (giỏ hàng tạm của 1 phiên cho 1 suất)              */
/* ------------------------------------------------------------------ */

/** Booking HOLDING còn hạn của phiên này. forUpdate = khóa dòng đến hết transaction */
export async function findActiveHold(db, { sessionId, showtimeId, forUpdate = false }) {
  const [rows] = await db.query(
    `SELECT BookingID, BookingCode, ShowtimeID, hold_expires_at AS HoldExpiresAt
       FROM booking
      WHERE session_id = ? AND ShowtimeID = ?
        AND status = 'HOLDING' AND hold_expires_at > NOW()
      ORDER BY BookingID DESC
      LIMIT 1
      ${forUpdate ? 'FOR UPDATE' : ''}`,
    [sessionId, showtimeId]
  );
  return rows[0] ?? null;
}

/** Mọi booking HOLDING của 1 phiên (mọi suất) — dùng khi phiên rời đi hẳn */
export async function findHoldsBySession(db, sessionId) {
  const [rows] = await db.query(
    `SELECT BookingID, ShowtimeID
       FROM booking
      WHERE session_id = ? AND status = 'HOLDING'`,
    [sessionId]
  );
  return rows;
}

/**
 * Tạo booking HOLDING mới. Hạn giữ tính bằng NOW() của DATABASE
 * -> đồng hồ của server quyết định, không phải đồng hồ trình duyệt (FR-BK-11).
 * Thông tin khách để trống, trang Payment sẽ điền sau.
 */
export async function createHoldBooking(db, { sessionId, showtimeId, bookingCode, holdMinutes }) {
  const [result] = await db.query(
    `INSERT INTO booking
       (BookingCode, ShowtimeID, session_id, customer_name, customer_email, customer_phone,
        seats_subtotal, total_amount, status, Channel, hold_expires_at)
     VALUES (?, ?, ?, '', '', '', 0, 0, 'HOLDING', 'ONLINE', NOW() + INTERVAL ? MINUTE)`,
    [bookingCode, showtimeId, sessionId, holdMinutes]
  );
  const [rows] = await db.query(
    `SELECT BookingID, BookingCode, ShowtimeID, hold_expires_at AS HoldExpiresAt
       FROM booking WHERE BookingID = ?`,
    [result.insertId]
  );
  return rows[0];
}

export async function setBookingStatus(db, bookingId, status) {
  await db.query(`UPDATE booking SET status = ? WHERE BookingID = ?`, [status, bookingId]);
}

/** Tính lại tiền ghế + tổng tiền từ chính order_seats (không tin số tiền client gửi) */
export async function recalcBookingTotals(db, bookingId) {
  await db.query(
    `UPDATE booking
        SET seats_subtotal = (SELECT COALESCE(SUM(Price), 0)
                                FROM order_seats
                               WHERE BookingID = ? AND SeatStatus = 'HELD'),
            total_amount = seats_subtotal + fb_subtotal - discount_amount
      WHERE BookingID = ?`,
    [bookingId, bookingId]
  );
}

/* ------------------------------------------------------------------ */
/* order_seats: từng ghế trong booking                                 */
/* ------------------------------------------------------------------ */

/** Dòng order_seats của ghế này trong booking này (kể cả đã RELEASED) */
export async function findOrderSeat(db, bookingId, seatId) {
  const [rows] = await db.query(
    `SELECT OrderSeatID, SeatStatus FROM order_seats
      WHERE BookingID = ? AND SeatID = ? LIMIT 1`,
    [bookingId, seatId]
  );
  return rows[0] ?? null;
}

/**
 * Giữ ghế. Có thể ném lỗi ER_DUP_ENTRY từ unique key
 * uk_active_showtime_seat (ShowtimeID, SeatID, ActiveLock)
 * -> nghĩa là ghế đã có người HELD/BOOKED. Đây chính là "khóa" chống double-booking.
 */
export async function insertHeldSeat(db, { bookingId, showtimeId, seatId, price }) {
  await db.query(
    `INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
     VALUES (?, ?, ?, ?, 'HELD')`,
    [bookingId, showtimeId, seatId, price]
  );
}

/** Chọn lại ghế mình vừa bỏ (dòng RELEASED cũ) -> bật lại HELD. Cũng có thể ném ER_DUP_ENTRY */
export async function reactivateHeldSeat(db, { orderSeatId, price }) {
  await db.query(
    `UPDATE order_seats SET SeatStatus = 'HELD', Price = ? WHERE OrderSeatID = ?`,
    [price, orderSeatId]
  );
}

/** Bỏ chọn 1 ghế. Trả về số dòng bị đổi (0 = ghế không phải của booking này) */
export async function releaseHeldSeat(db, { bookingId, seatId }) {
  const [result] = await db.query(
    `UPDATE order_seats SET SeatStatus = 'RELEASED'
      WHERE BookingID = ? AND SeatID = ? AND SeatStatus = 'HELD'`,
    [bookingId, seatId]
  );
  return result.affectedRows;
}

/** Nhả toàn bộ ghế HELD của 1 booking, trả về danh sách SeatID vừa nhả */
export async function releaseAllHeldSeats(db, bookingId) {
  const [rows] = await db.query(
    `SELECT SeatID FROM order_seats WHERE BookingID = ? AND SeatStatus = 'HELD' FOR UPDATE`,
    [bookingId]
  );
  if (rows.length === 0) return [];
  await db.query(
    `UPDATE order_seats SET SeatStatus = 'RELEASED' WHERE BookingID = ? AND SeatStatus = 'HELD'`,
    [bookingId]
  );
  return rows.map((r) => r.SeatID);
}

/** Ghế đang HELD của 1 booking, kèm nhãn/loại/giá để hiển thị giỏ hàng */
export async function findHeldSeatsOfBooking(db, bookingId) {
  const [rows] = await db.query(
    `SELECT os.SeatID, os.Price, se.SeatRow, se.SeatNumber, se.SeatLabel, st.TypeCode
       FROM order_seats os
       JOIN seats se      ON se.SeatID = os.SeatID
       JOIN seat_types st ON st.SeatTypeID = se.SeatTypeID
      WHERE os.BookingID = ? AND os.SeatStatus = 'HELD'
      ORDER BY se.SeatRow, se.SeatNumber`,
    [bookingId]
  );
  return rows;
}

/* ------------------------------------------------------------------ */
/* Job dọn ghế hết hạn                                                 */
/* ------------------------------------------------------------------ */

/** Booking HOLDING đã quá hạn giữ (index idx_booking_status_exp giúp câu này nhanh) */
export async function findExpiredHolds(db, limit = 100) {
  const [rows] = await db.query(
    `SELECT BookingID, ShowtimeID, session_id AS SessionID
       FROM booking
      WHERE status = 'HOLDING' AND hold_expires_at <= NOW()
      LIMIT ?`,
    [limit]
  );
  return rows;
}

/** Khóa lại booking và kiểm tra lần nữa trong transaction (tránh 2 nơi cùng dọn 1 booking) */
export async function lockExpiredHold(db, bookingId) {
  const [rows] = await db.query(
    `SELECT BookingID FROM booking
      WHERE BookingID = ? AND status = 'HOLDING' AND hold_expires_at <= NOW()
      FOR UPDATE`,
    [bookingId]
  );
  return rows.length > 0;
}

export async function lockHoldingBooking(db, bookingId) {
  const [rows] = await db.query(
    `SELECT BookingID FROM booking WHERE BookingID = ? AND status = 'HOLDING' FOR UPDATE`,
    [bookingId]
  );
  return rows.length > 0;
}
