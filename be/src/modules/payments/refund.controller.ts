import { Request, Response } from 'express';
import pool from '../../config/db.js';

// POST /api/payments/refund - Xử lý yêu cầu hoàn tiền
export const handleRefund = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
        const { bookingId, reason } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                error: { message: 'Booking ID không được để trống' }
            });
        }

        await connection.beginTransaction();

        // 1. Kiểm tra đơn hàng có tồn tại và đã thanh toán chưa
        const [orders]: any = await connection.execute(
            `SELECT status FROM booking WHERE BookingID = ?`,
            [bookingId]
        );

        if (!orders.length || orders[0].status !== 'PAID') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: { message: 'Đơn hàng không tồn tại hoặc chưa thanh toán thành công' }
            });
        }

        // 2. Cập nhật trạng thái booking sang REFUNDED
        await connection.execute(
            `UPDATE booking SET status = 'REFUNDED', refund_reason = ? WHERE BookingID = ?`,
            [reason || 'Khách hàng yêu cầu hoàn tiền', bookingId]
        );

        // 3. Vô hiệu hóa vé
        await connection.execute(
            `UPDATE tickets SET status = 'CANCELLED' WHERE booking_id = ?`,
            [bookingId]
        );

        // 4. Mở lại ghế trống (AVAILABLE)
        await connection.execute(
            `UPDATE seats s 
       JOIN booking_seats bs ON s.id = bs.seat_id 
       SET s.status = 'AVAILABLE' 
       WHERE bs.booking_id = ?`,
            [bookingId]
        );

        await connection.commit();
        return res.status(200).json({
            success: true,
            data: { bookingId, status: 'REFUNDED' },
            message: 'Yêu cầu hoàn tiền thành công'
        });
    } catch (error: any) {
        await connection.rollback();
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Lỗi hệ thống khi hoàn tiền' }
        });
    } finally {
        connection.release();
    }
};