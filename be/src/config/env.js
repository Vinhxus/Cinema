import 'dotenv/config';

const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const BOOKING = {
  HOLD_MINUTES: num(process.env.HOLD_MINUTES, 7),
  MAX_SEATS_PER_ORDER: num(process.env.MAX_SEATS_PER_ORDER, 8),
  SALES_CUTOFF_MINUTES: num(process.env.SALES_CUTOFF_MINUTES, 15),
  DISCONNECT_GRACE_SECONDS: num(process.env.DISCONNECT_GRACE_SECONDS, 30),
  SWEEP_INTERVAL_SECONDS: num(process.env.SWEEP_INTERVAL_SECONDS, 5),
};

export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Cấu hình MoMo Payment (Sandbox / Production)
export const MOMO = {
  PARTNER_CODE: process.env.MOMO_PARTNER_CODE || 'MOMO',
  ACCESS_KEY: process.env.MOMO_ACCESS_KEY || '',
  SECRET_KEY: process.env.MOMO_SECRET_KEY || '',
  ENDPOINT: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  REDIRECT_URL: process.env.MOMO_REDIRECT_URL || `${CLIENT_URL}/processing`,
  IPN_URL: process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payments/momopay/ipn',
};

// Cấu hình JWT cho QR Code
export const JWT_SECRET = process.env.JWT_SECRET || 'cinema_qr_ticket_secret_key_2026';

// Cấu hình Nodemailer gửi mail vé
export const MAIL_CONFIG = {
  HOST: process.env.MAIL_HOST || 'smtp.gmail.com',
  PORT: num(process.env.MAIL_PORT, 587),
  USER: process.env.MAIL_USER || '',
  PASS: process.env.MAIL_PASS || '',
  FROM: process.env.MAIL_FROM || '"Cinema Ticket" <no-reply@cinema.com>',
};
// Cấu hình SePay Payment Gateway (cổng thanh toán, KHÔNG phải webhook tài khoản)
// - MERCHANT_ID + SECRET_KEY: lấy ở Cổng thanh toán → Cấu hình → Thông tin đơn vị.
//   SECRET_KEY dùng để KÝ form checkout -> chỉ được nằm ở backend.
// - IPN_SECRET: chuỗi bạn tự đặt ở tab IPN (kiểu xác thực SECRET_KEY).
//   SePay gửi lại chuỗi này trong header X-Secret-Key mỗi lần gọi IPN.
export const SEPAY = {
  ENV: process.env.SEPAY_ENV === 'production' ? 'production' : 'sandbox',
  MERCHANT_ID: process.env.SEPAY_MERCHANT_ID || '',
  SECRET_KEY: process.env.SEPAY_SECRET_KEY || '',
  IPN_SECRET: process.env.SEPAY_IPN_SECRET || '',
  // Thời gian tối đa cho khách ở trang SePay. Hạn giữ ghế được kéo dài tới
  // ít nhất NOW() + PAYMENT_MINUTES khi khách bấm thanh toán.
  PAYMENT_MINUTES: num(process.env.SEPAY_PAYMENT_MINUTES, 10),
  // Số tiền tối thiểu của 1 đơn sau khi trừ voucher
  MIN_AMOUNT: num(process.env.SEPAY_MIN_AMOUNT, 2000),
  // IPN có thể đến trễ vài giây sau khi hết hạn -> chờ thêm chừng này rồi mới nhả ghế.
  EXPIRE_GRACE_MINUTES: num(process.env.SEPAY_EXPIRE_GRACE_MINUTES, 2),
};
