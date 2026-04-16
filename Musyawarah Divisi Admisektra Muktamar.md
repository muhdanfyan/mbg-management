## Hasil Utama

PONDOK INFORMATIKA mempresentasikan sistem manajemen keuangan untuk tracking distribusi hasil sewa dapur dan bagi hasil investor. Sistem mencakup modul investasi, bagi hasil, operasional, dan selisih bahan baku dengan akses berbasis role untuk setiap dapur. 
## Keputusan yang Dibuat

- **Struktur menu keuangan**: Submenu keuangan akan mencakup Sewa Dapur, Selisih Bahan Baku, dan Operasional (bukan menu terpisah) 
- **Akses dapur**: Setiap dapur memiliki login terpisah dengan akses terbatas hanya ke data mereka sendiri, tanpa dashboard agregat 
- **Pelaporan investor**: Investor tidak perlu akun login; laporan dikirim dalam bentuk cetak/digital yang menampilkan histori transfer bagi hasil 
- **Pengiriman dana**: Semua dana sewa dikirim ke pusat dalam jumlah penuh, bukan hanya bagi hasil; pusat yang mendistribusikan ke investor 
- **Tracking transaksi**: Sistem harus mencatat tanggal masuk dana dari dapur dan tanggal transfer ke investor 

## Fitur yang Akan Dikembangkan

### Modul Investasi

- Daftar lengkap investor per dapur dengan persentase kepemilikan masing-masing 
- Kemampuan filtering/sorting berdasarkan dapur atau berdasarkan investor (untuk investor yang berinvestasi di multiple dapur) 
- Tampilan 100% kepemilikan untuk dapur tanpa investor eksternal 

### Modul Bagi Hasil

- Progress bar untuk tracking pembayaran bagi hasil 
- Kalkulasi proyeksi: estimasi bulan/tahun penyelesaian pembayaran berdasarkan pola transfer rutin 
- Input fleksibel: opsi merekam nilai sewa total (sistem auto-calculate distribusi) atau langsung input nilai bagi hasil 
- Histori lengkap: tanggal transfer, jumlah, bulan pembayaran, dan sisa outstanding 

### Modul Selisih Bahan Baku

- Menu terpisah untuk tracking selisih bahan baku dengan distribusi 60-20-20 (detail ke DPD/koperasi) 
- Perhitungan Rp 6 juta per hari per dapur, tidak terpengaruh porsi 

### Modul Operasional

- Expense distribution untuk gaji kepala dapur, akuntan, dan staff lainnya 
- Fixed cost Rp 6 juta per bulan per dapur untuk honor staff 

### Integrasi Procurement

- Koneksi antara modul pengeluaran dapur dengan sistem procurement dan inventory 

## Perbaikan yang Diminta

- **Menu search**: Tambahkan fungsi pencarian dapur di daftar monitoring untuk kemudahan akses saat jumlah dapur banyak 
- **Data validation**: Perbaiki inkonsistensi data awal (contoh: bagi hasil Rp 21 juta tidak sesuai dengan perhitungan 25% dari Rp 72 juta seharusnya Rp 18 juta) 
- **Kolom tanggal**: Tambahkan kolom tanggal masuk dana dan tanggal transfer ke investor untuk tracking lengkap 
- **Format tanggal**: Perbaiki format tanggal yang terbalik (seharusnya tanggal 13 April) 

## Pending Konfirmasi

- Data lengkap untuk dapur Tujuh Undang-Undang (124) masih menunggu informasi nilai sewa total vs bagi hasil 
- Pemetaan user untuk masing-masing dapur PIC masih dalam proses 
- Error checking sistem setelah update terakhir sebelum deployment 

## Action Items

- **PONDOK INFORMATIKA**: Membuat video tutorial/simulasi sistem untuk keperluan presentasi ke pimpinan (Sekjen dan Ketua) 
- **PONDOK INFORMATIKA**: Deploy sistem ke website setelah pengecekan error selesai 
- **PONDOK INFORMATIKA**: Implementasikan struktur submenu keuangan dengan dropdown (Investasi, Sewa Dapur, Selisih Bahan Baku, Operasional) 
- **PONDOK INFORMATIKA**: Tambahkan fitur sorting/filtering per dapur dan per investor di monitoring investasi 
- **PONDOK INFORMATIKA**: Buat menu input data yang memungkinkan entry nilai sewa total atau nilai bagi hasil langsung 
- **PONDOK INFORMATIKA**: Tambahkan fungsi search dapur dan kolom tanggal transaksi lengkap 
- **Kadepkeu/Wawan**: Melengkapi data yang hilang/tidak lengkap untuk input sistem, khususnya untuk dapur Tujuh Undang-Undang 

## Langkah Selanjutnya

- Testing input data dengan case dapur Tujuh Undang-Undang setelah data lengkap tersedia 
- Presentasi sistem ke grup pimpinan menggunakan video simulasi yang akan dibuat PONDOK INFORMATIKA 
