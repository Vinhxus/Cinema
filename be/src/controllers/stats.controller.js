import * as statsService from '../services/stats.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getStats(req, res, next) {
  try {
    const result = await statsService.getStats(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}
