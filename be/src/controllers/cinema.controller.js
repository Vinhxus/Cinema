import * as cinemaService from '../services/cinema.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const cinemas = await cinemaService.listCinemas(req.query);
    return sendSuccess(res, cinemas);
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const cinema = await cinemaService.createCinema(req.body);
    return sendSuccess(res, cinema, 201);
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    const cinema = await cinemaService.updateCinema(req.params.id, req.body);
    return sendSuccess(res, cinema);
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await cinemaService.deleteCinema(req.params.id);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}
