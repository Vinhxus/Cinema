import { z } from 'zod';
import { isIsoDate } from '../utils/datetime.js';

/** Query string rỗng (vd: ?date=) được coi như không truyền. */
const emptyToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

/** Ngày phải đúng định dạng YYYY-MM-DD và là ngày có thật trong lịch. */
const isoDate = z
  .string({ error: 'Ngày phải có định dạng YYYY-MM-DD' })
  .refine((value) => isIsoDate(value), 'Ngày không hợp lệ (định dạng YYYY-MM-DD)');

export const listShowtimesQuerySchema = z.object({
  movieId: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'movieId là bắt buộc' })
      .int('movieId phải là số nguyên')
      .positive('movieId phải lớn hơn 0')
  ),
  date: z.preprocess(emptyToUndefined, isoDate.optional()),
  cinemaId: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'cinemaId không hợp lệ' })
      .int('cinemaId phải là số nguyên')
      .positive('cinemaId phải lớn hơn 0')
      .optional()
  ),
  format: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Định dạng không hợp lệ' })
      .trim()
      .min(1, 'Định dạng không hợp lệ')
      .max(100, 'Định dạng tối đa 100 ký tự')
      .optional()
  ),
  days: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'days không hợp lệ' })
      .int('days phải là số nguyên')
      .min(1, 'days tối thiểu là 1')
      .max(30, 'days tối đa là 30')
      .optional()
  ),
});