// 1 instance duy nhất cho cả app
import { io } from "socket.io-client";

export const Socket = io("http://localhost:5000");

Socket.on("connect", () => {
    console.log("Connected to Socket.IO Server!");
});