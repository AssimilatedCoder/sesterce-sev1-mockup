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

# Start API server (ensure single instance and port free)
echo "🔒 Ensuring secure API server is running on port 7779..."
cd "$SCRIPT_DIR"
source venv/bin/activate

# If something else is holding 7779, stop it
if ss -tln 2>/dev/null | grep -q ":7779\s"; then
  echo "⚠️  Port 7779 in use. Attempting to free it..."
  # Try to kill our prior API instance if tracked
  if [ -f api.pid ]; then
    OLD_PID=$(cat api.pid)
    if kill -0 "$OLD_PID" 2>/dev/null; then
      kill "$OLD_PID" 2>/dev/null || true
      sleep 1
    fi
    rm -f api.pid
  fi
  # If still bound, kill whatever is on the port
  PIDS=$(ss -tlnp 2>/dev/null | awk '/:7779 / {print $NF}' | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | sort -u)
  for P in $PIDS; do
    kill "$P" 2>/dev/null || true
  done
  sleep 1
fi

# Start only if not already listening
if ! ss -tln 2>/dev/null | grep -q ":7779\s"; then
  echo "🚀 Starting API on 127.0.0.1:7779..."
  python calculator-api.py &
  API_PID=$!
  echo $API_PID > api.pid
  echo "✅ API server started on http://localhost:7779 (PID: $API_PID)"
else
  echo "✅ API already listening on 127.0.0.1:7779"
fi

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
    add_header X-Frame-Options SAMEORIGIN;
    add_header Content-Security-Policy "frame-ancestors 'self'";
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
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        add_header Access-Control-Allow-Credentials true;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
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

# Copy config and start Nginx (open firewall and ensure correct state)
sudo cp "$NGINX_CONF" /etc/nginx/sites-available/sesterce-dashboard
sudo ln -sf /etc/nginx/sites-available/sesterce-dashboard /etc/nginx/sites-enabled/sesterce-dashboard

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Open firewall for 3025 (ignore errors if ufw not present)
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 3025/tcp >/dev/null 2>&1 || true
fi

# Test configuration
if sudo nginx -t; then
    # Prefer systemd state to decide
    if ! systemctl is-active --quiet nginx; then
        sudo systemctl enable nginx >/dev/null 2>&1 || true
        sudo systemctl restart nginx || sudo systemctl start nginx
        echo "✅ Nginx started"
    else
        sudo systemctl restart nginx || sudo systemctl reload nginx
        echo "✅ Nginx restarted"
    fi
    
    # Verify Nginx is listening
    sleep 2
    if netstat -tlnp 2>/dev/null | grep -q ":3025.*nginx" || ss -tlnp 2>/dev/null | grep -q ":3025.*nginx"; then
        echo "✅ Nginx confirmed listening on port 3025"
    else
        echo "⚠️  Warning: Nginx may not be listening on port 3025"
        echo "🔍 Nginx status:"
        sudo systemctl status nginx --no-pager -l || true
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
