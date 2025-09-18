#!/bin/bash

# Setup script for Sesterce React Dashboard

echo "🚀 Setting up Sesterce React Dashboard..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$SCRIPT_DIR/sesterce-dashboard"
BUILD_DIR="$REACT_DIR/build"

# Check if we're on Ubuntu or macOS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    IS_UBUNTU=true
    NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
    NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
    NGINX_LOG_DIR="/var/log/nginx"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    IS_UBUNTU=false
    NGINX_SITES_AVAILABLE="/usr/local/etc/nginx/servers"
    NGINX_SITES_ENABLED="/usr/local/etc/nginx/servers"
    NGINX_LOG_DIR="/usr/local/var/log/nginx"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

echo "🖥️  Detected OS: $([ "$IS_UBUNTU" = true ] && echo "Ubuntu/Linux" || echo "macOS")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    if [ "$IS_UBUNTU" = true ]; then
        echo "📦 Installing Node.js on Ubuntu..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        echo "✅ Node.js installed"
    else
        echo "   Please install Node.js first:"
        echo "   brew install node  # on macOS"
        exit 1
    fi
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
fi

echo "✅ Node.js $(node --version) and npm $(npm --version) are available"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ nginx is not installed."
    if [ "$IS_UBUNTU" = true ]; then
        echo "📦 Installing nginx on Ubuntu..."
        sudo apt update
        sudo apt install -y nginx
        echo "✅ nginx installed"
    else
        echo "   Please install nginx first:"
        echo "   brew install nginx  # on macOS"
        exit 1
    fi
fi

# Navigate to React directory
if [ ! -d "$REACT_DIR" ]; then
    echo "❌ React directory not found: $REACT_DIR"
    exit 1
fi

cd "$REACT_DIR"

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install npm dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build the React app
echo "🔨 Building React application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build React application"
    exit 1
fi

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not created: $BUILD_DIR"
    exit 1
fi

echo "✅ React application built successfully"

# Stop any existing nginx processes
echo "🛑 Stopping existing nginx processes..."
if [ "$IS_UBUNTU" = true ]; then
    sudo systemctl stop nginx 2>/dev/null || true
    sudo pkill nginx 2>/dev/null || true
else
    sudo nginx -s stop 2>/dev/null || true
    sudo pkill nginx 2>/dev/null || true
fi

# Create nginx sites directories if they don't exist
if [ "$IS_UBUNTU" = true ]; then
    sudo mkdir -p "$NGINX_SITES_AVAILABLE"
    sudo mkdir -p "$NGINX_SITES_ENABLED"
fi

# Update nginx config with correct path
echo "🔧 Creating nginx configuration..."
cat > /tmp/nginx-sesterce-dashboard.conf << EOF
server {
    listen 7777;
    listen [::]:7777;
    
    server_name _;
    root $BUILD_DIR;
    index index.html;
    
    # Enable CORS for all requests
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";
    
    # Serve the React app
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Serve static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }
    
    # Handle CSV and log files from the telemetry data
    location /superpod_sev1_fake_telemetry/ {
        add_header Access-Control-Allow-Origin *;
        add_header Content-Type "text/plain";
    }
    
    # Handle the dashboard data loader
    location /dashboard-data-loader.js {
        add_header Access-Control-Allow-Origin *;
        add_header Content-Type "application/javascript";
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

# Install nginx configuration
echo "📋 Installing nginx configuration..."
sudo cp /tmp/nginx-sesterce-dashboard.conf "$NGINX_SITES_AVAILABLE/sesterce-dashboard"

# Enable site on Ubuntu-style systems
if [ "$IS_UBUNTU" = true ]; then
    sudo ln -sf "$NGINX_SITES_AVAILABLE/sesterce-dashboard" "$NGINX_SITES_ENABLED/"
    # Remove default site if it exists
    sudo rm -f "$NGINX_SITES_ENABLED/default"
fi

# Fix permissions for nginx to access files
echo "🔧 Fixing file permissions..."
if [ "$IS_UBUNTU" = true ]; then
    # Fix directory permissions up the chain
    chmod 755 "$HOME" 2>/dev/null || true
    chmod 755 "$HOME/Projects" 2>/dev/null || true
    chmod 755 "$SCRIPT_DIR"
    chmod 755 "$REACT_DIR"
    chmod -R 755 "$BUILD_DIR"
    
    # Ensure www-data can access the files
    sudo chown -R www-data:www-data "$BUILD_DIR" 2>/dev/null || true
else
    # macOS permissions
    chmod 755 "$SCRIPT_DIR"
    chmod 755 "$REACT_DIR"
    chmod -R 755 "$BUILD_DIR"
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "❌ nginx configuration test failed"
    exit 1
fi

# Start nginx
echo "🚀 Starting nginx..."
if [ "$IS_UBUNTU" = true ]; then
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    sudo nginx
fi

# Wait a moment for nginx to start
sleep 2

# Check if nginx is running
if pgrep nginx > /dev/null; then
    echo "✅ nginx is running"
    
    # Get local IP
    if [ "$IS_UBUNTU" = true ]; then
        LOCAL_IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+' 2>/dev/null || hostname -I | awk '{print $1}')
    else
        LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    fi
    
    echo ""
    echo "🎉 Sesterce React Dashboard is now running!"
    echo "🌐 Local access: http://localhost:7777"
    if [ ! -z "$LOCAL_IP" ]; then
        echo "🌐 Network access: http://$LOCAL_IP:7777"
    fi
    echo ""
    echo "📊 Features available:"
    echo "   • SEV-1 War Room Dashboard (Tab 1)"
    echo "   • GPU Cost Calculator (Tab 2)"
    echo ""
    echo "🛠️  Management commands:"
    if [ "$IS_UBUNTU" = true ]; then
        echo "   sudo systemctl reload nginx  # Reload configuration"
        echo "   sudo systemctl stop nginx    # Stop nginx"
        echo "   sudo systemctl start nginx   # Start nginx"
        echo "   sudo systemctl status nginx  # Check status"
    else
        echo "   sudo nginx -s reload  # Reload configuration"
        echo "   sudo nginx -s stop    # Stop nginx"
        echo "   sudo nginx           # Start nginx"
    fi
    echo ""
    echo "🧪 Test the installation:"
    echo "   curl -I http://localhost:7777"
    echo "   ./react-dashboard test"
    
else
    echo "❌ Failed to start nginx"
    echo "📋 Check logs:"
    echo "   sudo tail -20 $NGINX_LOG_DIR/error.log"
    exit 1
fi

# Clean up temporary files
rm -f /tmp/nginx-sesterce-dashboard.conf

echo ""
echo "✅ Setup complete! The dashboard should now be accessible."