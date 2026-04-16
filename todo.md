# TODO List - MBG Kitchen Management
*Berdasarkan Musyawarah Divisi Admisektra Muktamar*

## 🏗️ Core Infrastructure & Security
- [x] **Akses Terintegrasi Berbasis Dapur (Kitchen-scoped Access)**
    - [x] Pastikan pintu masuk data jelas dari dapur mana (Kitchen-based data entry).
    - [x] Login terpisah untuk setiap dapur dengan akses terbatas hanya ke data mereka sendiri.
    - [x] Nonaktifkan dashboard agregat untuk akun level dapur.
- [x] **Role Management**
    - [x] Siapkan user role PIC yang mengurusi pengeluaran khusus untuk dapur tertentu.
    - [x] Pemetaan user untuk masing-masing dapur PIC (proses verifikasi data).

## 💰 Rekonstruksi Menu Keuangan
- [x] **Restrukturisasi Submenu Keuangan**
    - [x] Implementasikan struktur menu collapse/dropdown di Sidebar.
    - [x] Urutan Submenu: Investasi, Sewa Dapur, Selisih Bahan Baku, Operasional.
- [x] **Modul Investasi**
    - [x] Daftar lengkap investor per dapur dengan persentase kepemilikan.
    - [x] Tampilan 100% kepemilikan untuk dapur tanpa investor eksternal.
    - [x] Fitur sorting/filtering per dapur dan per investor (untuk investor lintas dapur).
- [x] **Modul Bagi Hasil (Sewa Dapur)**
    - [x] Tampilan: Seluruh dana sewa dapur disampaikan ke DPP (Pusat mendistribusikan ke investor).
    - [x] Implementasi kalkulasi bagi hasil otomatis.
    - [x] Input fleksibel: Opsi input Nilai Sewa Total (auto-calculate) atau Nilai Bagi Hasil langsung.
    - [x] Progress bar tracking pembayaran bagi hasil.
    - [x] Kalkulasi proyeksi: Estimasi bulan/tahun penyelesaian berdasarkan pola transfer.
    - [x] Histori lengkap: Tanggal transfer, jumlah, bulan pembayaran, dan sisa outstanding.
- [x] **Modul Selisih Bahan Baku**
    - [x] Menu terpisah untuk tracking selisih.
    - [x] Implementasi distribusi bagi hasil 60% (DPP) - 20% (DPD) - 20% (Koperasi).
    - [x] Perhitungan fixed Rp 6 juta per hari per dapur (tidak terpengaruh jumlah porsi).
- [x] **Modul Operasional**
    - [x] Expense distribution untuk gaji (Kepala Dapur, Akuntan, dll).
    - [x] Alokasi belanja: 5 Juta (Kepala Dapur), 2.5 Juta (dan alokasi lainnya).
    - [x] Fixed cost Rp 6 juta per bulan per dapur untuk honor staff.

## 🎨 UI/UX & Data Integrity
- [x] **Fungsi Pencarian & Navigasi**
    - [x] Implementasi Menu Pemilihan Dapur yang lebih intuitif (Global Search in Finance).
- [x] **Validasi & Akurasi Data**
    - [x] Audit dan perbaiki inkonsistensi data awal (Logic Hardening 60:20:20 & 75:25).
    - [x] Perbaiki format tanggal yang terbalik (Standardized to id-ID in Finance UI).
- [x] **Tracking Lengkap**
    - [x] Tambahkan kolom Tanggal Masuk Dana (dari dapur).
    - [x] Tambahkan kolom Tanggal Transfer (ke investor/pihak terkait).
    - [x] Implementasi histori lengkap per tab (Investasi, Sewa, Selisih, Operasional).

## 🔌 Integrasi & Lanjutan
- [x] **Integrasi Procurement**
    - [x] Koneksi antara modul pengeluaran dapur dengan sistem procurement dan inventory (Audit Scoping OK).
- [x] **Reporting**
    - [x] Laporan investor siap cetak/digital (Laporan histori transfer bagi hasil).

## 🚀 Deployment & Finalisasi
- [x] **Error Checking**
    - [x] Melakukan pengecekan sistem menyeluruh (QA) sebelum deployment.
    - [x] Testing input data khusus kasus dapur (Backend Unit Tests & API Scoping OK).
- [x] **Dokumentasi & Presentasi**
    - [x] Membuat video tutorial/simulasi sistem untuk presentasi ke Sekjen dan Ketua.
- [x] **Deployment**
    - [x] Deploy sistem ke website resmi setelah semua perbaikan selesai.
    - [x] Menyiapkan skema testing dalam Agentic Skill ([NOSS Testing Expert](file:///Users/pondokit/Herd/mbg-management/.agents/skills/noss_testing_expert.md)) berdasarkan 10 referensi repositori QA.

    
