---
name: User Credentials Reference
description: List of demo user accounts and their roles for testing the MBG Management system.
---

# User Credentials Reference

These credentials are to be used for automated and manual testing of the MBG Management system.

| Role | Email | Password | Allowed Modules |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@mbg.com` | `pass123` | All (Dashboard, Locations, Construction, Procurement, HR, Finance, Users) |
| **Manager** | `manager@mbg.com` | `pass123` | Dashboard, Locations, Construction |
| **Finance** | `finance@mbg.com` | `pass123` | Dashboard, Finance |
| **HRD** | `hrd@mbg.com` | `pass123` | Dashboard, HR |
| **Procurement** | `procurement@mbg.com` | `pass123` | Dashboard, Procurement |
| **Staff** | `staff@mbg.com` | `pass123` | Dashboard only |

## Access Requirements
- **Super Admin**: Full CRUD on all modules.
- **Manager**: View and limited edit on Locations/Construction.
- **Finance/HRD/Procurement**: Specific module focus.
- **Staff**: View-only Dashboard.

## Login URL
- `http://localhost:4729` (Local)
- `http://localhost:8080/api/auth/login` (Backend API)
