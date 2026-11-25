import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {
  listMoviesQuerySchema,
  movieIdParamSchema,
  searchMoviesQuerySchema,
} from '../validators/movie.validator.js';
import * as movieController from '../controllers/movie.controller.js';

const router = Router();

// Lưu ý: /search phải khai báo TRƯỚC /:id,
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

// Chi tiết 1 phim — luôn khai báo sau các route tĩnh ở trên.
router.get(
  '/:id',
  validate({ params: movieIdParamSchema }),
  movieController.getMovieById
);

export default router;