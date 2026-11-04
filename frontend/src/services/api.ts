import {
  MetricSummary,
  Transaction,
  Category,
  Pagination,
  AuthUser,
  SystemTelemetry,
  LoginResult,
} from '../types';

const BASE_URL = '/api';

const TOKEN_KEY = 'finance_ledger_token';
const USER_KEY = 'finance_ledger_user';

export const api = {
  // Auth Storage Helpers
  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setAuthSession(token: string, user: AuthUser, remember: boolean) {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Auth Endpoints
  async getTelemetry(): Promise<SystemTelemetry> {
    const res = await fetch(`${BASE_URL}/auth/telemetry`);
    if (!res.ok) throw new Error('Gagal mengambil telemetri sistem');
    return res.json();
  },

  async login(payload: {
    username: string;
    password?: string;
    password_hash?: string;
    remember_session?: boolean;
  }): Promise<LoginResult> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Autentikasi gagal. Periksa username dan kata sandi.');
    }

    const data: LoginResult = await res.json();
    this.setAuthSession(data.token, data.user, !!payload.remember_session);
    return data;
  },

  async getSession(): Promise<{ status: string; user?: AuthUser; telemetry?: SystemTelemetry }> {
    const token = this.getStoredToken();
    if (!token) {
      return { status: 'unauthenticated' };
    }

    const res = await fetch(`${BASE_URL}/auth/session`, {
      headers: this.getAuthHeaders(),
    });

    if (!res.ok) {
      this.clearAuthSession();
      return { status: 'unauthenticated' };
    }

    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } finally {
      this.clearAuthSession();
    }
  },

  // Metrics
  async getMetrics(month: string): Promise<MetricSummary> {
    const res = await fetch(`${BASE_URL}/metrics/summary?month=${month}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil data metrik');
    return res.json();
  },

  // Transactions
  async getTransactions(params: {
    month?: string;
    type?: string;
    categoryId?: string;
    source?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Transaction[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params.month) query.set('month', params.month);
    if (params.type && params.type !== 'ALL') query.set('type', params.type);
    if (params.categoryId && params.categoryId !== 'ALL') query.set('categoryId', params.categoryId);
    if (params.source && params.source !== 'ALL') query.set('source', params.source);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${BASE_URL}/transactions?${query.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil data transaksi');
    return res.json();
  },

  async createTransaction(payload: {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    categoryId: string;
    description: string;
    source?: string;
    date?: string;
  }): Promise<Transaction> {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal membuat transaksi');
    }
    return res.json();
  },

  async updateTransaction(
    id: string,
    payload: Partial<{
      type: 'INCOME' | 'EXPENSE';
      amount: number;
      categoryId: string;
      description: string;
      source?: string;
      date?: string;
    }>
  ): Promise<Transaction> {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memperbarui transaksi');
    }
    return res.json();
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus transaksi');
  },

  // Categories
  async getCategories(month?: string): Promise<Category[]> {
    const query = month ? `?month=${month}` : '';
    const res = await fetch(`${BASE_URL}/categories${query}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil kategori');
    const json = await res.json();
    return json.data;
  },

  async createCategory(payload: {
    name: string;
    type: 'INCOME' | 'EXPENSE';
    color: string;
    monthly_budget: number | null;
  }): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal membuat kategori');
    }
    return res.json();
  },

  async updateCategory(
    id: string,
    payload: {
      name?: string;
      type?: 'INCOME' | 'EXPENSE';
      color?: string;
      monthly_budget?: number | null;
    }
  ): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memperbarui kategori');
    }
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus kategori');
  },

  // Export CSV URL
  getExportCsvUrl(params: {
    month?: string;
    type?: string;
    categoryId?: string;
    source?: string;
    search?: string;
  }): string {
    const query = new URLSearchParams();
    if (params.month) query.set('month', params.month);
    if (params.type && params.type !== 'ALL') query.set('type', params.type);
    if (params.categoryId && params.categoryId !== 'ALL') query.set('categoryId', params.categoryId);
    if (params.source && params.source !== 'ALL') query.set('source', params.source);
    if (params.search) query.set('search', params.search);
    return `${BASE_URL}/export/csv?${query.toString()}`;
  },
};
