import * as bookingService from '../services/booking.service.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';

// Khách vãng lai chưa đăng nhập -> "danh tính" là clientId trong localStorage, gửi qua header.
// Dùng header thay vì query string để mã này không nằm trong URL / log truy cập.
const CLIENT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

function requireClientId(req) {
  const clientId = req.get('X-Client-Id');
  if (!clientId || !CLIENT_ID_RE.test(clientId)) throw new AppError('Missing or invalid X-Client-Id', 400);
  return clientId;
}

export const getHistory = async (req, res, next) => {
  try {
    const result = await bookingService.getHistory(requireClientId(req));
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getBookingDetail = async (req, res, next) => {
  try {
    const result = await bookingService.getBookingDetail(req.params.code, requireClientId(req));
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
