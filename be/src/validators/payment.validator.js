import { z } from 'zod';

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const checkoutSchema = z.object({
    body: z.object({
        phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ (định dạng Việt Nam)'),
        email: z.string().email('Email không đúng định dạng'),
        ageConfirmed: z.boolean().refine((val) => val === true, {
            message: 'Bạn phải xác nhận đủ điều kiện độ tuổi để xem phim',
        }),
    }),
});

export const createPaymentSchema = z.object({
    body: z.object({
        orderId: z.string().min(1, 'Order ID không được để trống'),
    }),
});