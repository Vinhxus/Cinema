
import type { Request, Response } from 'express';
import { z } from 'zod';
import { checkoutSchema } from './checkout.validation.js';

// Controller xử lý API POST /orders/:id/checkout
export async function handleCheckout(req: Request, res: Response) {
    try {
        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_BOOKING_ID',
                    message: 'Booking ID không hợp lệ'
                }
            });
        }

        const validatedData = checkoutSchema.parse(req.body);

        const updatedBooking = {
            bookingId,
            ...validatedData,
            ageConfirmedAt: new Date(),
            status: 'CHECKOUT_PENDING'
        };

        return res.status(200).json({
            success: true,
            data: updatedBooking,
            message: 'Xác nhận thông tin checkout thành công'
        });

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Dữ liệu không hợp lệ',
                    details: error.issues
                }
            });
        }

        return res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi máy chủ'
            }
        });
    }
}
