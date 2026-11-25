import * as movieService from '../services/movie.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const movies = await movieService.listMovies(req.query);
    return sendSuccess(res, movies);
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const movie = await movieService.createMovie(req.body);
    return sendSuccess(res, movie, 201);
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    return sendSuccess(res, movie);
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await movieService.deleteMovie(req.params.id);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}
