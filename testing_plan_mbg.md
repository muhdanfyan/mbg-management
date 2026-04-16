# Master Testing Plan: MBG Management System

Dokumen ini merincikan rencana pengujian (Test Plan) untuk sistem **MBG Kitchen Management**, mengacu pada standar QA modern dan strategi **NOSS (No-Screenshot Strategy)**.

## 1. Objectives (Tujuan)
- Memastikan akurasi kalkulasi bagi hasil antara Investor, DPP, DPD, dan Koperasi.
- Menjamin isolasi data antar dapur (Kitchen-scoped access).
- Memverifikasi kestabilan integrasi antara data SPPG (WMP) dan dashboard manajemen.
- Mencapai 0 critical bugs pada modul keuangan sebelum rilis resmi.

## 2. Scope (Cakupan Pengujian)
### 2.1 Modul Keuangan (Prioritas Tinggi)
- Perhitungan Selisih Bahan Baku (60:20:20).
- Kalkulasi Payout Investor vs DPP (75:25).
- Auto-swap status BEP (Break Even Point).
- Histori remittance dan evidence upload.

### 2.2 Modul Infrastruktur & Logistik
- Sinkronisasi data 102 titik armada.
- Pemetaan PJ Dapur dan Landlord.
- Tracking progres konstruksi SPPG.

### 2.3 Keamanan & Akses
- Role-based Access Control (RBAC) untuk 6 role demo.
- Validasi X-Kitchen-ID pada header request backend.

## 3. Testing Strategy: NOSS (No-Screenshot Strategy)
Sesuai arahan Divisi Admisektra, pembuktian testing tidak lagi mengandalkan tangkapan layar, melainkan:
1.  **Audit Logs**: Pengecekan log container Caddy dan Backend.
2.  **API Scoping Script**: Script otomatis yang memverifikasi isolasi data.
3.  **SQL Integrity Check**: Verifikasi langsung ke database untuk angka-angka finansial.
4.  **CLI Tracing**: Menggunakan `curl` dan `grep` untuk memverifikasi response body.

## 4. Tools & Environment
- **Backend Testing**: Go `testing` package, `testify`.
- **API Testing**: Custom bash scripts (`scripts/verify_api.sh`).
- **Performance**: `k6` atau benchmark internal Go.
- **Database**: MySQL (Production & Dev instances).
- **Environment**: VPS Ubuntu 22.04 + Docker Compose.

## 5. Test Schedule & Lifecycle
1.  **Unit Testing**: Setiap commit pada modul logic keuangan.
2.  **Integration Testing**: Setiap deployment ke subdomain `dev.mbgone.site`.
3.  **Audit Mandiri**: Dilakukan setiap minggu sebelum presentasi ke Sekjen/Ketua.

## 6. Acceptance Criteria
- Seluruh unit test backend lulus.
- Tidak ada data bocor antar `kitchen_id` saat diuji via script scoping.
- Kalkulasi bagi hasil pada `FinancialRecord` sesuai dengan rumus spreadsheet Admisektra.

---
*Dibuat oleh Antigravity AI - April 2026*
