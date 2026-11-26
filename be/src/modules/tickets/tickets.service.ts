import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { PoolConnection } from 'mysql2/promise';
import pool from '../../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'CINEVERSE_SECRET_KEY_2026';

if (!process.env.JWT_SECRET) {
    console.warn('⚠️ [TicketService] JWT_SECRET chưa được cấu hình trong .env, sử dụng khóa mặc định.');
}

export interface TicketTokenPayload {
    ticketNo: string;
    bookingId: number;
    showtimeId: number;
    seatId: number;
    seatLabel: string;
    cinemaId: number;
    roomNumber: string;
    date: string;
    time: string;
    antiForgeryHash: string;
    issuedAt: string;
}

export interface TicketRecord {
    TicketNo: string;
    BookingID: number;
    ShowtimeID: number;
    SeatID: number;
    Barcode: string;
    jwt_token: string;
    Price: number;
    SeatRow: string;
    SeatNumber: number;
    SeatLabel: string;
    SeatType: string;
    CinemaID: number;
    RoomNumber: string;
    Gate: string;
    Date: string;
    Time: string;
    status: 'VALID' | 'USED' | 'CANCELED' | 'REFUNDED';
    checkin_time: Date | null;
    checkin_staff_id: number | null;
}

/**
 * 1. Sinh chuỗi JWT Token chứa thông tin vé + chữ ký chống giả mạo
 */
export function generateTicketQR(ticketInfo: Omit<TicketTokenPayload, 'antiForgeryHash' | 'issuedAt'>): string {
    const payload: TicketTokenPayload = {
        ...ticketInfo,
        antiForgeryHash: crypto.randomUUID(),
        issuedAt: new Date().toISOString()
    };

    return jwt.sign(payload, JWT_SECRET);
}

/**
 * 2. Xác thực JWT token vé khi quét tại cửa soát vé
 */
export function verifyTicketQR(token: string): TicketTokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TicketTokenPayload;
    } catch (error) {
        return null;
    }
}

/**
 * 3. Phát hành vé trong Transaction MySQL sau khi thanh toán thành công
 */
