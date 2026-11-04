web application/stitch/projects/8826290163433072329/screens/b7059cbf6efe45f4be0a2fbbad659d9b
# Product Requirements Document (PRD) & Technical Brief

**Nama Proyek:** Finance Ledger IDR (Sistem Buku Kas Pribadi & Pelacak Finansial)  
**Versi:** 2.4.0 (Production-Ready Spec)  
**Status:** Baseline UI Selesai — Siap Integrasi Backend REST API & Webhook Telegram  
**Platform Target:** Web Application (Desktop & Mobile Responsive)  
**Arsitektur & Tech Stack:** Next.js / React, Tailwind CSS, Lucide Icons, SQLite Backend / REST API.

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
**Finance Ledger IDR** adalah platform pembukuan dan pemantau arus kas (*cashflow tracker*) personal tingkat lanjut yang mengedepankan **densitas data presisi (*high information density*)**, kecepatan input, dan estetika *clean fintech* setara produk kelas dunia (Mercury, Linear, Stripe). Aplikasi ini dirancang untuk menghilangkan ornamen visual berlebihan (*anti-AI slop*) demi menyajikan visibilitas finansial yang jujur, cepat, dan terpercaya bagi pengguna mandiri.

### 1.2 Masalah yang Diselesaikan (Problem Statement)
1. **Visual Terlalu Dekoratif & Lambat:** Aplikasi pencatat keuangan umum sering kali dipenuhi grafis kartunis atau chart permen pastel yang tidak efisien dalam menampilkan nominal angka secara cepat.
2. **Keterbatasan Input Multikanal:** Pencatatan manual sering terabaikan saat *mobile*. Diperlukan dukungan sinkronisasi langsung antara dashboard web dan bot Telegram.
3. **Format Mata Uang Tidak Standar:** Ketidaksesuaian pembacaan angka Rupiah (IDR) tanpa perataan desimal (*tabular numbers*) yang rapi menyulitkan audit pengeluaran cepat.
4. **Sistem Penguncian Terlalu Kompleks:** Kebutuhan sistem pembukuan personal adalah *single-user gatekeeper* yang terenkripsi dan ringan, bukan alur pendaftaran publik yang rumit.

### 1.3 Prinsip Desain Inti
- **Presisi Angka Tabular:** Seluruh angka menggunakan font *monospace/tabular-nums* (`font-variant-numeric: tabular-nums`) untuk menjaga kerapian pembacaan finansial.
- **Kerapian Antarmuka (No AI-Slop):** Palet monokromatik netral (*zinc/slate*), kontras tinggi, border halus, serta penanda status fungsional (*emerald/rose*).
- **API-First & State-Ready:** Setiap komponen UI berkorespondensi 1:1 dengan struktur payload JSON API (`/api/transactions`, `/api/categories`, `/api/auth/session`, `/api/metrics`).

---

## 2. Persona Pengguna & Alur Kerja

| Atribut | Detail |
| :--- | :--- |
| **Persona Utama** | **Budi Pratama** (Tech Professional / Freelancer / Financial Optimizer) |
| **Peran** | Single Admin / Pengelola Mandiri Buku Kas |
| **Kebiasaan Input** | • Di meja kerja: Membuka dashboard desktop untuk evaluasi bulanan, alokasi pos anggaran, dan ekspor data.<br>• Di luar ruangan: Mencatat transaksi instan via pesan Telegram (`/keluar 45000 Makan siang`). |
| **Sasaran Kunci** | Menjaga rasio tabungan (*net savings rate*) di atas 30%, memantau batas aman belanja harian (*safe daily spend limit*), dan mengamankan rekonsiliasi data kas secara lokal. |

---

## 3. Arsitektur Informasi & Layar Antarmuka

```
+---------------------------------------------------------------------------------+
|                               FINANCE LEDGER IDR                                |
+---------------------------------------------------------------------------------+
|  1. Halaman Login Portal (Single-User Gatekeeper)                               |
|     - Header Identitas & Status Sinkronisasi                                    |
|     - Form Autentikasi Pengelola (Username, SHA-256 Key, Eye Toggle)            |
|     - Telemetri Sistem Lokal (SQLite Latency: 1.2ms, Telegram Bot Sync Active)  |
|     - Switcher Pratinjau Status (Normal, Memuat, Galat, Sukses)                 |
+---------------------------------------------------------------------------------+
                                      │ (Autentikasi Berhasil)
                                      ▼
+---------------------------------------------------------------------------------+
|  2. Halaman Dashboard Finansial Utama (Buku Kas Utama)                          |
|     - Top Bar: Brand ID, Periode Aktif (Mei 2024), ⌘K Search, User Profile      |
|     - Aksi Cepat: Ekspor CSV, Kelola Pos Kategori, + Tambah Transaksi           |
|     - Baris Metrik Ringkasan:                                                   |
|       • Total Pemasukan (+12.5% MoM, Komposisi Gaji Pokok vs Freelance)         |
|       • Total Pengeluaran (43.4% Budget, Sisa Plafon Rp 10.18M)                 |
|       • Arus Kas Bersih (+Rp 10.680.000, Rasio Tabungan 57.7% Surplus)          |
|       • Rerata Beban Harian (Rp 558.571/hari, Proyeksi Penutupan)               |
|     - Grid Analitik 2-Kolom:                                                    |
|       • Alokasi Pos Anggaran: Proportional strip horizontal & matriks pos       |
|       • Tren Pengeluaran Harian: Histogram time-series dengan highlight puncak  |
|     - Tabel Transaksi Lengkap:                                                  |
|       • Filter Cepat (Semua / Keluar / Masuk), Dropdown Kategori & Kanal        |
|       • Kolom: Tanggal, Deskripsi/Vendor, Kategori, Kanal, Nominal IDR, Aksi    |
|       • Paginasi Presisi                                                        |
+---------------------------------------------------------------------------------+
```

