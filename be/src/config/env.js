import 'dotenv/config';

// Đọc số từ biến môi trường, sai/thiếu thì dùng giá trị mặc định
const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Mọi "con số nghiệp vụ" của trang đặt ghế gom về MỘT chỗ.
// Muốn đổi thời gian giữ ghế -> sửa .env, không phải lục code.
export const BOOKING = {
  HOLD_MINUTES: num(process.env.HOLD_MINUTES, 7), // FR-BK-10: giữ ghế 5–7 phút
  MAX_SEATS_PER_ORDER: num(process.env.MAX_SEATS_PER_ORDER, 8), // FR-BK-09
  SALES_CUTOFF_MINUTES: num(process.env.SALES_CUTOFF_MINUTES, 15), // FR-BK-04
  DISCONNECT_GRACE_SECONDS: num(process.env.DISCONNECT_GRACE_SECONDS, 30), // FR-BK-13
  SWEEP_INTERVAL_SECONDS: num(process.env.SWEEP_INTERVAL_SECONDS, 5), // job nhả ghế hết hạn
};

export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
