import { z } from 'zod';

export const registerSchema = {
  body: z
    .object({
      name: z.string().trim().min(2).max(255),
      mail: z.string().trim().email().max(255).optional(),
      email: z.string().trim().email().max(255).optional(),
      password: z.string().min(6).max(100),
      phone_number: z.string().trim().min(8).max(20).optional().nullable(),
      phone: z.string().trim().min(8).max(20).optional().nullable(),
      birthdate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birthdate must be in YYYY-MM-DD format')
        .optional()
        .nullable(),
    })
    .refine((data) => Boolean(data.mail || data.email), {
      message: 'Email is required',
      path: ['mail'],
    }),
};

export const loginSchema = {
  body: z
    .object({
      mail: z.string().trim().optional(),
      email: z.string().trim().optional(),
      identifier: z.string().trim().optional(),
      password: z.string().min(1),
    })
    .refine((data) => Boolean(data.mail || data.email || data.identifier), {
      message: 'Email or phone identifier is required',
      path: ['identifier'],
    }),
};

