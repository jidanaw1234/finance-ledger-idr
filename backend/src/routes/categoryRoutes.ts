import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const categoryRouter = Router();

// GET /api/categories
categoryRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { month } = req.query; // e.g. "2024-05"

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (month && typeof month === 'string') {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      startDate = new Date(year, m, 1);
      endDate = new Date(year, m + 1, 0, 23, 59, 59, 999);
    }

    // Hitung spent jika ada filter bulan
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        let currentSpent = 0;
        if (startDate && endDate) {
          const agg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
              categoryId: cat.id,
              date: { gte: startDate, lte: endDate },
            },
          });
          currentSpent = agg._sum.amount || 0;
        }

        const budget = cat.monthlyBudget || 0;
        const percentage = budget > 0 ? Number(((currentSpent / budget) * 100).toFixed(1)) : 0;

        return {
          id: cat.id,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          monthly_budget: cat.monthlyBudget,
          current_spent: currentSpent,
          percentage,
          created_at: cat.createdAt.toISOString(),
        };
      })
    );

    return res.json({ data: enriched });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Gagal mengambil data kategori' });
  }
});

// POST /api/categories
categoryRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type = 'EXPENSE', color = '#64748b', monthly_budget, monthlyBudget } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi' });
    }

    const budgetVal = monthly_budget !== undefined ? monthly_budget : monthlyBudget;

    const created = await prisma.category.create({
      data: {
        name: name.trim(),
        type: type.toUpperCase(),
        color,
        monthlyBudget: budgetVal ? Number(budgetVal) : null,
      },
    });

    return res.status(201).json({
      id: created.id,
      name: created.name,
      type: created.type,
      color: created.color,
      monthly_budget: created.monthlyBudget,
      current_spent: 0,
      percentage: 0,
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Kategori dengan nama tersebut sudah ada' });
    }
    return res.status(500).json({ error: 'Gagal membuat kategori baru' });
  }
});

// PUT /api/categories/:id
categoryRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, type, color, monthly_budget, monthlyBudget } = req.body;

    const budgetVal = monthly_budget !== undefined ? monthly_budget : monthlyBudget;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(type && { type: type.toUpperCase() }),
        ...(color && { color }),
        ...(budgetVal !== undefined && { monthlyBudget: budgetVal ? Number(budgetVal) : null }),
      },
    });

    return res.json({
      id: updated.id,
      name: updated.name,
      type: updated.type,
      color: updated.color,
      monthly_budget: updated.monthlyBudget,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ error: 'Gagal memperbarui kategori' });
  }
});

// DELETE /api/categories/:id
categoryRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.category.delete({
      where: { id },
    });
    return res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ error: 'Gagal menghapus kategori' });
  }
});

