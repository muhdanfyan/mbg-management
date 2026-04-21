#!/bin/bash

# Configuration
VPS_USER="mbgone"
VPS_IP="103.126.117.20"
REMOTE_DIR="/home/mbgone/mbg-management"

echo "🚀 Preparing deployment to VPS..."

# Create directory on VPS
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# Sync files using a list of necessary items
echo "📦 Uploading project files..."
rsync -avz -e "ssh -i mbg.pem -o StrictHostKeyChecking=no" --exclude 'node_modules' --exclude '.git' --exclude '.env' . $VPS_USER@$VPS_IP:$REMOTE_DIR/

echo "🔨 Compiling React UI on VPS (Node.js Build)..."
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $REMOTE_DIR && docker run --rm -v \$(pwd):/app -w /app node:20-alpine sh -c 'npm install && npm run build'"

echo "🐳 Starting Docker containers on VPS..."
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $REMOTE_DIR && docker compose build && docker compose down && docker compose up -d"

# Final Step: Sync database seed
echo "🗄️ Syncing database seed (demo users & financial corrections)..."
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "docker exec -i mbg_mysql mysql -uroot -pf2RZScqZe5JOmvd3xeBvQlkpo4Vutjm9 mbg_management_dev < $REMOTE_DIR/backend/seed.sql"

echo "✅ Deployment & Seeding complete!"
