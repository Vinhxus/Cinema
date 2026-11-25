import { z } from 'zod';

/** Query string rỗng (vd: ?status=) được coi như không truyền. */
const emptyToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export const listMoviesQuerySchema = z.object({
  status: z.preprocess(
    emptyToUndefined,
    z
      .enum(['now', 'upcoming', 'all'], {
        error: 'status chỉ nhận: now | upcoming | all',
      })
      .optional()
  ),
  genre: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Thể loại không hợp lệ' })
      .trim()
      .min(1, 'Thể loại không hợp lệ')
      .max(100, 'Thể loại tối đa 100 ký tự')
      .optional()
  ),
});

export const searchMoviesQuerySchema = z.object({
  q: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Vui lòng nhập từ khoá tìm kiếm' })
      .trim()
      .min(1, 'Vui lòng nhập từ khoá tìm kiếm')
      .max(100, 'Từ khoá tối đa 100 ký tự')
  ),
});
