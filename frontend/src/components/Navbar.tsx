import React from 'react';
import { Plus, Download, SlidersHorizontal, Search, Wallet, LogOut, User } from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onOpenNewTransaction: () => void;
  onOpenCategories: () => void;
  onExportCsv: () => void;
  onOpenSearch: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onMonthChange,
  onOpenNewTransaction,
  onOpenCategories,
  onExportCsv,
  onOpenSearch,
  user,
  onLogout,
}) => {
  // Generate last 12 months for picker
  const months = React.useMemo(() => {
    const list = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      list.push({ value, label });
    }
    return list;
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#1f2433] bg-[#090a0f]/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Sync Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white">Buku Kas Utama</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Tersinkronisasi</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">Finance Ledger IDR &bull; Single User</p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Period Dropdown */}
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-[#12141c] hover:bg-[#181b26] border border-[#1f2433] text-slate-200 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value} className="bg-[#12141c] text-white">
                {m.label}
              </option>
            ))}
          </select>

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12141c] hover:bg-[#181b26] border border-[#1f2433] text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Cari Cepat (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cari...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-[#1f2433] text-slate-300 rounded border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Pos Kategori */}
          <button
            onClick={onOpenCategories}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#12141c] hover:bg-[#181b26] border border-[#1f2433] text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Pos Kategori</span>
          </button>

          {/* Ekspor CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#12141c] hover:bg-[#181b26] border border-[#1f2433] text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>

          {/* + Tambah Entri */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 border border-emerald-400/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Entri</span>
            <kbd className="hidden sm:inline px-1 py-0.5 text-[10px] font-mono bg-emerald-700/60 rounded text-emerald-100">
              N
            </kbd>
          </button>

          {/* User Profile & Logout Pill (Modul B PRD) */}
          {user && (
            <div className="flex items-center pl-1 sm:pl-2 border-l border-[#1f2433] gap-1.5">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141c] border border-[#1f2433] text-xs text-slate-300 select-none"
                title={`Masuk sebagai ${user.name} (${user.username})`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <span className="hidden xl:inline font-medium text-slate-200">{user.name}</span>
                <span className="hidden sm:inline-block px-1 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                  {user.role}
                </span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg bg-[#12141c] hover:bg-rose-500/10 border border-[#1f2433] hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                  title="Keluar / Kunci Buku Kas"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
