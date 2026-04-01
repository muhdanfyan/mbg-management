#!/bin/bash

# Configuration
VPS_USER="mbgone"
VPS_IP="103.126.117.20"
REMOTE_DIR="/home/mbgone/mbg-management/backend"

echo "🚀 Preparing deployment to VPS..."

# Create directory on VPS
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# Sync files
echo "📦 Uploading files..."
scp -r ./backend/* $VPS_USER@$VPS_IP:$REMOTE_DIR/

# Deploy using Docker Compose
echo "🐳 Starting Docker containers on VPS..."
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR && docker-compose down && docker-compose up -d --build"

echo "✅ Deployment complete! API is running at http://$VPS_IP:8080"
