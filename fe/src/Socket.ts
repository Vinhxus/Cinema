import { io } from 'socket.io-client';

export const Socket = io(
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
);

Socket.on('connect', () => {
  console.log(`You connect with ID: ${Socket.id}`);
});
