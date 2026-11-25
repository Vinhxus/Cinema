import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../../config/db.js';
import { checkoutSchema } from './checkout.validation.js';

interface BookingRow {
    BookingID: number;
    BookingCode: string;
    ShowtimeID: number;
    StaffID: number | null;
    ClientID: number | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    age_confirmed: 'P' | 'T13' | 'T16' | 'T18';
    age_confirmed_at: Date | null;
    seats_subtotal: string;
    fb_subtotal: string;
    discount_amount: string;
    total_amount: string;
    status: 'HOLDING' | 'CHECKOUT_PENDING' | 'PAID' | 'CANCELED' | 'REFUNDED' | 'EXPIRED';
    hold_expires_at: Date;
    created_at: Date;
    updated_at: Date;
}

/**
 * 1. Khởi tạo giữ ghế & tạo đơn hàng (POST /api/orders/hold)
 */
export async function createHoldBooking(req: Request, res: Response) {
    const conn = await pool.getConnection();
    try {
        const { showtimeId, seatLabels, seatIds, foods, voucherCode } = req.body;

        const showtimeID = Number(showtimeId);
        if (!showtimeID || isNaN(showtimeID) || showtimeID <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_SHOWTIME_ID', message: 'Mã suất chiếu không hợp lệ' }
            });
        }

        const [showtimeRows] = await conn.query<any[]>(
            'SELECT ShowtimeID, RoomID, BaseTicketPrice, Status FROM showtimes WHERE ShowtimeID = ? LIMIT 1',
            [showtimeID]
        );

        if (showtimeRows.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: 'SHOWTIME_NOT_FOUND', message: 'Suất chiếu không tồn tại' }
            });
        }

        const showtime = showtimeRows[0];
        const basePrice = Number(showtime.BaseTicketPrice) || 110000;

        let resolvedSeatIds: number[] = [];
        if (Array.isArray(seatIds) && seatIds.length > 0) {
            resolvedSeatIds = seatIds.map(Number);
        } else if (Array.isArray(seatLabels) && seatLabels.length > 0) {
            const [seatRows] = await conn.query<any[]>(
                'SELECT SeatID, SeatLabel FROM seats WHERE RoomID = ? AND SeatLabel IN (?)',
                [showtime.RoomID, seatLabels]
            );
            resolvedSeatIds = seatRows.map(s => s.SeatID);
        }

        if (resolvedSeatIds.length === 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'NO_SEATS_SELECTED', message: 'Chưa có ghế nào được chọn' }
            });
        }

        await conn.beginTransaction();

        const [lockedSeats] = await conn.query<any[]>(
            `SELECT os.SeatID, s.SeatLabel 
             FROM order_seats os
             JOIN seats s ON os.SeatID = s.SeatID
             WHERE os.ShowtimeID = ? AND os.SeatID IN (?) AND os.SeatStatus IN ('HELD', 'BOOKED')
             FOR UPDATE`,
            [showtimeID, resolvedSeatIds]
        );

        if (lockedSeats.length > 0) {
            await conn.rollback();
            const lockedLabels = lockedSeats.map(s => s.SeatLabel).join(', ');
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'SEAT_ALREADY_LOCKED', message: `Ghế [${lockedLabels}] đã có người giữ hoặc đặt trước.` }
            });
        }

        const [seatDetailRows] = await conn.query<any[]>(
            `SELECT s.SeatID, s.SeatLabel, st.BasePrice, st.Surcharge
             FROM seats s
             JOIN seat_types st ON s.SeatTypeID = st.SeatTypeID
             WHERE s.SeatID IN (?)`,
            [resolvedSeatIds]
        );

        let seatsSubtotal = 0;
        const seatPriceMap = new Map<number, number>();
        for (const s of seatDetailRows) {
            const price = Number(s.BasePrice || basePrice) + Number(s.Surcharge || 0);
            seatPriceMap.set(s.SeatID, price);
            seatsSubtotal += price;
        }

        let fbSubtotal = 0;
        const validFoods: { productId: number; quantity: number; unitPrice: number }[] = [];
        if (Array.isArray(foods) && foods.length > 0) {
            for (const f of foods) {
                const qty = Number(f.quantity) || 0;
                const price = Number(f.price) || 0;
                const pId = Number(f.productId || f.id) || 1;
                if (qty > 0 && price > 0) {
                    fbSubtotal += qty * price;
                    validFoods.push({ productId: pId, quantity: qty, unitPrice: price });
                }
            }
        }

        let discountAmount = 0;
        if (voucherCode && String(voucherCode).trim().toUpperCase() === 'CINEVIP10') {
            discountAmount = Math.min(25000, seatsSubtotal + fbSubtotal);
        }

        const totalAmount = Math.max(0, seatsSubtotal + fbSubtotal - discountAmount);
        const bookingCode = `SN-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

        const [bResult]: any = await conn.query(
            `INSERT INTO booking (
                BookingCode, ShowtimeID, customer_name, customer_email, customer_phone,
                seats_subtotal, fb_subtotal, discount_amount, total_amount, status,
                hold_expires_at, Channel
             ) VALUES (
                ?, ?, 'Khách hàng', 'pending@senema.vn', '0000000000',
                ?, ?, ?, ?, 'HOLDING',
                DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'ONLINE'
             )`,
            [
                bookingCode,
                showtimeID,
                seatsSubtotal,
                fbSubtotal,
                discountAmount,
                totalAmount
            ]
        );

        const newBookingId = bResult.insertId;

        for (const seatId of resolvedSeatIds) {
            const price = seatPriceMap.get(seatId) || basePrice;
            await conn.query(
                `INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
                 VALUES (?, ?, ?, ?, 'HELD')`,
                [newBookingId, showtimeID, seatId, price]
            );
        }

        for (const f of validFoods) {
            try {
                await conn.query(
                    `INSERT INTO order_item (BookingID, ProductID, Quantity, UnitPrice)
                     VALUES (?, ?, ?, ?)`,
                    [newBookingId, f.productId, f.quantity, f.unitPrice]
                );
            } catch (ignore) { }
        }

        await conn.commit();

        return res.status(201).json({
            success: true,
            data: {
                bookingId: newBookingId,
                bookingCode,
                showtimeId: showtimeID,
                seatIds: resolvedSeatIds,
                seatsSubtotal,
                fbSubtotal,
                discountAmount,
                totalAmount,
                status: 'HOLDING',
                holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
            },
            error: null
        });

    } catch (error: any) {
        await conn.rollback();
        console.error('[createHoldBooking] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Lỗi giữ ghế' }
        });
    } finally {
        conn.release();
    }
}

/**
 * 2. Cập nhật thông tin khách hàng tại trang Checkout (POST /api/orders/:id/checkout)
 */
export async function handleCheckout(req: Request, res: Response) {
    try {
        const bookingId = Number(req.params.id);

        if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_BOOKING_ID', message: 'Mã đơn hàng không hợp lệ' }
            });
        }

        const validatedData = checkoutSchema.parse(req.body);

        const [rows] = await pool.query<any[]>(
            'SELECT * FROM booking WHERE BookingID = ? LIMIT 1',
            [bookingId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: 'BOOKING_NOT_FOUND', message: 'Đơn hàng không tồn tại' }
            });
        }

        const booking = rows[0] as BookingRow;

        if (booking.status === 'PAID') {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'BOOKING_ALREADY_PAID', message: 'Đơn hàng đã được thanh toán thành công' }
            });
        }

        if (booking.status === 'CANCELED' || booking.status === 'REFUNDED') {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'BOOKING_INACTIVE', message: 'Đơn hàng đã bị hủy hoặc hoàn tiền' }
            });
        }

        if (booking.status === 'EXPIRED') {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'BOOKING_EXPIRED', message: 'Đơn giữ ghế đã hết hạn' }
            });
        }

        const now = new Date();
        const expiresAt = new Date(booking.hold_expires_at);

        if (now > expiresAt) {
            await pool.query(
                `UPDATE booking SET status = 'EXPIRED', updated_at = NOW() WHERE BookingID = ?`,
                [bookingId]
            );
            await pool.query(
                `UPDATE order_seats SET SeatStatus = 'RELEASED' WHERE BookingID = ? AND SeatStatus = 'HELD'`,
                [bookingId]
            );

            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'HOLD_TIME_EXPIRED', message: 'Thời gian giữ ghế đã hết hạn. Vui lòng chọn lại ghế.' }
            });
        }

        await pool.query(
            `UPDATE booking 
             SET customer_name = ?, 
                 customer_email = ?, 
                 customer_phone = ?, 
                 age_confirmed = ?, 
                 age_confirmed_at = NOW(), 
                 status = 'CHECKOUT_PENDING', 
                 updated_at = NOW() 
             WHERE BookingID = ?`,
            [
                validatedData.customerName,
                validatedData.customerEmail,
                validatedData.customerPhone,
                validatedData.ageConfirmed,
                bookingId
            ]
        );

        return res.status(200).json({
            success: true,
            data: {
                bookingId: booking.BookingID,
                bookingCode: booking.BookingCode,
                showtimeId: booking.ShowtimeID,
                customerName: validatedData.customerName,
                customerEmail: validatedData.customerEmail,
                customerPhone: validatedData.customerPhone,
                ageConfirmed: validatedData.ageConfirmed,
                seatsSubtotal: Number(booking.seats_subtotal),
                fbSubtotal: Number(booking.fb_subtotal),
                discountAmount: Number(booking.discount_amount),
                totalAmount: Number(booking.total_amount),
                status: 'CHECKOUT_PENDING',
                holdExpiresAt: booking.hold_expires_at
            },
            error: null
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.issues[0]?.message || 'Dữ liệu không hợp lệ',
                    details: error.issues
                }
            });
        }
        console.error('[handleCheckout] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Lỗi xử lý checkout' }
        });
    }
}

/**
 * 3. Lấy thông tin chi tiết đơn hàng (GET /api/orders/:id)
 */
export async function getOrderDetail(req: Request, res: Response) {
    try {
        const bookingId = Number(req.params.id);

        if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_BOOKING_ID', message: 'Mã đơn hàng không hợp lệ' }
            });
        }

        const [bookings] = await pool.query<any[]>(
            `SELECT 
                b.BookingID, b.BookingCode, b.ShowtimeID, b.customer_name, b.customer_email,
                b.customer_phone, b.age_confirmed, b.seats_subtotal, b.fb_subtotal,
                b.discount_amount, b.total_amount, b.status, b.hold_expires_at, b.created_at,
                sh.ShowDate, sh.StartTime, sh.EndTime,
                m.MovieID, m.Title as movieTitle, m.AgeRating as ageRating,
                m.Duration as duration, m.PosterUrl as posterUrl,
                r.RoomID, r.RoomNumber as roomNumber, r.RoomType as roomType,
                c.CinemaID, c.CinemaName as cinemaName, c.Address as cinemaAddress
             FROM booking b
             JOIN showtimes sh ON b.ShowtimeID = sh.ShowtimeID
             JOIN movies m ON sh.MovieID = m.MovieID
             JOIN rooms r ON sh.RoomID = r.RoomID
             JOIN cinemas c ON r.CinemaID = c.CinemaID
             WHERE b.BookingID = ?
             LIMIT 1`,
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy thông tin đơn hàng' }
            });
        }

        const b = bookings[0];

        const [seatRows] = await pool.query<any[]>(
            `SELECT 
                os.OrderSeatID, os.SeatID, os.Price as price, os.SeatStatus,
                s.SeatRow as seatRow, s.SeatNumber as seatNumber, s.SeatLabel as seatLabel,
                st.TypeName as seatType, st.TypeCode as typeCode
             FROM order_seats os
             JOIN seats s ON os.SeatID = s.SeatID
             JOIN seat_types st ON s.SeatTypeID = st.SeatTypeID
             WHERE os.BookingID = ?`,
            [bookingId]
        );

        const [tickets] = await pool.query<any[]>(
            `SELECT 
                TicketNo, SeatLabel, SeatType, Price, Barcode, jwt_token, Gate, status,
                Date, Time, checkin_time
             FROM ticket 
             WHERE BookingID = ?`,
            [bookingId]
        );

        const [payments] = await pool.query<any[]>(
            `SELECT 
                PaymentID, Amount, Method, Partner, TransactionRef, momo_trans_id,
                status, payment_time, created_at
             FROM payment 
             WHERE BookingID = ?
             ORDER BY PaymentID DESC`,
            [bookingId]
        );

        return res.status(200).json({
            success: true,
            data: {
                bookingId: b.BookingID,
                bookingCode: b.BookingCode,
                status: b.status,
                customer: {
                    name: b.customer_name,
                    email: b.customer_email,
                    phone: b.customer_phone,
                    ageConfirmed: b.age_confirmed
                },
                movie: {
                    id: b.MovieID,
                    title: b.movieTitle,
                    ageRating: b.ageRating,
                    duration: b.duration,
                    posterUrl: b.posterUrl
                },
                screening: {
                    showtimeId: b.ShowtimeID,
                    date: b.ShowDate,
                    startTime: b.StartTime,
                    endTime: b.EndTime,
                    cinemaName: b.cinemaName,
                    cinemaAddress: b.cinemaAddress,
                    roomNumber: b.roomNumber,
                    roomType: b.roomType
                },
                pricing: {
                    seatsSubtotal: Number(b.seats_subtotal),
                    fbSubtotal: Number(b.fb_subtotal),
                    discountAmount: Number(b.discount_amount),
                    totalAmount: Number(b.total_amount)
                },
                seats: seatRows.map(s => ({
                    seatId: s.SeatID,
                    label: s.seatLabel,
                    row: s.seatRow,
                    number: s.seatNumber,
                    type: s.seatType,
                    price: Number(s.price),
                    status: s.SeatStatus
                })),
                tickets: tickets.map(t => ({
                    ticketNo: t.TicketNo,
                    seatLabel: t.SeatLabel,
                    seatType: t.SeatType,
                    price: Number(t.Price),
                    barcode: t.Barcode,
                    jwtToken: t.jwt_token,
                    gate: t.Gate,
                    status: t.status,
                    date: t.Date,
                    time: t.Time,
                    checkinTime: t.checkin_time
                })),
                payments: payments.map(p => ({
                    paymentId: p.PaymentID,
                    amount: Number(p.Amount),
                    method: p.Method,
                    partner: p.Partner,
                    transactionRef: p.TransactionRef,
                    momoTransId: p.momo_trans_id,
                    status: p.status,
                    paymentTime: p.payment_time
                })),
                holdExpiresAt: b.hold_expires_at,
                createdAt: b.created_at
            },
            error: null
        });

    } catch (error: any) {
        console.error('[getOrderDetail] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Lỗi lấy thông tin đơn hàng' }
        });
    }
}

/**
 * 4. Hủy đơn hàng và nhả ghế (POST /api/orders/:id/cancel) -> Phục vụ Failure.tsx
 */
export async function cancelOrder(req: Request, res: Response) {
    const conn = await pool.getConnection();
    try {
        const bookingId = Number(req.params.id);

        if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_BOOKING_ID', message: 'Mã đơn hàng không hợp lệ' }
            });
        }

        await conn.beginTransaction();

        const [rows] = await conn.query<any[]>(
            'SELECT status FROM booking WHERE BookingID = ? LIMIT 1 FOR UPDATE',
            [bookingId]
        );

        if (rows.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: 'BOOKING_NOT_FOUND', message: 'Đơn hàng không tồn tại' }
            });
        }

        if (rows[0].status === 'PAID') {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'CANNOT_CANCEL_PAID_ORDER', message: 'Đơn hàng đã thanh toán không thể hủy qua API này.' }
            });
        }

        await conn.query(
            `UPDATE booking SET status = 'CANCELED', updated_at = NOW() WHERE BookingID = ?`,
            [bookingId]
        );

        await conn.query(
            `UPDATE order_seats SET SeatStatus = 'RELEASED' WHERE BookingID = ?`,
            [bookingId]
        );

        await conn.commit();

        return res.status(200).json({
            success: true,
            data: { bookingId, status: 'CANCELED' },
            error: null
        });

    } catch (error: any) {
        await conn.rollback();
        console.error('[cancelOrder] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Lỗi hủy đơn hàng' }
        });
    } finally {
        conn.release();
    }
}

/**
 * 5. Yêu cầu hủy vé & hoàn tiền (POST /api/orders/:id/refund)
 */
export async function requestRefund(req: Request, res: Response) {
    const conn = await pool.getConnection();
    try {
        const bookingId = Number(req.params.id);
        const { reason } = req.body;

        if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_BOOKING_ID', message: 'Mã đơn hàng không hợp lệ' }
            });
        }

        await conn.beginTransaction();

        const [bookings] = await conn.query<any[]>(
            `SELECT b.BookingID, b.BookingCode, b.total_amount, b.status as booking_status,
                    sh.ShowDate, sh.StartTime,
                    p.PaymentID, p.Amount as paidAmount, p.status as payment_status
             FROM booking b
             JOIN showtimes sh ON b.ShowtimeID = sh.ShowtimeID
             JOIN payment p ON b.BookingID = p.BookingID AND p.status = 'SUCCESS'
             WHERE b.BookingID = ?
             ORDER BY p.PaymentID DESC
             LIMIT 1
             FOR UPDATE`,
            [bookingId]
        );

        if (bookings.length === 0) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'NOT_ELIGIBLE_FOR_REFUND', message: 'Đơn hàng chưa thanh toán hoặc không tồn tại giao dịch hợp lệ.' }
            });
        }

        const b = bookings[0];

        if (b.booking_status === 'REFUNDED') {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'ALREADY_REFUNDED', message: 'Đơn hàng này đã được hoàn tiền trước đó.' }
            });
        }

        const showDateStr = typeof b.ShowDate === 'string'
            ? b.ShowDate.slice(0, 10)
            : new Date(b.ShowDate).toISOString().slice(0, 10);
        const showtimeDateTime = new Date(`${showDateStr}T${b.StartTime}`);
        const now = new Date();

        const hoursDiff = (showtimeDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        let refundRatePercent = 100;
        let cancellationFee = 0;

        if (hoursDiff < 2) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 'NON_REFUNDABLE_WINDOW',
                    message: 'Theo chính sách bảo vệ vé rạp, không thể hoàn tiền trong vòng 2 tiếng trước giờ chiếu.'
                }
            });
        } else if (hoursDiff >= 2 && hoursDiff < 4) {
            refundRatePercent = 50;
            cancellationFee = Math.round(Number(b.paidAmount) * 0.5);
        } else {
            refundRatePercent = 100;
            cancellationFee = 0;
        }

        const refundAmount = Number(b.paidAmount) - cancellationFee;
        const refundRef = `RF-${Date.now().toString().slice(-8)}`;

        const [refResult]: any = await conn.query(
            `INSERT INTO refunds (
                RefundReference, BookingID, PaymentID, OriginalPaidAmount,
                CancellationFee, RefundAmount, RefundRatePercent, RefundDestination,
                Reason, Status, CompletedAt
             ) VALUES (?, ?, ?, ?, ?, ?, ?, 'MoMo E-Wallet', ?, 'COMPLETED', NOW())`,
            [
                refundRef,
                b.BookingID,
                b.PaymentID,
                b.paidAmount,
                cancellationFee,
                refundAmount,
                refundRatePercent,
                reason || 'Khách hàng yêu cầu hủy vé online'
            ]
        );

        await conn.query(
            `UPDATE booking SET status = 'REFUNDED', updated_at = NOW() WHERE BookingID = ?`,
            [b.BookingID]
        );

        await conn.query(
            `UPDATE payment SET status = 'REFUNDED', updated_at = NOW() WHERE PaymentID = ?`,
            [b.PaymentID]
        );

        await conn.query(
            `UPDATE order_seats SET SeatStatus = 'RELEASED' WHERE BookingID = ?`,
            [b.BookingID]
        );

        await conn.query(
            `UPDATE ticket SET status = 'REFUNDED' WHERE BookingID = ?`,
            [b.BookingID]
        );

        await conn.commit();

        return res.status(200).json({
            success: true,
            data: {
                refundId: refResult.insertId,
                refundReference: refundRef,
                bookingId: b.BookingID,
                bookingCode: b.BookingCode,
                originalPaidAmount: Number(b.paidAmount),
                cancellationFee,
                refundAmount,
                refundRatePercent,
                refundDestination: 'MoMo E-Wallet',
                status: 'COMPLETED'
            },
            error: null
        });

    } catch (error: any) {
        await conn.rollback();
        console.error('[requestRefund] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'REFUND_ERROR', message: error.message || 'Lỗi xử lý hoàn tiền' }
        });
    } finally {
        conn.release();
    }
}

/**
 * 6. Lấy thông tin chi tiết hoàn tiền (GET /api/orders/:id/refund)
 */
export async function getRefundDetail(req: Request, res: Response) {
    try {
        const bookingId = Number(req.params.id);

        if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'INVALID_BOOKING_ID', message: 'Mã đơn hàng không hợp lệ' }
            });
        }

        const [rows] = await pool.query<any[]>(
            `SELECT r.*, b.BookingCode, m.Title as movieTitle, rm.RoomNumber, c.CinemaName
             FROM refunds r
             JOIN booking b ON r.BookingID = b.BookingID
             JOIN showtimes sh ON b.ShowtimeID = sh.ShowtimeID
             JOIN movies m ON sh.MovieID = m.MovieID
             JOIN rooms rm ON sh.RoomID = rm.RoomID
             JOIN cinemas c ON rm.CinemaID = c.CinemaID
             WHERE r.BookingID = ?
             ORDER BY r.RefundID DESC
             LIMIT 1`,
            [bookingId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: 'REFUND_NOT_FOUND', message: 'Không tìm thấy thông tin hoàn tiền cho đơn này' }
            });
        }

        const r = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                refundId: r.RefundID,
                refundReference: r.RefundReference,
                bookingId: r.BookingID,
                bookingCode: r.BookingCode,
                movieTitle: r.movieTitle,
                cinemaName: r.CinemaName,
                roomNumber: r.RoomNumber,
                originalPaidAmount: Number(r.OriginalPaidAmount),
                cancellationFee: Number(r.CancellationFee),
                refundAmount: Number(r.RefundAmount),
                refundRatePercent: r.RefundRatePercent,
                refundDestination: r.RefundDestination,
                reason: r.Reason,
                status: r.Status,
                requestedAt: r.RequestedAt,
                completedAt: r.CompletedAt
            },
            error: null
        });

    } catch (error: any) {
        console.error('[getRefundDetail] Error:', error);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Lỗi lấy thông tin hoàn tiền' }
        });
    }
}