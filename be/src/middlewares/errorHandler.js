import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  if (err?.name === 'ZodError') {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return sendError(res, 'Validation failed', 400, details);
  }

  if (err?.code === 'ER_DUP_ENTRY') {
    return sendError(res, 'Duplicate record already exists', 409, {
      code: err.code,
    });
  }

  if (
    err?.code === 'ER_NO_REFERENCED_ROW_2' ||
    err?.code === 'ER_NO_REFERENCED_ROW'
  ) {
    return sendError(res, 'Referenced record does not exist', 400, {
      code: err.code,
    });
  }

  if (
    err?.name === 'JsonWebTokenError' ||
    err?.name === 'TokenExpiredError'
  ) {
    return sendError(res, 'Invalid or expired token', 401);
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Invalid JSON payload', 400);
  }

  // Lỗi không lường trước: ghi log đầy đủ ở server, client chỉ nhận thông báo chung
  // (err.message của MySQL có thể lộ tên bảng/cột).
  const status = err?.statusCode || err?.status || 500;
  if (status >= 500) {
    console.error('[error]', req.method, req.originalUrl, err);
    return sendError(res, 'Internal Server Error', status);
  }
  return sendError(res, err?.message || 'Request failed', status);
}

