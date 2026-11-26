import pool from '../config/db.js';
import AppError from '../utils/AppError.js';

export const getTicketById = async (ticketId) => {
    const [rows] = await pool.query(
        `SELECT t.*, b.customer_phone, b.customer_email, s.show_time, m.title as movie_title, c.name as cinema_name, r.name as room_name
     FROM ticket t
     JOIN booking b ON t.booking_id = b.id
     JOIN showtimes s ON b.showtime_id = s.id
     JOIN movies m ON s.movie_id = m.id
     JOIN rooms r ON s.room_id = r.id
     JOIN cinemas c ON r.cinema_id = c.id
     WHERE t.id = ?`,
        [ticketId]
    );

    if (!rows.length) throw new AppError('Không tìm thấy vé', 404);
    return rows[0];
};

export const lookupTicket = async ({ code, phone }) => {
    if (!code && !phone) {
        throw new AppError('Vui lòng cung cấp mã vé hoặc số điện thoại tra cứu', 400);
    }

    let query = `
    SELECT t.id as ticket_id, t.qr_code, t.status, b.id as booking_id, b.customer_phone, m.title as movie_title, s.show_time
    FROM ticket t
    JOIN booking b ON t.booking_id = b.id
    JOIN showtimes s ON b.showtime_id = s.id
    JOIN movies m ON s.movie_id = m.id
    WHERE 1=1
  `;
    const params = [];

    if (code) {
        query += ` AND (t.id = ? OR b.id = ?)`;
        params.push(code, code);
    }
    if (phone) {
        query += ` AND b.customer_phone = ?`;
        params.push(phone);
    }

    const [tickets] = await pool.query(query, params);
    return tickets;
};

export const cancelTicket = async (ticketId) => {
    const ticket = await getTicketById(ticketId);

    // Kiểm tra thời gian: Chỉ cho hủy trước giờ chiếu tối thiểu 60 phút
    const showTime = new Date(ticket.show_time).getTime();
    const now = Date.now();
    const diffMinutes = (showTime - now) / (1000 * 60);

    if (diffMinutes < 60) {
        throw new AppError('Chỉ có thể hủy vé trước giờ chiếu ít nhất 60 phút', 400);
    }

    if (ticket.status === 'CANCELLED') {
        throw new AppError('Vé này đã bị hủy trước đó', 400);
    }

    // Cập nhật trạng thái vé
    await pool.query(`UPDATE ticket SET status = 'CANCELLED' WHERE id = ?`, [ticketId]);

    return { ticketId, status: 'CANCELLED', message: 'Hủy vé thành công. Yêu cầu hoàn tiền đã gửi xử lý.' };
};