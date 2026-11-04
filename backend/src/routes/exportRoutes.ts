import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const exportRouter = Router();

// GET /api/export/csv
exportRouter.get('/csv', async (req: Request, res: Response) => {
  try {
    const { month, startDate, endDate, type, categoryId, source, search } = req.query;

    const where: any = {};

    if (month && typeof month === 'string') {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      where.date = {
        gte: new Date(year, m, 1),
        lte: new Date(year, m + 1, 0, 23, 59, 59, 999),
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (type && type !== 'ALL') where.type = type;
    if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId;
    if (source && source !== 'ALL') where.source = source;
    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { description: { contains: search.trim() } },
        { category: { name: { contains: search.trim() } } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    // Generate CSV content
    const header = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi / Vendor', 'Kanal', 'Nominal (IDR)'];
    const rows = transactions.map((t) => {
      const dateFormatted = t.date.toISOString().split('T')[0];
      const descSanitized = `"${(t.description || '').replace(/"/g, '""')}"`;
      const catSanitized = `"${(t.category?.name || '').replace(/"/g, '""')}"`;
      return [
        t.id,
        dateFormatted,
        t.type,
        catSanitized,
        descSanitized,
        t.source,
        t.amount,
      ].join(',');
    });

    const csvContent = [header.join(','), ...rows].join('\n');

    const filename = `transaksi_keuangan_${month || 'semua'}_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({ error: 'Gagal mengekspor data CSV' });
  }
});

