import { z } from 'zod';

export const bookingCodeSchema = {
  params: z.object({
    code: z.string().regex(/^[A-Za-z0-9-]{4,50}$/, 'Invalid booking code'),
  }),
};
