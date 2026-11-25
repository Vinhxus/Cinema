import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { listShowtimesSchema, seatMapSchema } from '../validators/seat.validator.js';
import { listShowtimesQuerySchema } from '../validators/showtime.validator.js';
import * as showtimeController from '../controllers/showtime.controller.js';

const router = Router();

// GET /api/showtimes dùng chung cho 2 màn hình:
//  - Có ?movieId=  -> lịch chiếu của 1 phim, gom theo rạp (trang MovieDetail)
//  - Không movieId -> danh sách suất sắp chiếu theo ngày (trang chọn ghế / ShowtimePicker)
const listMovieShowtimes = [
  validate({ query: listShowtimesQuerySchema }),
  showtimeController.listShowtimes,
];
const listUpcomingShowtimes = [validate(listShowtimesSchema), showtimeController.listUpcoming];

router.get('/', (req, res, next) => {
  const hasMovieId = req.query.movieId != null && String(req.query.movieId).trim() !== '';
  const chain = hasMovieId ? listMovieShowtimes : listUpcomingShowtimes;
  // Chạy lần lượt validate -> controller
  let i = 0;
  const step = (err) => {
    if (err) return next(err);
    const handler = chain[i++];
    return handler ? handler(req, res, step) : next();
  };
  return step();
});

router.get('/:id/seat-map', validate(seatMapSchema), showtimeController.getSeatMap);

export default router;
