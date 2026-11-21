import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import { handleCheckout } from './modules/orders/orders.controller.js'; // Nhớ import controller của bạn

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Health check (đã chạy ok)
app.get('/health', async (req, res) => {
    return res.json({ success: true, message: "Cinema Backend is running" });
});

// 2. BỔ SUNG ROUTE CHECKOUT NÀY VÀO:
app.post('/orders/:id/checkout', handleCheckout);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});