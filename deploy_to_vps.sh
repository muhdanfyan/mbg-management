#!/bin/bash

# Configuration
VPS_USER="mbgone"
VPS_IP="103.126.117.20"
REMOTE_DIR="/home/mbgone/mbg-management/backend"
export PATH="/usr/local/bin:$PATH"

echo "🚀 Preparing deployment to VPS..."
# Build and sync frontend
echo "🏗️ Building frontend..."
/usr/local/bin/npm run build
rm -rf ./backend/dist && mkdir -p ./backend/dist
cp -r ./dist/* ./backend/dist/

# Sync files (Wipe old dist first to prevent stale JS bundles)
echo "📦 Uploading files..."
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "rm -rf $REMOTE_DIR/dist"
scp -i mbg.pem -o StrictHostKeyChecking=no -r ./backend/* $VPS_USER@$VPS_IP:$REMOTE_DIR/

# Deploy using Docker Compose (DEV environment)
echo "🐳 Starting Docker containers on VPS (DEV)..."
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $REMOTE_DIR && docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml up -d --build"

echo "✅ Deployment complete!"
