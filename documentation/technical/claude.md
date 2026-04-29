# MBG Kitchen Management System

## Project Overview
MBG Kitchen Management System (Sistem Manajemen Dapur MBG) is a comprehensive platform for managing kitchen locations, construction, finances, HR, and procurement.

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet / Leaflet
- **Auth**: Supabase Auth (integration in progress/planned)
- **Icons**: Lucide React

### Backend
- **Language**: Go 1.23
- **Web Framework**: Gin Gonic
- **ORM**: GORM
- **Database**: MySQL 8.0 (Dockerized)
- **Containerization**: Docker & Docker Compose

## Directory Structure

- `/backend`: Go source code, Dockerfile, and docker-compose.yml.
  - `/models`: Database models and schemas.
- `/src`: React frontend source code.
  - `/pages`: Application views and page components.
  - `/services`: API client and data service definitions.
- `.github/workflows`: GitHub Actions for automated deployment.
- `.claude/skills`: Specialized agent skills for project development.
  - `skill_mapping_expert.md`: AI task coordination and skill gap identification.

## Deployment Information

- **VPS IP**: `103.191.92.247`
- **Backend API**: `http://103.191.92.247:8080/api`
- **Frontend Hosting**: GitHub Pages (planned at `https://muhdanfyan.github.io/mbg-management/`)
- **Deployment Scripts**:
  - `deploy_auto.sh`: Full automated deployment to VPS.
  - `deploy_to_vps.sh`: Core backend deployment to VPS.

## Key Development Notes
- The system uses Role-Based Access Control (RBAC) with roles like Super Admin, Manager, Finance, HRD, Procurement, and Staff.
- Database seeding is managed via `backend/seed.sql`.
- Authentication is handled via Supabase, with profiles stored in the MySQL database.
