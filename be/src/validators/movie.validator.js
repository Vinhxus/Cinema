import { z } from 'zod';

const movieBaseBody = z.object({
  code: z.string().trim().min(1).max(20),
  title: z.string().trim().min(1).max(255),
  subtitle: z.string().trim().max(255).optional().nullable(),
  tagline: z.string().trim().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  genre: z.string().trim().min(1).max(255),
  duration: z.coerce.number().int().positive(),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  ageRating: z.enum(['P', 'T13', 'T16', 'T18']).optional(),
  age_rating: z.enum(['P', 'T13', 'T16', 'T18']).optional(),
  ageNotice: z.string().optional().nullable(),
  age_notice: z.string().optional().nullable(),
  language: z.string().trim().max(100).optional(),
  formats: z.string().trim().max(255).optional(),
  imdbScore: z.coerce.number().min(0).max(10).optional(),
  imdb_score: z.coerce.number().min(0).max(10).optional(),
  audienceScore: z.coerce.number().min(0).max(10).optional(),
  audience_score: z.coerce.number().min(0).max(10).optional(),
  posterUrl: z.string().trim().max(500).optional().nullable(),
  poster_url: z.string().trim().max(500).optional().nullable(),
  backdropUrl: z.string().trim().max(500).optional().nullable(),
  backdrop_url: z.string().trim().max(500).optional().nullable(),
  trailerUrl: z.string().trim().max(500).optional().nullable(),
  trailer_url: z.string().trim().max(500).optional().nullable(),
  director: z.string().trim().max(255).optional().nullable(),
  starring: z.string().optional().nullable(),
  status: z.enum(['NOW_SHOWING', 'COMING_SOON', 'ENDED', 'DRAFT']).optional(),
});

export const idParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export const listMoviesSchema = {
  query: z.object({
    search: z.string().trim().optional(),
    status: z.enum(['NOW_SHOWING', 'COMING_SOON', 'ENDED', 'DRAFT']).optional(),
    genre: z.string().trim().optional(),
  }),
};

export const createMovieSchema = {
  body: movieBaseBody,
};

export const updateMovieSchema = {
  params: idParamSchema.params,
  body: movieBaseBody
    .partial()
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'At least one field is required for update',
    }),
};
