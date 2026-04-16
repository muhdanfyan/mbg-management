---
name: NOSS Testing Expert
description: Specialist in No-Screenshot (NOSS) testing strategies, utilizing external QA repositories for UI, API, and Financial logic validation.
---

# NOSS Testing Expert Skill

Gunakan skill ini untuk menjalankan skema testing mandiri yang mengutamakan verifikasi via CLI, Logs, dan Database, sesuai prinsip **NOSS (No-Screenshot Strategy)** dan referensi dari **Top 10 QA Repositories**.

## 🧠 Dasar Filosofi (Inspirasi Repo)
- **Repo #1 (fityanos)**: Fokus pada *effective test planning* sebelum eksekusi.
- **Repo #6 (faisalkhatri)**: Penggunaan *Generic Test Templates* untuk validasi logika UI tanpa harus melihat visualnya.
- **Repo #8 (mgasiorowski)**: Audit performa dan optimasi backend/frontend.
- **Repo #10 (LukaszLapaj)**: Penggunaan *Boundary Data Pack* untuk pengujian ketahanan API.

## 🛠️ Modul Pengujian Agentik

### 1. UI Logic Hardening (Tanpa Screenshot)
Gunakan pendekatan dari **Repo #6** untuk memverifikasi fungsionalitas UI melalui tracing API:
- **Verifikasi Modal:** Cek apakah payload yang dikirim oleh modal (misal: `/api/financial-records`) memiliki struktur field yang lengkap.
- **Verifikasi Scoping:** Pastikan header `X-Kitchen-ID` dihormati oleh backend dengan melakukan request antarkitchen (Negative Test).
- **Tools:** `curl`, `grep`, `jq`.

### 2. API Robustness & Boundary (Resource Pack)
Gunakan dataset dari **Repo #10** untuk menguji endpoint kritis:
- **Financial Payloads:** Kirim data dengan angka desimal ekstrem, karakter khusus pada nama investor, dan file evidence dengan nama panjang.
- **Security Check:** Verifikasi status code `401/403` saat mengakses endpoint `/api/backend` tanpa role yang sesuai (RBAC).

### 3. Financial Integrity Audit (SQL Driven)
Audit mendalam terhadap angka-angka krusial di database:
- **Profit Consistency:** Bandingkan `accumulated_profit` di tabel `dapurs` dengan jumlah total dari `financial_records`.
- **BEP Logic:** Pastikan `bep_status` otomatis berubah dari `PRE-BEP` ke `POST-BEP` saat margin tercapai.
- **SQL Source:** Gunakan `scripts/financial_audit.sql`.

### 4. Performance & Connectivity (VPS Centric)
Gunakan strategi dari **Repo #8** untuk memantau kesehatan sistem di VPS:
- **Caddy Audit:** Cek log Caddy untuk memastikan SSL `dev.mbgone.site` aktif dan tidak ada error `502 Bad Gateway`.
- **Database Latency:** Eksekusi query berat dan cek waktu eksekusinya.

## 🚀 Prosedur Eksekusi (Action Steps)

1.  **Preparation:** Inisialisasi environment testing dengan `./scripts/test_ui_flow.sh`.
2.  **Logic Check:** Jalankan audit SQL untuk memastikan integritas data awal.
3.  **Boundary Test:** Masukkan dataset "edge case" ke API dan cek penanganannya.
4.  **Reporting:** Buat log audit teks (Markdown) sebagai pengganti bukti visual (screenshot).

## 📄 Referensi Project
- **Testing Plan:** [testing_plan_mbg.md](file:///Users/pondokit/Herd/mbg-management/testing_plan_mbg.md)
- **Credential Reference:** [SETUP_DEMO_USERS.md](file:///Users/pondokit/Herd/mbg-management/SETUP_DEMO_USERS.md)
- **API Client:** [src/services/api.ts](file:///Users/pondokit/Herd/mbg-management/src/services/api.ts)
