import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { DailyHistogram } from './components/DailyHistogram';
import { LedgerTable } from './components/LedgerTable';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { CommandPalette } from './components/CommandPalette';
import { LoginPage } from './components/LoginPage';
import { api } from './services/api';
import { MetricSummary, Transaction, Category, Pagination, AuthUser } from './types';

export function App() {
  // Authentication state (Single-User Gatekeeper)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => api.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!api.getStoredToken());

  // Current period (default current month: YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Data states
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filter states
  const [filters, setFilters] = useState<{
    type?: string;
    categoryId?: string;
    source?: string;
    search?: string;
    page?: number;
  }>({
    type: 'ALL',
    categoryId: 'ALL',
    source: 'ALL',
    search: '',
    page: 1,
  });

  // Loading & Modals
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  // Load metrics
  const loadMetrics = useCallback(async (month: string) => {
    try {
      setLoadingMetrics(true);
      const data = await api.getMetrics(month);
      setMetrics(data);
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async (month: string) => {
    try {
      const data = await api.getCategories(month);
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  // Load transactions
  const loadTransactions = useCallback(
    async (month: string, currentFilters: typeof filters) => {
      try {
        setLoadingTable(true);
        const res = await api.getTransactions({
          month,
          type: currentFilters.type,
          categoryId: currentFilters.categoryId,
          source: currentFilters.source,
          search: currentFilters.search,
          page: currentFilters.page || 1,
          limit: 10,
        });
        setTransactions(res.data);
        setPagination(res.pagination);
      } catch (err) {
        console.error('Error loading transactions:', err);
      } finally {
        setLoadingTable(false);
      }
    },
    []
  );

  // Initial and reactive data fetching when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMetrics(currentMonth);
      loadCategories(currentMonth);
    }
  }, [isAuthenticated, currentMonth, loadMetrics, loadCategories]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions(currentMonth, filters);
    }
  }, [isAuthenticated, currentMonth, filters, loadTransactions]);

  // Keyboard shortcuts listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }

      // 'N' key -> New Entry (only if not in input field)
      if (!isInput && e.key.toLowerCase() === 'n' && !isTxModalOpen && !isCatModalOpen) {
        e.preventDefault();
        setEditingTx(null);
        setIsTxModalOpen(true);
      }

      // Escape -> Close modals
      if (e.key === 'Escape') {
        setIsTxModalOpen(false);
        setIsCatModalOpen(false);
        setIsCmdOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, isTxModalOpen, isCatModalOpen]);

  // Transaction submit handler
  const handleTransactionSubmit = async (payload: {
    id?: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    categoryId: string;
    description: string;
    source: string;
    date: string;
  }) => {
    if (payload.id) {
      await api.updateTransaction(payload.id, payload);
    } else {
      await api.createTransaction(payload);
    }
    loadMetrics(currentMonth);
    loadCategories(currentMonth);
    loadTransactions(currentMonth, filters);
  };

  // Transaction delete handler
  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    try {
      await api.deleteTransaction(id);
      loadMetrics(currentMonth);
      loadCategories(currentMonth);
      loadTransactions(currentMonth, filters);
    } catch (err) {
      alert('Gagal menghapus transaksi.');
    }
  };

  // Category handlers
  const handleAddCategory = async (data: any) => {
    await api.createCategory(data);
    loadCategories(currentMonth);
  };

  const handleUpdateCategory = async (id: string, data: any) => {
    await api.updateCategory(id, data);
    loadCategories(currentMonth);
    loadMetrics(currentMonth);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Hapus kategori ini? Transaksi terkait mungkin terpengaruh.')) return;
    await api.deleteCategory(id);
    loadCategories(currentMonth);
    loadMetrics(currentMonth);
  };

  // Export CSV handler
  const handleExportCsv = () => {
    const url = api.getExportCsvUrl({
      month: currentMonth,
      type: filters.type,
      categoryId: filters.categoryId,
      source: filters.source,
      search: filters.search,
    });
    window.open(url, '_blank');
  };

  // Logout handler
  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setAuthUser(null);
  };

  // JIKA BELUM TERAUTENTIKASI: TAMPILKAN LOGIN PORTAL
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setAuthUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // JIKA SUDAH TERAUTENTIKASI: TAMPILKAN DASHBOARD UTAMA SECARA PENUH
  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenCategories={() => setIsCatModalOpen(true)}
        onExportCsv={handleExportCsv}
        onOpenSearch={() => setIsCmdOpen(true)}
        user={authUser}
        onLogout={handleLogout}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Module 2: KPI Summary Cards */}
        <KpiCards metrics={metrics} loading={loadingMetrics} />

        {/* Module 3: Analytics Grid (Category Breakdown & Daily Histogram) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown metrics={metrics} loading={loadingMetrics} />
          <DailyHistogram metrics={metrics} loading={loadingMetrics} />
        </div>

        {/* Module 4: Transaction Ledger Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Buku Jurnal Transaksi</h2>
              <p className="text-xs text-slate-400">Riwayat pengeluaran dan pemasukan terperinci</p>
            </div>
          </div>
          <LedgerTable
            transactions={transactions}
            categories={categories}
            pagination={pagination}
            loading={loadingTable}
            onFilterChange={(newFilters) => {
              setFilters((prev) => ({ ...prev, ...newFilters }));
            }}
            onEditTransaction={(tx) => {
              setEditingTx(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      </main>

      {/* Footer Dashboard */}
      <footer className="border-t border-[#1f2433] bg-[#090a0f] px-4 sm:px-8 py-4 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>&copy; 2024 Finance Ledger IDR</span>
            <span className="text-slate-600">&bull;</span>
            <span>
              Kritik dan saran ke{' '}
              <a
                href="https://instagram.com/jidan_211"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors"
              >
                ig@jidan_211
              </a>
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">Penyimpanan Data Lokal Mandiri &bull; Anti-AI Slop</span>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        editData={editingTx}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenCategories={() => setIsCatModalOpen(true)}
        onExportCsv={handleExportCsv}
        onSearch={(text) => {
          setFilters((prev) => ({ ...prev, search: text, page: 1 }));
        }}
      />
    </div>
  );
}
