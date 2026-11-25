import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import * as movieController from '../controllers/movie.controller.js';
import * as cinemaController from '../controllers/cinema.controller.js';
import * as roomController from '../controllers/room.controller.js';
import * as priceRuleController from '../controllers/priceRule.controller.js';
import * as showtimeController from '../controllers/showtime.controller.js';
import * as statsController from '../controllers/stats.controller.js';
import {
  idParamSchema,
  listMoviesSchema,
  createMovieSchema,
  updateMovieSchema,
} from '../validators/movie.validator.js';
import {
  cinemaIdParamSchema,
  listCinemasSchema,
  createCinemaSchema,
  updateCinemaSchema,
} from '../validators/cinema.validator.js';
import {
  roomIdParamSchema,
  listRoomsSchema,
  createRoomSchema,
  updateRoomSchema,
  updateRoomLayoutSchema,
} from '../validators/room.validator.js';
import {
  priceRuleIdParamSchema,
  listPriceRulesSchema,
  createPriceRuleSchema,
  updatePriceRuleSchema,
  applyShowtimeSurchargeSchema,
} from '../validators/priceRule.validator.js';
import {
  showtimeIdParamSchema,
  listShowtimesSchema,
  createShowtimeSchema,
  updateShowtimeSchema,
  copyShowtimesSchema,
} from '../validators/showtime.validator.js';
import { getStatsSchema } from '../validators/stats.validator.js';

const router = Router();

router.use(verifyToken, authorizeRoles('ADMIN'));

router.get('/movies', validate(listMoviesSchema), movieController.list);
router.post('/movies', validate(createMovieSchema), movieController.create);
router.put('/movies/:id', validate(updateMovieSchema), movieController.update);
router.delete('/movies/:id', validate(idParamSchema), movieController.remove);

router.get('/cinemas', validate(listCinemasSchema), cinemaController.list);
router.post('/cinemas', validate(createCinemaSchema), cinemaController.create);
router.put(
  '/cinemas/:id',
  validate(updateCinemaSchema),
  cinemaController.update
);
router.delete(
  '/cinemas/:id',
  validate(cinemaIdParamSchema),
  cinemaController.remove
);

router.get('/rooms', validate(listRoomsSchema), roomController.list);
router.post('/rooms', validate(createRoomSchema), roomController.create);
router.put('/rooms/:id', validate(updateRoomSchema), roomController.update);
router.delete('/rooms/:id', validate(roomIdParamSchema), roomController.remove);
router.get(
  '/rooms/:id/layout',
  validate(roomIdParamSchema),
  roomController.getLayout
);
router.put(
  '/rooms/:id/layout',
  validate(updateRoomLayoutSchema),
  roomController.updateLayout
);

router.get(
  '/price-rules',
  validate(listPriceRulesSchema),
  priceRuleController.list
);
router.post(
  '/price-rules',
  validate(createPriceRuleSchema),
  priceRuleController.create
);
router.put(
  '/price-rules/showtimes',
  validate(applyShowtimeSurchargeSchema),
  priceRuleController.applyShowtimeSurcharge
);
router.put(
  '/price-rules/:id',
  validate(updatePriceRuleSchema),
  priceRuleController.update
);
router.delete(
  '/price-rules/:id',
  validate(priceRuleIdParamSchema),
  priceRuleController.remove
);

router.get(
  '/showtimes',
  validate(listShowtimesSchema),
  showtimeController.list
);
router.post(
  '/showtimes/copy',
  validate(copyShowtimesSchema),
  showtimeController.copy
);
router.post(
  '/showtimes',
  validate(createShowtimeSchema),
  showtimeController.create
);
router.put(
  '/showtimes/:id',
  validate(updateShowtimeSchema),
  showtimeController.update
);
router.delete(
  '/showtimes/:id',
  validate(showtimeIdParamSchema),
  showtimeController.remove
);

router.get('/stats', validate(getStatsSchema), statsController.getStats);

export default router;
