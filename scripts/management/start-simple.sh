#!/bin/bash

# Simple startup script without sudo requirements
# Uses a simple HTTP server for static files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$SCRIPT_DIR/NullSector-dashboard"
BUILD_DIR="$REACT_DIR/build"

echo "🚀 Starting NullSector Calculator (Simple Mode)..."

# Check if build directory exists and is recent
# Also check if git has newer commits than the build
NEEDS_BUILD=false

if [ ! -d "$BUILD_DIR" ]; then
    echo "🔍 Build directory missing"
    NEEDS_BUILD=true
elif [ "$REACT_DIR/src" -nt "$BUILD_DIR" ]; then
    echo "🔍 Source files newer than build"
    NEEDS_BUILD=true
elif [ "$REACT_DIR/package.json" -nt "$BUILD_DIR" ]; then
    echo "🔍 Package.json newer than build"
    NEEDS_BUILD=true
elif [ -d ".git" ] && [ "$(git log -1 --format=%ct)" -gt "$(stat -c %Y "$BUILD_DIR" 2>/dev/null || echo 0)" ]; then
    echo "🔍 Git commits newer than build"
    NEEDS_BUILD=true
fi

if [ "$NEEDS_BUILD" = true ]; then
    echo "🔄 Building React application..."
    cd "$REACT_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo "📦 Installing Node.js dependencies..."
        
        # Clean install to avoid conflicts
        rm -rf node_modules/ package-lock.json 2>/dev/null || true
        
        # Install without audit fixes to prevent breaking changes
        npm install --no-audit --no-fund
        
        if [ $? -ne 0 ]; then
            echo "❌ npm install failed"
            exit 1
        fi
    fi
    
    # Build the app
    GENERATE_SOURCEMAP=false npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ React build completed"
    else
        echo "❌ React build failed"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
else
    echo "✅ React build is up to date"
fi

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
echo "🎉 NullSector Calculator is running!"
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
