import { z } from 'zod';

/** Query string rỗng (vd: ?status=) được coi như không truyền. */
const emptyToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export const listMoviesQuerySchema = z.object({
  status: z.preprocess(
    emptyToUndefined,
    z
      .enum(['now', 'upcoming', 'all'], {
        error: 'status must be one of: now | upcoming | all',
      })
      .optional()
  ),
  genre: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Invalid genre' })
      .trim()
      .min(1, 'Invalid genre')
      .max(100, 'Genre must be at most 100 characters')
      .optional()
  ),
});

export const searchMoviesQuerySchema = z.object({
  q: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Please enter a search keyword' })
      .trim()
      .min(1, 'Please enter a search keyword')
      .max(100, 'Keyword must be at most 100 characters')
  ),
});

/** Tham số đường dẫn /:id — MovieID là số nguyên dương. */
export const movieIdParamSchema = z.object({
  id: z.coerce
    .number({ error: 'Invalid MovieID' })
    .int('MovieID must be an integer')
    .positive('MovieID must be greater than 0'),
});