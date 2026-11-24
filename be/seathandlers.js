// File cũ, giữ lại để code đang import đường dẫn này không bị gãy.
// Logic thật đã chuyển sang:
//   src/sockets/seat.socket.js        (tầng socket)
//   src/services/seatHold.service.js  (nghiệp vụ giữ ghế, dùng database)
export { registerSeatHandlers, markBooked } from './src/sockets/seat.socket.js';
