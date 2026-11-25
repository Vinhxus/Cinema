import * as staffService from '../services/staff.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listCinemas(req, res, next) {
  try {
    const cinemas = await staffService.listCinemas();
    return sendSuccess(res, cinemas);
  } catch (err) {
    return next(err);
  }
}

export async function listShowtimes(req, res, next) {
  try {
    const showtimes = await staffService.listShowtimes(req.query);
    return sendSuccess(res, showtimes);
  } catch (err) {
    return next(err);
  }
}

export async function listCheckins(req, res, next) {
  try {
    const result = await staffService.listCheckins(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function lookup(req, res, next) {
  try {
    const tickets = await staffService.lookupTickets(req.query);
    return sendSuccess(res, tickets);
  } catch (err) {
    return next(err);
  }
}

export async function checkin(req, res, next) {
  try {
    const ticket = await staffService.checkinTicket(
      req.body,
      req.user,
      req.ip
    );
    return sendSuccess(res, ticket);
  } catch (err) {
    return next(err);
  }
}
