import React, { useState, useEffect } from 'react';
import { Search, Send, Globe, Edit2, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Transaction, Category, Pagination } from '../types';
import { formatIDR, formatDateIndo } from '../utils/formatters';

interface LedgerTableProps {
  transactions: Transaction[];
  categories: Category[];
  pagination: Pagination;
  loading: boolean;
  onFilterChange: (filters: {
    type?: string;
    categoryId?: string;
    source?: string;
    search?: string;
    page?: number;
  }) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactions,
  categories,
  pagination,
  loading,
  onFilterChange,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeSource, setActiveSource] = useState('ALL');

  // Debounce search 150ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ search: searchTerm, page: 1 });
    }, 150);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    onFilterChange({ type, page: 1 });
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    onFilterChange({ categoryId, page: 1 });
  };

  const handleSourceChange = (source: string) => {
    setActiveSource(source);
    onFilterChange({ source, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    onFilterChange({ page: newPage });
  };

  return (
    <div className="rounded-xl bg-[#12141c] border border-[#1f2433] overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#1f2433] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari deskripsi, vendor, atau catatan..."
            className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Type Control */}
          <div className="flex items-center bg-[#090a0f] p-1 rounded-lg border border-[#1f2433]">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'EXPENSE', label: 'Keluar' },
              { id: 'INCOME', label: 'Masuk' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleTypeChange(t.id)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  activeType === t.id
                    ? 'bg-[#1f2433] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={activeCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-[#090a0f] border border-[#1f2433] text-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Source Dropdown */}
          <select
            value={activeSource}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="bg-[#090a0f] border border-[#1f2433] text-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="ALL">Semua Kanal</option>
            <option value="WEB">Web App</option>
            <option value="TELEGRAM">Telegram Bot</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0e1017] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#1f2433]">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Deskripsi / Vendor</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Kanal</th>
              <th className="py-3 px-4 text-right">Nominal (IDR)</th>
              <th className="py-3 px-4 text-center w-24">Kelola</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2433]/70">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-xs">Memuat data transaksi...</p>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Filter className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-medium text-slate-300">Tidak ada transaksi ditemukan</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Coba sesuaikan filter atau tambahkan transaksi baru.
                  </p>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#181b26]/60 transition-colors group"
                  >
                    {/* Tanggal */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {formatDateIndo(tx.date)}
                    </td>

                    {/* Deskripsi */}
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      {tx.description || '-'}
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1a1e2d] text-slate-200 border border-[#262c40]">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tx.category_color || '#64748b' }}
                        />
                        <span>{tx.category_name}</span>
                      </span>
                    </td>

                    {/* Kanal */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.source === 'TELEGRAM' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <Send className="w-2.5 h-2.5" />
                          <span>Telegram</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          <Globe className="w-2.5 h-2.5" />
                          <span>Web</span>
                        </span>
                      )}
                    </td>

                    {/* Nominal */}
                    <td
                      className={`py-3 px-4 text-right font-mono font-semibold tabular-nums text-sm whitespace-nowrap ${
                        isIncome ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isIncome ? '+ ' : '- '}
                      {formatIDR(tx.amount)}
                    </td>

                    {/* Kelola / Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 rounded hover:bg-[#252b3d] text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded hover:bg-[#252b3d] text-slate-400 hover:text-rose-400 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="p-4 border-t border-[#1f2433] bg-[#0c0e15] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Menampilkan baris{' '}
          <strong className="text-slate-200">
            {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
          </strong>{' '}
          s.d.{' '}
          <strong className="text-slate-200">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </strong>{' '}
          dari <strong className="text-slate-200">{pagination.total}</strong> total transaksi
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#1f2433] bg-[#12141c] hover:bg-[#181b26] disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="px-2 font-mono text-[11px] text-slate-300">
            Hal {pagination.page} / {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#1f2433] bg-[#12141c] hover:bg-[#181b26] disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

