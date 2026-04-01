#!/bin/bash

# Configuration
VPS_USER="mbgone"
VPS_IP="103.126.117.20"
VPS_PASS="Piblajar2020"
REMOTE_DIR="/home/mbgone/mbg-management/backend"

echo "🚀 Starting automated deployment..."

# Create directory on VPS
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# Sync files
echo "📦 Uploading files (including built frontend)..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -r ./backend/* $VPS_USER@$VPS_IP:$REMOTE_DIR/

# Deploy using Docker Compose
echo "🐳 Starting Docker containers on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $REMOTE_DIR && docker-compose down && docker-compose up -d --build"

echo "✅ Deployment complete! API and Frontend are running at http://$VPS_IP:8080"
