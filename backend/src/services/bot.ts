import { Bot } from 'grammy';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db.js';
import { parseNominal, formatIDR } from '../utils/parser.js';

export function setupTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  let allowedUserId = process.env.TELEGRAM_ALLOWED_USER_ID?.trim();

  if (!token || token.trim() === '' || token === 'your_bot_token_from_botfather') {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN belum diset di .env. Telegram Bot tidak diaktifkan.');
    return null;
  }

  const bot = new Bot(token);

  // FR-TG-01: Security Whitelist Middleware with Auto-binding for convenience
  bot.use(async (ctx, next) => {
    const senderId = ctx.from?.id?.toString();
    const senderName = ctx.from?.first_name || ctx.from?.username || 'User';

    if (!senderId) return;

    // Jika belum ada ALLOWED_USER_ID yang diset di .env, kita auto-bind user pertama yang mengirim pesan!
    if (!allowedUserId || allowedUserId === '') {
      allowedUserId = senderId;
      console.log(`🔑 TELEGRAM_ALLOWED_USER_ID otomatis terikat ke ID: ${senderId} (${senderName})`);

      // Update file .env secara otomatis
      try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          if (envContent.includes('TELEGRAM_ALLOWED_USER_ID=')) {
            envContent = envContent.replace(
              /TELEGRAM_ALLOWED_USER_ID=.*/,
              `TELEGRAM_ALLOWED_USER_ID="${senderId}"`
            );
          } else {
            envContent += `\nTELEGRAM_ALLOWED_USER_ID="${senderId}"`;
          }
          fs.writeFileSync(envPath, envContent, 'utf8');
          console.log(`✅ File .env berhasil diperbarui dengan TELEGRAM_ALLOWED_USER_ID="${senderId}"`);
        }
      } catch (e) {
        console.error('Gagal memperbarui .env secara otomatis:', e);
      }

      await ctx.reply(
        `🎉 *Selamat Datang, ${senderName}!*
━━━━━━━━━━━━━━━━━━
Akun Telegram Anda (*ID: ${senderId}*) telah berhasil didaftarkan sebagai pemilik tunggal (*Single User Whitelist*).

Bot ini sekarang dikunci eksklusif hanya untuk Anda! 🔐`,
        { parse_mode: 'Markdown' }
      );
    }

    // Cek apakah ID pengirim cocok
    if (senderId !== allowedUserId) {
      console.warn(`[Bot] Akses ditolak untuk ID Telegram ${senderId} (${senderName}). Whitelist ID: ${allowedUserId}`);
      return; // Abaikan pesan dari orang lain
    }

    await next();
  });

  // Helper find category
  async function findCategory(type: 'INCOME' | 'EXPENSE', query: string) {
    const cleanQuery = query.toLowerCase();
    const categories = await prisma.category.findMany({
      where: { type },
    });

    // 1. Exact match
    const exact = categories.find((c) => c.name.toLowerCase() === cleanQuery);
    if (exact) return exact;

    // 2. Partial match
    const partial = categories.find((c) => c.name.toLowerCase().includes(cleanQuery));
    if (partial) return partial;

    // 3. Fallback to default
    const fallbackName = type === 'EXPENSE' ? 'Lain-lain' : 'Pemasukan Lainnya';
    let fallback = categories.find((c) => c.name === fallbackName);
    if (!fallback && categories.length > 0) {
      fallback = categories[0];
    }
    return fallback;
  }

  // /start & /help
  bot.command(['start', 'help'], async (ctx) => {
    const helpText = `
👋 *Finance Tracker Bot (@${ctx.me.username}) Siap Digunakan!*

📌 *Format Catat Transaksi Cepat:*
• \`/out <nominal> <kategori> <keterangan>\`
  _Contoh:_ \`/out 25k makan Nasi Padang\`
  _Contoh:_ \`/out 150rb bensin Pertamax full\`
  _Contoh:_ \`/out 1.2m belanja Belanja bulanan\`

• \`/in <nominal> <kategori> <keterangan>\`
  _Contoh:_ \`/in 15m gaji Gaji bulanan\`
  _Contoh:_ \`/in 750k freelance Desain banner\`

📊 *Format Ringkasan & Query:*
• \`/hari_ini\` : Rekap masuk & keluar hari ini
• \`/bulan_ini\` atau \`/rekap\` : Arus kas & top 5 pos bulan ini
• \`/cek <kategori>\` : Total belanja per pos (cth: \`/cek makan\`)

↩️ *Koreksi Transaksi:*
• \`/batal\` : Menghapus 1 transaksi terakhir yang dicatat via Telegram
    `.trim();
    await ctx.reply(helpText, { parse_mode: 'Markdown' });
  });

  // FR-TG-02: Command /out (Expense)
  bot.command('out', async (ctx) => {
    const text = ctx.match?.trim() || '';
    const parts = text.split(/\s+/);
    if (parts.length < 2) {
      return ctx.reply('⚠️ Format salah.\nGunakan: `/out <nominal> <kategori> [keterangan]`\nContoh: `/out 35k makan Bakso Malang`', {
        parse_mode: 'Markdown',
      });
    }

    const rawNominal = parts[0];
    const categoryKeyword = parts[1];
    const description = parts.slice(2).join(' ') || categoryKeyword;

    const amount = parseNominal(rawNominal);
    if (!amount) {
      return ctx.reply(`⚠️ Nominal "${rawNominal}" tidak valid. Gunakan format seperti 25k, 50000, 1.5m, 25rb.`);
    }

    try {
      const category = await findCategory('EXPENSE', categoryKeyword);
      if (!category) {
        return ctx.reply('⚠️ Tidak ada kategori pengeluaran yang tersedia.');
      }

      const tx = await prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          amount,
          categoryId: category.id,
          description,
          source: 'TELEGRAM',
          date: new Date(),
        },
      });

      // Hitung total pengeluaran hari ini
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayExpense = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'EXPENSE',
          date: { gte: startOfDay },
        },
      });

      const reply = `
✅ *Pengeluaran Dicatat!*
━━━━━━━━━━━━━━━━━━
💸 Nominal: *${formatIDR(tx.amount)}*
📁 Pos: *${category.name}*
📝 Catatan: ${tx.description}
📅 Waktu: ${tx.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB

📊 *Total Keluar Hari Ini:* ${formatIDR(todayExpense._sum.amount || 0)}
      `.trim();

      await ctx.reply(reply, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Error inserting expense:', err);
      await ctx.reply('❌ Terjadi kesalahan saat mencatat pengeluaran.');
    }
  });

  // FR-TG-02: Command /in (Income)
  bot.command('in', async (ctx) => {
    const text = ctx.match?.trim() || '';
    const parts = text.split(/\s+/);
    if (parts.length < 2) {
      return ctx.reply('⚠️ Format salah.\nGunakan: `/in <nominal> <kategori> [keterangan]`\nContoh: `/in 10m gaji Gaji Pokok`', {
        parse_mode: 'Markdown',
      });
    }

    const rawNominal = parts[0];
    const categoryKeyword = parts[1];
    const description = parts.slice(2).join(' ') || categoryKeyword;

    const amount = parseNominal(rawNominal);
    if (!amount) {
      return ctx.reply(`⚠️ Nominal "${rawNominal}" tidak valid. Gunakan format angka seperti 15m, 500k, 250000.`);
    }

    try {
      const category = await findCategory('INCOME', categoryKeyword);
      if (!category) {
        return ctx.reply('⚠️ Tidak ada kategori pemasukan yang tersedia.');
      }

      const tx = await prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount,
          categoryId: category.id,
          description,
          source: 'TELEGRAM',
          date: new Date(),
        },
      });

      const reply = `
✅ *Pemasukan Dicatat!*
━━━━━━━━━━━━━━━━━━
💰 Nominal: *${formatIDR(tx.amount)}*
📁 Pos: *${category.name}*
📝 Catatan: ${tx.description}
      `.trim();

      await ctx.reply(reply, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Error inserting income:', err);
      await ctx.reply('❌ Terjadi kesalahan saat mencatat pemasukan.');
    }
  });

  // FR-TG-03: /hari_ini
  bot.command('hari_ini', async (ctx) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [incomeAgg, expenseAgg, txs] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'INCOME', date: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'EXPENSE', date: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.transaction.findMany({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const net = totalIncome - totalExpense;

    let txList = txs.length === 0 ? '_Belum ada transaksi hari ini._' : '';
    if (txs.length > 0) {
      txList = txs
        .map((t) => {
          const sign = t.type === 'INCOME' ? '🟢 +' : '🔴 -';
          return `${sign} ${formatIDR(t.amount)} (${t.category.name}: ${t.description || '-'})`;
        })
        .join('\n');
    }

    const reply = `
📅 *REKAP HARI INI*
━━━━━━━━━━━━━━━━━━
🟢 Total Masuk: *${formatIDR(totalIncome)}*
🔴 Total Keluar: *${formatIDR(totalExpense)}*
💵 Net Hari Ini: *${net >= 0 ? '+' : ''}${formatIDR(net)}*

📋 *Transaksi Terakhir:*
${txList}
    `.trim();

    await ctx.reply(reply, { parse_mode: 'Markdown' });
  });

  // FR-TG-03: /bulan_ini & /rekap
  bot.command(['bulan_ini', 'rekap'], async (ctx) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [incomeAgg, expenseAgg, categoriesExpense] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'INCOME', date: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        where: { type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth } },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const net = totalIncome - totalExpense;
    const monthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const categoryIds = categoriesExpense.map((c) => c.categoryId);
    const cats = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const catMap = new Map(cats.map((c) => [c.id, c.name]));

    const catDetails = categoriesExpense
      .map((c) => {
        const name = catMap.get(c.categoryId) || 'Lainnya';
        const amt = c._sum.amount || 0;
        const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : '0';
        return `• ${name}: *${formatIDR(amt)}* (${pct}%)`;
      })
      .join('\n');

    const reply = `
📊 *REKAP BULAN ${monthName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━
💰 Pemasukan: *${formatIDR(totalIncome)}*
💸 Pengeluaran: *${formatIDR(totalExpense)}*
⚖️ Arus Kas Bersih: *${net >= 0 ? '+' : ''}${formatIDR(net)}*

📂 *Top 5 Pengeluaran:*
${catDetails || '_Belum ada pengeluaran._'}
    `.trim();

    await ctx.reply(reply, { parse_mode: 'Markdown' });
  });

  // FR-TG-03: /cek <kategori>
  bot.command('cek', async (ctx) => {
    const keyword = ctx.match?.trim();
    if (!keyword) {
      return ctx.reply('⚠️ Masukkan kategori yang ingin dicek.\nContoh: `/cek makan` atau `/cek bensin`', {
        parse_mode: 'Markdown',
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const categories = await prisma.category.findMany({
      where: {
        name: { contains: keyword },
      },
    });

    if (categories.length === 0) {
      return ctx.reply(`⚠️ Kategori dengan kata kunci "${keyword}" tidak ditemukan.`);
    }

    const catIds = categories.map((c) => c.id);
    const agg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        categoryId: { in: catIds },
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const total = agg._sum.amount || 0;
    const count = agg._count.id;
    const catNames = categories.map((c) => c.name).join(', ');

    await ctx.reply(
      `
🔍 *Pengeluaran Kategori: ${catNames}*
━━━━━━━━━━━━━━━━━━
📅 Bulan Ini: *${formatIDR(total)}*
🔢 Total Transaksi: *${count} kali*
      `.trim(),
      { parse_mode: 'Markdown' }
    );
  });

  // FR-TG-04: /batal (Quick Undo)
  bot.command('batal', async (ctx) => {
    try {
      const lastTx = await prisma.transaction.findFirst({
        where: { source: 'TELEGRAM' },
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      });

      if (!lastTx) {
        return ctx.reply('⚠️ Tidak ada transaksi dari Telegram yang bisa dibatalkan.');
      }

      await prisma.transaction.delete({
        where: { id: lastTx.id },
      });

      await ctx.reply(
        `
🗑️ *Transaksi Berhasil Dibatalkan!*
━━━━━━━━━━━━━━━━━━
Jenis: *${lastTx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}*
Nominal: *${formatIDR(lastTx.amount)}*
Pos: *${lastTx.category.name}*
Catatan: ${lastTx.description || '-'}
        `.trim(),
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error undo transaction:', err);
      await ctx.reply('❌ Gagal membatalkan transaksi.');
    }
  });

  // FR-TG-05: Cron Reminder Setiap Pukul 21:00 WIB
  cron.schedule(
    '0 21 * * *',
    async () => {
      try {
        if (!allowedUserId) return;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const countTodayExpense = await prisma.transaction.count({
          where: {
            type: 'EXPENSE',
            date: { gte: startOfDay },
          },
        });

        if (countTodayExpense === 0) {
          const reminderMsg = `
🔔 *PENGINGAT PENGELUARAN (21:00 WIB)*
━━━━━━━━━━━━━━━━━━
Hai! Kamu belum mencatat pengeluaran apa pun hari ini.
Apakah ada transaksi jajan, makan, atau belanja yang belum tercatat?

Ketik \`/out <nominal> <kategori> <keterangan>\` untuk mencatat kilat!
          `.trim();
          await bot.api.sendMessage(allowedUserId, reminderMsg, { parse_mode: 'Markdown' });
        }
      } catch (err) {
        console.error('Gagal mengirim cron reminder:', err);
      }
    },
    {
      timezone: 'Asia/Jakarta',
    }
  );

  // Jalankan bot (long polling)
  bot.start({
    onStart: (botInfo) => {
      console.log(`🤖 Telegram Bot aktif sebagai @${botInfo.username}`);
    },
  }).catch((err) => {
    console.error('Telegram bot error:', err);
  });

  return bot;
}
