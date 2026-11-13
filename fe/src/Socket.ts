// 1 instance duy nhất cho cả app
import { io } from "socket.io-client";
export const Socket = io("http://localhost:3000");

Socket.on('connect', () => {
    console.log(`You connect with ID: ${Socket.id}`)
})