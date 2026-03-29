#!/bin/bash

# MBG Management - Unified Dev Starter
echo "🚀 Starting MBG Kitchen Management System..."

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    # Kill background jobs
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM EXIT

# 1. Check if backend port 8080 is in use and kill if necessary
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is already in use. Cleaning up..."
    lsof -ti:8080 | xargs kill -9
fi

# 2. Start Backend with Hot Reload (Air)
echo "📡 Starting Backend (Air)..."
(cd backend && go run github.com/air-verse/air@v1.61.0) &

# 3. Wait a moment for BE to initialize
sleep 2

# 4. Start Frontend
echo "💻 Starting Frontend (Vite)..."
npm run dev

# Wait for background jobs
wait
