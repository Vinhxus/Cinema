import pool from '../config/db.js';

export const findBookingById = async (bookingId) => {
    const [rows] = await pool.query(
        `SELECT b.*, TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) as elapsed_minutes 
     FROM booking b WHERE b.BookingID = ?`,
        [bookingId]
    );
    return rows[0] || null;
};

export const updateBookingCustomerInfo = async (bookingId, { name, phone, email, ageConfirmed }) => {
    await pool.query(
        `UPDATE booking 
     SET customer_name = ?, customer_phone = ?, customer_email = ?, age_confirmed = ?, age_confirmed_at = NOW() 
     WHERE BookingID = ?`,
        [name, phone, email, ageConfirmed, bookingId]
    );
};

export const updateBookingStatus = async (bookingId, status, connection = pool) => {
    await connection.query(`UPDATE booking SET status = ? WHERE BookingID = ?`, [status, bookingId]);
};

export const createPaymentRecord = async ({ bookingId, amount, transactionRef, status }, connection = pool) => {
    const [result] = await connection.query(
        `INSERT INTO payment (BookingID, Amount, Method, Partner, TransactionRef, status, created_at)
     VALUES (?, ?, 'CAPTURE_WALLET', 'MOMO', ?, ?, NOW())`,
        [bookingId, amount, transactionRef, status]
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

export const markSeatsBooked = async (bookingId, connection = pool) => {
    await connection.query(
        `UPDATE order_seats SET SeatStatus = 'BOOKED' WHERE BookingID = ?`,
        [bookingId]
    );
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