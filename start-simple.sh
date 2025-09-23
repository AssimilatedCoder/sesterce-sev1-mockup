#!/bin/bash

# Simple startup script without sudo requirements
# Uses a simple HTTP server for static files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/sesterce-dashboard/build"

echo "🚀 Starting Sesterce Calculator (Simple Mode)..."

# Start API server
echo "🔒 Starting secure API server..."
cd "$SCRIPT_DIR"
source venv/bin/activate
python calculator-api.py &
API_PID=$!
echo $API_PID > api.pid
echo "✅ API server started on http://localhost:7779 (PID: $API_PID)"

# Start simple HTTP server for static files
echo "🌐 Starting static file server..."
cd "$BUILD_DIR"
python3 -m http.server 3025 &
HTTP_PID=$!
echo $HTTP_PID > ../http.pid
echo "✅ Static server started on http://localhost:3025 (PID: $HTTP_PID)"

echo ""
echo "🎉 Sesterce Calculator is running!"
echo "🌐 Frontend: http://localhost:3025"
echo "🔒 API: http://localhost:7779"
echo ""
echo "📊 Login credentials:"
echo "   • admin / Arno7747_SECURE_v2"
echo ""
echo "⚠️  Note: This uses Python's simple HTTP server."
echo "   API calls will go directly to port 7779."
echo ""
echo "To stop: ./stop-simple.sh"
