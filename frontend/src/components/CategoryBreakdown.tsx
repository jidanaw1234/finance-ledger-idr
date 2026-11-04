import React from 'react';
import { MetricSummary } from '../types';
import { formatIDR } from '../utils/formatters';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface CategoryBreakdownProps {
  metrics: MetricSummary | null;
  loading: boolean;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-5 h-80 animate-pulse"></div>
    );
  }

  const { category_breakdown, total_expense, safe_daily_spend_limit } = metrics;

  return (
    <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Alokasi Berdasarkan Pos</h2>
            <p className="text-xs text-slate-400">Komposisi pengeluaran bulan ini</p>
          </div>
          <span className="text-xs font-medium text-slate-300 tabular-nums">
            Total: {formatIDR(total_expense)}
          </span>
        </div>

        {/* Proportional Multi-Segment Horizontal Strip */}
        <div className="w-full h-3 rounded-full bg-[#1f2433] overflow-hidden flex mb-5">
          {category_breakdown.length === 0 ? (
            <div className="w-full h-full bg-[#1f2433]" />
          ) : (
            category_breakdown.map((cat) => (
              <div
                key={cat.id}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color || '#64748b',
                }}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-85"
                title={`${cat.name}: ${cat.percentage}% (${formatIDR(cat.amount)})`}
              />
            ))
          )}
        </div>

        {/* Category Matrix List */}
        <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
          {category_breakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada data pengeluaran pos.</p>
          ) : (
            category_breakdown.map((cat) => {
              const hasBudget = cat.budget !== null && cat.budget > 0;
              const budgetUsage = hasBudget ? ((cat.amount / (cat.budget as number)) * 100).toFixed(0) : null;
              const isOver = hasBudget && cat.amount > (cat.budget as number);

              return (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#64748b' }}
                    />
                    <span className="text-slate-200 font-medium truncate max-w-[150px]">{cat.name}</span>
                    {hasBudget && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isOver ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'}`}>
                        {budgetUsage}% pagu
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-white tabular-nums">{formatIDR(cat.amount)}</span>
                    <span className="text-slate-400 text-[11px] ml-2 font-mono">{cat.percentage}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Safe Daily Spend Footer Indicator */}
      <div className="mt-4 pt-3 border-t border-[#1f2433] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Kapasitas Belanja Harian Aman:</span>
        </div>
        <span className="font-bold text-emerald-400 tabular-nums">
          {formatIDR(safe_daily_spend_limit)} / hari
        </span>
      </div>
    </div>
  );
};

