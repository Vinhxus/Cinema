import { expireStaleCheckouts } from '../services/payment.service.js';

// Job chạy nền: nhả ghế của các đơn đang thanh toán (CHECKOUT_PENDING) đã quá hạn.
// Chạy thưa hơn holdSweeper vì đơn thanh toán đã có thêm vài phút chờ IPN đến trễ.
export function startPaymentSweeper(intervalSeconds = 30) {
  let running = false;
  const run = async () => {
    if (running) return; // lần trước chưa xong thì bỏ qua lượt này
    running = true;
    try {
      await expireStaleCheckouts();
    } catch (err) {
      console.error('[payment sweeper]', err.message);
    } finally {
      running = false;
    }
  };

  run();
  const timer = setInterval(run, intervalSeconds * 1000);
  timer.unref();
  return () => clearInterval(timer);
}
