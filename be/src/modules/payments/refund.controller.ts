import { Request, Response } from 'express';
import pool from '../../config/db.js';

// POST /api/payments/refund - Xử lý yêu cầu hoàn tiền (Đã đồng bộ MySQL Schema Senema)
export const handleRefund = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
        const bookingId = Number(req.body.bookingId);
        const reason = req.body.reason;

        if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'Booking ID không hợp lệ' }
            });
        }

        await connection.beginTransaction();

        // 1. Kiểm tra đơn hàng có tồn tại và đã thanh toán chưa (SELECT FOR UPDATE)
        const [orders]: any = await connection.query(
            `SELECT BookingID, total_amount, status FROM booking WHERE BookingID = ? FOR UPDATE`,
            [bookingId]
        );

        if (!orders.length || orders[0].status !== 'PAID') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: { message: 'Đơn hàng không tồn tại hoặc chưa thanh toán thành công' }
            });
        }

        const b = orders[0];
        const refundRef = `RF-${Date.now().toString().slice(-8)}`;

        // 2. Tạo bản ghi hoàn tiền vào bảng refunds
        await connection.query(
            `INSERT INTO refunds (
                RefundReference, BookingID, OriginalPaidAmount, CancellationFee,
                RefundAmount, RefundRatePercent, RefundDestination, Reason, Status, CompletedAt
             ) VALUES (?, ?, ?, 0, ?, 100, 'MoMo E-Wallet', ?, 'COMPLETED', NOW())`,
            [refundRef, b.BookingID, b.total_amount, b.total_amount, reason || 'Khách hàng yêu cầu hoàn tiền']
        );

        // 3. Cập nhật trạng thái booking & payment sang REFUNDED
        await connection.query(
            `UPDATE booking SET status = 'REFUNDED', updated_at = NOW() WHERE BookingID = ?`,
            [bookingId]
        );

        await connection.query(
            `UPDATE payment SET status = 'REFUNDED', updated_at = NOW() WHERE BookingID = ?`,
            [bookingId]
        );

        // 4. Vô hiệu hóa vé trong bảng ticket
        await connection.query(
            `UPDATE ticket SET status = 'REFUNDED' WHERE BookingID = ?`,
            [bookingId]
        );

        // 5. Mở lại ghế trống (RELEASED) trong bảng order_seats
        await connection.query(
            `UPDATE order_seats SET SeatStatus = 'RELEASED' WHERE BookingID = ?`,
            [bookingId]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            data: {
                refundReference: refundRef,
                bookingId,
                status: 'REFUNDED',
                refundAmount: Number(b.total_amount)
            },
            message: 'Yêu cầu hoàn tiền thành công'
        });
    } catch (error: any) {
        await connection.rollback();
        console.error('[handleRefund] Error:', error);
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Lỗi hệ thống khi hoàn tiền' }
        });
    } finally {
        connection.release();
    }
};