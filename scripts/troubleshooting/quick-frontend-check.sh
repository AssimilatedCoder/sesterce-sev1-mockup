#!/bin/bash

# Quick Frontend Health Check
# Run this immediately when black screen occurs

echo "🚨 Quick Frontend Black Screen Diagnostic"
echo "========================================"
echo "Timestamp: $(date)"
echo ""

# Check container status
echo "📦 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep nullsector

echo ""
echo "💾 Memory Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep nullsector

echo ""
echo "🌐 Connectivity Test:"
echo -n "Frontend (2053): "
if curl -s -m 3 http://localhost:2053 > /dev/null; then
    echo "✅ Responsive"
else
    echo "❌ Unresponsive"
fi

echo -n "API Health: "
if curl -s -m 3 http://localhost:2053/api/health > /dev/null; then
    echo "✅ Responsive"
else
    echo "❌ Unresponsive"
fi

echo ""
echo "📋 Recent Frontend Logs (last 20 lines):"
docker logs --tail 20 nullsector-frontend 2>&1

echo ""
echo "🔍 Recent Nginx Logs (last 10 lines):"
docker logs --tail 10 nullsector-nginx 2>&1

echo ""
echo "⚡ Quick Actions:"
echo "1. Check browser console (F12 → Console tab)"
echo "2. Check browser network tab for failed requests"
echo "3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo "4. Run full investigation: ./debug-frontend-blackscreen.sh"
echo ""
