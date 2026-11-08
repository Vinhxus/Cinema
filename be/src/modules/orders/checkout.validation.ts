import { z } from 'zod';

// Regex kiểm tra số điện thoại di động Việt Nam (10 chữ số)
const vietnamPhoneRegex = /(03|05|07|08|09)+([0-9]{8})\b/;

export const checkoutSchema = z.object({
    customerName: z
        .string({ message: 'Vui lòng cung cấp họ tên' })
        .trim()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự'),

    customerEmail: z
        .string({ message: 'Vui lòng cung cấp email' })
        .trim()
        .email('Định dạng email không hợp lệ'),

    customerPhone: z
        .string({ message: 'Vui lòng cung cấp số điện thoại' })
        .trim()
        .regex(vietnamPhoneRegex, 'Số điện thoại Việt Nam không hợp lệ (VD: 0912345678)'),

    ageConfirmed: z.enum(['T13', 'T16', 'T18'], {
        message: 'Vui lòng chọn xác nhận đúng mức độ tuổi (T13, T16, T18)',
    }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;