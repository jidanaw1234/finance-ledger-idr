# Product Requirement Document (PRD)

**Project Name:** Personal Finance Tracker (Web & Telegram Bot)

**Status:** Draft / Ready for Development

**Target User:** Penggunaan Pribadi (Single User)

---

## 1. Project Overview & Objective

Membangun sistem pencatatan keuangan pribadi harian yang fleksibel dan tersentralisasi. Sistem ini memisahkan dua fungsi utama:

* **Telegram Bot:** Input transaksi kilat saat mobilitas tinggi dan query ringkasan cepat.
* **Web Dashboard:** Visualisasi data analitik, pelaporan, dan koreksi data transaksi detail.

---

## 2. System Architecture & Tech Stack

```text
[ Telegram App ]          [ Web Browser ]
       │                         │
       ▼                         ▼
 [ Telegram Bot ]         [ Web Dashboard ]
 (Webhook / Polling)      (Next.js / Vite React)
       │                         │
       └──────────┬──────────────┘
                  ▼
         [ Backend REST API ]
       (Node.js / Express / Fastify)
                  │
                  ▼
            [ Database ]
       (PostgreSQL / SQLite)

```

* **Backend & API:** Node.js (TypeScript) + Express/Fastify + Prisma ORM
* **Bot Engine:** `grammy` atau `telegraf`
* **Frontend Web:** Next.js / Vite React + Tailwind CSS + Lucide Icons + Chart.js / Recharts
* **Database:** PostgreSQL (atau SQLite untuk deployment lokal/self-hosted sederhana)

---

## 3. Database Schema

### Tabel: `categories`

| Field | Type | Constraint | Keterangan |
| --- | --- | --- | --- |
| `id` | SERIAL / UUID | PRIMARY KEY | ID unik kategori |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | Nama (makan, bensin, gaji, tagihan) |
| `type` | VARCHAR(10) | NOT NULL | `income` atau `expense` |
| `monthly_budget` | DECIMAL(12, 2) | NULLABLE | Batas anggaran bulanan (opsional) |

### Tabel: `transactions`

| Field | Type | Constraint | Keterangan |
| --- | --- | --- | --- |
| `id` | SERIAL / UUID | PRIMARY KEY | ID transaksi |
| `type` | VARCHAR(10) | NOT NULL | `income` atau `expense` |
| `amount` | DECIMAL(12, 2) | NOT NULL | Nominal transaksi |
| `category_id` | INT / UUID | FOREIGN KEY | Relasi ke `categories.id` |
| `description` | TEXT | NULLABLE | Catatan detail |
| `source` | VARCHAR(10) | NOT NULL | Asal input: `telegram` atau `web` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu pencatatan |

---

## 4. Functional Requirements

### 4.1. Telegram Bot Engine

* **FR-TG-01 (Security Whitelist):** Bot hanya merespons `telegram_user_id` yang terdaftar di file `.env`. Pesan dari ID lain langsung diabaikan.
* **FR-TG-02 (Input Parser):**
* Format Expense: `/out <nominal> <kategori> <keterangan>`
* Format Income: `/in <nominal> <kategori> <keterangan>`
* Dukungan suffix nominal: `k` / `rb` (ribu: $\times 1.000$) dan `m` / `jt` (juta: $\times 1.000.000$).


* **FR-TG-03 (Summary Commands):**
* `/hari_ini`: Menampilkan total pengeluaran dan pemasukan hari ini.
* `/bulan_ini` atau `/rekap`: Menampilkan total pemasukan, total pengeluaran, dan net cashflow bulan berjalan.
* `/cek <kategori>`: Menampilkan total pengeluaran untuk kategori tertentu pada bulan berjalan.


* **FR-TG-04 (Quick Undo):**
* Perintah `/batal`: Menghapus 1 transaksi terakhir yang di-input via Telegram.


* **FR-TG-05 (Cron Reminder):**
* Bot mengirim notifikasi otomatis setiap pukul 21:00 WIB jika belum ada transaksi keluar yang dicatat pada hari tersebut.



### 4.2. Web Dashboard

* **FR-WEB-01 (Metric Cards):** Menampilkan ringkasan bulan berjalan:
* Total Pemasukan
* Total Pengeluaran
* Net Balance (Pemasukan - Pengeluaran)


* **FR-WEB-02 (Data Visualization):**
* Donut/Pie Chart: Distribusi pengeluaran per kategori bulan ini.
* Bar/Line Chart: Tren pengeluaran harian dalam 30 hari terakhir.


* **FR-WEB-03 (Transaction Management):**
* Tabel riwayat transaksi dengan sorting tanggal/nominal dan live search teks.
* Filter multi-kriteria: Rentang tanggal (`start_date` s.d. `end_date`), tipe, dan kategori.
* Form input manual transaksi (tambah, edit, dan hapus data).


