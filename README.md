# Finance Ledger IDR (Personal Finance Tracker)

Aplikasi pencatatan keuangan pribadi (*Personal Finance & Expense Tracker*) tingkat lanjut dengan sistem **Multi-Kanal (Telegram Bot + Web Dashboard)** yang mengutamakan kecepatan entri data, tipografi tabular presisi (*tabular-nums*), serta estetika *Clean Fintech* (setara Mercury, Linear, dan Stripe).

---

## 🌟 Fitur Utama

* **Telegram Bot Engine (`@Antoniiiiibot`):**
  * Pencatatan kilat pengeluaran: `/out <nominal> <kategori> <keterangan>` (Mendukung akhiran `25k`, `50rb`, `1.5m`, `1.5jt`).
  * Pencatatan kilat pemasukan: `/in <nominal> <kategori> <keterangan>`.
  * Rekap & query instan: `/hari_ini`, `/bulan_ini`, `/rekap`, dan `/cek <kategori>`.
  * Quick undo: `/batal` untuk menghapus 1 transaksi terakhir Telegram.
  * Cron reminder otomatis setiap pukul 21:00 WIB jika belum ada pengeluaran yang dicatat.
  * *Security Whitelist* eksklusif hanya untuk ID Telegram pengelola.
* **Web Dashboard Antarmuka Presisi:**
  * **Login Portal (Single-User Gatekeeper):** Autentikasi pengelola mandiri dengan opsi sesi 30 hari.
  * **4 Kartu Metrik Finansial:** Total Pemasukan MoM, Pengeluaran & Utilisasi Budget %, Arus Kas Bersih Likuid, dan Rerata Beban Harian.
  * **Alokasi Pos Anggaran:** *Proportional multi-segment bar* horizontal berlabel warna fungsional dan matriks pos terurut.
  * **Daily Spending Histogram:** Grafik batang waktu 30 hari Recharts dengan sorotan otomatis untuk pengeluaran puncak (*peak spend anomaly*) dan toggle Harian/Mingguan.
  * **Buku Jurnal Transaksi:** Tabel interaktif dengan live-search debounce (150ms), filter tipe, filter kategori, badge kanal (`Web` vs `Telegram`), dan paginasi.
  * **Shortcut Keyboard:** Tekan `N` untuk entri transaksi cepat, `Ctrl+K` untuk Command Palette, `ESC` untuk menutup modal.
  * **Ekspor CSV:** Unduh seluruh data transaksi yang terfilter ke format spreadsheet.

---

## 🛠️ Tech Stack

* **Backend:** Node.js (TypeScript), Express.js, Prisma ORM, SQLite (`dev.db`), grammY (Telegram Bot Framework), node-cron.
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts.
* **Database:** SQLite (Self-hosted lokal/server mandiri, zero-configuration serverless).

---

## 🚀 Panduan Menjalankan di Home Server / Komputer Lokal

### 1. Kloning Repository
```bash
git clone <URL_REPOSITORY_ANDA>
cd "Website Catatan pengeluaran"
```

### 2. Setup Backend & Database
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Buat file `.env` dari contoh template:
   ```bash
   cp .env.example .env
   ```
3. Sesuaikan isi `backend/.env`:
   ```env
   PORT=4000
   DATABASE_URL="file:./dev.db"

   # Token Bot dari @BotFather di Telegram
   TELEGRAM_BOT_TOKEN="your_bot_token"
   TELEGRAM_ALLOWED_USER_ID=""

   # Akun Login Portal
   ADMIN_USERNAME="jidan"
   ADMIN_PASSWORD="jidanaw12"
   ```
4. Pasang dependensi dan inisialisasi database SQLite:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
5. Jalankan backend:
   * **Mode Development:**
     ```bash
     npm run dev
     ```
   * **Mode Production / Background (PM2 di Home Server):**
     ```bash
     npm run build
     npm install -g pm2
     pm2 start dist/server.js --name "finance-backend"
     ```

### 3. Setup Frontend Web Dashboard
1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Jalankan frontend:
   * **Mode Development:**
     ```bash
     npm run dev -- --host 0.0.0.0 --port 3000
     ```
   * **Mode Production Build (Nginx / Caddy / Serve):**
     ```bash
     npm run build
     # Sajikan folder dist/ menggunakan Nginx atau web server pilihan Anda
     ```

---

## 🔐 Kredensial Bawaan Login Portal

* **Username:** `jidan`
* **Password:** `jidanaw12`
*(Dapat disesuaikan kapan saja lewat file `backend/.env`)*

---

## 📄 Lisensi
Hak cipta dilindungi. Penggunaan pribadi mandiri.

