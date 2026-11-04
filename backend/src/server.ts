import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { transactionRouter } from './routes/transactionRoutes.js';
import { categoryRouter } from './routes/categoryRoutes.js';
import { metricRouter } from './routes/metricRoutes.js';
import { exportRouter } from './routes/exportRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { setupTelegramBot } from './services/bot.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Personal Finance Tracker API',
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/metrics', metricRouter);
app.use('/api/export', exportRouter);

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend REST API berjalan di http://localhost:${port}`);
  
  // Start Telegram Bot
  setupTelegramBot();
});

