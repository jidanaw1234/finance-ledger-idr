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
import { prisma } from './db.js';

const app = express();
const port = process.env.PORT || 4000;

// Default categories seeder if empty
async function ensureDefaultCategories() {
  try {
    const count = await prisma.category.count();
    if (count === 0) {
      console.log('🌱 Menginisialisasi pos kategori default...');
      const defaultCategories = [
        { name: 'Makanan & Minuman', type: 'EXPENSE', color: '#f59e0b', monthlyBudget: 3500000 },
        { name: 'Tagihan & Utilitas', type: 'EXPENSE', color: '#ef4444', monthlyBudget: 2000000 },
        { name: 'Transportasi', type: 'EXPENSE', color: '#3b82f6', monthlyBudget: 1500000 },
        { name: 'Belanja & Kebutuhan', type: 'EXPENSE', color: '#10b981', monthlyBudget: 2500000 },
        { name: 'Hiburan & Langganan', type: 'EXPENSE', color: '#8b5cf6', monthlyBudget: 1000000 },
        { name: 'Kesehatan & Pribadi', type: 'EXPENSE', color: '#ec4899', monthlyBudget: 800000 },
        { name: 'Lain-lain', type: 'EXPENSE', color: '#64748b', monthlyBudget: 500000 },
        { name: 'Gaji Pokok', type: 'INCOME', color: '#059669', monthlyBudget: null },
        { name: 'Freelance & Side Project', type: 'INCOME', color: '#0284c7', monthlyBudget: null },
        { name: 'Investasi & Bunga', type: 'INCOME', color: '#d97706', monthlyBudget: null },
        { name: 'Pemasukan Lainnya', type: 'INCOME', color: '#6b7280', monthlyBudget: null },
      ];
      for (const cat of defaultCategories) {
        await prisma.category.create({ data: cat });
      }
      console.log('✅ Kategori default berhasil disiapkan.');
    }
  } catch (err) {
    console.error('Error seeding default categories:', err);
  }
}

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
app.listen(port, async () => {
  console.log(`🚀 Backend REST API berjalan di http://localhost:${port}`);
  
  // Inisialisasi kategori default jika kosong
  await ensureDefaultCategories();

  // Start Telegram Bot
  setupTelegramBot();
});

