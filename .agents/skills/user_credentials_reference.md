# User Credentials Reference (MBG Management)

This file contains the demo accounts and system credentials for development and testing.

## 1. Demo User Accounts
All passwords except Super Admin are `mbg12345`.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@mbg.com` | `pass123` |
| **PIC Dapur** | `dapur@mbg.com` | `mbg12345` |
| **Investor** | `investor@mbg.com` | `mbg12345` |
| **Operator Koperasi** | `koperasi@mbg.com` | `mbg12345` |

---

## 2. Server & Infrastructure
| Service | Host / IP | User / Port | Password |
| :--- | :--- | :--- | :--- |
| **VPS (Main)** | `103.126.117.20` | `mbgone` | `Piblajar2020` |
| **MariaDB/MySQL (Prod)** | `localhost` | `kassaone` | `Piblajar2020` |
| **MariaDB/MySQL (Dev)** | `localhost` | `kassaone` | `Piblajar2020` |
| **Caddy Reverse Proxy** | `localhost` | Ports 80, 443 | - |

---

## 3. Web Interfaces
| Environment | Frontend URL | Backend URL |
| :--- | :--- | :--- |
| **Production** | [mbgone.site](https://mbgone.site) | [api.mbgone.site](https://api.mbgone.site) |
| **Development** | [dev.mbgone.id](https://dev.mbgone.id) | [api-dev.mbgone.id](https://api-dev.mbgone.id) |

> [!CAUTION]
> These credentials are for **demo/staging** environments. Ensure production environments use unique, secure passwords stored in environmental secrets.
