// SERVICE = nghiệp vụ giữ ghế. Không biết gì về Socket.io hay Express:
// nhận dữ liệu đã validate, gọi repository, trả kết quả, và phát "sự kiện nghiệp vụ"
// qua seatEvents. Tầng socket nghe seatEvents để báo cho các client.
// => Route thanh toán (HTTP), job dọn ghế, socket... đều gọi chung các hàm này.
import { EventEmitter } from 'node:events';
import { randomBytes } from 'node:crypto';
import pool, { withTransaction } from '../config/db.js';
import { BOOKING } from '../config/env.js';
import * as seatRepo from '../repositories/seat.repository.js';

/**
 * Các sự kiện phát ra:
 *  - 'seats-changed' { showtimeId, seatIds: string[], status: 'held' | 'booked' | 'available' }
 *  - 'holds-changed' { sessionId, showtimeId }   -> giỏ ghế của 1 phiên vừa đổi
 *  - 'hold-expired'  { sessionId, showtimeId }   -> hết giờ giữ ghế
 */
export const seatEvents = new EventEmitter();

/** Lý do thất bại, FE dựa vào đây để hiện thông báo */
export const HoldError = Object.freeze({
  SHOWTIME_NOT_FOUND: 'SHOWTIME_NOT_FOUND',
  SALES_CLOSED: 'SALES_CLOSED',
  SEAT_NOT_FOUND: 'SEAT_NOT_FOUND',
  TAKEN: 'TAKEN',
  LIMIT: 'LIMIT',
  NOT_HELD: 'NOT_HELD',
  NO_HOLD: 'NO_HOLD',
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// DECIMAL từ mysql2 về dạng string ("140000.00") -> đổi sang number
const money = (v) => Math.round(Number(v) || 0);

/** Giá 1 ghế = Giá suất chiếu × số người/ghế + Phụ thu loại ghế (UC-ADM-02) */
export const seatPrice = (showtime, seat) =>
  money(showtime.BaseTicketPrice) * (Number(seat.SeatsPerUnit) || 1) + money(seat.Surcharge);

const toMs = (date) => (date ? new Date(date).getTime() : null);

const newBookingCode = () =>
  `SN-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;

const isDuplicate = (err) => err?.code === 'ER_DUP_ENTRY';

/** Ném ra trong transaction để buộc ROLLBACK nhưng vẫn trả về một kết quả bình thường */
class Abort extends Error {
  constructor(result) {
    super(result.reason);
    this.result = result;
  }
}

/**
 * "Khóa" theo phiên trong 1 process: các thao tác của CÙNG một phiên chạy lần lượt.
 * Lý do: 1 người mở 2 tab, bấm 2 ghế cùng lúc -> cả 2 request cùng thấy
 * "chưa có booking HOLDING" và tạo ra 2 booking. Xếp hàng theo sessionId là đủ.
 * (Giữa các phiên KHÁC nhau thì unique key trong DB mới là thứ chống double-booking.)
 */
const sessionQueues = new Map();
function withSessionLock(sessionId, task) {
  const prev = sessionQueues.get(sessionId) ?? Promise.resolve();
  const run = prev.then(task, task);
  const tail = run.catch(() => {});
  sessionQueues.set(sessionId, tail);
  tail.then(() => {
    if (sessionQueues.get(sessionId) === tail) sessionQueues.delete(sessionId);
  });
  return run;
}

const toSeatDto = (row, price) => ({
  id: String(row.SeatID),
  row: row.SeatRow,
  number: row.SeatNumber,
  label: row.SeatLabel,
  type: row.TypeCode, // 'standard' | 'vip' | 'couple'
  price,
});

const toShowtimeDto = (st) => ({
  id: String(st.ShowtimeID),
  movie: {
    id: st.MovieID,
    title: st.Title,
    ageRating: st.AgeRating,
    posterUrl: st.PosterUrl,
    duration: st.Duration,
  },
  cinemaName: st.Branch ? `${st.CinemaName} • ${st.Branch}` : st.CinemaName,
  roomName: st.RoomNumber,
  format: st.Format,
  startsAt: toMs(st.StartsAt),
  basePrice: money(st.BaseTicketPrice),
  isOnSale: Boolean(st.IsOnSale),
});

async function loadShowtime(db, showtimeId) {
  return seatRepo.findShowtimeById(db, showtimeId, BOOKING.SALES_CUTOFF_MINUTES);
}

/** Trạng thái ghế của 1 suất, tách ghế của phiên hiện tại ra riêng */
async function buildTaken(db, showtimeId, sessionId) {
  const rows = await seatRepo.findTakenSeats(db, showtimeId);
  const taken = {};
  for (const r of rows) {
    if (sessionId && r.SeatStatus === 'HELD' && r.SessionID === sessionId) continue; // ghế của mình
    taken[String(r.SeatID)] = r.SeatStatus === 'BOOKED' ? 'booked' : 'held';
  }
  return taken;
}

async function buildMyHold(db, sessionId, showtimeId) {
  const hold = await seatRepo.findActiveHold(db, { sessionId, showtimeId });
  if (!hold) return { mine: [], expiresAt: null, booking: null, seats: [] };
  const seats = await seatRepo.findHeldSeatsOfBooking(db, hold.BookingID);
  return {
    mine: seats.map((s) => String(s.SeatID)),
    expiresAt: toMs(hold.HoldExpiresAt),
    booking: hold,
    seats,
  };
}

/* ------------------------------------------------------------------ */
/* Đọc dữ liệu                                                         */
/* ------------------------------------------------------------------ */

export async function listUpcomingShowtimes({ date }) {
  const rows = await seatRepo.findUpcomingShowtimes(pool, {
    date,
    cutoffMinutes: BOOKING.SALES_CUTOFF_MINUTES,
  });
  return rows.map((r) => ({
    id: String(r.ShowtimeID),
    title: r.Title,
    date: r.ShowDate,
    time: String(r.StartTime).slice(0, 5),
    format: r.Format,
    cinemaName: r.Branch ? `${r.CinemaName} • ${r.Branch}` : r.CinemaName,
    roomName: r.RoomNumber,
    basePrice: money(r.BaseTicketPrice),
  }));
}

/** Sơ đồ ghế (layout + giá + trạng thái hiện tại). Trả null nếu không có suất. */
export async function getSeatMap(showtimeId) {
  const showtime = await loadShowtime(pool, showtimeId);
  if (!showtime) return null;

  const [seatRows, taken] = await Promise.all([
    seatRepo.findSeatsByRoom(pool, showtime.RoomID),
    buildTaken(pool, showtimeId, null),
  ]);

  return {
    showtime: toShowtimeDto(showtime),
    seats: seatRows.map((s) => toSeatDto(s, seatPrice(showtime, s))),
    taken,
    rules: {
      holdMinutes: BOOKING.HOLD_MINUTES,
      maxSeats: BOOKING.MAX_SEATS_PER_ORDER,
    },
  };
}

/** Snapshot khi client join phòng suất chiếu (và mỗi lần reconnect) */
export async function getSnapshot({ sessionId, showtimeId }) {
  const showtime = await loadShowtime(pool, showtimeId);
  if (!showtime) return { ok: false, reason: HoldError.SHOWTIME_NOT_FOUND };

  const [taken, my] = await Promise.all([
    buildTaken(pool, showtimeId, sessionId),
    buildMyHold(pool, sessionId, showtimeId),
  ]);
  return { ok: true, taken, mine: my.mine, expiresAt: my.expiresAt };
}

/* ------------------------------------------------------------------ */
/* Giữ ghế                                                             */
/* ------------------------------------------------------------------ */

export function holdSeat({ sessionId, showtimeId, seatId }) {
  return withSessionLock(sessionId, () => holdSeatUnsafe({ sessionId, showtimeId, seatId }));
}

async function holdSeatUnsafe({ sessionId, showtimeId, seatId }) {
  // 1) Kiểm tra suất chiếu và ghế (đọc thường, chưa cần transaction)
  const showtime = await loadShowtime(pool, showtimeId);
  if (!showtime) return { ok: false, reason: HoldError.SHOWTIME_NOT_FOUND };
  if (!showtime.IsOnSale) return { ok: false, reason: HoldError.SALES_CLOSED };

  const seat = await seatRepo.findSeatInRoom(pool, seatId, showtime.RoomID);
  if (!seat) return { ok: false, reason: HoldError.SEAT_NOT_FOUND };

  // 2) Dọn các booking đã hết hạn trước, để ghế hết hạn không còn chặn unique key
  await sweepExpiredHolds();

  const price = seatPrice(showtime, seat);

  // 3) Transaction: lấy/tạo giỏ HOLDING -> kiểm tra giới hạn -> ghi ghế
  const result = await withTransaction(async (conn) => {
    let booking = await seatRepo.findActiveHold(conn, { sessionId, showtimeId, forUpdate: true });
    if (!booking) {
      booking = await seatRepo.createHoldBooking(conn, {
        sessionId,
        showtimeId,
        bookingCode: newBookingCode(),
        holdMinutes: BOOKING.HOLD_MINUTES, // FR-BK-10: đếm giờ từ ghế ĐẦU TIÊN, không reset
      });
    }

    const heldNow = await seatRepo.findHeldSeatsOfBooking(conn, booking.BookingID);
    if (heldNow.some((s) => String(s.SeatID) === String(seatId))) {
      // Bấm 2 lần / 2 tab cùng gửi -> coi như thành công (idempotent)
      return { ok: true, booking, changed: false };
    }
    if (heldNow.length >= BOOKING.MAX_SEATS_PER_ORDER) {
      throw new Abort({ ok: false, reason: HoldError.LIMIT });
    }

    try {
      const existing = await seatRepo.findOrderSeat(conn, booking.BookingID, seatId);
      if (existing) {
        await seatRepo.reactivateHeldSeat(conn, { orderSeatId: existing.OrderSeatID, price });
      } else {
        await seatRepo.insertHeldSeat(conn, {
          bookingId: booking.BookingID,
          showtimeId,
          seatId,
          price,
        });
      }
    } catch (err) {
      // Unique key (ShowtimeID, SeatID, ActiveLock) bị trùng = ghế đã có người giữ/mua.
      // Người đến trước đã ghi được dòng HELD; người đến sau rơi vào đây (FR-BK-07).
      // Ném Abort để ROLLBACK cả booking vừa tạo (không để lại giỏ rỗng đang đếm giờ).
      if (isDuplicate(err)) throw new Abort({ ok: false, reason: HoldError.TAKEN });
      throw err;
    }

    await seatRepo.recalcBookingTotals(conn, booking.BookingID);
    return { ok: true, booking, changed: true };
  }).catch((err) => {
    if (err instanceof Abort) return err.result;
    // Deadlock giữa 2 transaction cũng nghĩa là "có người tranh ghế": trả TAKEN
    if (err?.code === 'ER_LOCK_DEADLOCK') return { ok: false, reason: HoldError.TAKEN };
    throw err;
  });

  if (!result.ok) return result;

  // 4) Commit xong mới báo cho mọi người (không báo khi DB còn có thể rollback)
  if (result.changed) {
    seatEvents.emit('seats-changed', { showtimeId: String(showtimeId), seatIds: [String(seatId)], status: 'held' });
    seatEvents.emit('holds-changed', { sessionId, showtimeId: String(showtimeId) });
  }
  const my = await buildMyHold(pool, sessionId, showtimeId);
  return { ok: true, mine: my.mine, expiresAt: my.expiresAt };
}

/* ------------------------------------------------------------------ */
/* Bỏ chọn ghế                                                         */
/* ------------------------------------------------------------------ */

export function releaseSeat({ sessionId, showtimeId, seatId }) {
  return withSessionLock(sessionId, () => releaseSeatUnsafe({ sessionId, showtimeId, seatId }));
}

async function releaseSeatUnsafe({ sessionId, showtimeId, seatId }) {
  const result = await withTransaction(async (conn) => {
    const booking = await seatRepo.findActiveHold(conn, { sessionId, showtimeId, forUpdate: true });
    if (!booking) return { ok: false, reason: HoldError.NOT_HELD };

    const affected = await seatRepo.releaseHeldSeat(conn, { bookingId: booking.BookingID, seatId });
    if (affected === 0) return { ok: false, reason: HoldError.NOT_HELD };

    const remaining = await seatRepo.findHeldSeatsOfBooking(conn, booking.BookingID);
    if (remaining.length === 0) {
      // Bỏ hết ghế = hủy giỏ. Lần chọn sau sẽ có booking mới và đồng hồ mới (UC-03 Alt)
      await seatRepo.setBookingStatus(conn, booking.BookingID, 'CANCELED');
    }
    await seatRepo.recalcBookingTotals(conn, booking.BookingID);
    return { ok: true };
  });

  if (!result.ok) return result;

  seatEvents.emit('seats-changed', { showtimeId: String(showtimeId), seatIds: [String(seatId)], status: 'available' });
  seatEvents.emit('holds-changed', { sessionId, showtimeId: String(showtimeId) });
  const my = await buildMyHold(pool, sessionId, showtimeId);
  return { ok: true, mine: my.mine, expiresAt: my.expiresAt };
}

/** Phiên rời đi hẳn (đóng tab quá thời gian ân hạn) -> nhả mọi ghế đang giữ */
export function releaseAllForSession(sessionId) {
  return withSessionLock(sessionId, async () => {
    const holds = await seatRepo.findHoldsBySession(pool, sessionId);
    for (const hold of holds) {
      const seatIds = await withTransaction(async (conn) => {
        if (!(await seatRepo.lockHoldingBooking(conn, hold.BookingID))) return [];
        const released = await seatRepo.releaseAllHeldSeats(conn, hold.BookingID);
        await seatRepo.setBookingStatus(conn, hold.BookingID, 'CANCELED');
        await seatRepo.recalcBookingTotals(conn, hold.BookingID);
        return released;
      });
      if (seatIds.length) {
        seatEvents.emit('seats-changed', {
          showtimeId: String(hold.ShowtimeID),
          seatIds: seatIds.map(String),
          status: 'available',
        });
      }
    }
  });
}

/* ------------------------------------------------------------------ */
/* Kiểm tra trước khi sang bước tiếp theo (FR-BK-20)                   */
/* ------------------------------------------------------------------ */

export async function verifyHold({ sessionId, showtimeId }) {
  const my = await buildMyHold(pool, sessionId, showtimeId);
  if (!my.booking || my.seats.length === 0) return { ok: false, reason: HoldError.NO_HOLD };

  const seats = my.seats.map((s) => toSeatDto(s, money(s.Price)));
  return {
    ok: true,
    bookingCode: my.booking.BookingCode,
    seats,
    seatsTotal: seats.reduce((sum, s) => sum + s.price, 0),
    expiresAt: my.expiresAt,
  };
}

/* ------------------------------------------------------------------ */
/* Job dọn ghế hết hạn (FR-BK-13, FR-BK-14)                            */
/* ------------------------------------------------------------------ */

let sweeping = null;

/** Chạy định kỳ + trước mỗi lần giữ ghế. Gọi chồng nhau thì dùng chung 1 lượt. */
export function sweepExpiredHolds() {
  if (!sweeping) {
    sweeping = sweepOnce().finally(() => {
      sweeping = null;
    });
  }
  return sweeping;
}

async function sweepOnce() {
  const expired = await seatRepo.findExpiredHolds(pool);
  for (const hold of expired) {
    const seatIds = await withTransaction(async (conn) => {
      // Kiểm tra lại trong transaction: có thể booking vừa chuyển sang thanh toán
      if (!(await seatRepo.lockExpiredHold(conn, hold.BookingID))) return null;
      const released = await seatRepo.releaseAllHeldSeats(conn, hold.BookingID);
      await seatRepo.setBookingStatus(conn, hold.BookingID, 'EXPIRED');
      return released;
    });
    if (seatIds === null) continue;

    if (seatIds.length) {
      seatEvents.emit('seats-changed', {
        showtimeId: String(hold.ShowtimeID),
        seatIds: seatIds.map(String),
        status: 'available',
      });
    }
    if (hold.SessionID) {
      seatEvents.emit('hold-expired', { sessionId: hold.SessionID, showtimeId: String(hold.ShowtimeID) });
    }
  }
}

/* ------------------------------------------------------------------ */
/* Cho module Payment gọi sau khi đã cập nhật DB sang BOOKED            */
/* ------------------------------------------------------------------ */

export function notifyBooked(showtimeId, seatIds) {
  seatEvents.emit('seats-changed', {
    showtimeId: String(showtimeId),
    seatIds: seatIds.map(String),
    status: 'booked',
  });
}
