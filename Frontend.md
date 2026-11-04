# Product Requirements Document (PRD) & Project Brief

**Project Name:** Finance Ledger IDR (Personal Expense & Income Tracker)  
**Version:** 1.0.0  
**Target Platform:** Web (Desktop & Responsive Mobile)  
**Target Audience:** Personal financial planners, tech-savvy professionals, freelancers seeking high-density, no-fluff financial tracking.  
**Tech Stack Baseline:** Next.js / React, Tailwind CSS, Lucide Icons, REST API Backend.

---

## 1. Executive Summary & Vision

### 1.1 Objective
Membangun antarmuka pelacak keuangan pribadi (*Personal Finance & Expense Tracker*) berbasis web yang mengutamakan kecepatan entri data, densitas informasi yang presisi (*high information density*), serta estetika *clean fintech* setara Mercury, Stripe, dan Linear. Sistem dirancang untuk siap dihubungkan langsung ke backend REST API kustom milik pengguna.

### 1.2 Problem Statement
Kebanyakan aplikasi pelacak pengeluaran personal memiliki masalah:
- Tampilan terlalu dekoratif / kartunis (*AI slop* / visual permen neon) yang menyulitkan pembacaan data cepat.
- Entri data lambat dan tidak fleksibel (minim dukungan integrasi multi-kanal seperti Telegram bot).
- Format mata uang dan konvensi akuntansi lokal (IDR / Rupiah) sering kali tidak presisi atau canggung.

### 1.3 Key Principles
- **Clarity over Clutter:** Mengutamakan tipografi tabular, kontras tinggi, dan whitespace terukur daripada visualisasi dekoratif berlebihan.
- **API-First Architecture:** Setiap komponen UI dirancang berkorespondensi 1:1 dengan struktur payload JSON API (`/api/transactions`, `/api/categories`, `/api/metrics`).
- **Omnichannel Data Ingestion:** Mendukung penandaan sumber input (Web manual entry & Telegram bot auto-sync).

---

## 2. Core User Persona

| Attribute | Details |
| :--- | :--- |
| **Persona** | Budi Pratama (Tech Professional / Freelance Designer) |
| **Needs** | Mencatat pengeluaran harian cepat, memantau *cashflow* bulanan, memantau alokasi budget pos pengeluaran, serta mengekspor data ke format CSV / spreadsheet. |
| **Pain Points** | Form entri yang panjang, loading dashboard yang berat, grafik visual yang sulit diinterpretasikan. |
| **Usage Pattern** | Cek dashboard harian via web desktop; catat transaksi *on-the-go* via integrasi bot Telegram. |

---

## 3. Product Architecture & Scope

```
+------------------------------------------------------------------------+
|                          Finance Tracker Web App                       |
+------------------------------------------------------------------------+
|  Top Navigation Bar (Global Period Filter, Search ⌘K, User Profile)   |
+------------------------------------------------------------------------+
|  Metric KPI Summary Cards (Pemasukan, Pengeluaran, Net Cashflow, Rate) |
+------------------------------------------------------------------------+
|  Analytics Grid:                                                       |
|  - Pos Breakdown (Proportional Strip + Category Matrix)                |
|  - Daily Expense Histogram (Time-series spending cadence)              |
+------------------------------------------------------------------------+
|  Transaction Ledger:                                                   |
|  - Realtime Search, Multi-Filter (Semua/Keluar/Masuk), Category Pill   |
|  - Data Table: Tanggal, Deskripsi, Kategori, Kanal, Nominal, Actions   |
|  - Monospace Numbers & Pagination Control                              |
+------------------------------------------------------------------------+
|  Modals & Interactive Overlays:                                        |
|  - Tambah/Edit Transaksi (Quick Entry Modal)                           |
|  - Kelola Kategori (Category Allocation Manager)                       |
+------------------------------------------------------------------------+
```

---

## 4. Functional Specifications & Modules

### Module 1: Global Navigation & Controls
- **Brand Emblem & Ledger Title:** Menampilkan status sinkronisasi (*Tersinkronisasi*) dan nama buku kas (*Buku Kas Utama*).
- **Date Range Picker:** Pilihan dropdown bulan/tahun (Default: `Mei 2024`) dengan periode penutupan buku kas.
- **Global Actions:**
  - `Ekspor CSV`: Mengunduh data transaksi filter aktif ke file `.csv`.
  - `Pos Kategori`: Membuka modal/drawer kelola kategori & pagu anggaran.
  - `+ Tambah Entri` (`Shortcut: N`): Membuka modal entri transaksi cepat.
  - `Search Modal (⌘K)`: Navigasi cepat dan pencarian global.

### Module 2: Metric KPI Cards
1. **Total Pemasukan (Total Income):**
   - Menampilkan total pemasukan dalam IDR (misal: `Rp 18.500.000`).
   - Indikator perbandingan MoM (misal: `+12.5%`).
   - Komposisi sumber pendapatan (Gaji pokok vs Freelance).
2. **Total Pengeluaran (Total Expenses):**
   - Menampilkan realisasi belanja (misal: `Rp 7.820.000`).
   - Utilisasi terhadap pagu/plafon bulanan (misal: `43.4% budget`).
   - Sisa pagu belanja aman (misal: `Sisa Rp 10.18M`).
