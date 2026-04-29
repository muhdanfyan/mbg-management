**PENAWARAN PENGEMBANGAN APLIKASI MBG MANAGEMENT SYSTEM**

**Kepada:** Wahdah Islamiyah
**Nilai Proyek:** Rp 46.000.000
**Timeline:** 3 Bulan
**Tim:** 3 Developer

---

**RINCIAN TERMIN PEMBAYARAN:**

1. **TERMIN 1: Rp 12.000.000**

   - Setup server & infrastructure
   - Database design & architecture
   - Prototyping & technical documentation
2. **TERMIN 2: Rp 24.000.000**

   - Pengembangan MVP 6 Modul:
     * Dashboard & Statistik
     * Manajemen Dapur & Lokasi
     * Procurement & Inventory
     * Manajemen SDM & Payroll
     * Pengawasan Pembangunan
     * Financial Management
3. **TERMIN 3: Rp 10.000.000**

   - Finishing & optimization
   - Deployment production
   - Training & dokumentasi
   - Support 1 bulan

---

**TEKNOLOGI:**
Backend: Laravel API | Frontend: React TypeScript

**FITUR MVP:**

- Dashboard statistik & aktivitas
- Manajemen data dapur & lokasi
- Purchase order & inventory
- Database karyawan & payroll
- Tracking progress konstruksi
- Pencatatan transaksi keuangan

**FITUR EXCLUDED:**

- Real-time tracking
- Gantt chart complex
- QR code system
- Mobile app version

---

**TIMELINE:**
Bulan 1: Foundation & Setup
Bulan 2: MVP Development
Bulan 3: Finishing & Deployment

**PENJAMINAN:**

- Aplikasi functional 6 modul
- Responsive design
- Dokumentasi lengkap
- Support 1 bulan

---

**MEKANISME:**
Kick-off → Development → MVP → Deployment

**Kontak:**
Tim Development
*Penawaran berlaku hingga 30 Desember 2024*

---
---

# Rencana Proyek Final (Opsi A: Backend Laravel, Budget Rp 46jt)

Dokumen ini menguraikan rencana pengerjaan final untuk aplikasi "MBG Kitchen Management System" berdasarkan pilihan arsitektur backend menggunakan **Laravel API** dengan total anggaran **Rp 46.000.000**.

Pilihan ini menukar kemudahan dan kecepatan pengembangan (menggunakan Supabase) dengan kontrol dan fleksibilitas penuh (menggunakan Laravel), dengan konsekuensi pengurangan cakupan fitur agar sesuai dengan anggaran.

---

## 1. Arsitektur & Teknologi

*   **Backend:** Laravel (PHP) - Custom REST API.
*   **Frontend:** React / TypeScript.
*   **Database:** PostgreSQL (dijalankan di server yang sama dengan backend).
*   **Server / Hosting:** VPS (Virtual Private Server) yang dikelola sendiri (misal: DigitalOcean, Vultr).

---

## 2. Cakupan Fitur Final (Sesuai Budget Rp 46jt)

Total anggaran **Rp 46.000.000** setara dengan sekitar **9.2 minggu** total kerja pengembangan.

### Fitur yang Akan Dibangun:
1.  **Backend API Lengkap:** Ditulis dari nol menggunakan Laravel.
2.  **Sistem Autentikasi:** Fungsi Register, Login, dan Logout untuk pengguna.
3.  **Manajemen Lokasi (CRUD):** Fungsionalitas penuh untuk Tambah, Baca, Ubah, dan Hapus data lokasi/dapur.
4.  **Halaman Dashboard Statis:** Halaman dashboard akan ditampilkan sesuai desain, namun angka-angka dan data di dalamnya bersifat statis (tidak terhubung ke API) untuk menghemat waktu pengembangan.

### Fitur yang Dihapus dari Rencana Awal:
*   Modul Pengadaan (Procurement).
*   Modul SDM (HR).
*   Modul Keuangan.
*   Modul Konstruksi.
*   Data live dan dinamis di halaman Dashboard.

---

## 3. Rencana Pengerjaan & Jadwal Pembayaran

Berikut adalah rincian tahapan pengerjaan yang disesuaikan dengan termin pembayaran dan total budget yang baru.

### **Termin 1: Uang Muka & Setup Infrastruktur**
*   **Pembayaran:** **Rp 8.000.000**
*   **Target Pengerjaan (Durasi: ~1.5 Minggu):**
    1.  Setup dan konfigurasi server VPS (Instalasi Linux, Nginx, PHP, PostgreSQL).
    2.  Inisialisasi proyek Laravel dan React pada repository Git.
    3.  Membuat migrasi database dari skema SQL yang sudah ada ke dalam sistem migrasi Laravel.
    *   *Output: Server siap, struktur proyek dibuat, database siap digunakan oleh Laravel.*

### **Termin 2: Penyelesaian Backend API Inti**
*   **Pembayaran:** **Rp 18.000.000**
*   **Target Pengerjaan (Durasi: ~3.5 Minggu):**
    1.  Pembuatan API untuk autentikasi (register, login, logout) menggunakan Laravel Sanctum.
    2.  Pembuatan API untuk CRUD (Tambah, Baca, Ubah, Hapus) data Lokasi/Dapur.
    3.  Penulisan unit test dasar untuk memastikan API berfungsi.
    *   *Output: Endpoint API yang dapat diuji melalui Postman/Insomnia, siap untuk dihubungkan ke frontend.*

### **Termin 3: Penyelesaian Frontend & Peluncuran**
*   **Pembayaran:** **Rp 20.000.000**
*   **Target Pengerjaan (Durasi: 4 Minggu):**
    1.  Mengintegrasikan aplikasi React dengan backend API Laravel yang telah dibuat.
    2.  Membuat fungsionalitas halaman Login dan Register.
    3.  Membuat fungsionalitas penuh untuk halaman Manajemen Lokasi (peta, daftar, tambah/ubah/hapus data).
    4.  Menampilkan halaman Dashboard statis sesuai desain.
    5.  Melakukan deployment final aplikasi backend dan frontend ke server VPS.
    *   *Output: Aplikasi live yang dapat diakses online dengan semua fitur yang telah ditentukan.*

---

**Hasil Akhir Proyek:** Sebuah aplikasi web fungsional yang solid dengan backend Laravel, memungkinkan pengguna untuk login dan mengelola data lokasi. Ini menjadi fondasi yang kuat jika di masa depan ada penambahan budget untuk mengembangkan modul-modul lainnya.