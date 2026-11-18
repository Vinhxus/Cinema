import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { registerSeatHandlers } from './seathandlers.js';
import apiRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { sendError } from './src/utils/response.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    sendError(res, 'Too many requests, please try again later', 429),
});

app.use('/api/auth', authLimiter);
app.use('/api', apiRouter);

app.use((req, res) => sendError(res, 'Route not found', 404));
app.use(errorHandler);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
});

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);
  registerSeatHandlers(io, socket);
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server on :${PORT}`));
