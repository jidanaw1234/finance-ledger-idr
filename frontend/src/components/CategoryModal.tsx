import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, SlidersHorizontal } from 'lucide-react';
import { Category } from '../types';
import { formatIDR } from '../utils/formatters';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (data: {
    name: string;
    type: 'INCOME' | 'EXPENSE';
    color: string;
    monthly_budget: number | null;
  }) => Promise<void>;
  onUpdateCategory: (
    id: string,
    data: {
      name?: string;
      type?: 'INCOME' | 'EXPENSE';
      color?: string;
      monthly_budget?: number | null;
    }
  ) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#64748b', '#059669',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // New category form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [color, setColor] = useState('#f59e0b');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Editing state
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editBudget, setEditBudget] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditBudget(cat.monthly_budget ? cat.monthly_budget.toString() : '');
  };

  const handleSaveEdit = async (id: string) => {
    setSubmitting(true);
    try {
      await onUpdateCategory(id, {
        name: editName,
        color: editColor,
        monthly_budget: editBudget ? parseFloat(editBudget) : null,
      });
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui kategori');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama kategori tidak boleh kosong.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddCategory({
        name: name.trim(),
        type,
        color,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : null,
      });
      setName('');
      setMonthlyBudget('');
    } catch (err: any) {
      setError(err.message || 'Gagal membuat kategori baru');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#12141c] border border-[#1f2433] shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2433]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Manajemen Pos Kategori & Alokasi Pagu</h2>
              <p className="text-xs text-slate-400">Atur pos alokasi dan batas pagu bulanan (monthly budget)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2433] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto my-4 space-y-6 pr-1">
          {/* List of categories */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Daftar Pos Kategori
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;

                if (isEditing) {
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl bg-[#090a0f] border border-emerald-500/40 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-[#12141c] border border-[#1f2433] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          placeholder="Nama pos"
                        />
                        <input
                          type="number"
                          value={editBudget}
                          onChange={(e) => setEditBudget(e.target.value)}
                          className="bg-[#12141c] border border-[#1f2433] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          placeholder="Pagu bulanan (IDR)"
                        />
                        <div className="flex items-center gap-1.5">
                          {PRESET_COLORS.slice(0, 6).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              style={{ backgroundColor: c }}
                              className={`w-5 h-5 rounded-full ${editColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.id)}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#090a0f] border border-[#1f2433] hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div>
                        <span className="text-xs font-medium text-white">{cat.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${cat.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {cat.type}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                            {cat.monthly_budget ? `Pagu: ${formatIDR(cat.monthly_budget)}` : 'Tanpa Pagu'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2433]"
                        title="Edit Kategori"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#1f2433]"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create new category form */}
          <div className="pt-4 border-t border-[#1f2433]">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              + Tambah Pos Kategori Baru
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Pos</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="cth: Tabungan Darurat"
                    className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tipe</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="EXPENSE">Pengeluaran (EXPENSE)</option>
                    <option value="INCOME">Pemasukan (INCOME)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Pagu Bulanan (IDR)</label>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="Opsional, cth: 2000000"
                    className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Label Warna</label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-all ${
                        color === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

