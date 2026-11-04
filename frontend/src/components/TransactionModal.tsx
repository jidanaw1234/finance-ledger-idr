import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category, Transaction } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    categoryId: string;
    description: string;
    source: string;
    date: string;
  }) => Promise<void>;
  editData: Transaction | null;
  categories: Category[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  categories,
}) => {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('WEB');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Synchronize on open or change editData
  useEffect(() => {
    if (editData) {
      setType(editData.type);
      setAmount(editData.amount.toString());
      setCategoryId(editData.category_id);
      setDescription(editData.description || '');
      setSource(editData.source || 'WEB');
      setDate(editData.date ? editData.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
    } else {
      setType('EXPENSE');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'EXPENSE');
      setCategoryId(defaultCat?.id || '');
      setDescription('');
      setSource('WEB');
      setDate(new Date().toISOString().slice(0, 10));
    }
    setError('');
  }, [editData, isOpen, categories]);

  if (!isOpen) return null;

  // Filter categories by selected type
  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Masukkan nominal transaksi yang valid.');
      return;
    }

    if (!categoryId) {
      setError('Pilih pos kategori terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: editData?.id,
        type,
        amount: numAmount,
        categoryId,
        description,
        source,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#12141c] border border-[#1f2433] shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2433]">
          <h2 className="text-base font-semibold text-white">
            {editData ? 'Edit Entri Transaksi' : 'Catat Transaksi Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2433] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Segmented Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-[#090a0f] rounded-xl border border-[#1f2433]">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                const cat = categories.find((c) => c.type === 'EXPENSE');
                if (cat) setCategoryId(cat.id);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💸 Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                const cat = categories.find((c) => c.type === 'INCOME');
                if (cat) setCategoryId(cat.id);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💰 Pemasukan
            </button>
          </div>

          {/* Nominal (IDR) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nominal (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                step="any"
                required
                className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg pl-10 pr-3 py-2.5 text-sm font-mono font-semibold text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors tabular-nums"
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pos Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="" disabled>Pilih Pos Kategori</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deskripsi / Vendor */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Deskripsi / Vendor
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="cth: Makan Siang Nasi Padang, Langganan Netflix"
              className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Tanggal & Kanal Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kanal Sumber
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="WEB">Web App</option>
                <option value="TELEGRAM">Telegram Bot</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1f2433]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2433] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : editData ? 'Perbarui' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

