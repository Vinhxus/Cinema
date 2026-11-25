import { Request, Response } from 'express';
import { MomoService } from './momo.service.js';
import pool from '../../config/db.js';
import { issueTicketsForBooking } from '../tickets/tickets.service.js';
import { markBooked } from '../../seathandlers.js';

const momoService = new MomoService();

/**
 * 1. API Tạo yêu cầu thanh toán MoMo (POST /api/payments/momo/create)
 * - Xác minh booking tồn tại trong DB và hợp lệ
 * - Lấy số tiền CHÍNH THỨC từ database (booking.total_amount), KHÔNG tin tưởng client
 * - Sinh mã TransactionRef duy nhất
 * - Lưu bản ghi payment vào DB với trạng thái CREATED -> PENDING
 */
export async function createMomoPayment(req: Request, res: Response) {
    try {
        const bookingId = Number(req.body.bookingId);

        if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_BOOKING_ID', message: 'Mã đơn hàng không hợp lệ' }
            });
        }

        // A. Truy vấn thông tin đơn hàng từ Database
        const [bookings] = await pool.query<any[]>(
            'SELECT BookingID, BookingCode, total_amount, status, hold_expires_at FROM booking WHERE BookingID = ? LIMIT 1',
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: 'BOOKING_NOT_FOUND', message: 'Đơn hàng không tồn tại' }
            });
        }

        const booking = bookings[0];

        // B. Kiểm tra trạng thái đơn hàng
        if (booking.status === 'PAID') {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'ALREADY_PAID', message: 'Đơn hàng này đã được thanh toán thành công' }
            });
        }

        if (booking.status === 'CANCELED' || booking.status === 'REFUNDED') {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INACTIVE_BOOKING', message: 'Đơn hàng đã bị hủy hoặc hoàn tiền' }
            });
        }

        // C. Kiểm tra thời hạn giữ ghế
        const now = new Date();
        const expiresAt = new Date(booking.hold_expires_at);
        if (booking.status === 'EXPIRED' || now > expiresAt) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'HOLD_TIME_EXPIRED', message: 'Thời gian giữ ghế đã hết hạn. Vui lòng đặt lại vé mới.' }
            });
        }

        // D. Lấy số tiền thực tế từ database (làm tròn nguyên cho cổng thanh toán)
        const amount = Math.round(Number(booking.total_amount));
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_AMOUNT', message: 'Số tiền thanh toán phải lớn hơn 0' }
            });
        }

        // E. Sinh mã tham chiếu giao dịch (TransactionRef) duy nhất cho lần thanh toán này
        const transactionRef = `MOMO-${booking.BookingCode}-${Date.now()}`;

        // F. Lưu bản ghi payment vào database trước khi gọi cổng thanh toán
        const [paymentInsertResult]: any = await pool.query(
            `INSERT INTO payment (BookingID, Amount, Method, Partner, TransactionRef, status)
             VALUES (?, ?, 'CAPTURE_WALLET', 'MOMO', ?, 'CREATED')`,
            [booking.BookingID, amount, transactionRef]
        );

        // G. Gọi MoMo Service để tạo URL thanh toán
        const momoResult = await momoService.createPaymentUrl(
            booking.BookingID,
            amount,
            transactionRef,
            booking.BookingCode
        );

        // H. Cập nhật trạng thái payment sang PENDING
        await pool.query(
            `UPDATE payment SET status = 'PENDING', updated_at = NOW() WHERE TransactionRef = ?`,
            [transactionRef]
        );

        return res.status(200).json({
            success: true,
            data: {
                paymentId: paymentInsertResult.insertId,
                bookingId: booking.BookingID,
                bookingCode: booking.BookingCode,
                amount,
                transactionRef,
                payUrl: momoResult.payUrl,
                deeplink: momoResult.deeplink,
                qrCodeUrl: momoResult.qrCodeUrl,
                isMock: momoResult.isMock
            },
            error: null
        });

    } catch (error: any) {
        console.error('[createMomoPayment] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'PAYMENT_CREATION_FAILED', message: error.message || 'Lỗi khởi tạo thanh toán MoMo' }
        });
    }
}