export async function issueTicketsForBooking(
    conn: PoolConnection,
    bookingId: number
): Promise<TicketRecord[]> {
    const [existingTickets] = await conn.query<any[]>(
        'SELECT * FROM ticket WHERE BookingID = ?',
        [bookingId]
    );

    if (existingTickets.length > 0) {
        console.log(`ℹ️ [TicketService] Vé cho đơn #${bookingId} đã được phát hành trước đó (${existingTickets.length} vé).`);
        return existingTickets as TicketRecord[];
    }

    const [seatRows] = await conn.query<any[]>(
        `SELECT 
            os.OrderSeatID,
            os.BookingID,
            os.ShowtimeID,
            os.SeatID,
            os.Price as SeatPrice,
            s.SeatRow,
            s.SeatNumber,
            s.SeatLabel,
            st.TypeName as SeatType,
            sh.ShowDate,
            sh.StartTime,
            r.RoomNumber,
            c.CinemaID,
            c.CinemaName
        FROM order_seats os
        JOIN seats s ON os.SeatID = s.SeatID
        JOIN seat_types st ON s.SeatTypeID = st.SeatTypeID
        JOIN showtimes sh ON os.ShowtimeID = sh.ShowtimeID
        JOIN rooms r ON sh.RoomID = r.RoomID
        JOIN cinemas c ON r.CinemaID = c.CinemaID
        WHERE os.BookingID = ?`,
        [bookingId]
    );

    if (seatRows.length === 0) {
        throw new Error(`Không tìm thấy ghế nào trong đơn hàng #${bookingId} để phát hành vé.`);
    }

    const issuedTickets: TicketRecord[] = [];

    for (const seat of seatRows) {
        const uniqueSuffix = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const ticketNo = `TK${bookingId}-${seat.SeatLabel}-${uniqueSuffix}`;
        const barcode = `BC${bookingId}${seat.SeatID}${Date.now().toString().slice(-6)}`;

        const showDateStr = typeof seat.ShowDate === 'string'
            ? seat.ShowDate.slice(0, 10)
            : new Date(seat.ShowDate).toISOString().slice(0, 10);
        const startTimeStr = String(seat.StartTime).slice(0, 8);

        const jwtToken = generateTicketQR({
            ticketNo,
            bookingId,
            showtimeId: seat.ShowtimeID,
            seatId: seat.SeatID,
            seatLabel: seat.SeatLabel,
            cinemaId: seat.CinemaID,
            roomNumber: seat.RoomNumber,
            date: showDateStr,
            time: startTimeStr
        });

        await conn.query(
            `INSERT INTO ticket (
                TicketNo, BookingID, ShowtimeID, SeatID, Barcode, jwt_token, Price,
                SeatRow, SeatNumber, SeatLabel, SeatType, CinemaID, RoomNumber, Gate,
                Date, Time, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID')`,
            [
                ticketNo,
                bookingId,
                seat.ShowtimeID,
                seat.SeatID,
                barcode,
                jwtToken,
                Number(seat.SeatPrice),
                seat.SeatRow,
                seat.SeatNumber,
                seat.SeatLabel,
                seat.SeatType,
                seat.CinemaID,
                seat.RoomNumber,
                'GATE 01',
                showDateStr,
                startTimeStr
            ]
        );

        issuedTickets.push({
            TicketNo: ticketNo,
            BookingID: bookingId,
            ShowtimeID: seat.ShowtimeID,
            SeatID: seat.SeatID,
            Barcode: barcode,
            jwt_token: jwtToken,
            Price: Number(seat.SeatPrice),
            SeatRow: seat.SeatRow,
            SeatNumber: seat.SeatNumber,
            SeatLabel: seat.SeatLabel,
            SeatType: seat.SeatType,
            CinemaID: seat.CinemaID,
            RoomNumber: seat.RoomNumber,
            Gate: 'GATE 01',
            Date: showDateStr,
            Time: startTimeStr,
            status: 'VALID',
            checkin_time: null,
            checkin_staff_id: null
        });
    }

    console.log(`✅ [TicketService] Đã phát hành thành công ${issuedTickets.length} vé cho đơn #${bookingId}`);
    return issuedTickets;
}

/**
 * 4. Truy vấn danh sách vé theo BookingID
 */
export async function getTicketsByBookingId(bookingId: number): Promise<TicketRecord[]> {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM ticket WHERE BookingID = ? ORDER BY SeatLabel ASC',
        [bookingId]
    );
    return rows as TicketRecord[];
}

/**
 * 5. Lấy chi tiết 1 vé theo TicketNo, Barcode hoặc TicketID
 */
export async function getTicketByIdOrCode(ticketIdOrCode: string | number) {
    const [rows] = await pool.query<any[]>(
        `SELECT 
        t.TicketNo, t.BookingID, t.SeatLabel, t.SeatType, t.Price, 
        t.Barcode, t.jwt_token, t.Gate, t.status, t.Date, t.Time, t.checkin_time,
        b.customer_name, b.customer_phone, b.customer_email,
        m.Title as movieTitle, m.PosterUrl as posterUrl,
        rm.RoomNumber, c.CinemaName
     FROM ticket t
     JOIN booking b ON t.BookingID = b.BookingID
     JOIN showtimes sh ON b.ShowtimeID = sh.ShowtimeID
     JOIN movies m ON sh.MovieID = m.MovieID
     JOIN rooms rm ON sh.RoomID = rm.RoomID
     JOIN cinemas c ON rm.CinemaID = c.CinemaID
     WHERE t.TicketNo = ? OR t.Barcode = ? OR t.BookingID = ?
     LIMIT 1`,
        [ticketIdOrCode, ticketIdOrCode, ticketIdOrCode]
    );

    return rows.length > 0 ? rows[0] : null;
}