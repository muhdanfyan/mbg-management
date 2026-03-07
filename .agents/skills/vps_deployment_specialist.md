---
name: vps_deployment_specialist
description: Skill for deploying the MBG backend to the specific kassaone VPS.
---
# VPS Deployment Specialist Skill

Targeting VPS: `103.191.92.247` (User: `kassaone`).

## Requirements
- **Runtime:** Go 1.23+.
- **Database:** MySQL 8.0.
- **Port:** 8080 (API).

## Deployment Steps
1. **Build Binary:** `GOOS=linux GOARCH=amd64 go build -o app main.go models.go`
2. **Transfer:** Use `scp` to send the binary and `docker-compose.yml` to `/home/kassaone/mbg-backend`.
3. **Database Setup:**
   - Log in: `ssh kassaone@103.191.92.247`
   - Install MySQL if missing.
   - Create database `mbg_management`.
4. **Execution:** Run via Docker Compose or Systemd.

## MySQL Setup Commands
```bash
# On VPS
mysql -u root -p
CREATE DATABASE mbg_management;
CREATE USER 'kassaone'@'%' IDENTIFIED BY 'Piblajar2020';
GRANT ALL PRIVILEGES ON mbg_management.* TO 'kassaone'@'%';
FLUSH PRIVILEGES;
```
