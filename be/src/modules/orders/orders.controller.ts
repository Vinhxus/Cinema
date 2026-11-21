import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../../config/db.js';

export const checkoutSchema = z.object({
    customerName: z.string().min(2, 'Họ tên phải từ 2 ký tự trở lên'),
    customerEmail: z.string().email('Email không đúng định dạng'),
    customerPhone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại Việt Nam không hợp lệ'),
    ageConfirmed: z.enum(['P', 'T13', 'T16', 'T18'], {
        message: 'Xác nhận độ tuổi không hợp lệ (P, T13, T16, T18)'
    }),
});

export async function handleCheckout(req: Request, res: Response) {
    try {
        const bookingId = Number(req.params.id);

        if (isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Mã đơn hàng không hợp lệ', details: null }
            });
        }

        const validatedData = checkoutSchema.parse(req.body);
        const ageConfirmedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const [rows]: any = await pool.query('SELECT * FROM booking WHERE BookingID = ?', [bookingId]);

        if (rows.length === 0) {
            await pool.query(
                `INSERT INTO booking 
         (BookingID, customer_name, customer_email, customer_phone, age_confirmed, age_confirmed_at, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    bookingId,
                    validatedData.customerName,
                    validatedData.customerEmail,
                    validatedData.customerPhone,
                    validatedData.ageConfirmed,
                    ageConfirmedAt,
                    'CHECKOUT_PENDING'
                ]
            );
        } else {
            await pool.query(
                `UPDATE booking 
         SET customer_name = ?, customer_email = ?, customer_phone = ?, age_confirmed = ?, age_confirmed_at = ?, status = ? 
         WHERE BookingID = ?`,
                [
                    validatedData.customerName,
                    validatedData.customerEmail,
                    validatedData.customerPhone,
                    validatedData.ageConfirmed,
                    ageConfirmedAt,
                    'CHECKOUT_PENDING',
                    bookingId
                ]
            );
        }

        return res.status(200).json({
            success: true,
            data: {
                bookingId,
                ...validatedData,
                status: 'CHECKOUT_PENDING'
            },
            error: null
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { message: 'Dữ liệu không hợp lệ', details: error.issues }
            });
        }
        return res.status(500).json({
            success: false,
            data: null,
            error: { message: error.message, details: null }
        });
    }
}