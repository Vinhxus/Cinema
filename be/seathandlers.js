// Đặt file này cạnh server.js (thư mục be)
const HOLD_MS = 5 * 60 * 1000; // giữ ghế tối đa 5 phút

// showtimeId -> Map<seatId, { socketId, timer }>
const holds = new Map();

const roomOf = (showtimeId) => `showtime:${showtimeId}`;

const getHolds = (showtimeId) => {
  if (!holds.has(showtimeId)) holds.set(showtimeId, new Map());
  return holds.get(showtimeId);
};

// Nhả ghế nếu đúng là socketId này đang giữ
function release(io, showtimeId, seatId, socketId) {
  const map = holds.get(showtimeId);
  const h = map?.get(seatId);
  if (!h || h.socketId !== socketId) return false;

  clearTimeout(h.timer);
  map.delete(seatId);
  io.to(roomOf(showtimeId)).emit("seat-released", { seatId });
  return true;
}

// Gọi hàm này SAU KHI thanh toán thành công (từ route HTTP của bạn)
export function markBooked(io, showtimeId, seatIds) {
  const map = getHolds(showtimeId);
  for (const seatId of seatIds) {
    const h = map.get(seatId);
    if (h) clearTimeout(h.timer);
    map.delete(seatId);
  }
  io.to(roomOf(showtimeId)).emit("seat-booked", { seatIds });
}

export function registerSeatHandlers(io, socket) {
  const myHolds = new Set(); // "showtimeId|seatId"

  // Client vào xem 1 suất chiếu -> trả về danh sách ghế đang bị giữ
  socket.on("join-showtime", (showtimeId, ack) => {
    socket.join(roomOf(showtimeId));

    const others = [];
    const mine = [];
    for (const [seatId, h] of getHolds(showtimeId)) {
      (h.socketId === socket.id ? mine : others).push(seatId);
    }
    ack?.({ others, mine });
  });

  // Client xin giữ 1 ghế
  socket.on("hold-seat", ({ showtimeId, seatId }, ack) => {
    const map = getHolds(showtimeId);

    // Node.js chạy đơn luồng nên has() + set() bên dưới không bị chen ngang
    if (map.has(seatId)) return ack?.({ ok: false, reason: "held" });

    // TODO: kiểm tra trong DB ghế này chưa bị đặt (booked) rồi mới cho giữ

    const timer = setTimeout(
      () => release(io, showtimeId, seatId, socket.id),
      HOLD_MS
    );
    map.set(seatId, { socketId: socket.id, timer });
    myHolds.add(`${showtimeId}|${seatId}`);

    socket.to(roomOf(showtimeId)).emit("seat-held", { seatId });
    ack?.({ ok: true });
  });

  // Client bỏ chọn ghế
  socket.on("release-seat", ({ showtimeId, seatId }) => {
    release(io, showtimeId, seatId, socket.id);
    myHolds.delete(`${showtimeId}|${seatId}`);
  });

  // Mất kết nối (đóng tab, mất mạng) -> nhả hết ghế đang giữ
  socket.on("disconnect", () => {
    for (const key of myHolds) {
      const [showtimeId, seatId] = key.split("|");
      release(io, showtimeId, seatId, socket.id);
    }
    myHolds.clear();
  });
}