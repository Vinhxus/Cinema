
import "dotenv/config";

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { registerSeatHandlers } from "./seathandlers.js";

const app = express();

const httpServer = createServer(app);

const PORT = Number(process.env.PORT) || 3000;

const FRONTEND_URL =
    process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Cinema Backend is running",
        timestamp: new Date().toISOString()
    });
});

// Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

// Socket connection
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    registerSeatHandlers(io, socket);
});

// Start server
httpServer.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("Cinema Backend started");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log("--------------------------------");
});

// Handle server errors
httpServer.on("error", (error) => {
    console.error("Server error:", error);
});

export { app, httpServer, io };
