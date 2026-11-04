import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { AuthUser } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

type UIPreviewMode = 'normal' | 'loading' | 'error' | 'success';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Form state
  const [username, setUsername] = useState('jidan');
  const [password, setPassword] = useState('jidanaw12');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Runtime status state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Interactive UI Preview Switcher (Sesuai Modul A.2 PRD)
  const [previewMode, setPreviewMode] = useState<UIPreviewMode>('normal');

  // Handle Switcher UI Preview
  const handlePreviewModeChange = (mode: UIPreviewMode) => {
    setPreviewMode(mode);
    if (mode === 'normal') {
      setLoading(false);
      setErrorMessage('');
      setSuccessMessage('');
    } else if (mode === 'loading') {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
    } else if (mode === 'error') {
      setLoading(false);
      setErrorMessage('Kredensial tidak valid. Periksa kembali username dan kata sandi Anda.');
      setSuccessMessage('');
    } else if (mode === 'success') {
      setLoading(false);
      setErrorMessage('');
      setSuccessMessage('Autentikasi terverifikasi. Mengalihkan ke Buku Kas Utama...');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await api.login({
        username: username.trim(),
        password,
        remember_session: rememberSession,
      });

      setSuccessMessage('Autentikasi terverifikasi. Mengalihkan ke Buku Kas Utama...');

      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Kredensial tidak valid. Periksa username dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDefault = () => {
    setUsername('jidan');
    setPassword('jidanaw12');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar Identitas Sistem (Selaras 1:1 dengan Navbar Utama) */}
      <header className="border-b border-[#1f2433] bg-[#090a0f]/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-white">Finance Ledger IDR</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Node Lokal</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">Sistem Buku Kas Pribadi &bull; Single User Gatekeeper</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Mata Uang: <strong className="text-slate-200">IDR (Rp)</strong></span>
            <span className="text-slate-600">|</span>
            <span>Versi: <strong className="text-slate-200">v2.4.0</strong></span>
          </div>
        </div>
      </header>

      {/* Main Center Form Area */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-[420px] space-y-4">
          {/* Uji Status UI Interaktif (Segmented Control ala Ledger Table) */}
          <div className="flex items-center justify-between bg-[#12141c] border border-[#1f2433] rounded-lg p-1.5 text-xs">
            <span className="text-[11px] font-medium text-slate-400 pl-2">
              Uji Status UI:
            </span>
            <div className="flex items-center bg-[#090a0f] p-0.5 rounded-md border border-[#1f2433]">
              {(
                [
                  { id: 'normal', label: 'Normal' },
                  { id: 'loading', label: 'Memuat' },
                  { id: 'error', label: 'Galat' },
                  { id: 'success', label: 'Sukses' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handlePreviewModeChange(s.id)}
                  className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                    previewMode === s.id
                      ? 'bg-[#1f2433] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Login Card (Fintech Monochromatic Structure) */}
          <div className="rounded-xl bg-[#12141c] border border-[#1f2433] p-5 sm:p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Autentikasi Pengelola</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Masukkan kredensial pengelola buku kas untuk membuka sesi dashboard.
              </p>
            </div>

            {/* Alert Status Banners */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Akses Ditolak</p>
                  <p className="text-[11px] text-rose-300 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-200">Autentikasi Terverifikasi</p>
                  <p className="text-[11px] text-emerald-300 mt-0.5">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Username Pengelola</label>
                  <button
                    type="button"
                    onClick={handleAutofillDefault}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 font-mono transition-colors"
                  >
                    Pakai Akun Default
                  </button>
                </div>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="jidan"
                    required
                    className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 font-mono placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Kunci Akses / Sandi</label>
                  <span className="text-[10px] text-slate-500 font-mono">SHA-256</span>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#090a0f] border border-[#1f2433] rounded-lg pl-9 pr-9 py-2 text-xs text-slate-200 font-mono placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#1f2433] bg-[#090a0f] text-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px]">Ingat sesi di perangkat ini</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">30 Hari Sesi</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 border border-emerald-400/20 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memverifikasi Sesi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Buku Kas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-[#1f2433] flex items-center justify-between text-[11px] text-slate-400">
              <span>Akun Default:</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-[#090a0f] border border-[#1f2433] text-slate-300 text-[10px]">
                  jidan
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#090a0f] border border-[#1f2433] text-slate-300 text-[10px]">
                  jidanaw12
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimalis Bersih */}
      <footer className="border-t border-[#1f2433] bg-[#090a0f] px-4 sm:px-8 py-3 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2024 Finance Ledger IDR. Hak cipta dilindungi.</span>
          <span className="font-mono text-[11px]">Penyimpanan Data Lokal Mandiri &bull; Anti-AI Slop</span>
        </div>
      </footer>
    </div>
  );
};
