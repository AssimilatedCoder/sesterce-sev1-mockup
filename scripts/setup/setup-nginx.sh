#!/bin/bash
# Setup nginx to serve SEV-1 Dashboard on port 7777

set -e

echo "🚀 Setting up nginx for SEV-1 Dashboard..."

# Get the current directory (project root)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Project root: $PROJECT_ROOT"

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    sudo apt update
    sudo apt install nginx -y
else
    echo "✅ nginx is already installed"
fi

# Stop any existing nginx
echo "🛑 Stopping existing nginx..."
sudo systemctl stop nginx 2>/dev/null || true

# Kill anything on port 7777
echo "🔪 Clearing port 7777..."
sudo fuser -k 7777/tcp 2>/dev/null || true
sleep 2

# Create nginx config with correct project path
echo "📝 Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/sev1-dashboard > /dev/null << EOF
server {
    listen 7777;
    listen [::]:7777;
    
    server_name _;
    root $PROJECT_ROOT;
    index sev1-warroom-dashboard.html;
    
    # Enable CORS for all requests
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";
    
    # Serve the dashboard at root
    location / {
        try_files /sev1-warroom-dashboard.html =404;
    }
    
    # Serve static files with proper headers
    location ~* \.(js|css|html)$ {
        expires 1h;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }
    
    # Handle CSV and log files specifically
    location /superpod_sev1_fake_telemetry/ {
        add_header Access-Control-Allow-Origin *;
        add_header Content-Type "text/plain";
        expires 1h;
    }
    
    # Handle test files
    location ~* ^/test-.*\.html$ {
        add_header Access-Control-Allow-Origin *;
        expires 1h;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Logging
    access_log /var/log/nginx/sev1-dashboard.access.log;
    error_log /var/log/nginx/sev1-dashboard.error.log;
}
EOF

# Enable the site and disable default
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/sev1-dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ nginx configuration is valid"
else
    echo "❌ nginx configuration is invalid"
    exit 1
fi

# Start and enable nginx
echo "🚀 Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Test the setup
echo "🧪 Testing server..."
sleep 2

if curl -s http://localhost:7777 | grep -q "SEV-1"; then
    echo "✅ Dashboard is accessible locally"
else
    echo "⚠️  Dashboard test failed, but nginx is running"
fi

if curl -s http://localhost:7777/superpod_sev1_fake_telemetry/gpu_utilization.csv | head -1 | grep -q "timestamp"; then
    echo "✅ CSV files are accessible"
else
    echo "⚠️  CSV files test failed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Dashboard URLs:"
echo "   Local:    http://localhost:7777"
echo "   Network:  http://$SERVER_IP:7777"
echo "   External: http://YOUR_PUBLIC_IP:7777"
echo ""
echo "🔧 Management commands:"
echo "   sudo systemctl status nginx    # Check status"
echo "   sudo systemctl restart nginx   # Restart"
echo "   sudo systemctl stop nginx      # Stop"
echo "   sudo tail -f /var/log/nginx/sev1-dashboard.access.log  # View logs"
echo ""
echo "🔥 If you need to open firewall:"
echo "   sudo ufw allow 7777/tcp"
echo ""

# Show nginx status
sudo systemctl status nginx --no-pager -l
