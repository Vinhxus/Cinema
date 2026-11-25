import * as showtimeService from '../services/showtime.service.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/showtimes?movieId=&date=&cinemaId=&format=&days= */
export async function listShowtimes(req, res, next) {
  try {
    const data = await showtimeService.getMovieShowtimes({
      movieId: req.query.movieId,
      date: req.query.date,
      cinemaId: req.query.cinemaId,
      format: req.query.format,
      days: req.query.days,
    });

    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
}