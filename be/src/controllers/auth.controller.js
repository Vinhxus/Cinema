import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 201);
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 200);
  } catch (err) {
    return next(err);
  }
}

