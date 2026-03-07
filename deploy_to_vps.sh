#!/bin/bash

# Configuration
VPS_USER="kassaone"
VPS_IP="103.191.92.247"
REMOTE_DIR="/home/kassaone/mbg-management/backend"

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