---

## 4. Spesifikasi Fungsional Per Modul

### Modul A: Gerbang Akses & Keamanan (Login Portal)
1. **Otentikasi Pengelola Mandiri:**
   - Input username unik pengelola (`budi.pratama`).
   - Input kunci akses / kata sandi dengan toggle visibilitas sandi (*show/hide*).
   - Opsi persisten *"Ingat sesi di perangkat ini"*.
   - CTA utama *"Masuk ke Buku Kas"* dengan indikator status memuat (*loading spinner*).
2. **Uji Status UI Interaktif:**
   - Menyediakan pengujian status instan di sisi antarmuka: **Normal**, **Memuat (Loading)**, **Galat (Error Alert Banner)**, dan **Sukses**.
3. **Telemetri Sistem Node Lokal:**
   - Menampilkan status koneksi SQLite DB (`Connected - 1.2ms`).
   - Menampilkan status bot sinkronisasi Telegram (`@FinanceLedgerBot: Active`).
   - Penanda target katalog data lokal (`ledger_idr_2024.db`).

### Modul B: Navigasi Global & Kontrol Periode
- **Identitas & Status:** Logo mark `ID Finance / Ledger`, pill status `Tersinkronisasi`, dan tag mata uang `IDR (Rp)`.
- **Selector Periode:** Dropdown pemilihan periode buku kas bulanan (Default: `Mei 2024`).
- **Aksi Cepat:**
  - `Ekspor CSV`: Unduh otomatis seluruh rekaman buku kas yang terfilter.
  - `Pos Kategori`: Akses cepat modal pengaturan pos dan plafon anggaran.
  - `+ Tambah Entri (Shortcut: N)`: Pembuka modal entri transaksi cepat.
  - `Cari Data (⌘K)`: Modal pencarian instan seluruh deskripsi, vendor, dan catatan.

### Modul C: Kartu Indikator Finansial (Metric KPI Summary)
1. **Total Pemasukan (Total Income):**
   - Nilai: `Rp 18.500.000` (+12.5% vs bulan lalu).
   - Rasio sumber: Gaji Pokok (81%) dan Freelance (19%).
2. **Total Pengeluaran (Total Expenses):**
   - Nilai: `Rp 7.820.000` (43.4% dari plafon Rp 18.000.000).
   - Indikator sisa pagu belanja: `Sisa Rp 10.18M`.
3. **Arus Kas Bersih (Net Cashflow / Balance):**
   - Nilai: `+Rp 10.680.000` (Surplus likuid).
   - Rasio tabungan riil: `57.7%` (melampaui target minimum >30%).
4. **Rerata Beban Harian (Daily Burn Rate):**
   - Nilai: `Rp 558.571/hari`.
   - Proyeksi pengeluaran hingga akhir bulan berjalan: `Rp 17.3M`.

### Modul D: Visualisasi Alokasi & Tren Pengeluaran
1. **Alokasi Berdasarkan Pos (Category Breakdown):**
   - Visualisasi *horizontal proportional strip* yang terbagi proporsional berdasarkan realisasi belanja.
   - Matriks kategori terurut:
     - Makanan & Minuman (`36.4%` - `Rp 2.850.000`)
     - Tagihan & Utilitas (`24.9%` - `Rp 1.950.000`)
     - Transportasi (`14.7%` - `Rp 1.150.000`)
     - Belanja & Kebutuhan (`14.3%` - `Rp 1.120.000`)
     - Hiburan & Langganan (`9.6%` - `Rp 750.000`)
   - Indikator *Kapasitas Belanja Aman*: `Rp 339.333 / hari sisa`.
2. **Histogram Pengeluaran Harian (Daily Spending Histogram):**
   - Grafik batang waktu 1–31 Mei 2024 dengan baseline rata-rata harian.
   - Pembeda visual kontras gelap untuk pengeluaran puncak anomali: `10 Mei — Servis Berkala Mobil Toyota (Rp 850.000)`.
   - Toggle tampilan: `Harian` vs `Mingguan`.

### Modul E: Buku Kas Transaksi (Ledger Table)
- **Kontrol Filter & Pencarian:**
  - Live filter pencarian teks bebas (deskripsi transaksi & vendor).
  - Segmented control status tipe transaksi: `Semua`, `Keluar`, `Masuk`.
  - Dropdown filter multi-dimensi: Pos Kategori & Kanal Sumber (`Semua Sumber`, `Web`, `Telegram`).
