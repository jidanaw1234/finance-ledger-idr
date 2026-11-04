import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Wallet, Activity } from 'lucide-react';
import { MetricSummary } from '../types';
import { formatIDR, formatCompactIDR } from '../utils/formatters';

interface KpiCardsProps {
  metrics: MetricSummary | null;
  loading: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-[#12141c] border border-[#1f2433] animate-pulse"></div>
        ))}
      </div>
    );
  }

  const {
    total_income,
    total_expense,
    net_cashflow,
    savings_rate_pct,
    budget_limit,
    budget_used_pct,
    daily_average_expense,
    safe_daily_spend_limit,
    mom_income_pct,
    income_sources,
  } = metrics;

  const remainingBudget = Math.max(0, budget_limit - total_expense);
  const primaryIncomeSource = income_sources?.[0]?.name || 'Gaji & Lainnya';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pemasukan */}
      <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total Pemasukan</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <div className="text-xl font-bold tracking-tight text-white tabular-nums">
            {formatIDR(total_income)}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1f2433]/60">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{mom_income_pct !== null ? `${mom_income_pct >= 0 ? '+' : ''}${mom_income_pct}% MoM` : 'MoM Netral'}</span>
          </div>
          <span className="truncate max-w-[120px] text-slate-400 text-[11px]">{primaryIncomeSource}</span>
        </div>
      </div>

      {/* 2. Total Pengeluaran */}
      <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total Pengeluaran</span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <div className="text-xl font-bold tracking-tight text-white tabular-nums">
            {formatIDR(total_expense)}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1f2433]/60">
          <div className="flex items-center gap-1.5">
            <span className={`font-medium ${budget_used_pct > 90 ? 'text-rose-400' : 'text-slate-300'}`}>
              {budget_used_pct}% budget
            </span>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            Sisa {formatCompactIDR(remainingBudget)}
          </span>
        </div>
      </div>

      {/* 3. Arus Kas Bersih */}
      <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Arus Kas Bersih (Net)</span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${net_cashflow >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <div className={`text-xl font-bold tracking-tight tabular-nums ${net_cashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {net_cashflow >= 0 ? '+' : ''}{formatIDR(net_cashflow)}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1f2433]/60">
          <span className="text-slate-300 font-medium">
            Tabungan: {savings_rate_pct}%
          </span>
          <span className="text-[11px] text-slate-400">Target &gt;30%</span>
        </div>
      </div>

      {/* 4. Rerata Beban Harian */}
      <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Rerata Beban Harian</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <div className="text-xl font-bold tracking-tight text-white tabular-nums">
            {formatIDR(daily_average_expense)}
            <span className="text-xs font-normal text-slate-400 ml-1">/hari</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1f2433]/60">
          <span className="text-[11px] text-slate-400">Pagu Aman:</span>
          <span className="text-[11px] font-medium text-emerald-400 tabular-nums">
            {formatIDR(safe_daily_spend_limit)} /hari
          </span>
        </div>
      </div>
    </div>
  );
};

