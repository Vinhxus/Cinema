import { z } from 'zod';

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const checkoutSchema = z.object({
    body: z.object({
        phone: z.string().regex(phoneRegex, 'Invalid phone number (Vietnamese format)'),
        email: z.string().email('Invalid email address'),
        name: z.string().min(1, 'Full name is required'),
        ageConfirmed: z.enum(['P', 'T13', 'T16', 'T18'], {
            errorMap: () => ({ message: 'Invalid age confirmation' }),
        }),
    }),
});

export const createPaymentSchema = z.object({
    body: z.object({
        bookingId: z.number().int().positive('BookingID must be a positive integer'),
    }),
});
// Lưu ý: middleware validate() nhận object dạng { body, params, query } (KHÔNG bọc z.object bên ngoài).
// Nếu bọc z.object({ body: ... }) thì validate sẽ đem cả schema đi parse req.body -> luôn báo lỗi.
export const createSepaySchema = {
    body: z.object({
        clientId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/, 'Invalid clientId'),
        showtimeId: z.coerce.number().int().positive(),
        customer: z.object({
            name: z.string().trim().min(1, 'Full name is required').max(255),
            phone: z.string().trim().regex(phoneRegex, 'Invalid phone number'),
            email: z.string().trim().email('Invalid email address').max(255),
            ageConfirmed: z.enum(['P', 'T13', 'T16', 'T18']).optional(),
        }),
        voucher: z.string().trim().max(32).nullish(),
    }),
};

export const paymentStatusSchema = {
    params: z.object({
        ref: z.string().regex(/^[A-Za-z0-9_]{4,100}$/, 'Invalid transaction reference'),
    }),
};
