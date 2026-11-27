import { z } from 'zod';
import { isIsoDate } from '../utils/datetime.js';

/** Query string rỗng (vd: ?date=) được coi như không truyền. */
const emptyToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

/** Ngày phải đúng định dạng YYYY-MM-DD và là ngày có thật trong lịch. */
const isoDate = z
  .string({ error: 'Date must be in YYYY-MM-DD format' })
  .refine((value) => isIsoDate(value), 'Invalid date (YYYY-MM-DD)');

export const listShowtimesQuerySchema = z.object({
  movieId: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'movieId is required' })
      .int('movieId must be an integer')
      .positive('movieId must be greater than 0')
  ),
  date: z.preprocess(emptyToUndefined, isoDate.optional()),
  cinemaId: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'Invalid cinemaId' })
      .int('cinemaId must be an integer')
      .positive('cinemaId must be greater than 0')
      .optional()
  ),
  format: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Invalid format' })
      .trim()
      .min(1, 'Invalid format')
      .max(100, 'Format must be at most 100 characters')
      .optional()
  ),
  days: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'Invalid days' })
      .int('days must be an integer')
      .min(1, 'days must be at least 1')
      .max(30, 'days must be at most 30')
      .optional()
  ),
});