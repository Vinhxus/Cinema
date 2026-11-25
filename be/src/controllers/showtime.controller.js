import * as showtimeService from '../services/showtime.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const showtimes = await showtimeService.listShowtimes(req.query);
    return sendSuccess(res, showtimes);
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const showtime = await showtimeService.createShowtime(req.body);
    return sendSuccess(res, showtime, 201);
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    const showtime = await showtimeService.updateShowtime(
      req.params.id,
      req.body
    );
    return sendSuccess(res, showtime);
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await showtimeService.deleteShowtime(req.params.id);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function copy(req, res, next) {
  try {
    const result = await showtimeService.copyShowtimes(req.body);
    return sendSuccess(res, result, 201);
  } catch (err) {
    return next(err);
  }
}
