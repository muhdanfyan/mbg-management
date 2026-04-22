# Konsolidasi Pemahaman & Rencana Pengembangan MBG Management
*Berdasarkan Dokumen: Musyawarah Divisi Admisektra Muktamar.pdf*

## 1. Visi & Hasil Utama
Sistem Manajemen Keuangan MBG dikembangkan untuk melakukan tracking distribusi hasil sewa dapur dan bagi hasil investor secara transparan.
*   **Cakupan Modul**: Investasi, Bagi Hasil, Operasional, dan Selisih Bahan Baku.
*   **Keamanan**: Akses berbasis peran (*Role-Based Access Control*) dengan isolasi data per dapur.

## 2. Keputusan Strategis yang Dibuat
*   **Struktur Menu Keuangan**: Harus mencakup Submenu **Sewa Dapur**, **Selisih Bahan Baku**, dan **Operasional** dalam satu kesatuan (tidak terpisah).
*   **Isolasi Akses**: Setiap dapur memiliki login terpisah. PIC Dapur hanya dapat melihat data dapur mereka sendiri tanpa akses ke dashboard agregat (pusat).
*   **Pelaporan Investor**: Investor tidak memerlukan akun login. Laporan dikirim dalam bentuk cetak/digital yang menampilkan histori transfer bagi hasil.
*   **Alur Dana**: Semua dana sewa dikirim ke Pusat dalam jumlah penuh (100%), kemudian Pusat yang mendistribusikan porsi bagi hasil ke investor.
*   **Audit Trail**: Sistem wajib mencatat tanggal masuk dana dari dapur dan tanggal transfer ke investor untuk transparansi.

## 3. Rincian Modul Keuangan

### A. Modul Investasi
*   Daftar lengkap investor per dapur dengan persentase kepemilikan yang jelas.
*   Fitur filtering dan sorting berdasarkan dapur atau investor (untuk investor yang memiliki modal di beberapa dapur).
*   Tampilan kepemilikan 100% untuk dapur yang sudah selesai masa ROI-nya atau yang tidak memiliki investor eksternal.

### B. Modul Bagi Hasil (Sewa Dapur)
*   **Visualisasi**: Menggunakan *progress bar* untuk melacak status pembayaran bagi hasil menuju BEP.
*   **Proyeksi**: Kalkulasi estimasi waktu penyelesaian pembayaran berdasarkan pola transfer rutin.
*   **Fleksibilitas Input**: Opsi input nilai sewa total (sistem hitung otomatis) atau input langsung nilai bagi hasil.
*   **Histori**: Mencatat tanggal transfer, jumlah, bulan pembayaran, dan sisa *outstanding*.
*   **Porsi**: Mengonfirmasi porsi bagi hasil investor sebesar **25%** dari nilai sewa (sesuai contoh perhitungan Rp18jt dari Rp72jt).

### C. Modul Selisih Bahan Baku (Margin Koperasi)
*   **Rasio Distribusi**: Menggunakan skema **60:20:20** (60% DPP/Pusat, 20% DPD, 20% Koperasi).
*   **Base Margin**: Perhitungan didasarkan pada selisih sekitar Rp6 juta per hari per dapur.

### D. Modul Operasional
*   **Distribusi Beban**: Mencakup gaji kepala dapur, akuntan, dan staff lainnya.
*   **Biaya Tetap (Fixed Cost)**: Ditetapkan **Rp6 juta per bulan** per dapur untuk honor staff.

## 4. Integrasi & Pengembangan Teknis
*   **Integrasi Procurement**: Mengoneksikan modul pengeluaran dapur dengan sistem procurement dan inventory untuk sinkronisasi stok dan biaya.
*   **Validasi Data**: Memperbaiki inkonsistensi data awal (misal: penyesuaian porsi 25% yang sebelumnya tidak akurat).
*   **Format Data**: Standarisasi format tanggal (format Indonesia) dan penambahan fungsi pencarian (*search*) dapur yang masif.

## 5. Action Items & Langkah Selanjutnya
1.  **Video Tutorial**: Pembuatan video simulasi sistem untuk presentasi ke pimpinan (Sekjen dan Ketua).
2.  **Deployment**: Melakukan rilis ke website setelah pengecekan error (QC) selesai.
3.  **Dropdown Keuangan**: Implementasi struktur submenu keuangan dengan dropdown (Investasi, Sewa, Selisih, Operasional).
4.  **Laporan Monitoring**: Menambahkan fitur sorting/filtering per dapur dan per investor di dashboard monitoring.
5.  **Finalisasi Data**: Melengkapi data dapur yang masih tertinggal (seperti Dapur Tujuh Undang-Undang).

---
*Dokumen ini merupakan hasil ekstraksi resmi untuk dijadikan acuan pengembangan sistem MBG Management.*
