import { z } from 'zod';

export const getStatsSchema = {
  query: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    cinema_id: z.coerce.number().int().positive().optional(),
    cinemaId: z.coerce.number().int().positive().optional(),
    room_id: z.coerce.number().int().positive().optional(),
    roomId: z.coerce.number().int().positive().optional(),
  }),
};
