import { z } from 'zod';

// ID trong DB là INT AUTO_INCREMENT. Client có thể gửi 4 hoặc "4" -> coerce về number.
const id = z.coerce.number().int().positive();

/* ---------- Socket payloads (không bao giờ tin dữ liệu từ client) ---------- */
export const showtimePayload = z.object({ showtimeId: id });
export const seatPayload = z.object({ showtimeId: id, seatId: id });

// clientId do FE tự sinh (crypto.randomUUID) và gửi lúc handshake
export const clientIdSchema = z.string().regex(/^[A-Za-z0-9_-]{8,64}$/);

/* ---------- HTTP (dùng với middleware validate) ---------- */
export const seatMapSchema = {
  params: z.object({ id }),
};

export const listShowtimesSchema = {
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
      .optional(),
  }),
};
