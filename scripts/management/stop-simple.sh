#!/bin/bash

# Simple stop script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛑 Stopping NullSector Calculator..."

# Stop API server
if [ -f "$SCRIPT_DIR/api.pid" ]; then
    API_PID=$(cat "$SCRIPT_DIR/api.pid")
    if kill -0 $API_PID 2>/dev/null; then
        kill $API_PID
        echo "✅ API server stopped"
    fi
    rm -f "$SCRIPT_DIR/api.pid"
fi

# Stop HTTP server
if [ -f "$SCRIPT_DIR/http.pid" ]; then
    HTTP_PID=$(cat "$SCRIPT_DIR/http.pid")
    if kill -0 $HTTP_PID 2>/dev/null; then
        kill $HTTP_PID
        echo "✅ HTTP server stopped"
    fi
    rm -f "$SCRIPT_DIR/http.pid"
fi

echo "✅ All services stopped"
