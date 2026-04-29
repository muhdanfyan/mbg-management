# MBG Agent Skills & Knowledge Base
Log ini mencatat pembelajaran dari setiap bug, error, dan solusi teknis yang ditemukan selama pengembangan MBG Management System.

## [23 April 2026] - UI Standardization & Error Handling

### 1. Issue: ReferenceError (useAuth, Plus, Building2 is not defined)
- **Problem**: Penggunaan hook atau icon baru tanpa melakukan import yang sesuai di bagian atas file `.tsx`.
- **Root Cause**: Kelalaian saat melakukan copy-paste atau refactoring komponen UI (seperti `SearchableSelect`).
- **Fix**: 
    - Menambahkan `import { useAuth } from '../contexts/AuthContext';` di `HR.tsx`.
    - Menambahkan `Plus`, `Trash2`, `Building2` di import `lucide-react`.
- **Lesson Learned**: Selalu verifikasi daftar import setiap kali menambahkan elemen UI atau hook baru. Gunakan tool `grep` untuk memastikan semua variabel terdefinisi.

### 2. Issue: Database Relation Missing (Employee -> Kitchen)
- **Problem**: Karyawan tidak terhubung dengan unit dapur tertentu meskipun form di frontend sudah menyediakan field tersebut.
- **Root Cause**: Model GORM di backend (`models.Employee`) belum memiliki field `KitchenID` dan relasi `Kitchen`.
- **Fix**: 
    - Menambahkan `KitchenID` dan `Kitchen` (Dapur) di `backend/models/hr.go`.
    - Menambahkan `Preload("Kitchen")` pada handler `GET /employees` di `backend/main.go`.
- **Lesson Learned**: Fitur frontend yang membutuhkan relasi data harus didukung oleh sinkronisasi model di sisi backend.

### 3. Feature: Dynamic Transaction Categories
- **Context**: User menginginkan kategori transaksi (Pemasukan/Pengeluaran) bersifat dinamis (CRUD).
- **Implementation**:
    - Membuat model `TransactionCategory`.
    - Implementasi modal "Kelola Kategori" di modul Finance.
    - Sinkronisasi dropdown kategori agar mengambil data dari API terbaru.
- **Skill**: Pembuatan sistem kategori kustom yang mendukung fleksibilitas operasional admin.

### 4. Issue: API Upload 400 Bad Request
- **Problem**: Gagal mengunggah gambar karena request dikirim sebagai JSON stringified, bukan FormData.
- **Root Cause**: Method `api.post` di `api.ts` secara otomatis melakukan `JSON.stringify` pada semua body request.
- **Fix**: Menambahkan pengecekan `instanceof FormData` pada `api.post`. Jika data adalah FormData, hapus header `Content-Type` agar browser mengatur *boundary* multipart secara otomatis.
- **Lesson Learned**: Untuk upload file, jangan gunakan `JSON.stringify` dan biarkan browser menangani header `Content-Type` untuk multipart/form-data.

### 5. Issue: Dropdown State Sync (Controlled Component)
- **Problem**: Dropdown `SearchableSelect` tidak langsung menampilkan nilai yang dipilih saat mengedit data (Edit Modal).
- **Root Cause**: Penggunaan `defaultValue` atau `value` yang tidak terhubung dengan state lokal yang reaktif (`controlled component`).
- **Fix**: 
    - Mengimplementasikan `formState` lokal (misal: `employeeForm`).
    - **PENTING**: Dalam fungsi `onSubmit`, ambil data langsung dari `formState` tersebut, jangan mengandalkan `new FormData(e.target)` karena value dari komponen kustom mungkin tidak tersinkronisasi dengan benar di DOM.
- **Lesson Learned**: Untuk form yang menggunakan komponen kustom, pola `controlled components` di seluruh alur (dari input hingga submit) adalah cara teraman untuk menjaga integritas data.

### 6. Issue: Foreign Key Constraint Fail (Error 1452)
- **Problem**: Gagal menyimpan atau update data karyawan dengan pesan `fk_employees_department` fails.
- **Root Cause**: Mencoba mengirim `department_id` atau `position_id` bernilai `0` atau `null` ke kolom yang mewajibkan relasi valid. Hal ini terjadi jika user belum memilih opsi pada dropdown namun form tetap disubmit.
- **Fix**: 
    - Menambahkan validasi di frontend untuk memastikan field wajib (relasi) sudah dipilih sebelum submit.
    - Memberikan pesan error yang informatif jika validasi gagal.
- **Lesson Learned**: Untuk kolom database dengan `FOREIGN KEY`, pastikan frontend selalu mengirimkan ID yang eksis di tabel referensi. Jangan biarkan nilai default `0` terkirim jika tabel referensi mulai dari ID `1`.

