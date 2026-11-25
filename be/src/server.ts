import "dotenv/config";

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

import pool from "./config/db.js";
import {
    handleCheckout,
    getOrderDetail,
    createHoldBooking,
    requestRefund,
    getRefundDetail
} from "./modules/orders/orders.controller.js";
import { createMomoPayment, handleMomoIPN, getPaymentStatus } from "./modules/payments/payments.controller.js";
import { getTicketsByBooking, getTicketDetail } from "./modules/tickets/tickets.controller.js";
import { registerSeatHandlers } from "./seathandlers.js";

const app = express();

// Middleware CORS
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Health check & DB verification
app.get("/api/health", async (_req, res) => {
    try {
        const [rows]: any = await pool.query("SELECT DATABASE() as db, 1 as ok");

        return res.status(200).json({
            success: true,
            data: {
                status: "OK",
                database: "CONNECTED",
                activeDb: rows[0]?.db || "unknown"
            },
            error: null,
        });
    } catch (error: any) {
        console.error("Health check failed:", error);

        return res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "DATABASE_CONNECTION_ERROR",
                message: "Database connection failed",
                details: error.message
            },
        });
    }
});

// 2. Orders & Checkout Routes
app.post("/api/orders/hold", createHoldBooking);
app.post("/api/orders/:id/checkout", handleCheckout);
app.get("/api/orders/:id", getOrderDetail);
app.post("/api/orders/:id/refund", requestRefund);
app.get("/api/orders/:id/refund", getRefundDetail);

// 3. Payments - MoMo Gateway Routes
app.post("/api/payments/momo/create", createMomoPayment);
app.post("/api/payments/momo/ipn", handleMomoIPN);
app.get("/api/payments/momo/ipn", handleMomoIPN);
app.get("/api/payments/status/:transactionRef", getPaymentStatus);

// 4. Tickets Routes
app.get("/api/tickets/booking/:bookingId", getTicketsByBooking);
app.get("/api/tickets/:ticketId", getTicketDetail);

// 5. HTTP & Socket.IO server setup
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Client Socket connected:", socket.id);

    // Kích hoạt logic giữ ghế thời gian thực
    registerSeatHandlers(io, socket);

    socket.on("disconnect", () => {
        console.log("Client Socket disconnected:", socket.id);
    });
});

// Start server
const PORT = Number(process.env.PORT) || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export { app, httpServer, io };