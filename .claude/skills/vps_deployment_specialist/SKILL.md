---
name: vps_deployment_specialist
description: Skill for deploying the MBG backend to the specific kassaone VPS (Docker or Native).
---
# VPS Deployment Specialist Skill

Targeting VPS: `103.191.92.247` (User: `kassaone`).

## Requirements
- **Runtime:** Go 1.23+
- **Database:** MySQL 8.0
- **Port:** 8080 (API)

## Deployment Method (Confirmed: Docker)
We use Docker for isolation and ease of deployment.

1. **Transfer files:** Send the entire `backend/` folder (including `Dockerfile` and `docker-compose.yml`) to `/home/kassaone/mbg-management/`.
2. **Build & Run:** 
   ```bash
   cd /home/kassaone/mbg-management/backend
   docker-compose up -d --build
   ```
3. **Database:** The `db` service in `docker-compose.yml` automatically starts a MySQL 8.0 instance.

### Manual Database Access (Inside Docker)
```bash
docker exec -it mbg_mysql mysql -u kassaone -pPiblajar2020 mbg_management
```

### Option B: Native Systemd (Direct on Host)
*Use this if you want maximum performance and already have MySQL on the host.*

1. **Build locally:** `GOOS=linux GOARCH=amd64 go build -o mbg-api main.go models.go`.
2. **Transfer:** `scp backend/mbg-api kassaone@103.191.92.247:/home/kassaone/`.
3. **Setup Systemd:**
   Create `/etc/systemd/system/mbg-api.service`:
   ```ini
   [Unit]
   Description=MBG Management API
   After=network.target mysql.service

   [Service]
   User=kassaone
   WorkingDirectory=/home/kassaone
   ExecStart=/home/kassaone/mbg-api
   Restart=always
   Environment=DB_DSN="kassaone:Piblajar2020@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"

   [Install]
   WantedBy=multi-user.target
   ```
4. **Commands:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable mbg-api
   sudo systemctl start mbg-api
   ```

## MySQL Setup (Host-based)
If not using Docker, run this on the VPS:
```sql
CREATE DATABASE mbg_management;
CREATE USER 'kassaone'@'localhost' IDENTIFIED BY 'Piblajar2020';
GRANT ALL PRIVILEGES ON mbg_management.* TO 'kassaone'@'localhost';
FLUSH PRIVILEGES;
```