/**
 * 2. API Tiếp nhận Webhook IPN từ MoMo (POST /api/payments/momo/ipn)
 * - Xác thực chữ ký an toàn HMAC-SHA256
 * - Sử dụng MySQL Transaction với FOR UPDATE Row Locking để xử lý Idempotency & Race Condition
 * - Đối chiếu số tiền IPN với DB
 * - Cập nhật Payment -> SUCCESS, Booking -> PAID, Ghế -> BOOKED
 * - Tự động phát hành vé điện tử (Ticket) với JWT Token chống giả mạo
 * - Thông báo Socket.IO chốt ghế thời gian thực
 */
export async function handleMomoIPN(req: Request, res: Response) {
    try {
        const ipnData = req.method === 'POST' ? req.body : req.query;

        console.log(`[MoMo IPN] Nhận callback từ MoMo (${req.method}):`, {
            orderId: ipnData.orderId,
            resultCode: ipnData.resultCode,
            amount: ipnData.amount,
            transId: ipnData.transId
        });

        // 1. Xác thực chữ ký IPN
        const isValidSignature = momoService.verifyIpnSignature(ipnData);
        if (!isValidSignature) {
            console.error('[MoMo IPN] ❌ Chữ ký IPN không hợp lệ:', ipnData.signature);
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_SIGNATURE', message: 'Chữ ký IPN không hợp lệ' }
            });
        }

        const {
            orderId,
            resultCode,
            amount,
            transId,
            message
        } = ipnData;

        // 2. Mở kết nối Transaction MySQL
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // Khóa dòng giao dịch thanh toán để chống race condition (SELECT FOR UPDATE)
            const [payments] = await conn.query<any[]>(
                'SELECT * FROM payment WHERE TransactionRef = ? FOR UPDATE',
                [orderId]
            );

            if (payments.length === 0) {
                await conn.rollback();
                console.warn(`[MoMo IPN] Không tìm thấy transactionRef: ${orderId}`);
                return res.status(404).json({
                    success: false,
                    error: { code: 'PAYMENT_NOT_FOUND', message: 'Không tìm thấy giao dịch thanh toán' }
                });
            }

            const payment = payments[0];

            // 3. Cơ chế Idempotency bền vững bằng Database: Nếu đã xử lý SUCCESS trước đó -> Trả về 204 ngay
            if (payment.status === 'SUCCESS') {
                await conn.rollback();
                console.log(`[MoMo IPN] Giao dịch ${orderId} đã được xử lý thành công trước đó (Idempotent).`);
                return res.status(204).send();
            }

            // 4. Đối chiếu số tiền thanh toán (Amount Verification)
            const expectedAmount = Math.round(Number(payment.Amount));
            const receivedAmount = Math.round(Number(amount));

            if (expectedAmount !== receivedAmount) {
                console.error(`[MoMo IPN] ❌ Sai lệch số tiền: DB=${expectedAmount}, IPN=${receivedAmount}`);
                await conn.query(
                    `UPDATE payment 
                     SET status = 'NEED_RECONCILE', 
                         momo_trans_id = ?, 
                         transaction_log = ?, 
                         updated_at = NOW() 
                     WHERE PaymentID = ?`,
                    [String(transId || ''), JSON.stringify(ipnData), payment.PaymentID]
                );
                await conn.commit();
                return res.status(400).json({
                    success: false,
                    error: { code: 'AMOUNT_MISMATCH', message: 'Số tiền thanh toán không khớp với đơn hàng' }
                });
            }

            // 5. Kiểm tra mã kết quả giao dịch từ MoMo (resultCode === 0 là thành công)
            if (Number(resultCode) === 0) {
                // A. Cập nhật bảng payment
                await conn.query(
                    `UPDATE payment 
                     SET status = 'SUCCESS', 
                         momo_trans_id = ?, 
                         payment_time = NOW(), 
                         transaction_log = ?, 
                         updated_at = NOW() 
                     WHERE PaymentID = ?`,
                    [String(transId || ''), JSON.stringify(ipnData), payment.PaymentID]
                );

                // B. Cập nhật trạng thái booking sang PAID
                await conn.query(
                    `UPDATE booking SET status = 'PAID', updated_at = NOW() WHERE BookingID = ?`,
                    [payment.BookingID]
                );

                // C. Cập nhật trạng thái ghế trong order_seats sang BOOKED
                await conn.query(
                    `UPDATE order_seats SET SeatStatus = 'BOOKED' WHERE BookingID = ?`,
                    [payment.BookingID]
                );

                // D. Phát hành vé điện tử cho từng ghế trong đơn (Ticket generation)
                const issuedTickets = await issueTicketsForBooking(conn, payment.BookingID);

                // E. Commit toàn bộ giao dịch vào MySQL
                await conn.commit();
                console.log(`✅ [MoMo IPN] Thanh toán đơn #${payment.BookingID} thành công. Đã xuất ${issuedTickets.length} vé.`);

                // F. Thông báo Socket.IO giải phóng giữ chỗ và chốt ghế trên sơ đồ
                try {
                    const [seatRows] = await pool.query<any[]>(
                        'SELECT ShowtimeID, SeatID FROM order_seats WHERE BookingID = ?',
                        [payment.BookingID]
                    );
                    if (seatRows.length > 0) {
                        const showtimeId = seatRows[0].ShowtimeID;
                        const seatIds = seatRows.map(s => s.SeatID);
                        markBooked(null, showtimeId, seatIds);
                    }
                } catch (socketErr) {
                    console.warn('[MoMo IPN] Socket notification warning:', socketErr);
                }

                // Trả về HTTP 204 No Content theo đúng chuẩn tài liệu MoMo IPN
                return res.status(204).send();

            } else {
                // Thanh toán thất bại hoặc người dùng hủy giao dịch tại MoMo
                console.warn(`[MoMo IPN] Thanh toán thất bại: resultCode=${resultCode}, message=${message}`);
                await conn.query(
                    `UPDATE payment 
                     SET status = 'FAILED', 
                         momo_trans_id = ?, 
                         transaction_log = ?, 
                         updated_at = NOW() 
                     WHERE PaymentID = ?`,
                    [String(transId || ''), JSON.stringify(ipnData), payment.PaymentID]
                );
                await conn.commit();

                return res.status(200).json({
                    success: false,
                    message: `Giao dịch thanh toán MoMo không thành công (${message || 'Hủy'})`
                });
            }

        } catch (dbError: any) {
            await conn.rollback();
            throw dbError;
        } finally {
            conn.release();
        }

    } catch (error: any) {
        console.error('[handleMomoIPN] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'IPN_PROCESSING_FAILED', message: error.message || 'Lỗi xử lý IPN Webhook' }
        });
    }
}

/**
 * 3. API Tra cứu trạng thái thanh toán (GET /api/payments/status/:transactionRef)
 */
export async function getPaymentStatus(req: Request, res: Response) {
    try {
        const { transactionRef } = req.params;

        if (!transactionRef) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_REF', message: 'Mã tham chiếu không hợp lệ' }
            });
        }

        const [rows] = await pool.query<any[]>(
            `SELECT PaymentID, BookingID, Amount, Method, Partner, TransactionRef, momo_trans_id, status, payment_time, created_at
             FROM payment 
             WHERE TransactionRef = ? 
             LIMIT 1`,
            [transactionRef]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: 'PAYMENT_NOT_FOUND', message: 'Không tìm thấy giao dịch' }
            });
        }

        const p = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                paymentId: p.PaymentID,
                bookingId: p.BookingID,
                amount: Number(p.Amount),
                method: p.Method,
                partner: p.Partner,
                transactionRef: p.TransactionRef,
                momoTransId: p.momo_trans_id,
                status: p.status,
                paymentTime: p.payment_time,
                createdAt: p.created_at
            },
            error: null
        });

    } catch (error: any) {
        console.error('[getPaymentStatus] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Lỗi truy vấn trạng thái thanh toán' }
        });
    }
}
