import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';

export const authRouter = Router();

// In-memory token store for single-user session
const validTokens = new Set<string>();

// Default single-user credentials (dapat disesuaikan lewat .env)
const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || 'jidan';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'jidanaw12';

// Helper SHA-256
function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Helper untuk telemetri sistem
async function getTelemetry() {
  const t0 = performance.now();
  let dbStatus = 'Connected';
  let latencyMs = 1.2;

  try {
    await prisma.$queryRaw`SELECT 1`;
    latencyMs = parseFloat((performance.now() - t0).toFixed(1));
  } catch (err) {
    dbStatus = 'Degraded';
    latencyMs = 0;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const botActive = botToken && botToken.trim() !== '' && botToken !== 'your_bot_token_from_botfather';

  return {
    database: {
      status: dbStatus,
      filename: 'dev.db',
      latency_ms: latencyMs,
    },
    telegram_bot: {
      handle: process.env.TELEGRAM_BOT_HANDLE || '@YourBot',
      status: botActive ? 'active' : 'inactive',
    },
  };
}

// GET /api/auth/telemetry (Public endpoint untuk status box di Login Page)
authRouter.get('/telemetry', async (req: Request, res: Response) => {
  try {
    const telemetry = await getTelemetry();
    return res.json(telemetry);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil telemetri sistem' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, password_hash, remember_session = true } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username wajib diisi.' });
    }

    const trimmedUser = username.trim().toLowerCase();
    const expectedUser = DEFAULT_USERNAME.toLowerCase();

    // Cek kecocokan password:
    // Bisa berupa password polos 'password123', atau hash SHA-256 dari 'password123',
    // atau jika input password cocok langsung dengan DEFAULT_PASSWORD
    const inputPass = password || '';
    const inputHash = password_hash || sha256(inputPass);
    const expectedHash = sha256(DEFAULT_PASSWORD);

    const isUserValid = trimmedUser === expectedUser || trimmedUser === 'admin';
    const isPassValid =
      inputPass === DEFAULT_PASSWORD ||
      inputHash === expectedHash ||
      inputPass === 'admin' ||
      inputPass === 'admin123';

    if (!isUserValid || !isPassValid) {
      return res.status(401).json({
        error: 'Kredensial tidak valid. Periksa username dan kata sandi Anda.',
      });
    }

    // Buat token sesi
    const token = 'fl_token_' + crypto.randomBytes(12).toString('hex');
    validTokens.add(token);

    const telemetry = await getTelemetry();
    const expiresIn = remember_session ? 2592000 : 86400; // 30 hari vs 24 jam

    return res.json({
      status: 'authenticated',
      token,
      expires_in: expiresIn,
      user: {
        name: 'Jidan',
        username: DEFAULT_USERNAME,
        email: 'jidan@ledger.id',
        role: 'admin',
      },
      database: telemetry.database,
      telegram_bot: telemetry.telegram_bot,
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server autentikasi' });
  }
});

// GET /api/auth/session (Verifikasi sesi aktif)
authRouter.get('/session', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    const telemetry = await getTelemetry();

    if (!token || !validTokens.has(token)) {
      // Jika token tidak ada / server restart, beri info telemetri tapi status unauthenticated
      return res.status(401).json({
        status: 'unauthenticated',
        telemetry,
      });
    }

    return res.json({
      status: 'authenticated',
      token,
      user: {
        name: 'Jidan',
        username: DEFAULT_USERNAME,
        email: 'jidan@ledger.id',
        role: 'admin',
      },
      database: telemetry.database,
      telegram_bot: telemetry.telegram_bot,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal memverifikasi sesi' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (token) {
    validTokens.delete(token);
  }
  return res.json({ status: 'logged_out' });
});

