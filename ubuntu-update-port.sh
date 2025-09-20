#!/bin/bash

# Automated port update script for Ubuntu

echo "🔄 Updating Sesterce Dashboard from port 7777 to 3025..."
echo "=================================================="

# Stop all services
echo "📋 Stopping services..."
sudo systemctl stop nginx
sudo systemctl stop sesterce-calculator-api 2>/dev/null || true
sudo pkill -f 'gunicorn.*calculator-api' 2>/dev/null || true

# Update Nginx configuration
echo "🔧 Updating Nginx configuration..."
if [ -f "/etc/nginx/sites-available/sesterce-dashboard" ]; then
    sudo sed -i 's/listen 7777/listen 3025/g' /etc/nginx/sites-available/sesterce-dashboard
    sudo sed -i 's/listen \[::\]:7777/listen \[::\]:3025/g' /etc/nginx/sites-available/sesterce-dashboard
    echo "✅ Nginx configuration updated"
else
    echo "❌ Nginx configuration not found!"
    exit 1
fi

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Check if anything is using the new port
echo "🔍 Checking port 3025..."
if sudo lsof -i :3025 > /dev/null 2>&1; then
    echo "⚠️  Warning: Port 3025 is already in use:"
    sudo lsof -i :3025
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start services
echo "🚀 Starting services..."
sudo systemctl start nginx
if [ -f "/etc/systemd/system/sesterce-calculator-api.service" ]; then
    sudo systemctl start sesterce-calculator-api
fi

# Check status
echo ""
echo "📊 Service Status:"
echo "=================="
sudo systemctl status nginx --no-pager | head -10
echo ""

if [ -f "/etc/systemd/system/sesterce-calculator-api.service" ]; then
    sudo systemctl status sesterce-calculator-api --no-pager | head -10
fi

# Test the new endpoint
echo ""
echo "🧪 Testing new endpoint..."
if curl -s -I http://localhost:3025 | grep -q "200 OK\|302 Found"; then
    echo "✅ Dashboard is accessible at http://localhost:3025"
else
    echo "❌ Dashboard is not responding on port 3025"
    echo ""
    echo "Debug information:"
    sudo nginx -t
    sudo lsof -i :3025
fi

echo ""
echo "🎉 Port update complete!"
echo "========================"
echo ""
echo "Access the dashboard at: http://localhost:3025"
echo ""
echo "Login credentials:"
echo "  Username: Youssef  Password: Sesterce2025"
echo "  Username: admin    Password: Arno7747"
