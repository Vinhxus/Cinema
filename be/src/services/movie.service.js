import * as movieRepository from '../repositories/movie.repository.js';
import { AppError } from '../utils/AppError.js';

function pickDefined(target, key, value) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function mapMovieFields(payload) {
  const mapped = {};
  pickDefined(mapped, 'Code', payload.code);
  pickDefined(mapped, 'Title', payload.title);
  pickDefined(mapped, 'Subtitle', payload.subtitle);
  pickDefined(mapped, 'Tagline', payload.tagline);
  pickDefined(mapped, 'Description', payload.description);
  pickDefined(mapped, 'Genre', payload.genre);
  pickDefined(mapped, 'Duration', payload.duration);
  pickDefined(mapped, 'ReleaseDate', payload.releaseDate ?? payload.release_date);
  pickDefined(mapped, 'AgeRating', payload.ageRating ?? payload.age_rating);
  pickDefined(mapped, 'AgeNotice', payload.ageNotice ?? payload.age_notice);
  pickDefined(mapped, 'Language', payload.language);
  pickDefined(mapped, 'Formats', payload.formats);
  pickDefined(mapped, 'ImdbScore', payload.imdbScore ?? payload.imdb_score);
  pickDefined(
    mapped,
    'AudienceScore',
    payload.audienceScore ?? payload.audience_score
  );
  pickDefined(mapped, 'PosterUrl', payload.posterUrl ?? payload.poster_url);
  pickDefined(
    mapped,
    'BackdropUrl',
    payload.backdropUrl ?? payload.backdrop_url
  );
  pickDefined(mapped, 'TrailerUrl', payload.trailerUrl ?? payload.trailer_url);
  pickDefined(mapped, 'Director', payload.director);
  pickDefined(mapped, 'Starring', payload.starring);
  pickDefined(mapped, 'Status', payload.status);
  return mapped;
}

export async function listMovies(filters) {
  return movieRepository.findAll(filters);
}

export async function createMovie(payload) {
  const data = mapMovieFields(payload);
  return movieRepository.create(data);
}

export async function updateMovie(movieId, payload) {
  const existing = await movieRepository.findById(movieId);
  if (!existing) {
    throw new AppError('Movie not found', 404);
  }

  const fields = mapMovieFields(payload);
  return movieRepository.update(movieId, fields);
}

export async function deleteMovie(movieId) {
  const existing = await movieRepository.findById(movieId);
  if (!existing) {
    throw new AppError('Movie not found', 404);
  }

  const hasSold = await movieRepository.hasSoldTickets(movieId);
  if (hasSold) {
    throw new AppError(
      'Cannot delete movie because it has showtimes with sold tickets',
      400
    );
  }

  const hasBookings = await movieRepository.hasAnyBookingsOrTickets(movieId);
  if (hasBookings) {
    throw new AppError(
      'Cannot delete movie because it has existing bookings or tickets',
      400
    );
  }

  await movieRepository.remove(movieId);
  return { deletedId: movieId };
}
