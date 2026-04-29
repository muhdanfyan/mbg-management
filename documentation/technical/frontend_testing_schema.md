# MBG Management: Frontend CRUD Testing Schema

Dokumen ini merincikan skema pengujian untuk setiap operasi CRUD (Create, Read, Update, Delete) pada antarmuka pengguna (Frontend).

## 1. Modul Lokasi & Dapur (`/locations`)

| Fitur | Aksi Test | Ekspektasi Hasil |
|-------|-----------|------------------|
| **Create Kitchen** | Klik "Tambah Dapur", isi form lengkap, klik simpan. | Modal tertutup, dapur baru muncul di list & peta, toast success muncul. |
| **Read/Detail** | Klik salah satu titik di peta atau baris di tabel. | Modal detail terbuka dengan data lengkap (Keuangan, Infrastruktur, Logistik). |
| **Update Kitchen** | Klik tombol edit, ubah kapasitas/status, simpan. | Data di tabel/peta terupdate seketika tanpa refresh halaman. |
| **Map Interaction** | Geser pin pada peta saat edit/tambah. | Koordinat Latitude/Longitude di form terupdate otomatis. |

## 2. Modul Keuangan (`/finance`)

| Fitur | Aksi Test | Ekspektasi Hasil |
|-------|-----------|------------------|
| **Add Transaction** | Klik "New Transaction", pilih kategori, input nominal. | Saldo/Cashflow terupdate, transaksi muncul di histori. |
| **Edit Transaction** | Klik ikon pensil pada baris transaksi. | Form terbuka dengan data lama, perubahan tersimpan dengan benar. |
| **Delete Transaction**| Klik ikon sampah, konfirmasi dialog. | Transaksi hilang dari daftar, saldo terkalkulasi ulang. |
| **New Loan** | Input pinjaman baru dengan bunga & tenor. | Muncul di daftar hutang, kalkulasi cicilan bulanan sesuai rumus. |

## 3. Modul Konstruksi (`/construction`)

| Fitur | Aksi Test | Ekspektasi Hasil |
|-------|-----------|------------------|
| **Create Contract** | Input kontrak baru, pilih vendor & SPPG. | Kontrak muncul di tab "Manajemen Kontrak". |
| **Update Progress** | Klik "Update Progress", geser slider %, upload foto. | Progress bar pada kontrak utama terupdate, foto muncul di galeri. |
| **Delete Update** | Hapus salah satu log progress. | Progress % kontrak utama berkurang sesuai sisa log yang ada. |

## 4. Modul Galeri SPPG (`/sppg-gallery`)

| Fitur | Aksi Test | Ekspektasi Hasil |
|-------|-----------|------------------|
| **Add Media** | Buka galeri salah satu SPPG, klik "Tambah Foto", input link GDrive. | Foto baru muncul di grid galeri dengan preview yang benar. |
| **Delete Media** | Klik ikon sampah pada salah satu foto galeri. | Foto terhapus dari gallery modal. |
| **Navigation** | Klik "View Photos" dari list mode. | Modal gallery terbuka langsung ke SPPG yang dimaksud. |

---

# Backend API Testing Suite

Gunakan script `scripts/api_test_suite.py` untuk melakukan testing otomatis pada seluruh endpoint API.

### Cara Menjalankan:
```bash
# Pastikan backend berjalan di port 8080
python3 scripts/api_test_suite.py
```

### Lingkup Testing API:
1.  **POST (Create)**: Validasi payload JSON dan constraint database.
2.  **GET (Read)**: Verifikasi struktur response dan scoping data (`X-Kitchen-ID`).
3.  **PUT (Update)**: Verifikasi perubahan data persisten.
4.  **DELETE**: Verifikasi penghapusan (atau soft-delete jika diaktifkan).
