import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Invalid or missing token', 401));
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return next(new AppError('Unauthorized: Invalid or missing token', 401));
  }

  try {
    // Không có giá trị mặc định: secret nằm trong code/git thì ai cũng ký được token admin
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[auth] JWT_SECRET is not set in .env');
      return next(new AppError('Server misconfigured', 500));
    }
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.user = decoded;
    return next();
  } catch {
    return next(new AppError('Unauthorized: Invalid or missing token', 401));
  }
}

export function authorizeRoles(...roles) {
  const allowed = roles.map((r) => String(r).toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const userRole = String(
      req.user.role || req.user.UserType || ''
    ).toUpperCase();

    if (!allowed.includes(userRole)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }

    return next();
  };
}

