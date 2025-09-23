#!/bin/bash

# Complete update and restart script
# Handles git pull, rebuild, and service restart

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Updating Sesterce Calculator..."

# Stop services first
echo "🛑 Stopping current services..."
./stop-simple.sh 2>/dev/null || true
./secure-dashboard stop 2>/dev/null || true

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi

# Check if there are changes to React source
if git diff --name-only HEAD~1 HEAD | grep -q "sesterce-dashboard/src\|package.json"; then
    echo "🔄 React source changes detected, rebuild required"
    FORCE_REBUILD=true
else
    echo "✅ No React source changes detected"
    FORCE_REBUILD=false
fi

# Start services (will auto-build if needed)
echo "🚀 Starting services..."
./start-simple.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Update complete!"
    echo "🌐 Access: http://localhost:3025"
    echo "🔒 API: http://localhost:7779"
    echo ""
    echo "📊 Login with:"
    echo "   • admin / Arno7747_SECURE_v2"
else
    echo "❌ Failed to start services"
    exit 1
fi
