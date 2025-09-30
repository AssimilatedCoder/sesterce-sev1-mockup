#!/bin/bash

# Stop Nginx-based services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛑 Stopping Nginx-based NullSector Calculator..."

# Stop API server
if [ -f "$SCRIPT_DIR/api.pid" ]; then
    API_PID=$(cat "$SCRIPT_DIR/api.pid")
    if kill -0 $API_PID 2>/dev/null; then
        kill $API_PID
        echo "✅ API server stopped"
    fi
    rm -f "$SCRIPT_DIR/api.pid"
fi

# Stop Nginx
if pgrep nginx > /dev/null; then
    sudo systemctl stop nginx
    echo "✅ Nginx stopped"
fi

# Remove our site configuration
sudo rm -f /etc/nginx/sites-enabled/NullSector-dashboard

echo "✅ All services stopped"
