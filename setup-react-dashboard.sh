#!/bin/bash

# Setup script for Sesterce React Dashboard

echo "🚀 Setting up Sesterce React Dashboard..."

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ nginx is not installed. Please install nginx first:"
    echo "   brew install nginx  # on macOS"
    echo "   sudo apt install nginx  # on Ubuntu"
    exit 1
fi

# Stop any existing nginx processes
echo "🛑 Stopping existing nginx processes..."
sudo pkill nginx 2>/dev/null || true

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/sesterce-dashboard/build"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found. Building React app..."
    cd "$SCRIPT_DIR/sesterce-dashboard"
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please check the React app."
        exit 1
    fi
fi

# Update nginx config with correct path
echo "🔧 Updating nginx configuration..."
sed "s|/Users/avanhuys/Projects/Grafana\\\\ Sesterce/sesterce-dashboard/build|$BUILD_DIR|g" \
    "$SCRIPT_DIR/nginx-sesterce-dashboard.conf" > /tmp/nginx-sesterce-dashboard.conf

# Copy nginx configuration
echo "📋 Installing nginx configuration..."
sudo cp /tmp/nginx-sesterce-dashboard.conf /usr/local/etc/nginx/servers/ 2>/dev/null || \
sudo cp /tmp/nginx-sesterce-dashboard.conf /etc/nginx/sites-available/sesterce-dashboard

# Enable site on Ubuntu-style systems
if [ -d "/etc/nginx/sites-enabled" ]; then
    sudo ln -sf /etc/nginx/sites-available/sesterce-dashboard /etc/nginx/sites-enabled/
    # Remove default site if it exists
    sudo rm -f /etc/nginx/sites-enabled/default
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
sudo nginx

# Check if nginx is running
sleep 2
if pgrep nginx > /dev/null; then
    echo "✅ nginx is running"
    
    # Get local IP
    LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    
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
    echo "   sudo nginx -s reload  # Reload configuration"
    echo "   sudo nginx -s stop    # Stop nginx"
    echo "   sudo nginx           # Start nginx"
    
else
    echo "❌ Failed to start nginx"
    exit 1
fi
