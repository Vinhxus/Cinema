import * as seatHoldService from '../services/seatHold.service.js';
import * as showtimeService from '../services/showtime.service.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';

// GET /api/showtimes?date=YYYY-MM-DD
export async function listUpcoming(req, res, next) {
  try {
    const data = await seatHoldService.listUpcomingShowtimes({ date: req.query.date });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
}

// GET /api/showtimes/:id/seat-map
// Layout + giá + trạng thái ghế. FE dùng khi vào trang, và dùng làm
// "HTTP polling fallback" khi mất kết nối socket.
export async function getSeatMap(req, res, next) {
  try {
    const data = await seatHoldService.getSeatMap(req.params.id);
    if (!data) throw new AppError('Showtime not found', 404);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
}

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
