import jwt from 'jsonwebtoken';

export interface TicketPayload {
    orderId: string;
    ticketCode: string;
    showtimeId: string;
    seats: string[];
}

export class TicketService {
    constructor(private jwtSecret: string) { }

    /**
     * Tạo token JWT cho vé QR code (hết hạn sau suất chiếu hoặc dùng 1 lần)
     */
    generateTicketQRToken(data: TicketPayload): string {
        return jwt.sign(data, this.jwtSecret, {
            expiresIn: '24h',
        });
    }

    /**
     * Xác thực mã QR tại cổng soát vé
     */
    verifyTicketQRToken(token: string): TicketPayload | null {
        try {
            return jwt.verify(token, this.jwtSecret) as TicketPayload;
        } catch {
            return null;
        }
    }
}