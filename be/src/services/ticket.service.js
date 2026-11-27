import pool from '../config/db.js';
import AppError from '../utils/AppError.js';

export const getTicketByNo = async (ticketNo) => {
    const [rows] = await pool.query(
        `SELECT t.*, b.customer_name, b.customer_phone, b.customer_email, b.BookingCode,
            m.Title as movie_title, m.PosterUrl, c.CinemaName, r.RoomNumber
     FROM ticket t
     JOIN booking b ON t.BookingID = b.BookingID
     JOIN showtimes s ON t.ShowtimeID = s.ShowtimeID
     JOIN movies m ON s.MovieID = m.MovieID
     JOIN cinemas c ON t.CinemaID = c.CinemaID
     JOIN rooms r ON s.RoomID = r.RoomID
     WHERE t.TicketNo = ? OR b.BookingCode = ?`,
        [ticketNo, ticketNo]
    );

    if (!rows.length) throw new AppError('Ticket not found', 404);
    return rows;
};

export const lookupTickets = async ({ code, phone }) => {
    if (!code && !phone) {
        throw new AppError('Please provide a ticket/booking code or a phone number', 400);
    }

    let query = `
    SELECT t.TicketNo, t.Barcode, t.jwt_token, t.SeatLabel, t.SeatType, t.Price, t.Date, t.Time, t.status,
           b.BookingCode, b.customer_name, b.customer_phone, m.Title as movie_title, c.CinemaName, r.RoomNumber
    FROM ticket t
    JOIN booking b ON t.BookingID = b.BookingID
    JOIN showtimes s ON t.ShowtimeID = s.ShowtimeID
    JOIN movies m ON s.MovieID = m.MovieID
    JOIN cinemas c ON t.CinemaID = c.CinemaID
    JOIN rooms r ON s.RoomID = r.RoomID
    WHERE 1=1
  `;
    const params = [];

    if (code) {
        query += ` AND (t.TicketNo = ? OR b.BookingCode = ?)`;
        params.push(code, code);
    }
    if (phone) {
        query += ` AND b.customer_phone = ?`;
        params.push(phone);
    }

    const [tickets] = await pool.query(query, params);
    return tickets;
};

export const cancelTicketAndRefund = async (ticketNo) => {
    const [rows] = await pool.query(
        `SELECT t.*, s.ShowDate, s.StartTime, b.BookingID, p.PaymentID, p.Amount
     FROM ticket t
     JOIN booking b ON t.BookingID = b.BookingID
     JOIN showtimes s ON t.ShowtimeID = s.ShowtimeID
     LEFT JOIN payment p ON b.BookingID = p.BookingID AND p.status = 'SUCCESS'
     WHERE t.TicketNo = ?`,
        [ticketNo]
    );

    if (!rows.length) throw new AppError('Ticket to cancel not found', 404);
    const ticket = rows[0];

    // Kiểm tra thời gian: Trước giờ chiếu ít nhất 60 phút
    const showDateTime = new Date(`${ticket.ShowDate.toISOString().split('T')[0]}T${ticket.StartTime}`);
    const now = new Date();
    const diffMinutes = (showDateTime.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes < 60) {
        throw new AppError('Tickets can only be cancelled at least 60 minutes before showtime', 400);
    }

    if (ticket.status === 'CANCELED' || ticket.status === 'REFUNDED') {
        throw new AppError('This ticket has already been cancelled or refunded', 400);
    }

    // Đổi trạng thái vé
    await pool.query(`UPDATE ticket SET status = 'REFUNDED' WHERE TicketNo = ?`, [ticketNo]);

    // Tạo record vào bảng refunds
    const refundRef = `RF-${Date.now().toString().slice(-6)}`;
    await pool.query(
        `INSERT INTO refunds (RefundReference, BookingID, PaymentID, OriginalPaidAmount, CancellationFee, RefundAmount, RefundRatePercent, Reason, Status, RequestedAt, CompletedAt)
     VALUES (?, ?, ?, ?, 0.00, ?, 100, 'Customer cancelled on the website at least 60 minutes before showtime', 'COMPLETED', NOW(), NOW())`,
        [refundRef, ticket.BookingID, ticket.PaymentID || 1, ticket.Price, ticket.Price]
    );

    return { ticketNo, status: 'REFUNDED', refundReference: refundRef, message: 'Ticket cancelled and refund created' };
};