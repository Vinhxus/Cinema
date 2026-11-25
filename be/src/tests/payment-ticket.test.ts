import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'node:http';
import { app } from '../server.js';
import pool from '../config/db.js';
import { MomoService } from '../modules/payments/momo.service.js';
import { verifyTicketQR } from '../modules/tickets/tickets.service.js';

const momoService = new MomoService();
let server: Server;
let baseUrl: string;

// Biến lưu trạng thái các booking test
let testBookingId: number;
let expiredBookingId: number;
let paidBookingId: number;
let createdTransactionRef: string;
const TEST_SHOWTIME_ID = 4; // Showtime có sẵn trong seed data (IMAX Dune 2)

before(async () => {
    // 1. Khởi động server trên cổng ngẫu nhiên (ephemeral port)
    await new Promise<void>((resolve) => {
        server = app.listen(0, () => {
            const address = server.address();
            const port = typeof address === 'object' && address ? address.port : 5000;
            baseUrl = `http://127.0.0.1:${port}`;
            console.log(`\n🚀 [Test Runner] Test server started at ${baseUrl}`);
            resolve();
        });
    });

    // 2. Chuẩn bị dữ liệu test trên cinema_db_verify
    // A. Tạo booking hợp lệ đang giữ chỗ (HOLDING) với 2 ghế, thời hạn 15 phút tới
    const [bRes]: any = await pool.query(
        `INSERT INTO booking (
            BookingCode, ShowtimeID, customer_name, customer_email, customer_phone,
            seats_subtotal, fb_subtotal, discount_amount, total_amount, status,
            hold_expires_at, Channel
        ) VALUES (
            ?, ?, 'Tester Test', 'tester@test.com', '0912345678',
            280000.00, 0.00, 0.00, 280000.00, 'HOLDING',
            DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'ONLINE'
        )`,
        [`BK-TEST-${Date.now()}`, TEST_SHOWTIME_ID]
    );
    testBookingId = bRes.insertId;

    // Gán 2 ghế cho test booking (ghế 624, 625 là hàng G)
    await pool.query(
        `INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
         VALUES (?, ?, 624, 140000.00, 'HELD'), (?, ?, 625, 140000.00, 'HELD')`,
        [testBookingId, TEST_SHOWTIME_ID, testBookingId, TEST_SHOWTIME_ID]
    );

    // B. Tạo booking đã hết hạn (EXPIRED)
    const [expRes]: any = await pool.query(
        `INSERT INTO booking (
            BookingCode, ShowtimeID, customer_name, customer_email, customer_phone,
            seats_subtotal, fb_subtotal, discount_amount, total_amount, status,
            hold_expires_at, Channel
        ) VALUES (
            ?, ?, 'Expired Tester', 'expired@test.com', '0912345678',
            140000.00, 0.00, 0.00, 140000.00, 'HOLDING',
            DATE_SUB(NOW(), INTERVAL 10 MINUTE), 'ONLINE'
        )`,
        [`BK-EXP-${Date.now()}`, TEST_SHOWTIME_ID]
    );
    expiredBookingId = expRes.insertId;

    // C. Booking 1 trong seed data đã ở trạng thái PAID
    paidBookingId = 1;
});

after(async () => {
    // Dọn dẹp dữ liệu test sinh ra trong quá trình chạy test
    try {
        if (testBookingId) {
            await pool.query('DELETE FROM ticket WHERE BookingID = ?', [testBookingId]);
            await pool.query('DELETE FROM payment WHERE BookingID = ?', [testBookingId]);
            await pool.query('DELETE FROM order_seats WHERE BookingID = ?', [testBookingId]);
            await pool.query('DELETE FROM booking WHERE BookingID = ?', [testBookingId]);
        }
        if (expiredBookingId) {
            await pool.query('DELETE FROM order_seats WHERE BookingID = ?', [expiredBookingId]);
            await pool.query('DELETE FROM booking WHERE BookingID = ?', [expiredBookingId]);
        }
    } catch (e) {
        console.warn('[Test Cleanup Warning]:', e);
    }

    // Đóng server và connection pool
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log('🏁 [Test Runner] Test suite hoàn tất.\n');
});