### 7. Issue: ERR_CONNECTION_REFUSED on Localhost (IPv6 vs IPv4)
- **Problem**: Browser gagal terhubung ke `localhost:8080` meskipun server sudah jalan (net::ERR_CONNECTION_REFUSED).
- **Root Cause**: Di beberapa sistem (terutama macOS), `localhost` bisa me-resolve ke IPv6 (`::1`), sedangkan server Go/Gin mungkin hanya mendengarkan di IPv4 (`127.0.0.1`).
- **Fix**: Ubah `API_BASE_URL` dari `localhost` menjadi alamat IP eksplisit `127.0.0.1` untuk menjamin koneksi IPv4 yang stabil.

### 6. Logic: Financial Division of Labor (Kitchen vs Coop)
- **Problem**: Ketidakjelasan batas tanggung jawab antara PIC Dapur dan Operator Koperasi dalam mengelola anggaran porsi (Rp15.000).
- **Implementation**:
    - **PIC Dapur**: Mengelola porsi **Rp5.000** untuk operasional (Gaji, Sewa, Listrik). Menu difilter melalui tab **"Operasional"**.
    - **Koperasi**: Mengelola porsi **Rp10.000** untuk bahan baku. Menu difilter melalui tab **"Selisih Bahan"**.
    - **Smart Warning**: Implementasi logika di `Procurement.tsx` yang memicu warna merah jika biaya belanja per porsi > Rp10.000.
    - **Data Scoping**: Menggunakan `X-Kitchen-ID` di request header untuk memastikan isolasi data antar unit dapur.
- **Skill**: Penerapan aturan bisnis (Business Rules) ke dalam arsitektur teknis menggunakan RBAC dan validasi dinamis di frontend.

## [28 April 2026] - Infrastructure & CMS Advanced Setup

### 1. Skill: Cloudflare Tunnel Deployment
- **Context**: Menghindari eksposur port publik dan mengatasi masalah SSL handshake manual.
- **Implementation**: 
    - Menggunakan `cloudflared` untuk membuat tunnel terenkripsi antara VPS dan Cloudflare Edge.
    - Memungkinkan akses internal service (localhost:port) melalui domain publik tanpa konfigurasi firewall yang rumit (bypassing CGNAT/NAT).
- **Lesson Learned**: Tunneling jauh lebih aman dan stabil untuk produksi dibandingkan port forwarding atau Caddy manual di level entry.

### 2. Skill: Keystatic UI Customization (Markdown CMS)
- **Context**: Filter kategori default terlalu memakan ruang saat jumlah kategori bertambah.
- **Implementation**: Mengganti komponen filter button dengan reaktif dropdown selector yang terhubung ke state Keystatic metadata.
- **Lesson Learned**: Meskipun menggunakan Markdown CMS, UI dashboard tetap harus mengikuti prinsip UX aplikasi modern (responsive & compact).

### 3. Strategy: Multi-Repo Sync Management
- **Context**: Mengelola 4+ repository (Admin, API, Mobile, Petugas) yang saling bergantung.
- **Skill**: Teknik sinkronisasi branch massal (batch push to `dev`) untuk memastikan integritas data antar layanan tetap terjaga saat deployment.

### 4. Skill: VPS Hardware Sizing for Go/Node Ecosystem
- **Context**: Menentukan biaya vs performa untuk hosting aplikasi berbasis Go (API) dan beberapa frontend Node.js (Astro/Vite).
- **Insight**: Prioritaskan RAM (min 4GB) dan CPU dengan single-core performance yang baik untuk build time frontend yang lebih cepat di VPS.

## [29 April 2026] - DevOps & Server Orchestration

### 1. Skill: Server RAM Optimization (Swap Strategy)
- **Context**: Menginstal aplikasi berat (Coolify/Panel) pada VPS dengan RAM terbatas (2GB).
- **Implementation**: Menambahkan swap file (misal 4GB) untuk memberikan "napas" tambahan bagi kernel saat terjadi lonjakan penggunaan memori (spiking).
- **Lesson Learned**: Swap bukan pengganti RAM fisik (lebih lambat), tapi sangat krusial sebagai jaring pengaman (*fail-safe*) agar OS tidak melakukan *kill process* secara acak saat memori penuh.

### 2. Skill: Self-Hosted Orchestration (Coolify)
- **Context**: Mengganti manajemen Docker Compose manual dengan dashboard visual.
- **Benefit**: Memberikan kemudahan dalam monitoring log, manajemen database, dan *zero-downtime deployment* melalui antarmuka web.

### 3. Skill: Secure Credential Management
- **Context**: Menyimpan data akses panel dan SSH key secara terstruktur.
- **Implementation**: Menggunakan folder `documentation/credentials/` yang di-exclude dari public sync (atau dijaga kerahasiaannya) untuk menyimpan `COOLIFY_ACCESS.md` dan SSH Deploy Keys.
- **Lesson Learned**: Selalu pisahkan kredensial infrastruktur dari kode utama dan dokumentasikan alur penggunaan Deploy Key untuk integrasi CI/CD.

---
*Generated by Antigravity Agent*
