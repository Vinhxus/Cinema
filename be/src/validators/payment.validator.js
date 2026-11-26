import { z } from 'zod';

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const checkoutSchema = z.object({
    body: z.object({
        phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ (định dạng Việt Nam)'),
        email: z.string().email('Email không đúng định dạng'),
        name: z.string().min(1, 'Họ tên không được để trống'),
        ageConfirmed: z.enum(['P', 'T13', 'T16', 'T18'], {
            errorMap: () => ({ message: 'Xác nhận độ tuổi không hợp lệ' }),
        }),
    }),
});

export const createPaymentSchema = z.object({
    body: z.object({
        bookingId: z.number().int().positive('BookingID phải là số nguyên dương'),
    }),
});