import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {
  listMoviesQuerySchema,
  searchMoviesQuerySchema,
} from '../validators/movie.validator.js';
import * as movieController from '../controllers/movie.controller.js';

const router = Router();

// Lưu ý: /search phải khai báo TRƯỚC /:id (sẽ thêm ở Chặng 2),
// nếu không Express sẽ hiểu "search" là MovieID.
router.get(
  '/search',
  validate({ query: searchMoviesQuerySchema }),
  movieController.searchMovies
);

router.get(
  '/',
  validate({ query: listMoviesQuerySchema }),
  movieController.getMovies
);

export default router;
