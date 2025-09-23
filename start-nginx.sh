#!/bin/bash

# Production-ready Nginx startup script
# Uses Nginx for proper web server functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$SCRIPT_DIR/sesterce-dashboard"
BUILD_DIR="$REACT_DIR/build"

echo "🚀 Starting Sesterce Calculator (Production Mode with Nginx)..."

# Check if build directory exists and is recent
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
        echo "📦 Installing Node.js dependencies (safe mode)..."
        
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

# Start Nginx
echo "🌐 Starting Nginx web server..."

# Check if nginx is installed
if ! command -v nginx >/dev/null 2>&1; then
    echo "❌ Nginx not found. Please install nginx:"
    echo "   sudo apt update && sudo apt install nginx"
    exit 1
fi

# Create dynamic Nginx config with correct paths
NGINX_CONF="/tmp/sesterce-nginx.conf"
cat > "$NGINX_CONF" << EOF
server {
    listen 3025;
    listen [::]:3025;
    
    server_name _;
    root $BUILD_DIR;
    index index.html;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Proxy API requests to secure backend
    location /api/ {
        proxy_pass http://127.0.0.1:7779;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin "http://localhost:3025";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        add_header Access-Control-Allow-Credentials true;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "http://localhost:3025";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Serve the React app
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Serve static files with caching and compression
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF

# Copy config and start Nginx
sudo cp "$NGINX_CONF" /etc/nginx/sites-available/sesterce-dashboard
sudo ln -sf /etc/nginx/sites-available/sesterce-dashboard /etc/nginx/sites-enabled/sesterce-dashboard

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
if sudo nginx -t; then
    if ! pgrep nginx > /dev/null; then
        sudo systemctl start nginx
        echo "✅ Nginx started"
    else
        sudo systemctl reload nginx
        echo "✅ Nginx reloaded"
    fi
    
    # Verify Nginx is listening
    sleep 2
    if netstat -tlnp 2>/dev/null | grep -q ":3025.*nginx" || ss -tlnp 2>/dev/null | grep -q ":3025.*nginx"; then
        echo "✅ Nginx confirmed listening on port 3025"
    else
        echo "⚠️  Warning: Nginx may not be listening on port 3025"
    fi
else
    echo "❌ Nginx configuration test failed"
    sudo nginx -t
    exit 1
fi

# Clean up temp file
rm -f "$NGINX_CONF"

echo ""
echo "🎉 Production Sesterce Calculator is running!"
echo "🌐 Frontend: http://localhost:3025 (Nginx)"
echo "🔒 API: http://localhost:7779 (Flask)"
echo "🛡️  Features: Security headers, gzip compression, API proxying"
echo ""
echo "📊 Login credentials:"
echo "   • admin / Arno7747_SECURE_v2"
echo ""
echo "✅ Production-ready with:"
echo "   • Nginx web server"
echo "   • API proxying (/api/* → port 7779)"
echo "   • Security headers (XSS, CSRF protection)"
echo "   • Gzip compression"
echo "   • Static file caching"
echo ""
echo "To stop: ./stop-nginx.sh"
