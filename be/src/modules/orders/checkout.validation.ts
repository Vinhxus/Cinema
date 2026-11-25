import { z } from 'zod';

export const checkoutSchema = z.object({
    customerName: z.string().trim().min(2, 'Họ tên phải từ 2 ký tự trở lên'),

    customerEmail: z.string().trim().email('Email không đúng định dạng'),

    customerPhone: z.string().trim().regex(
        /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/,
        'Số điện thoại Việt Nam không hợp lệ'
    ),

    ageConfirmed: z.enum(['P', 'T13', 'T16', 'T18'], {
        message: 'Xác nhận độ tuổi không hợp lệ (P, T13, T16, T18)'
    }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
