#!/bin/bash

# Configuration
VPS_USER="mbgone"
VPS_IP="103.126.117.20"

# Detect current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 Current branch: $BRANCH"

if [ "$BRANCH" == "main" ]; then
    REMOTE_DIR="/home/mbgone/mbg-prod"
    PROJECT_NAME="mbg-prod"
    DOMAIN="mbgone.id"
    DB_NAME="mbg_management"
elif [ "$BRANCH" == "dev" ]; then
    REMOTE_DIR="/home/mbgone/mbg-dev"
    PROJECT_NAME="mbg-dev"
    DOMAIN="mbgone.site"
    DB_NAME="mbg_management_dev"
else
    echo "⚠️ Branch is not main or dev. Defaulting to dev settings."
    REMOTE_DIR="/home/mbgone/mbg-dev"
    PROJECT_NAME="mbg-dev"
    DOMAIN="mbgone.site"
    DB_NAME="mbg_management_dev"
fi

echo "🚀 Preparing deployment to $DOMAIN ($PROJECT_NAME)..."

# Create directory on VPS
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# Sync files
echo "📦 Uploading project files from local..."
rsync -avz -e "ssh -i mbg.pem -o StrictHostKeyChecking=no" --exclude 'node_modules' --exclude '.git' --exclude '.env' . $VPS_USER@$VPS_IP:$REMOTE_DIR/

echo "🔨 Compiling React UI on VPS..."
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $REMOTE_DIR && docker run --rm -v \$(pwd):/app -w /app node:20-alpine sh -c 'npm install && npm run build'"

echo "🐳 Starting Docker containers ($PROJECT_NAME)..."
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $REMOTE_DIR && docker compose -p $PROJECT_NAME build && docker compose -p $PROJECT_NAME down && docker compose -p $PROJECT_NAME up -d"

# Final Step: Sync database seed
echo "🗄️ Syncing database seed to $DB_NAME..."
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "docker exec -i mbg_mysql mysql -uroot -pf2RZScqZe5JOmvd3xeBvQlkpo4Vutjm9 $DB_NAME < $REMOTE_DIR/backend/seed.sql"

echo "✅ Deployment to $DOMAIN complete!"
