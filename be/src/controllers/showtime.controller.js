import * as seatHoldService from '../services/seatHold.service.js';
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
