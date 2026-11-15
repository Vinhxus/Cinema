import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'CINEVERSE_SECRET_KEY_2026';

export function generateTicketQR(ticketInfo: { ticketNo: string; bookingId: number; showtimeId: number; seatLabel: string; cinemaId: number }) {
    // Sinh JWT token chứa mã đơn + token chống giả
    const payload = {
        ...ticketInfo,
        antiForgeryHash: crypto.randomUUID(),
        issuedAt: new Date().toISOString()
    };

    // JWT không hết hạn để soát vé ở rạp
    const token = jwt.sign(payload, JWT_SECRET);
    return token;
}