import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const transactionRouter = Router();

// GET /api/transactions
transactionRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      month, // e.g. "2024-05"
      startDate,
      endDate,
      type, // "INCOME" | "EXPENSE" | "ALL"
      categoryId,
      source, // "WEB" | "TELEGRAM" | "ALL"
      search,
      page = '1',
      limit = '10',
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * take;

    const where: any = {};

    // Date filtering
    if (month && typeof month === 'string') {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      const start = new Date(year, m, 1);
      const end = new Date(year, m + 1, 0, 23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    // Type filtering
    if (type && type !== 'ALL') {
      where.type = type;
    }

    // Category filtering
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    // Source filtering
    if (source && source !== 'ALL') {
      where.source = source;
    }

    // Search query
    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { description: { contains: search.trim() } },
        { category: { name: { contains: search.trim() } } },
      ];
    }

    // Order
    const orderBy: any = {};
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.date = sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, color: true, type: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
    ]);

    const formatted = transactions.map((t) => ({
      id: t.id,
      date: t.date.toISOString(),
      type: t.type,
      category_id: t.categoryId,
      category_name: t.category.name,
      category_color: t.category.color,
      description: t.description || '',
      source: t.source,
      amount: t.amount,
      currency: 'IDR',
      created_at: t.createdAt.toISOString(),
    }));

    return res.json({
      data: formatted,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Gagal mengambil data transaksi' });
  }
});

// POST /api/transactions
transactionRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { type, amount, category_id, categoryId, description, source = 'WEB', date } = req.body;

    const actualCategoryId = category_id || categoryId;
    if (!type || !amount || !actualCategoryId) {
      return res.status(400).json({ error: 'Field type, amount, dan categoryId wajib diisi.' });
    }

    const txDate = date ? new Date(date) : new Date();

    const created = await prisma.transaction.create({
      data: {
        type: type.toUpperCase(),
        amount: Number(amount),
        categoryId: actualCategoryId,
        description: description || null,
        source: source.toUpperCase(),
        date: txDate,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      id: created.id,
      date: created.date.toISOString(),
      type: created.type,
      category_id: created.categoryId,
      category_name: created.category.name,
      category_color: created.category.color,
      description: created.description,
      source: created.source,
      amount: created.amount,
      currency: 'IDR',
      created_at: created.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ error: 'Gagal menambahkan transaksi baru' });
  }
});

// PUT /api/transactions/:id
transactionRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { type, amount, category_id, categoryId, description, source, date } = req.body;

    const actualCategoryId = category_id || categoryId;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(type && { type: type.toUpperCase() }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(actualCategoryId && { categoryId: actualCategoryId }),
        ...(description !== undefined && { description }),
        ...(source && { source: source.toUpperCase() }),
        ...(date && { date: new Date(date) }),
      },
      include: {
        category: true,
      },
    });

    return res.json({
      id: updated.id,
      date: updated.date.toISOString(),
      type: updated.type,
      category_id: updated.categoryId,
      category_name: updated.category?.name || '',
      category_color: updated.category?.color || '',
      description: updated.description,
      source: updated.source,
      amount: updated.amount,
      currency: 'IDR',
      created_at: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return res.status(500).json({ error: 'Gagal memperbarui transaksi' });
  }
});

// DELETE /api/transactions/:id
transactionRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.transaction.delete({
      where: { id },
    });
    return res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ error: 'Gagal menghapus transaksi' });
  }
});

