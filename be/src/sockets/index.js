import { Server } from 'socket.io';
import { CLIENT_URL } from '../config/env.js';
import { clientIdSchema } from '../validators/seat.validator.js';
import { bindSeatEvents, clientRoom, registerSeatHandlers } from './seat.socket.js';

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: CLIENT_URL },
  });

  // Middleware handshake: chạy TRƯỚC 'connection'. Không có clientId hợp lệ -> từ chối.
  // clientId cố định theo trình duyệt (localStorage), nên reload trang (socket.id đổi)
  // vẫn nhận ra đúng người -> không mất ghế.
  // Sau này có đăng nhập: đọc JWT ở socket.handshake.auth.token và dùng userId.
  io.use((socket, next) => {
    const parsed = clientIdSchema.safeParse(socket.handshake.auth?.clientId);
    if (!parsed.success) return next(new Error('INVALID_CLIENT_ID'));
    socket.data.clientId = parsed.data;
    next();
  });

  bindSeatEvents(io);

  io.on('connection', (socket) => {
    // Mọi tab của cùng 1 người vào chung phòng này -> đồng bộ giỏ ghế giữa các tab
    socket.join(clientRoom(socket.data.clientId));
    registerSeatHandlers(io, socket);

    // Trang /chat (bài tập socket)
    socket.on('chat-message', (text) => {
      if (typeof text !== 'string' || !text.trim() || text.length > 500) return;
      io.emit('chat-message', { id: socket.id, text: text.trim(), time: Date.now() });
    });
  });

  return io;
}
