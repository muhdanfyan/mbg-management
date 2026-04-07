#!/bin/bash

# This script runs on the VPS to deploy the dev environment
echo "🚀 Deploying DEV environment..."

# Navigate to project directory
cd /home/mbgone/mbg-management/backend

# 1. Ensure the dev database exists inside the MySQL container
echo "🗄️ Ensuring mbg_management_dev database exists..."
docker exec mbg_mysql mysql -uroot -prootpassword -e "CREATE DATABASE IF NOT EXISTS mbg_management_dev;"

# 2. Deploy the dev backend service using docker-compose
echo "🐳 Starting mbg_backend_dev..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build backend_dev

# 3. Reload Caddy to apply domain changes
echo "🌐 Reloading Caddy..."
docker exec mbg_caddy caddy reload --config /etc/caddy/Caddyfile

echo "✅ DEV environment deployed successfully!"
