# 🚀 Project Blueprint: Personal Finance Tracker

## 1. Project Overview
* **App Name**: FinTrack (atau nama pilihan Anda)
* **Description**: Aplikasi pencatatan keuangan pribadi (pemasukan & pengeluaran) dengan fitur analitik dasar.
* **Tech Stack**:
  * **Framework**: Next.js (App Router)
  * **UI/Styling**: React, Tailwind CSS v4 (menggunakan konfigurasi CSS-based modern dari v4)
  * **Backend/BaaS**: Supabase (PostgreSQL, Authentication, Row Level Security)
  * **Icons**: Lucide React
  * **Components**: Radix UI / Shadcn UI (opsional, direkomendasikan untuk kecepatan)

---

## 2. Database Architecture (Supabase PostgreSQL)
Agen AI harus membuat schema berikut di Supabase. Semua tabel harus mengaktifkan Row Level Security (RLS) agar data user terisolasi.

### Tabel `categories`
Tabel untuk menyimpan kategori pemasukan/pengeluaran.
* `id` (uuid, primary key, default uuid_generate_v4())
* `user_id` (uuid, foreign key ke auth.users, not null)
* `name` (text, not null) - Contoh: Makanan, Gaji
* `type` (text, not null) - Values: 'income' | 'expense'
* `icon` (text, nullable) - Nama icon Lucide`
* `color` (text, nullable) - Hex code untuk UI
* `created_at` (timestamp, default now())

### Tabel `transactions`
Tabel utama untuk pencatatan keuangan.
* `id` (uuid, primary key, default uuid_generate_v4())
* `user_id` (uuid, foreign key ke auth.users, not null)
* `category_id` (uuid, foreign key ke categories(id), nullable)
* `type` (text, not null) - Values: 'income' | 'expense'
* `amount` (numeric/decimal, not null)
* `description` (text, nullable)
* `date` (date, not null)
* `created_at` (timestamp, default now())

### RLS Policies (Wajib diimplementasikan)
* SELECT, INSERT, UPDATE, DELETE pada semua tabel hanya diizinkan jika auth.uid() = user_id.

---

## 3. Application Structure (Next.js App Router)
Struktur folder dalam direktori app/:
* `(auth)`
  * `/login`: Halaman login/register menggunakan Supabase Auth UI (Magic Link atau Email/Password).
* `(dashboard)` - Protected routes, butuh layout khusus dengan Sidebar/Navbar.
  * `/`: Dashboard utama. Menampilkan ringkasan saldo, total pemasukan/pengeluaran bulan ini, dan 5 transaksi terakhir.
  * `/transactions`: Daftar semua transaksi dengan fitur filter (berdasarkan bulan, tipe) dan pagination.
  * `/transactions/add`: Form untuk menambah transaksi baru.
  * `/categories`: Halaman manajemen kategori (CRUD kategori pribadi).
* `api/` (opsional, karena Supabase bisa dipanggil langsung dari Server Components/Actions).

---

## 4. UI & Component Guidelines (Tailwind CSS v4)
> **Catatan untuk AI Agent terkait Tailwind v4**: Gunakan pendekatan konfigurasi baru (tanpa tailwind.config.js, melainkan melalui file app/globals.css menggunakan @theme).

**Core Components yang perlu dibuat:**
1. **Card**: Untuk membungkus ringkasan saldo dan chart.
2. **TransactionItem**: Komponen list untuk menampilkan satu baris transaksi (Icon kategori, nama, tanggal, jumlah uang dengan warna hijau untuk income, merah untuk expense).
3. **TransactionForm**: Form dengan input:
   * Radio button / Tabs: Income vs Expense.
   * Number input: Amount (Rp).
   * Select input: Category (di-fetch dari Supabase berdasarkan tipe yang dipilih).
   * Date picker: Tanggal transaksi.
   * Text input: Deskripsi (opsional).
4. **BottomNav (Mobile) / Sidebar (Desktop)**: Navigasi adaptif.

---

## 5. State Management & Data Fetching Strategy
* **Authentication**: Gunakan @supabase/ssr untuk mengecek session di middleware (middleware.ts). Jika belum login, redirect ke /login.
* **Data Fetching**: Gunakan React Server Components (RSC) di Next.js untuk mengambil data awal (misal: data ringkasan dashboard) agar load lebih cepat. Gunakan Server Actions ("use server") untuk mutasi data (Insert/Update/Delete transaksi dan kategori).
* **Client State**: Gunakan standard useState dan useTransition dari React untuk interaksi UI (seperti loading state saat form di-submit).

---

## 6. Implementation Steps (Prompting Guide for AI)
Instruksikan AI Agent Anda dengan membaginya ke dalam fase-fase berikut agar pengerjaan tidak tumpang tindih:

* **Fase 1: Setup & Konfigurasi** * "Inisialisasi proyek Next.js dengan Tailwind v4. Pasang library @supabase/supabase-js dan @supabase/ssr. Buat utilitas Supabase client untuk server dan browser."
* **Fase 2: Authentication & Layout**
  * "Buat sistem autentikasi di halaman /login dan proteksi route menggunakan Next.js Middleware. Buat layout dashboard dasar dengan navigasi."
* **Fase 3: Database & Server Actions**
  * "Buat file untuk Server Actions (actions.ts) yang berisi fungsi CRUD untuk transactions dan categories berinteraksi dengan Supabase."
* **Fase 4: Core UI (Dashboard & Form)**
  * "Implementasikan UI Dashboard di route / yang menampilkan total saldo, serta buat form di /transactions/add yang terhubung dengan Server Actions."
* **Fase 5: Pengelolaan Data & Finishing**
  * "Buat halaman /transactions untuk melihat riwayat lengkap dan halaman /categories untuk manajemen kategori."