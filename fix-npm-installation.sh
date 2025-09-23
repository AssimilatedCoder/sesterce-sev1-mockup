#!/bin/bash

# NPM Installation Recovery Script
# Fixes broken npm installations caused by audit fixes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$SCRIPT_DIR/sesterce-dashboard"

echo "🔧 Fixing broken npm installation..."

cd "$REACT_DIR"

# Step 1: Clean everything
echo "🧹 Cleaning broken installation..."
rm -rf node_modules/
rm -f package-lock.json
rm -rf .npm/
rm -rf ~/.npm/_cacache/ 2>/dev/null || true

# Step 2: Restore original package files from git
echo "🔄 Restoring original package.json from git..."
git checkout HEAD -- package.json package-lock.json 2>/dev/null || true

# Step 3: Clear npm cache
echo "🗑️  Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Step 4: Install with safe options
echo "📦 Installing dependencies (safe mode)..."

# Try standard install first
npm install --no-audit --no-fund

if [ $? -ne 0 ]; then
    echo "⚠️  Standard install failed, trying alternative approaches..."
    
    # Try with legacy peer deps
    npm install --legacy-peer-deps --no-audit --no-fund
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Legacy install failed, trying with force..."
        
        # Last resort: force install
        npm install --force --no-audit --no-fund
        
        if [ $? -ne 0 ]; then
            echo "❌ All installation attempts failed"
            echo ""
            echo "🚨 Manual recovery needed:"
            echo "1. Check Node.js version: node --version"
            echo "2. Check npm version: npm --version"
            echo "3. Try: npm install react-scripts@5.0.1"
            echo "4. Or delete and re-clone the repository"
            exit 1
        fi
    fi
fi

# Step 5: Verify react-scripts is installed
echo "🔍 Verifying react-scripts installation..."
if [ ! -f "node_modules/.bin/react-scripts" ]; then
    echo "⚠️  react-scripts missing, installing specifically..."
    npm install react-scripts@5.0.1 --save-dev --no-audit
fi

# Step 6: Test build
echo "🧪 Testing build..."
GENERATE_SOURCEMAP=false npm run build

if [ $? -eq 0 ]; then
    echo "✅ NPM installation fixed successfully!"
    echo "📦 Build completed"
    
    # Show new build info
    NEW_JS=$(ls build/static/js/main.*.js 2>/dev/null | head -1)
    if [ -n "$NEW_JS" ]; then
        echo "🆕 New build file: $(basename "$NEW_JS")"
    fi
    
    cd "$SCRIPT_DIR"
    
    echo ""
    echo "🚀 Starting services with fixed installation..."
    ./start-simple.sh
    
else
    echo "❌ Build still failing after npm fix"
    echo ""
    echo "🔍 Diagnostics:"
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "React-scripts: $(ls node_modules/.bin/react-scripts 2>/dev/null || echo 'MISSING')"
    exit 1
fi
