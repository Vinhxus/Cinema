import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { sendError } from './src/utils/response.js';
import { CLIENT_URL } from './src/config/env.js';
import { createSocketServer } from './src/sockets/index.js';
import { startHoldSweeper } from './src/jobs/holdSweeper.js';

const app = express();

app.use(helmet());
// Cùng 1 origin với Socket.io, không mở cho mọi trang web
app.use(cors({ origin: CLIENT_URL }));
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
export const io = createSocketServer(httpServer);

startHoldSweeper();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server on :${PORT}`));