* **FR-WEB-04 (Category Management):** CRUD data kategori (tambah kategori baru atau ubah budget).
* **FR-WEB-05 (Data Export):** Tombol download data transaksi terfilter ke format CSV.

---

## 5. Non-Functional Requirements

* **Response Time Bot:** Bot membalas pesan maksimal 2 detik setelah perintah dikirim.
* **Data Consistency:** Transaksi yang dicatat via Telegram harus langsung muncul di Web Dashboard saat direfresh (atau via WebSocket jika realtime).
* **Environment Configuration:** Seluruh kredensial sensitif (`BOT_TOKEN`, `ALLOWED_USER_ID`, `DATABASE_URL`) wajib berada di `.env`.

---

# Task Breakdown & Implementation Roadmap

```text
[Phase 1: Database & Core API] ──▶ [Phase 2: Telegram Bot Engine]
                                           │
                                           ▼
[Phase 4: Deployment & Polish] ◀── [Phase 3: Frontend Dashboard]

```

### Phase 1: Database & Backend Core API

* [ ] **Task 1.1:** Setup repository proyek (Monorepo atau terpisah backend/frontend).
* [ ] **Task 1.2:** Inisialisasi database (PostgreSQL/SQLite) dan konfigurasi ORM (Prisma/SQLAlchemy).
* [ ] **Task 1.3:** Eksekusi migrasi tabel `categories` dan `transactions`.
* [ ] **Task 1.4:** Buat API CRUD Transaksi (`GET /api/transactions`, `POST`, `PUT`, `DELETE`).
* [ ] **Task 1.5:** Buat API Agregasi/Rekap:
* `GET /api/summary/monthly?month=MM&year=YYYY`
* `GET /api/summary/daily?date=YYYY-MM-DD`
* `GET /api/summary/by-category?month=MM&year=YYYY`


* [ ] **Task 1.6:** Buat API CRUD Kategori (`GET /api/categories`, `POST`, `PUT`, `DELETE`).
* [ ] **Task 1.7:** Buat endpoint `GET /api/export/csv`.

### Phase 2: Telegram Bot Service

* [ ] **Task 2.1:** Registrasi bot di `@BotFather` dan konfigurasi environment variables (`TELEGRAM_BOT_TOKEN`, `MY_TELEGRAM_ID`).
* [ ] **Task 2.2:** Buat middleware verifikasi keamanan: cek apakah `ctx.from.id === MY_TELEGRAM_ID`.
* [ ] **Task 2.3:** Buat utilitas parser string nominal (mengubah `25k` $\rightarrow 25000$, `1.5m` $\rightarrow 1500000$).
* [ ] **Task 2.4:** Implementasi command handler `/in` dan `/out` yang langsung terhubung ke database/service.
* [ ] **Task 2.5:** Implementasi command query `/hari_ini`, `/bulan_ini`, dan `/cek <kategori>`.
* [ ] **Task 2.6:** Implementasi command `/batal` (hapus transaksi terakhir ID user tersebut).
* [ ] **Task 2.7:** Setup node-cron untuk reminder otomatis harian pukul 21:00 WIB.

### Phase 3: Web Dashboard Frontend

* [ ] **Task 3.1:** Inisialisasi project frontend (Next.js atau Vite React + Tailwind CSS).
* [ ] **Task 3.2:** Integrasi library chart (Recharts atau Chart.js).
* [ ] **Task 3.3:** Buat komponen Metric Cards (Total Income, Total Expense, Net Balance).
* [ ] **Task 3.4:** Buat komponen Visualisasi Data (Donut Chart kategori & Bar Chart pengeluaran harian).
* [ ] **Task 3.5:** Buat tabel transaksi interaktif lengkap dengan fitur filter tanggal, search, dan pagination.
* [ ] **Task 3.6:** Buat modal form Tambah/Edit transaksi dan konfirmasi Hapus.
* [ ] **Task 3.7:** Buat halaman/modal manajemen kategori.
* [ ] **Task 3.8:** Pasang fungsi trigger export CSV.

### Phase 4: Integration, Testing & Deployment

* [ ] **Task 4.1:** Pengujian end-to-end: input data lewat bot $\rightarrow$ verifikasi data tampil akurat pada web chart.
* [ ] **Task 4.2:** Buat file `docker-compose.yml` untuk memaketkan Backend, Frontend, Database, dan Bot Runner.
* [ ] **Task 4.3:** Setup reverse proxy (Nginx / Cloudflare Tunnel / Caddy) untuk domain dashboard.
* [ ] **Task 4.4:** Konfigurasi Telegram Bot Webhook (atau polling mode via process manager seperti PM2/Docker restart policy).