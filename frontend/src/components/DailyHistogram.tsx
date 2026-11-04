import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { MetricSummary } from '../types';
import { formatIDR, formatCompactIDR } from '../utils/formatters';

interface DailyHistogramProps {
  metrics: MetricSummary | null;
  loading: boolean;
}

export const DailyHistogram: React.FC<DailyHistogramProps> = ({ metrics, loading }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const chartData = useMemo(() => {
    if (!metrics?.daily_histogram) return [];

    if (viewMode === 'daily') {
      return metrics.daily_histogram.map((item) => ({
        label: `Tgl ${item.day}`,
        fullDate: item.date,
        amount: item.amount,
        isPeak: item.isPeak,
      }));
    }

    // Weekly grouping
    const weeks: { [key: string]: number } = {
      'Mgg 1 (1-7)': 0,
      'Mgg 2 (8-14)': 0,
      'Mgg 3 (15-21)': 0,
      'Mgg 4 (22-28)': 0,
      'Mgg 5 (29+)': 0,
    };

    metrics.daily_histogram.forEach((item) => {
      if (item.day <= 7) weeks['Mgg 1 (1-7)'] += item.amount;
      else if (item.day <= 14) weeks['Mgg 2 (8-14)'] += item.amount;
      else if (item.day <= 21) weeks['Mgg 3 (15-21)'] += item.amount;
      else if (item.day <= 28) weeks['Mgg 4 (22-28)'] += item.amount;
      else weeks['Mgg 5 (29+)'] += item.amount;
    });

    const maxWeekly = Math.max(...Object.values(weeks), 0);
    return Object.entries(weeks).map(([label, amount]) => ({
      label,
      fullDate: label,
      amount,
      isPeak: amount > 0 && amount === maxWeekly,
    }));
  }, [metrics, viewMode]);

  const averageAmount = useMemo(() => {
    if (!chartData.length) return 0;
    const activeDays = chartData.filter((d) => d.amount > 0);
    if (!activeDays.length) return 0;
    const sum = activeDays.reduce((acc, d) => acc + d.amount, 0);
    return Math.round(sum / activeDays.length);
  }, [chartData]);

  if (loading || !metrics) {
    return (
      <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-5 h-80 animate-pulse"></div>
    );
  }

  return (
    <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Tren Pengeluaran Harian</h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-[#1f2433] text-slate-400 font-mono">
              30 Hari
            </span>
          </div>
          <p className="text-xs text-slate-400">Distribusi ritme pengeluaran</p>
        </div>

        {/* Toggle Harian vs Mingguan */}
        <div className="flex items-center bg-[#090a0f] p-1 rounded-lg border border-[#1f2433]">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${viewMode === 'daily' ? 'bg-[#1f2433] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Harian
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${viewMode === 'weekly' ? 'bg-[#1f2433] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Mingguan
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1f2433' }}
            />
            <YAxis
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1f2433' }}
              tickFormatter={(v) => formatCompactIDR(v)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-[#0d0f17] border border-[#1f2433] p-2.5 shadow-xl">
                      <p className="text-xs text-slate-400 mb-1">{data.fullDate}</p>
                      <p className="text-sm font-bold text-white tabular-nums">
                        {formatIDR(data.amount)}
                      </p>
                      {data.isPeak && (
                        <span className="inline-block mt-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          ⚡ Puncak Pengeluaran
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {averageAmount > 0 && (
              <ReferenceLine
                y={averageAmount}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{
                  value: `Rerata: ${formatCompactIDR(averageAmount)}`,
                  fill: '#94a3b8',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}
            <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPeak ? '#f59e0b' : '#3b82f6'}
                  opacity={entry.amount === 0 ? 0.2 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1f2433]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]"></span>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]"></span>
            <span>Puncak (Anomali)</span>
          </div>
        </div>
        <span className="tabular-nums text-slate-400">
          Rerata: <strong className="text-slate-200">{formatIDR(averageAmount)}</strong>
        </span>
      </div>
    </div>
  );
};

