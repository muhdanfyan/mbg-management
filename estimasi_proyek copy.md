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