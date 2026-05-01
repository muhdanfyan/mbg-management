#!/bin/bash

# Configuration
VPS_USER="mbgone"
VPS_IP="103.126.117.20"
PROD_DIR="/home/mbgone/mbg-prod"
DEV_DIR="/home/mbgone/mbg-dev"

# Detect current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 Current branch: $BRANCH"

if [ "$BRANCH" == "main" ]; then
    TARGET_DIR=$PROD_DIR
    DOMAIN="mbgone.id"
else
    TARGET_DIR=$DEV_DIR
    DOMAIN="mbgone.site"
fi

echo "🚀 Preparing deployment to $DOMAIN..."

# Create directory on VPS
ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p $TARGET_DIR"

# Sync files
echo "📦 Uploading project files from local..."
rsync -avz -e "ssh -i mbg.pem -o StrictHostKeyChecking=no" --exclude 'node_modules' --exclude '.git' --exclude '.env' . $VPS_USER@$VPS_IP:$TARGET_DIR/

if [ "$BRANCH" == "dev" ]; then
    echo "🔨 Rebuilding DEV backend in the PROD stack..."
    # We trigger the build from the PROD directory but pointing to the DEV context
    ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "if [ -d $PROD_DIR ]; then cd $PROD_DIR && export DEV_CONTEXT=$DEV_DIR && docker compose build backend_dev && docker compose up -d backend_dev; else echo 'PROD stack not found, only files uploaded.'; fi"
else
    echo "🔨 Compiling React UI on VPS..."
    ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $TARGET_DIR && docker run --rm -v \$(pwd):/app -w /app node:20-alpine sh -c 'npm install && npm run build'"

    echo "🐳 Starting Full Stack (Production & Dev)..."
    ssh -i mbg.pem -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $TARGET_DIR && export DEV_CONTEXT=$DEV_DIR && docker compose build && docker compose down && docker compose up -d"
fi

# Sync Database (Follow Local)
echo "🗄️ Synchronizing Databases to match local data..."
# Start temporary tunnel for sync scripts
ssh -i mbg.pem -o StrictHostKeyChecking=no -L 3307:127.0.0.1:3306 $VPS_USER@$VPS_IP -N &
TUNNEL_PID=$!
sleep 5

echo "Syncing Production DB..."
export DB_DSN="root:f2RZScqZe5JOmvd3xeBvQlkpo4Vutjm9@tcp(127.0.0.1:3307)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
cd backend && go run scripts/sync_wadah_data.go && go run scripts/sync_running_data.go && go run scripts/sync_batch2_data.go && go run scripts/sync_final_data.go && cd ..

echo "Syncing Dev DB..."
export DB_DSN="root:f2RZScqZe5JOmvd3xeBvQlkpo4Vutjm9@tcp(127.0.0.1:3307)/mbg_management_dev?charset=utf8mb4&parseTime=True&loc=Local"
cd backend && go run scripts/sync_wadah_data.go && go run scripts/sync_running_data.go && go run scripts/sync_batch2_data.go && go run scripts/sync_final_data.go && cd ..

kill $TUNNEL_PID

echo "✅ Deployment to $DOMAIN complete!"
