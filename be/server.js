import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json()); // parse body dạng JSON

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" }, // URL frontend của bạn
});

io.on("connection", (socket) => { // lắng nghe có client mới kết nối (từ socket.io)
  console.log("Connected:", socket.id);
  registerSeatHandlers(io, socket);   
})

const PORT = 3000;
httpServer.listen(PORT, () => console.log(`Server on :${PORT}`));