3. **Arus Kas Bersih (Net Cashflow / Balance):**
   - Nominal surplus/defisit bersih: `+Rp 10.680.000`.
   - Rasio tabungan riil vs target (misal: `57.7% (Target >30%)`).
4. **Rerata Beban Harian (Daily Burn Rate):**
   - Rata-rata belanja harian terhitung (misal: `Rp 558.571/hari`).
   - Proyeksi pengeluaran hingga akhir bulan kalender.

### Module 3: Visualisasi Data & Analisis
1. **Alokasi Berdasarkan Pos (Category Breakdown):**
   - Strip proporsional horizontal (*multi-segment bar*) berwarna fungsional.
   - Daftar pos pengeluaran dengan persentase dan nominal terurut dari yang terbesar:
     - Makanan & Minuman
     - Tagihan & Utilitas
     - Transportasi
     - Belanja & Kebutuhan
     - Hiburan & Langganan
   - Metrik kapasitas belanja harian aman tersisa (*Safe Daily Spend Limit*).
2. **Tren Pengeluaran Harian (Daily Spending Histogram):**
   - Bar chart harian (1–31 hari) dengan pembeda warna untuk hari puncak (*Peak spend anomaly highlight*).
   - Toggle tampilan: `Harian` vs `Mingguan`.
   - Informasi tooltip dan baseline rata-rata pengeluaran.

### Module 4: Tabel Buku Transaksi (Ledger Table)
- **Filtering & Search Bar:**
  - Input pencarian berbasis teks bebas (pencarian instan pada deskripsi/vendor).
  - Segmented control status tipe: `Semua`, `Keluar`, `Masuk`.
  - Dropdown filter: Pos Kategori & Kanal Sumber (`Semua Sumber`, `Web`, `Telegram`).
- **Data Columns:**
  - `TANGGAL`: Format standar Indonesia (e.g. `14 Mei 2024`).
  - `DESKRIPSI / VENDOR`: Nama vendor atau keterangan transaksi.
  - `KATEGORI`: Pos alokasi anggaran dengan penanda warna pos.
  - `KANAL`: Sumber pencatatan (`Web` / `Telegram`).
  - `NOMINAL (IDR)`: Nominal angka dengan font monospace/tabular-nums (Hijau untuk kredit, Hitam/Netral untuk debit).
  - `KELOLA`: Tombol aksi cepat (Edit & Hapus baris).
- **Pagination:** Kontrol halaman presisi (`Prev`, nomor halaman aktif, `Next`) dengan indikator jumlah baris ditampilkan.

---

## 5. Data Models & REST API Contracts

### 5.1 Transaction Entity (`/api/transactions`)
```json
{
  "id": "tx_98234812",
  "date": "2024-05-14T12:30:00Z",
  "type": "EXPENSE",
  "category_id": "cat_fnb",
  "category_name": "Makanan & Minuman",
  "description": "Makan Siang Tim Senopati",
  "source": "WEB",
  "amount": 285000,
  "currency": "IDR",
  "notes": "Metode pembayaran kartu debit",
  "created_at": "2024-05-14T12:31:00Z"
}
```

### 5.2 Category Budget Entity (`/api/categories`)
```json
{
  "id": "cat_fnb",
  "name": "Makanan & Minuman",
  "color": "#f59e0b",
  "monthly_budget": 3500000,
  "current_spent": 2850000,
  "percentage": 36.4
}
```

### 5.3 Monthly Summary Metrics (`/api/metrics/summary?month=2024-05`)
```json
{
  "period": "2024-05",
  "currency": "IDR",
  "total_income": 18500000,
  "total_expense": 7820000,
  "net_cashflow": 10680000,
  "savings_rate_pct": 57.7,
  "budget_limit": 18000000,
  "budget_used_pct": 43.4,
  "daily_average_expense": 558571,
  "safe_daily_spend_limit": 339333
}
```

---

## 6. Non-Functional Requirements & Design Principles

1. **Information Density & Typography:**
   - Font: Geist / Inter / SF Pro Display.
   - Angka keuangan wajib menggunakan `font-variant-numeric: tabular-nums` untuk menjaga kerapian kolom angka IDR.
2. **Responsiveness:**
   - Desktop (>= 1024px): Layout 2-kolom analitik, tabel penuh.
   - Mobile / Tablet (< 768px): Kolom metriks bertumpuk (*stacked cards*), horizontal scrolling pada tabel atau transformasi menjadi card view baris transaksi.
3. **Performance:**
   - Waktu render halaman pertama (*First Contentful Paint*) < 1.0 detik.
   - Filter dan pencarian tabel dilakukan dengan *client-side debounce* (150ms).
4. **Keamanan & Data Privacy:**
   - Endpoint terproteksi JWT / API Token header (`Authorization: Bearer <TOKEN>`).
   - Tidak ada transmisi data finansial mentah ke pihak ketiga tanpa izin pengguna.

---

## 7. Roadmap & Next Phases

- **Phase 1 (Current):** Dashboard Web Frontend & Mock Data State Integration (Selesai).
- **Phase 2:** Koneksi REST API Backend & Endpoint Auth/CRUD.
- **Phase 3:** Integrasi Webhook Telegram Bot untuk entri pengeluaran otomatis via chat (`/keluar 25000 Makan siang`).
- **Phase 4:** Fitur multi-akun / multi-rekening (BCA, Mandiri, Jenius, GoPay, OVO).
