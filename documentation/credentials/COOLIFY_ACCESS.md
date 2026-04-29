# Coolify Dashboard Access

Berikut adalah kredensial akses untuk panel manajemen Coolify:

- **URL Dashboard**: [http://103.126.117.20:8000](http://103.126.117.20:8000)
- **Email**: `mbgone@gmail.com`
- **Password**: `Piblajar2020!`

> [!IMPORTANT]
> Segera ganti password setelah Anda berhasil login untuk pertama kali.

## SSH Deploy Key
Kunci SSH berikut telah dibuat untuk menghubungkan repository GitHub ke Coolify:

- **Private Key**: `documentation/credentials/mbg_deploy_key`
- **Public Key**: `documentation/credentials/mbg_deploy_key.pub`

### Cara Penggunaan:
1. Copy isi dari `mbg_deploy_key.pub`.
2. Masukkan ke **GitHub Repository Settings** -> **Deploy Keys** -> **Add deploy key** (centang "Allow write access" jika perlu).
3. Di Coolify, pilih **Private Repository (via Deploy Key)** dan masukkan isi dari `mbg_deploy_key`.
