import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/config/db.js";
import { handleCheckout } from "./src/modules/orders/orders.controller.ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Health Check kiểm tra kết nối DB (chuẩn LMAT)
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({
      success: true,
      data: { status: "OK", database: "CONNECTED" },
      error: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: "Database connection failed", details: error.message }
    });
  }
});

// API Checkout MVP
app.post("/api/orders/:id/checkout", handleCheckout);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" },
});

io.on("connection", (socket) => {
  console.log("Client Socket connected:", socket.id);
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});