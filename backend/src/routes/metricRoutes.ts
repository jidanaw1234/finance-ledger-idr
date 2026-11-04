import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const metricRouter = Router();

// GET /api/metrics/summary?month=YYYY-MM
metricRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthQuery = (req.query.month as string) || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [yearStr, monthStr] = monthQuery.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;

    const startDate = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    // Previous month range for MoM calculations
    const prevStartDate = new Date(year, monthIndex - 1, 1);
    const prevEndDate = new Date(year, monthIndex, 0, 23, 59, 59, 999);

    // Queries
    const [
      incomeAgg,
      expenseAgg,
      prevIncomeAgg,
      prevExpenseAgg,
      categoriesWithBudget,
      categoryExpenses,
      dailyTransactions,
      incomeTransactions,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'INCOME', date: { gte: startDate, lte: endDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'INCOME', date: { gte: prevStartDate, lte: prevEndDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'EXPENSE', date: { gte: prevStartDate, lte: prevEndDate } },
      }),
      prisma.category.findMany({
        where: { type: 'EXPENSE' },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        where: { type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      prisma.transaction.findMany({
        where: { type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
        select: { date: true, amount: true },
      }),
      prisma.transaction.findMany({
        where: { type: 'INCOME', date: { gte: startDate, lte: endDate } },
        include: { category: true },
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const netCashflow = totalIncome - totalExpense;

    // Savings rate
    const savingsRatePct = totalIncome > 0 ? Number(((netCashflow / totalIncome) * 100).toFixed(1)) : 0;

    // Budget limit from all expense categories
    const budgetLimit = categoriesWithBudget.reduce((acc, cat) => acc + (cat.monthlyBudget || 0), 0);
    const budgetUsedPct = budgetLimit > 0 ? Number(((totalExpense / budgetLimit) * 100).toFixed(1)) : 0;

    // Days elapsed so far in selected month
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === monthIndex;
    const daysElapsed = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
    const remainingDays = Math.max(1, daysInMonth - daysElapsed);

    // Daily average expense & Safe Daily Spend Limit
    const dailyAverageExpense = Math.round(totalExpense / daysElapsed);
    const safeRemainingBudget = Math.max(0, budgetLimit - totalExpense);
    const safeDailySpendLimit = Math.round(safeRemainingBudget / remainingDays);

    // MoM changes
    const prevIncome = prevIncomeAgg._sum.amount || 0;
    const momIncomePct = prevIncome > 0 ? Number((((totalIncome - prevIncome) / prevIncome) * 100).toFixed(1)) : null;

    const prevExpense = prevExpenseAgg._sum.amount || 0;
    const momExpensePct = prevExpense > 0 ? Number((((totalExpense - prevExpense) / prevExpense) * 100).toFixed(1)) : null;

    // Daily histogram (days 1 to daysInMonth)
    const dailyTotals: { [day: number]: number } = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyTotals[d] = 0;
    }
    dailyTransactions.forEach((t) => {
      const d = new Date(t.date).getDate();
      dailyTotals[d] = (dailyTotals[d] || 0) + t.amount;
    });

    const maxDayAmount = Math.max(...Object.values(dailyTotals), 0);
    const dailyHistogram = Object.entries(dailyTotals).map(([dayStr, amount]) => {
      const day = parseInt(dayStr, 10);
      const isPeak = amount > 0 && amount === maxDayAmount;
      const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
      return {
        day,
        date: dateStr,
        amount,
        isPeak,
      };
    });

    // Category breakdown
    const catMap = new Map(categoriesWithBudget.map((c) => [c.id, c]));
    const categoryBreakdown = categoryExpenses.map((ce) => {
      const cat = catMap.get(ce.categoryId);
      const amt = ce._sum.amount || 0;
      const percentage = totalExpense > 0 ? Number(((amt / totalExpense) * 100).toFixed(1)) : 0;
      return {
        id: ce.categoryId,
        name: cat?.name || 'Lainnya',
        color: cat?.color || '#94a3b8',
        amount: amt,
        percentage,
        budget: cat?.monthlyBudget || null,
      };
    });

    // Income breakdown by category
    const incomeSourceMap: { [name: string]: number } = {};
    incomeTransactions.forEach((tx) => {
      const name = tx.category.name;
      incomeSourceMap[name] = (incomeSourceMap[name] || 0) + tx.amount;
    });
    const incomeSources = Object.entries(incomeSourceMap).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalIncome > 0 ? Number(((amount / totalIncome) * 100).toFixed(1)) : 0,
    }));

    return res.json({
      period: monthQuery,
      currency: 'IDR',
      total_income: totalIncome,
      total_expense: totalExpense,
      net_cashflow: netCashflow,
      savings_rate_pct: savingsRatePct,
      budget_limit: budgetLimit,
      budget_used_pct: budgetUsedPct,
      daily_average_expense: dailyAverageExpense,
      safe_daily_spend_limit: safeDailySpendLimit,
      mom_income_pct: momIncomePct,
      mom_expense_pct: momExpensePct,
      daily_histogram: dailyHistogram,
      category_breakdown: categoryBreakdown,
      income_sources: incomeSources,
    });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return res.status(500).json({ error: 'Gagal menghitung metrik analitik' });
  }
});

