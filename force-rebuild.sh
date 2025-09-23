#!/bin/bash

# Force rebuild script - ensures React app is rebuilt with latest changes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$SCRIPT_DIR/sesterce-dashboard"

echo "🔄 Force rebuilding React application..."

# Stop any running services
echo "🛑 Stopping services..."
./stop-simple.sh 2>/dev/null || true

# Go to React directory
cd "$REACT_DIR"

# Remove old build completely
echo "🗑️  Removing old build..."
rm -rf build/
rm -rf node_modules/.cache/ 2>/dev/null || true

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Force clean build
echo "🏗️  Building with latest API routing..."
GENERATE_SOURCEMAP=false npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
    
    # Show the new build hash
    NEW_JS=$(ls build/static/js/main.*.js 2>/dev/null | head -1)
    if [ -n "$NEW_JS" ]; then
        echo "📦 New build: $(basename "$NEW_JS")"
    fi
else
    echo "❌ Build failed"
    exit 1
fi

cd "$SCRIPT_DIR"

# Start services
echo "🚀 Starting services with new build..."
./start-simple.sh

echo ""
echo "🎉 Force rebuild complete!"
echo "🌐 Access: http://localhost:3025"
echo "🔒 API calls should now go to: http://[your-ip]:7779"
echo ""
echo "📊 Test login with: admin / Arno7747_SECURE_v2"
