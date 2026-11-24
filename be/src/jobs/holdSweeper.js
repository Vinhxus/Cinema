import { BOOKING } from '../config/env.js';
import { sweepExpiredHolds } from '../services/seatHold.service.js';

// Job chạy nền: mỗi vài giây tìm booking HOLDING đã quá hạn -> nhả ghế + báo client.
// Hạn nằm trong DB (hold_expires_at), nên restart server cũng không làm "kẹt" ghế:
// lần chạy đầu tiên sau khi khởi động sẽ dọn hết.
export function startHoldSweeper() {
  const run = () =>
    sweepExpiredHolds().catch((err) => console.error('[hold sweeper]', err.message));

  run();
  const timer = setInterval(run, BOOKING.SWEEP_INTERVAL_SECONDS * 1000);
  timer.unref(); // không giữ process sống chỉ vì job này
  return () => clearInterval(timer);
}
