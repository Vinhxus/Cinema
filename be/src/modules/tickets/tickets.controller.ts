import { Request, Response } from 'express';
import { getTicketsByBookingId, getTicketByIdOrCode } from './tickets.service.js';

// GET /api/tickets/booking/:bookingId - Phục vụ Successfull.tsx
export const getTicketsByBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = Number(req.params.bookingId);

        if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_BOOKING_ID', message: 'Mã đơn hàng không hợp lệ' },
            });
        }

        const tickets = await getTicketsByBookingId(bookingId);

        return res.status(200).json({
            success: true,
            data: tickets,
            error: null,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Lỗi lấy danh sách vé' },
        });
    }
};

// GET /api/tickets/:ticketId - Phục vụ TicketDetails.tsx
export const getTicketDetail = async (req: Request, res: Response) => {
    try {
        const rawTicketId = req.params.ticketId;
        const ticketId = Array.isArray(rawTicketId) ? rawTicketId[0] : rawTicketId;

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_TICKET_ID', message: 'Mã vé không được để trống' },
            });
        }

        const ticket = await getTicketByIdOrCode(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: 'TICKET_NOT_FOUND', message: 'Không tìm thấy thông tin vé' },
            });
        }

        return res.status(200).json({
            success: true,
            data: ticket,
            error: null,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Lỗi lấy chi tiết vé' },
        });
    }
};