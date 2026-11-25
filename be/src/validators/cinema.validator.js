import { z } from 'zod';

const cinemaFields = {
  slug: z.string().trim().min(1).max(100),
  cinemaName: z.string().trim().min(1).max(255).optional(),
  cinema_name: z.string().trim().min(1).max(255).optional(),
  name: z.string().trim().min(1).max(255).optional(),
  branch: z.string().trim().max(100).optional().nullable(),
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().max(100).optional(),
  distanceLabel: z.string().trim().max(50).optional().nullable(),
  distance_label: z.string().trim().max(50).optional().nullable(),
  perk: z.string().trim().max(255).optional().nullable(),
  mapUrl: z.string().trim().max(500).optional().nullable(),
  map_url: z.string().trim().max(500).optional().nullable(),
};

export const cinemaIdParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export const listCinemasSchema = {
  query: z.object({
    search: z.string().trim().optional(),
    city: z.string().trim().optional(),
  }),
};

export const createCinemaSchema = {
  body: z
    .object(cinemaFields)
    .refine((d) => Boolean(d.cinemaName || d.cinema_name || d.name), {
      message: 'Cinema name is required',
      path: ['cinemaName'],
    }),
};

export const updateCinemaSchema = {
  params: cinemaIdParamSchema.params,
  body: z
    .object({
      ...cinemaFields,
      slug: cinemaFields.slug.optional(),
      address: cinemaFields.address.optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'At least one field is required for update',
    }),
};