describe('=== SENEMA BACKEND PAYMENT & TICKET TEST SUITE ===', () => {

    // 1. Kiểm tra kết nối DB và Health check
    test('1. [Health Check] GET /api/health phải trả về status OK và database CONNECTED', async () => {
        const res = await fetch(`${baseUrl}/api/health`);
        assert.equal(res.status, 200);

        const body: any = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.status, 'OK');
        assert.equal(body.data.database, 'CONNECTED');
    });

    // 2. Test Checkout - Đơn hàng không tồn tại
    test('2. [Checkout] POST /api/orders/999999/checkout phải trả về 404 BOOKING_NOT_FOUND', async () => {
        const res = await fetch(`${baseUrl}/api/orders/999999/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: 'Nguyễn Văn A',
                customerEmail: 'a@example.com',
                customerPhone: '0987654321',
                ageConfirmed: 'T18'
            })
        });

        assert.equal(res.status, 404);
        const body: any = await res.json();
        assert.equal(body.success, false);
        assert.equal(body.error.code, 'BOOKING_NOT_FOUND');
    });

    // 3. Test Checkout - Đơn hàng đã hết hạn hold_expires_at
    test('3. [Checkout] POST /api/orders/:expiredId/checkout phải từ chối khi hết hạn giữ ghế (400)', async () => {
        const res = await fetch(`${baseUrl}/api/orders/${expiredBookingId}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: 'Người Hết Hạn',
                customerEmail: 'expired@example.com',
                customerPhone: '0987654321',
                ageConfirmed: 'P'
            })
        });

        assert.equal(res.status, 400);
        const body: any = await res.json();
        assert.equal(body.success, false);
        assert.equal(body.error.code, 'HOLD_TIME_EXPIRED');

        // Kiểm tra trong MySQL xem trạng thái đơn có tự động chuyển sang EXPIRED không
        const [rows]: any = await pool.query('SELECT status FROM booking WHERE BookingID = ?', [expiredBookingId]);
        assert.equal(rows[0].status, 'EXPIRED');
    });

    // 4. Test Checkout - Đơn hàng đã thanh toán (PAID)
    test('4. [Checkout] POST /api/orders/:paidId/checkout phải từ chối khi đơn đã PAID (400)', async () => {
        const res = await fetch(`${baseUrl}/api/orders/${paidBookingId}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: 'Người Đã Trả',
                customerEmail: 'paid@example.com',
                customerPhone: '0987654321',
                ageConfirmed: 'T16'
            })
        });

        assert.equal(res.status, 400);
        const body: any = await res.json();
        assert.equal(body.success, false);
        assert.equal(body.error.code, 'BOOKING_ALREADY_PAID');
    });

    // 5. Test Checkout - Dữ liệu không hợp lệ (Validation check)
    test('5. [Checkout] POST /api/orders/:id/checkout dữ liệu sai (SĐT sai, email sai) phải trả về 400', async () => {
        const res = await fetch(`${baseUrl}/api/orders/${testBookingId}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: 'A', // Quá ngắn (<2 ký tự)
                customerEmail: 'email-sai-dinh-dang',
                customerPhone: '123456', // Sai định dạng VN
                ageConfirmed: 'INVALID_RATING'
            })
        });

        assert.equal(res.status, 400);
        const body: any = await res.json();
        assert.equal(body.success, false);
        assert.equal(body.error.code, 'VALIDATION_ERROR');
    });

    // 6. Test Checkout - Thành công
    test('6. [Checkout] POST /api/orders/:id/checkout thành công cập nhật CHECKOUT_PENDING', async () => {
        const res = await fetch(`${baseUrl}/api/orders/${testBookingId}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: 'Ngô Tuấn Checkout',
                customerEmail: 'tuan.checkout@example.com',
                customerPhone: '0912345678',
                ageConfirmed: 'T18'
            })
        });

        assert.equal(res.status, 200);
        const body: any = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.status, 'CHECKOUT_PENDING');
        assert.equal(body.data.customerName, 'Ngô Tuấn Checkout');
        assert.equal(body.data.totalAmount, 280000);

        // Kiểm chứng trực tiếp trong MySQL
        const [rows]: any = await pool.query('SELECT customer_name, status FROM booking WHERE BookingID = ?', [testBookingId]);
        assert.equal(rows[0].customer_name, 'Ngô Tuấn Checkout');
        assert.equal(rows[0].status, 'CHECKOUT_PENDING');
    });

    // 7. Test xem chi tiết đơn hàng GET /api/orders/:id
    test('7. [Order Detail] GET /api/orders/:id trả về đầy đủ thông tin phim, suất chiếu, ghế từ DB', async () => {
        const res = await fetch(`${baseUrl}/api/orders/${testBookingId}`);
        assert.equal(res.status, 200);

        const body: any = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.bookingId, testBookingId);
        assert.equal(body.data.screening.cinemaName, 'SENEMA Landmark 81');
        assert.equal(body.data.seats.length, 2);
        assert.equal(body.data.customer.name, 'Ngô Tuấn Checkout');
    });

    // 8. Test Tạo giao dịch MoMo Payment - Khởi tạo thành công & Không tin amount của client
    test('8. [MoMo Payment] POST /api/payments/momo/create tạo payment record với số tiền từ DB', async () => {
        const res = await fetch(`${baseUrl}/api/payments/momo/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bookingId: testBookingId,
                amount: 1000 // Client cố tình gian lận gửi 1,000₫ thay vì 280,000₫
            })
        });

        assert.equal(res.status, 200);
        const body: any = await res.json();
        assert.equal(body.success, true);
        assert.ok(body.data.payUrl);
        assert.ok(body.data.transactionRef);

        // Kiểm tra số tiền: Phải lấy 280,000₫ từ DB, không tin 1,000₫ của client
        assert.equal(body.data.amount, 280000);

        createdTransactionRef = body.data.transactionRef;

        // Kiểm chứng trong bảng payment của MySQL
        const [pRows]: any = await pool.query(
            'SELECT * FROM payment WHERE TransactionRef = ?',
            [createdTransactionRef]
        );
        assert.equal(pRows.length, 1);
        assert.equal(pRows[0].status, 'PENDING');
        assert.equal(Number(pRows[0].Amount), 280000);
    });

    // 9. Test MoMo IPN - Chữ ký không hợp lệ
    test('9. [MoMo IPN] POST /api/payments/momo/ipn từ chối chữ ký giả mạo (400)', async () => {
        const invalidPayload = {
            partnerCode: 'MOMO',
            orderId: createdTransactionRef,
            requestId: `REQ_${Date.now()}`,
            amount: 280000,
            orderInfo: 'Thanh toán đơn hàng',
            orderType: 'momo_wallet',
            transId: 999999999,
            resultCode: 0,
            message: 'Thành công',
            payType: 'qr',
            responseTime: Date.now(),
            extraData: '',
            signature: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' // Chữ ký sai
        };

        const res = await fetch(`${baseUrl}/api/payments/momo/ipn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidPayload)
        });

        assert.equal(res.status, 400);
        const body: any = await res.json();
        assert.equal(body.error.code, 'INVALID_SIGNATURE');
    });

    // 10. Test MoMo IPN - Sai lệch số tiền (Amount mismatch / Tampering)
    test('10. [MoMo IPN] Sai lệch số tiền phải bị từ chối và đổi status sang NEED_RECONCILE (400)', async () => {
        const tamperedPayloadRaw = {
            partnerCode: 'MOMO',
            orderId: createdTransactionRef,
            requestId: `REQ_${Date.now()}`,
            amount: 1000, // Số tiền bị can thiệp khác 280,000₫
            orderInfo: 'Thanh toan ve',
            orderType: 'momo_wallet',
            transId: 88888888,
            resultCode: 0,
            message: 'Thanh cong',
            payType: 'qr',
            responseTime: Date.now(),
            extraData: ''
        };

        const rawSig = momoService.buildIpnRawSignature(tamperedPayloadRaw as any);
        const validSigForTampered = momoService.createSignature(rawSig);

        const res = await fetch(`${baseUrl}/api/payments/momo/ipn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...tamperedPayloadRaw,
                signature: validSigForTampered
            })
        });

        assert.equal(res.status, 400);
        const body: any = await res.json();
        assert.equal(body.error.code, 'AMOUNT_MISMATCH');

        // Kiểm tra trong MySQL bảng payment đã được đánh dấu NEED_RECONCILE
        const [pRows]: any = await pool.query(
            'SELECT status FROM payment WHERE TransactionRef = ?',
            [createdTransactionRef]
        );
        assert.equal(pRows[0].status, 'NEED_RECONCILE');
    });

    // 11. Test MoMo IPN - Thanh toán thành công (Happy Path)
    test('11. [MoMo IPN] Thanh toán thành công cập nhật Payment, Booking PAID, chốt ghế BOOKED và phát hành vé (204)', async () => {
        // Cần reset status payment về PENDING để test thanh toán chuẩn
        await pool.query(
            `UPDATE payment SET status = 'PENDING' WHERE TransactionRef = ?`,
            [createdTransactionRef]
        );

        const validPayloadRaw = {
            partnerCode: 'MOMO',
            orderId: createdTransactionRef,
            requestId: `REQ_VALID_${Date.now()}`,
            amount: 280000,
            orderInfo: 'Thanh toan don hang',
            orderType: 'momo_wallet',
            transId: 1234567890,
            resultCode: 0,
            message: 'Giao dich thanh cong.',
            payType: 'qr',
            responseTime: Date.now(),
            extraData: ''
        };

        const rawSig = momoService.buildIpnRawSignature(validPayloadRaw as any);
        const signature = momoService.createSignature(rawSig);

        const res = await fetch(`${baseUrl}/api/payments/momo/ipn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...validPayloadRaw,
                signature
            })
        });

        // MoMo chuẩn IPN yêu cầu HTTP 204 No Content
        assert.equal(res.status, 204);

        // A. Kiểm tra bảng payment trong MySQL
        const [pRows]: any = await pool.query(
            'SELECT status, momo_trans_id FROM payment WHERE TransactionRef = ?',
            [createdTransactionRef]
        );
        assert.equal(pRows[0].status, 'SUCCESS');
        assert.equal(pRows[0].momo_trans_id, '1234567890');

        // B. Kiểm tra bảng booking trong MySQL
        const [bRows]: any = await pool.query(
            'SELECT status FROM booking WHERE BookingID = ?',
            [testBookingId]
        );
        assert.equal(bRows[0].status, 'PAID');

        // C. Kiểm tra bảng order_seats (Ghế được chốt sang BOOKED)
        const [osRows]: any = await pool.query(
            'SELECT SeatStatus FROM order_seats WHERE BookingID = ?',
            [testBookingId]
        );
        assert.equal(osRows.length, 2);
        assert.equal(osRows[0].SeatStatus, 'BOOKED');
        assert.equal(osRows[1].SeatStatus, 'BOOKED');

        // D. Kiểm tra bảng ticket (Đã phát hành đúng 2 vé tương ứng với 2 ghế)
        const [tRows]: any = await pool.query(
            'SELECT TicketNo, SeatLabel, Barcode, jwt_token, status FROM ticket WHERE BookingID = ?',
            [testBookingId]
        );
        assert.equal(tRows.length, 2);
        assert.equal(tRows[0].status, 'VALID');
        assert.equal(tRows[1].status, 'VALID');

        // E. Kiểm tra JWT token của vé có giải mã được thông tin hợp lệ không
        const decodedTicket = verifyTicketQR(tRows[0].jwt_token);
        assert.ok(decodedTicket);
        assert.equal(decodedTicket.bookingId, testBookingId);
        assert.ok(decodedTicket.seatLabel);
        assert.ok(decodedTicket.antiForgeryHash);
    });

    // 12. Test MoMo IPN - Chống xử lý lặp lại (Idempotency)
    test('12. [Idempotency] Gửi lại IPN thành công lần 2 phải trả về 204 và không sinh thêm vé trùng', async () => {
        const repeatPayloadRaw = {
            partnerCode: 'MOMO',
            orderId: createdTransactionRef,
            requestId: `REQ_REPEAT_${Date.now()}`,
            amount: 280000,
            orderInfo: 'Thanh toan don hang',
            orderType: 'momo_wallet',
            transId: 1234567890,
            resultCode: 0,
            message: 'Giao dich thanh cong.',
            payType: 'qr',
            responseTime: Date.now(),
            extraData: ''
        };

        const rawSig = momoService.buildIpnRawSignature(repeatPayloadRaw as any);
        const signature = momoService.createSignature(rawSig);

        const res = await fetch(`${baseUrl}/api/payments/momo/ipn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...repeatPayloadRaw,
                signature
            })
        });

        assert.equal(res.status, 204);

        // Số lượng vé trong DB vẫn giữ nguyên là 2, không bị nhân đôi lên 4
        const [tRows]: any = await pool.query(
            'SELECT COUNT(*) as count FROM ticket WHERE BookingID = ?',
            [testBookingId]
        );
        assert.equal(tRows[0].count, 2);
    });

    // 13. Test Tra cứu vé theo Booking ID: GET /api/tickets/booking/:id
    test('13. [Ticket Query] GET /api/tickets/booking/:id trả về danh sách vé đầy đủ của đơn', async () => {
        const res = await fetch(`${baseUrl}/api/tickets/booking/${testBookingId}`);
        assert.equal(res.status, 200);

        const body: any = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.length, 2);
        assert.equal(body.data[0].BookingID, testBookingId);
        assert.ok(body.data[0].jwt_token);
    });

    // 14. Test Tra cứu trạng thái giao dịch: GET /api/payments/status/:transactionRef
    test('14. [Payment Status] GET /api/payments/status/:transactionRef trả về đúng trạng thái SUCCESS', async () => {
        const res = await fetch(`${baseUrl}/api/payments/status/${createdTransactionRef}`);
        assert.equal(res.status, 200);

        const body: any = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.status, 'SUCCESS');
        assert.equal(body.data.amount, 280000);
        assert.equal(body.data.momoTransId, '1234567890');
    });

});
