# Pemahaman Alur Keuangan & Mekanisme Bagi Hasil MBG

Dokumen ini merangkum pembagian kerja teknis dan operasional antara **PIC Dapur** dan **Koperasi** dalam ekosistem MBG Management System, berdasarkan Knowledge Base internal dan implementasi riil dalam kode program.

## 1. Pembagian Peran & Tanggung Jawab

| Fitur Kerja | **PIC Dapur (Kitchen Role)** | **Koperasi (Coop Role)** |
| :--- | :--- | :--- |
| **Pemasukan** | Mencatat dana gelondongan dari BGN (Rp15rb/porsi). | Menerima transfer internal untuk belanja (Rp10rb/porsi). |
| **Pengeluaran** | Input gaji, sewa, dan biaya operasional kantor. | **Input belanja riil bahan baku (Item per item).** |
| **Tanggung Jawab** | Transparansi saldo rekening dapur. | **Audit fisik & administrasi nota belanja.** |
| **Fokus Utama** | Kelancaran produksi & distribusi makanan. | Efisiensi HPP (Harga Pokok Penjualan). |

---

## 2. Implementasi Teknis dalam Sistem

### A. Peran PIC Dapur (Input Pemasukan & Operasional)
*   **Dana Masuk (BGN):** PIC Dapur mencatat dana masuk sebesar **Rp15.000/porsi** melalui fitur **"Lapor Dana BGN"**.
*   **Dana Operasional (Rp5.000/porsi):** Bertanggung jawab menginput pengeluaran harian di tab **"Operasional"**, meliputi:
    *   **Gaji Personel:** Honor untuk staf dapur.
    *   **Sewa Dapur:** Pembayaran biaya sewa tempat.
    *   **Operasional:** Listrik, air, dan biaya pemeliharaan lainnya.

### B. Peran Koperasi (Pengadaan & Audit)
*   **Dana Bahan Baku (Rp10.000/porsi):** Koperasi mengelola porsi ini untuk pengadaan bahan makanan riil.
*   **Audit Pengeluaran (Tab "Selisih Bahan"):** 
    *   Mencatat harga beli nyata di pasar per item/nota.
    *   Wajib mengunggah **bukti/nota belanja** ke sistem.
    *   **Validasi Cerdas (Smart Warning):** Sistem secara otomatis menghitung biaya per porsi. Jika pengeluaran > Rp10.000/porsi, indikator akan berubah menjadi **MERAH** sebagai peringatan pemborosan anggaran.

### C. Keamanan & Isolasi Data (RBAC & Scoping)
*   **Role-Based Access Control (RBAC):** Tab menu disaring secara otomatis. PIC Dapur hanya melihat operasional, sedangkan Operator Koperasi melihat audit belanja bahan baku.
*   **Data Scoping:** Header `X-Kitchen-ID` pada setiap request API memastikan data antar dapur tidak bercampur. PIC Dapur A tidak bisa melihat data keuangan Dapur B.

---

## 3. Mekanisme Alur Kerja (Workflow)

1.  **Pemasukan:** PIC Dapur klik **"Lapor Dana BGN"** → Input Tanggal & Jumlah Porsi → Saldo Sistem bertambah.
2.  **Operasional:** PIC Dapur input **"Transaksi Baru"** → Kategori: Gaji/Operasional → Memotong jatah porsi Rp5.000.
3.  **Bahan Baku:** Koperasi input **"Audit Belanja"** → Input Total Nota & Jumlah Porsi Masak → Memotong jatah porsi Rp10.000 → Sistem otomatis menghitung **Selisih (Margin)** untuk bagi hasil (DPP 60%, DPD 20%, Koperasi 20%).

---
*Dokumen ini bersifat rahasia dan menjadi acuan standar implementasi fitur Keuangan & Procurement MBG Management.*
