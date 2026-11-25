import * as movieService from '../services/movie.service.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/movies?status=now|upcoming|all&genre= */
export async function getMovies(req, res, next) {
  try {
    const data = await movieService.listMovies({
      status: req.query.status,
      genre: req.query.genre,
    });

    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
}

/** GET /api/movies/search?q= */
export async function searchMovies(req, res, next) {
  try {
    const data = await movieService.searchMovies(req.query.q);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
}
