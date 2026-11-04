export interface Transaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category_id: string;
  category_name: string;
  category_color?: string;
  description: string;
  source: 'WEB' | 'TELEGRAM';
  amount: number;
  currency: 'IDR';
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  monthly_budget: number | null;
  current_spent?: number;
  percentage?: number;
}

export interface MetricSummary {
  period: string;
  currency: string;
  total_income: number;
  total_expense: number;
  net_cashflow: number;
  savings_rate_pct: number;
  budget_limit: number;
  budget_used_pct: number;
  daily_average_expense: number;
  safe_daily_spend_limit: number;
  mom_income_pct: number | null;
  mom_expense_pct: number | null;
  daily_histogram: {
    day: number;
    date: string;
    amount: number;
    isPeak: boolean;
  }[];
  category_breakdown: {
    id: string;
    name: string;
    color: string;
    amount: number;
    percentage: number;
    budget: number | null;
  }[];
  income_sources: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthUser {
  name: string;
  username: string;
  email: string;
  role: string;
}

export interface SystemTelemetry {
  database: {
    status: string;
    filename: string;
    latency_ms: number;
  };
  telegram_bot: {
    handle: string;
    status: string;
  };
}

export interface LoginResult {
  status: string;
  token: string;
  expires_in: number;
  user: AuthUser;
  database: {
    status: string;
    filename: string;
    latency_ms: number;
  };
  telegram_bot: {
    handle: string;
    status: string;
  };
}
