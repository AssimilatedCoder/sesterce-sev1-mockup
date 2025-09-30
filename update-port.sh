#!/bin/bash

# Script to update Nginx configuration to new port

echo "🔄 Updating Nginx configuration to port 3025..."

# Check if Homebrew nginx exists
if [ -d "/opt/homebrew/etc/nginx/servers" ]; then
    NGINX_DIR="/opt/homebrew/etc/nginx/servers"
elif [ -d "/usr/local/etc/nginx/servers" ]; then
    NGINX_DIR="/usr/local/etc/nginx/servers"
else
    echo "❌ Nginx servers directory not found"
    exit 1
fi

echo "📁 Nginx directory: $NGINX_DIR"
echo ""
echo "Please run the following commands:"
echo ""
echo "1. Copy the new configuration:"
echo "   sudo cp nginx-nullsector-dashboard.conf $NGINX_DIR/"
echo ""
echo "2. Test the configuration:"
echo "   sudo nginx -t"
echo ""
echo "3. Reload Nginx:"
echo "   sudo nginx -s reload"
echo ""
echo "4. Access the dashboard at:"
echo "   http://localhost:3025"
echo ""
echo "Note: Port has been changed from 7777 to 3025 for security"
