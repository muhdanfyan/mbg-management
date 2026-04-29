# Master Development Log - MBG Management System

## Overview
Log ini mencatat seluruh kronologi pengembangan, instruksi USER, dan solusi AI secara ringkas. Digunakan sebagai acuan teknis dan audit trail yang ringan.

---

## [Sesi 23 April 2026] - UI Standardization & Dynamic Categories

### 1. Instruksi User
- Standardisasi semua dropdown dengan `SearchableSelect`.
- Implementasi kategori transaksi dinamis (CRUD).
- Penambahan foto karyawan dan relasi dapur pada modul HR.
- Perbaikan berbagai `ReferenceError` akibat missing imports.

### 2. Aktivitas & Keputusan Teknis
- **UI Upgrade**: Mengganti `<select>` standar di modul Finance, HR, Procurement, Construction, Investors, dan Locations.
- **Backend Sync**: 
    - Menambahkan model `TransactionCategory` dan API CRUD.
    - Menambah relasi `Kitchen` pada model `Employee`.
- **UI Enhancement**: Menambahkan Hero Image premium di modul HR menggunakan AI.
- **Knowledge Management**: Membuat file `AGENT_SKILLS.md` untuk mencatat setiap perbaikan error secara sistematis.

### 3. Masalah & Solusi
- **Issue**: `ReferenceError: useAuth/Plus/Building2 is not defined`.
- **Fix**: Melengkapi import di `HR.tsx` dan `Finance.tsx`.
- **Status**: ✅ BERHASIL.

---

## [Sesi 22 April 2026] - Final Deployment & System Audit

### 1. Instruksi User
- Menjalankan skema testing lengkap di Lokal, Dev, dan Production.
- Memastikan semua link/sub-link aman dari error 404/500.
- Push kode ke GitHub (`dev` dan `main`).
- Deploy ke VPS (`dev.mbgone.site` dan `mbgone.site`).
- Menyembunyikan fitur Demo di Production.
- Memverifikasi logika finansial (60:20:20).

### 2. Aktivitas & Keputusan Teknis
- **Testing**: Menjalankan `verify_api.sh` dan `test_ui_flow.sh`. Semua test Passed.
- **Git Strategy**: Melakukan merge dari `dev` ke `main` setelah validasi di lingkungan Dev berhasil.
- **Deployment**:
    - Build aset dilakukan langsung di VPS untuk menghindari masalah *permission* rsync.
    - Penambahan kolom `kitchen_id` secara manual di DB Production karena auto-migration GORM tidak berjalan otomatis di lingkungan tersebut.
- **Security**: Implementasi pengecekan `window.location.hostname` di `Login.tsx` untuk menyembunyikan panel demo di domain produksi.

### 3. Masalah & Solusi
- **Issue**: Seeding gagal di VPS karena `Unknown column 'kitchen_id'`.
- **Fix**: Eksekusi `ALTER TABLE users ADD COLUMN kitchen_id...` via CLI dan jalankan ulang seeding.
- **Status**: ✅ BERHASIL.

### 4. Hasil Akhir
- **Lokal**: Sinkron dengan GitHub.
- **Dev**: Aktif di [dev.mbgone.site](https://dev.mbgone.site).
- **Production**: Aktif di [mbgone.site](https://mbgone.site).

---

## [Sesi 29 April 2026] - DevOps: Coolify Orchestration & Server Optimization

### 1. Instruksi User
- Instalasi **Coolify** di server VPS untuk manajemen Docker yang lebih modern.
- Memastikan server mampu menangani load panel manajemen baru.

### 2. Aktivitas & Keputusan Teknis
- **Server Optimization**: 
    - Melakukan audit sumber daya (RAM: 2GB, Disk: 58GB).
    - Menambahkan **4GB Swap File** untuk mencegah *out-of-memory* (OOM) saat instalasi dan operasional Coolify (minimum RAM Coolify adalah 2GB).
- **DevOps**:
    - Instalasi Coolify v4 (Beta) menggunakan skrip resmi.
    - Konfigurasi Docker daemon untuk mendukung network pool Coolify.

### 3. Masalah & Solusi
- **Issue**: Keterbatasan RAM (hanya tersedia ~1GB) dapat menyebabkan instalasi Coolify gagal.
- **Fix**: Penambahan Swap secara manual via CLI sebelum eksekusi skrip instalasi.
- **Status**: ⏳ PROSES (Instalasi Sedang Berjalan).

---

## [Log Sebelumnya]
- *Catatan: Log detail sebelumnya tersimpan dalam Knowledge Items (KI).*
