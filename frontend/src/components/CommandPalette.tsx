import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, SlidersHorizontal, Download, ArrowRight, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTransaction: (type?: 'INCOME' | 'EXPENSE') => void;
  onOpenCategories: () => void;
  onExportCsv: () => void;
  onSearch: (query: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenNewTransaction,
  onOpenCategories,
  onExportCsv,
  onSearch,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'new-expense',
      label: 'Catat Pengeluaran Baru',
      desc: 'Tambah entri belanja atau pembayaran',
      icon: PlusCircle,
      action: () => {
        onClose();
        onOpenNewTransaction('EXPENSE');
      },
    },
    {
      id: 'new-income',
      label: 'Catat Pemasukan Baru',
      desc: 'Tambah entri gaji, freelance, atau pendapatan',
      icon: PlusCircle,
      action: () => {
        onClose();
        onOpenNewTransaction('INCOME');
      },
    },
    {
      id: 'categories',
      label: 'Kelola Pos Kategori & Budget',
      desc: 'Atur pos alokasi dan batas anggaran bulanan',
      icon: SlidersHorizontal,
      action: () => {
        onClose();
        onOpenCategories();
      },
    },
    {
      id: 'export-csv',
      label: 'Unduh Ekspor Data CSV',
      desc: 'Download seluruh transaksi bulan aktif ke spreadsheet',
      icon: Download,
      action: () => {
        onClose();
        onExportCsv();
      },
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#12141c] border border-[#1f2433] shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#1f2433] gap-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Ketik perintah atau cari transaksi..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Aksi Cepat
          </div>
          {filteredActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.action}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#181b26] text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1f2433] flex items-center justify-center text-slate-300 group-hover:text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{act.label}</p>
                    <p className="text-[11px] text-slate-400">{act.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#090a0f] border-t border-[#1f2433] flex items-center justify-between text-[11px] text-slate-500">
          <span>Tekan ESC untuk menutup</span>
          <div className="flex items-center gap-2">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#1f2433] text-slate-300 font-mono text-[10px]">N</kbd> Entri Baru
          </div>
        </div>
      </div>
    </div>
  );
};

