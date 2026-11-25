import { z } from 'zod';

const showtimeFields = {
  movieId: z.coerce.number().int().positive().optional(),
  movie_id: z.coerce.number().int().positive().optional(),
  roomId: z.coerce.number().int().positive().optional(),
  room_id: z.coerce.number().int().positive().optional(),
  showDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  show_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().trim().min(4).optional(),
  start_time: z.string().trim().min(4).optional(),
  format: z.string().trim().max(100).optional(),
  baseTicketPrice: z.coerce.number().min(0).optional(),
  base_ticket_price: z.coerce.number().min(0).optional(),
  status: z
    .enum(['SCHEDULED', 'CHECKIN_OPEN', 'COMPLETED', 'CANCELED'])
    .optional(),
};

export const showtimeIdParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export const listShowtimesSchema = {
  query: z.object({
    cinema_id: z.coerce.number().int().positive().optional(),
    cinemaId: z.coerce.number().int().positive().optional(),
    room_id: z.coerce.number().int().positive().optional(),
    roomId: z.coerce.number().int().positive().optional(),
    movie_id: z.coerce.number().int().positive().optional(),
    movieId: z.coerce.number().int().positive().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    show_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    showDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: z
      .enum(['SCHEDULED', 'CHECKIN_OPEN', 'COMPLETED', 'CANCELED'])
      .optional(),
  }),
};

export const createShowtimeSchema = {
  body: z
    .object(showtimeFields)
    .refine((d) => Boolean(d.movieId || d.movie_id), {
      message: 'movie_id is required',
      path: ['movie_id'],
    })
    .refine((d) => Boolean(d.roomId || d.room_id), {
      message: 'room_id is required',
      path: ['room_id'],
    })
    .refine((d) => Boolean(d.startTime || d.start_time), {
      message: 'start_time is required',
      path: ['start_time'],
    }),
};

export const updateShowtimeSchema = {
  params: showtimeIdParamSchema.params,
  body: z
    .object(showtimeFields)
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'At least one field is required for update',
    }),
};

export const copyShowtimesSchema = {
  body: z
    .object({
      sourceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      source_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      cinemaId: z.coerce.number().int().positive().optional(),
      cinema_id: z.coerce.number().int().positive().optional(),
      roomId: z.coerce.number().int().positive().optional(),
      room_id: z.coerce.number().int().positive().optional(),
    })
    .refine((d) => Boolean(d.sourceDate || d.source_date), {
      message: 'source_date is required',
      path: ['source_date'],
    })
    .refine((d) => Boolean(d.targetDate || d.target_date), {
      message: 'target_date is required',
      path: ['target_date'],
    })
    .refine((d) => Boolean(d.cinemaId || d.cinema_id), {
      message: 'cinema_id is required',
      path: ['cinema_id'],
    }),
};