- **Skema Kolom:**
  - `TANGGAL`: Format standar Indonesia (e.g., `14 Mei 2024`).
  - `DESKRIPSI / VENDOR`: Nama vendor/keperluan transaksi.
  - `KATEGORI`: Pos anggaran dengan penanda titik warna fungsional.
  - `KANAL`: Sumber pencatatan (`Web` / `Telegram`).
  - `NOMINAL (IDR)`: Format angka bertanda (`-Rp` untuk debit/pengeluaran, `+Rp` hijau untuk kredit/pemasukan).
  - `KELOLA`: Akses cepat aksi baris (Sunting & Hapus).
- **Paginasi:** Kontrol halaman presisi (`Prev`, nomor halaman aktif, `Next`) dengan indikator jumlah baris terdata.

---

## 5. Kontrak Data & Skema REST API Backend

### 5.1 Endpoint Autentikasi (`POST /api/auth/login`)
```json
{
  "username": "budi.pratama",
  "password_hash": "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "remember_session": true
}
```
**Respons Sukses (200 OK):**
```json
{
  "status": "authenticated",
  "token": "fl_token_77a91c89012fbc29",
  "expires_in": 2592000,
  "user": {
    "name": "Budi Pratama",
    "email": "bp@pratama.id",
    "role": "admin"
  },
  "database": {
    "filename": "ledger_idr_2024.db",
    "latency_ms": 1.2
  },
  "telegram_bot": {
    "handle": "@FinanceLedgerBot",
    "status": "active"
  }
}
```

### 5.2 Endpoint Transaksi (`/api/transactions`)
- **GET `/api/transactions?month=2024-05&type=ALL&channel=ALL&search=`**
```json
[
  {
    "id": "tx_20240514_01",
    "date": "2024-05-14",
    "type": "EXPENSE",
    "category": "Makanan & Minuman",
    "category_code": "fnb",
    "vendor": "Makan Siang Tim Senopati",
    "channel": "Web",
    "amount": 285000,
    "currency": "IDR"
  },
  {
    "id": "tx_20240512_01",
    "date": "2024-05-12",
    "type": "INCOME",
    "category": "Freelance",
    "category_code": "freelance",
    "vendor": "Freelance UI/UX Mobile Redesign SG",
    "channel": "Telegram",
    "amount": 3500000,
    "currency": "IDR"
  }
]
```

### 5.3 Endpoint Ringkasan Metrik (`GET /api/metrics/summary?month=2024-05`)
```json
{
  "period": "2024-05",
  "total_income": 18500000,
  "total_expense": 7820000,
  "net_cashflow": 10680000,
  "savings_rate_pct": 57.7,
  "budget_limit": 18000000,
  "daily_average_expense": 558571,
  "safe_daily_spend_limit": 339333,
  "peak_expense": {
    "date": "2024-05-10",
    "description": "Servis Berkala Mobil Toyota",
    "amount": 850000
  }
}
```

### 5.4 Webhook Bot Telegram (`POST /api/webhooks/telegram`)
Payload integrasi bot untuk mencatat transaksi instan secara otomatis melalui chat:
```json
{
  "update_id": 98127391,
  "message": {
    "from": { "id": 10928371, "username": "budipratama" },
    "text": "/keluar 225000 Bensin Pertamax Shell Sudirman",
    "date": 1715682000
  }
}
```

---

## 6. Persyaratan Non-Fungsional & Kualitas Sistem

1. **Tipografi & Standar Tampilan IDR:**
   - Standar penulisan nominal mata uang Indonesia: Titik sebagai pemisah ribuan, tanpa desimal sen (`Rp 18.500.000`).
   - Penegakan CSS tabular: `font-variant-numeric: tabular-nums` dan tracking proporsional untuk mencegah pergeseran angka saat filter berubah.
2. **Kecepatan & Kinerja (Performance):**
   - *First Contentful Paint (FCP)* < 800ms pada koneksi broadband standar.
   - Filter dan pencarian tabel lokal menggunakan *client-side debounce* (150ms).
3. **Privasi & Keamanan Mandiri:**
   - Seluruh data transaksi tersimpan di database lokal pengguna (*self-hosted SQLite*).
   - Akses API dilindungi oleh Bearer Token Header (`Authorization: Bearer <TOKEN>`).
   - Tidak ada pengiriman data telemetri finansial ke layanan analitik pihak ketiga tanpa enkripsi.

---

## 7. Roadmap Implementasi Tahap Lanjut

- **Fase 1 (Selesai):** Desain UI High-Fidelity Dashboard Utama & Login Portal (*Clean Fintech Standard*).
- **Fase 2 (Berikutnya):** Setup REST API backend (Next.js App Router / Fastify) dengan persistensi SQLite lokal.
- **Fase 3:** Implementasi Webhook Telegram Bot untuk penguraian pesan cerdas (*NLP parser* pengeluaran).
- **Fase 4:** Modul Rekonsiliasi Multi-Rekening (BCA, Mandiri, Jenius, GoPay, OVO) dan fitur ekspor laporan bulanan PDF terenkripsi.
