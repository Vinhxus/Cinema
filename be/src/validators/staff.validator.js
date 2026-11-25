import { z } from 'zod';

export const listCheckinsSchema = {
  query: z.object({
    cinema_id: z.coerce.number().int().positive().optional(),
    cinemaId: z.coerce.number().int().positive().optional(),
    showtime_id: z.coerce.number().int().positive().optional(),
    showtimeId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
};

export const listStaffShowtimesSchema = {
  query: z.object({
    cinema_id: z.coerce.number().int().positive().optional(),
    cinemaId: z.coerce.number().int().positive().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
};

export const lookupTicketSchema = {
  query: z.object({
    q: z.string().trim().min(1, 'Search query is required'),
    cinema_id: z.coerce.number().int().positive().optional(),
    cinemaId: z.coerce.number().int().positive().optional(),
    showtime_id: z.coerce.number().int().positive().optional(),
    showtimeId: z.coerce.number().int().positive().optional(),
  }),
};

export const checkinSchema = {
  body: z
    .object({
      qr_token: z.string().trim().min(1).optional(),
      qrToken: z.string().trim().min(1).optional(),
      ticket_no: z.string().trim().min(1).optional(),
      ticketNo: z.string().trim().min(1).optional(),
      barcode: z.string().trim().min(1).optional(),
      booking_code: z.string().trim().min(1).optional(),
      bookingCode: z.string().trim().min(1).optional(),
      phone_number: z.string().trim().min(1).optional(),
      phoneNumber: z.string().trim().min(1).optional(),
      showtime_id: z.coerce.number().int().positive().optional(),
      showtimeId: z.coerce.number().int().positive().optional(),
      cinema_id: z.coerce.number().int().positive().optional(),
      cinemaId: z.coerce.number().int().positive().optional(),
    })
    .refine(
      (d) =>
        Boolean(
          d.qr_token ||
            d.qrToken ||
            d.ticket_no ||
            d.ticketNo ||
            d.barcode ||
            d.booking_code ||
            d.bookingCode ||
            d.phone_number ||
            d.phoneNumber
        ),
      {
        message:
          'Provide qr_token, ticket_no, barcode, booking_code, or phone_number',
        path: ['ticket_no'],
      }
    ),
};
