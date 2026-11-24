// 1 instance duy nhất cho cả app (rule 1 của bài lab: tạo socket MỘT lần)
import { io, type Socket as IOSocket } from 'socket.io-client'
import { API_URL } from './config'
import { getClientId } from './utils/clientId'
import type { ClientToServerEvents, ServerToClientEvents } from './types/seatSocket'

export const Socket: IOSocket<ServerToClientEvents, ClientToServerEvents> = io(API_URL, {
  // Gửi kèm lúc handshake; server đọc ở socket.handshake.auth.clientId
  auth: { clientId: getClientId() },
})

Socket.on('connect', () => {
  console.log(`You connect with ID: ${Socket.id}`)
})

Socket.on('connect_error', (err) => {
  console.warn('[socket] connect_error:', err.message)
})
