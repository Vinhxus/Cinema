import pool from '../config/db.js';

export const findOrderById = async (orderId) => {
    const [rows] = await pool.query(
        `SELECT b.*, TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) as elapsed_minutes 
     FROM booking b WHERE b.id = ?`,
        [orderId]
    );
    return rows[0] || null;
};

export const updateOrderCustomerInfo = async (orderId, { phone, email }) => {
    await pool.query(
        `UPDATE booking SET customer_phone = ?, customer_email = ? WHERE id = ?`,
        [phone, email, orderId]
    );
};

export const updateOrderStatus = async (orderId, status, connection = pool) => {
    await connection.query(`UPDATE booking SET status = ? WHERE id = ?`, [status, orderId]);
};

export const saveTransactionLog = async ({ orderId, transactionId, amount, status, rawData }) => {
    await pool.query(
        `INSERT INTO audit_logs (action, target_id, details, created_at) 
     VALUES ('PAYMENT_TRANSACTION', ?, ?, NOW())`,
        [orderId, JSON.stringify({ transactionId, amount, status, rawData })]
    );
};

export const createTicketsForOrder = async (orderId, ticketsData, connection = pool) => {
    for (const t of ticketsData) {
        await connection.query(
            `INSERT INTO ticket (id, booking_id, seat_id, qr_code, status, price, created_at)
       VALUES (?, ?, ?, ?, 'ACTIVE', ?, NOW())`,
            [t.id, orderId, t.seatId, t.qrCode, t.price]
        );
    }
};