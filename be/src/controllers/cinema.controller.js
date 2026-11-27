import * as cinemaService from '../services/cinema.service.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/cinemas — danh sách cụm rạp kèm số phòng chiếu. */
export async function getCinemas(req, res, next) {
  try {
    const data = await cinemaService.listCinemas();
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
}