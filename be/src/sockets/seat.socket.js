// TẦNG SOCKET cho trang chọn ghế.
// Nhiệm vụ: validate payload -> gọi service -> ack kết quả -> phát sự kiện cho đúng người.
// Không có SQL hay nghiệp vụ ở đây (xem services/seatHold.service.js).
//
// Client -> Server (đều có ack):
//   join-showtime  { showtimeId }           -> { ok, taken, mine, expiresAt, serverNow }
//   leave-showtime { showtimeId }
//   hold-seat      { showtimeId, seatId }   -> { ok, mine, expiresAt, serverNow } | { ok:false, reason }
//   release-seat   { showtimeId, seatId }   -> như trên
//   verify-hold    { showtimeId }           -> { ok, bookingCode, seats, seatsTotal, expiresAt }
// Server -> Client:
//   seat-update  { showtimeId, seatIds, status }   gửi cả phòng showtime:<id>
//   my-holds     { showtimeId, mine, expiresAt }   gửi mọi tab của cùng 1 người (phòng client:<id>)
//   hold-expired { showtimeId }                    hết giờ giữ ghế
import { BOOKING } from '../config/env.js';
import * as seatHoldService from '../services/seatHold.service.js';
import { seatEvents } from '../services/seatHold.service.js';
import { seatPayload, showtimePayload } from '../validators/seat.validator.js';

const showtimeRoom = (showtimeId) => `showtime:${showtimeId}`;
export const clientRoom = (clientId) => `client:${clientId}`;

// clientId -> số tab đang mở & timer ân hạn khi tab cuối cùng đóng
const openSockets = new Map();
const graceTimers = new Map();

/** Bọc handler: validate payload, bắt lỗi, luôn gọi ack đúng 1 lần */
function handle(schema, fn) {
  return async (payload, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const parsed = schema.safeParse(payload);
    if (!parsed.success) return reply({ ok: false, reason: 'INVALID_PAYLOAD' });
    try {
      const result = await fn(parsed.data);
      return reply({ ...result, serverNow: Date.now() });
    } catch (err) {
      console.error('[seat socket]', err);
      return reply({ ok: false, reason: 'SERVER_ERROR' });
    }
  };
}

/** Gọi 1 lần khi khởi động: nối "sự kiện nghiệp vụ" của service với Socket.io */
export function bindSeatEvents(io) {
  seatEvents.on('seats-changed', ({ showtimeId, seatIds, status }) => {
    io.to(showtimeRoom(showtimeId)).emit('seat-update', { showtimeId, seatIds, status });
  });

  seatEvents.on('holds-changed', async ({ sessionId, showtimeId }) => {
    try {
      const snap = await seatHoldService.getSnapshot({ sessionId, showtimeId });
      if (!snap.ok) return;
      io.to(clientRoom(sessionId)).emit('my-holds', {
        showtimeId,
        mine: snap.mine,
        expiresAt: snap.expiresAt,
      });
    } catch (err) {
      console.error('[seat socket] my-holds', err);
    }
  });

  seatEvents.on('hold-expired', ({ sessionId, showtimeId }) => {
    io.to(clientRoom(sessionId)).emit('hold-expired', { showtimeId });
  });
}

export function registerSeatHandlers(io, socket) {
  const clientId = socket.data.clientId;

  // ---- Có mặt / vắng mặt (để biết khi nào người dùng thật sự rời đi) ----
  openSockets.set(clientId, (openSockets.get(clientId) ?? 0) + 1);
  clearTimeout(graceTimers.get(clientId)); // quay lại trong thời gian ân hạn -> giữ nguyên ghế
  graceTimers.delete(clientId);

  socket.on('disconnect', () => {
    const left = (openSockets.get(clientId) ?? 1) - 1;
    if (left > 0) {
      openSockets.set(clientId, left); // vẫn còn tab khác đang mở
      return;
    }
    openSockets.delete(clientId);
    // FR-BK-13: rớt mạng 2 giây không được mất ghế -> đợi một khoảng rồi mới nhả
    const timer = setTimeout(() => {
      graceTimers.delete(clientId);
      if (openSockets.has(clientId)) return;
      seatHoldService
        .releaseAllForSession(clientId)
        .catch((err) => console.error('[seat socket] release on leave', err));
    }, BOOKING.DISCONNECT_GRACE_SECONDS * 1000);
    graceTimers.set(clientId, timer);
  });

  // ---- Xem 1 suất chiếu ----
  socket.on(
    'join-showtime',
    handle(showtimePayload, async ({ showtimeId }) => {
      const snapshot = await seatHoldService.getSnapshot({ sessionId: clientId, showtimeId });
      if (!snapshot.ok) return snapshot;
      // Mỗi tab chỉ xem 1 suất: rời phòng suất cũ trước khi vào phòng mới
      for (const room of socket.rooms) {
        if (room.startsWith('showtime:') && room !== showtimeRoom(showtimeId)) socket.leave(room);
      }
      socket.join(showtimeRoom(showtimeId));
      return snapshot;
    })
  );

  socket.on(
    'leave-showtime',
    handle(showtimePayload, async ({ showtimeId }) => {
      socket.leave(showtimeRoom(showtimeId)); // chỉ rời phòng, KHÔNG nhả ghế (sang trang Food vẫn giữ)
      return { ok: true };
    })
  );

  // ---- Giữ / bỏ ghế ----
  socket.on(
    'hold-seat',
    handle(seatPayload, ({ showtimeId, seatId }) =>
      seatHoldService.holdSeat({ sessionId: clientId, showtimeId, seatId })
    )
  );

  socket.on(
    'release-seat',
    handle(seatPayload, ({ showtimeId, seatId }) =>
      seatHoldService.releaseSeat({ sessionId: clientId, showtimeId, seatId })
    )
  );

  // ---- Trước khi bấm Continue (FR-BK-20) ----
  socket.on(
    'verify-hold',
    handle(showtimePayload, ({ showtimeId }) =>
      seatHoldService.verifyHold({ sessionId: clientId, showtimeId })
    )
  );
}

/** Module Payment gọi sau khi DB đã chuyển ghế sang BOOKED */
export function markBooked(_io, showtimeId, seatIds) {
  seatHoldService.notifyBooked(showtimeId, seatIds);
}
