#!/bin/bash

echo "🔍 Ubuntu Troubleshooting for Port Change"
echo "========================================="
echo ""

echo "1. Check what's running on old port 7777:"
echo "   sudo lsof -i :7777"
echo ""

echo "2. Check what's running on new port 3025:"
echo "   sudo lsof -i :3025"
echo ""

echo "3. Check Nginx configuration:"
echo "   sudo nginx -t"
echo "   grep -n 'listen' /etc/nginx/sites-enabled/*"
echo ""

echo "4. Stop all services:"
echo "   sudo systemctl stop nginx"
echo "   sudo systemctl stop sesterce-calculator-api"
echo "   sudo pkill -f 'gunicorn.*calculator-api'"
echo ""

echo "5. Update Nginx configuration:"
echo "   sudo sed -i 's/listen 7777/listen 3025/g' /etc/nginx/sites-available/sesterce-dashboard"
echo "   sudo sed -i 's/listen \[::\]:7777/listen [::]:3025/g' /etc/nginx/sites-available/sesterce-dashboard"
echo ""

echo "6. Reload Nginx configuration:"
echo "   sudo systemctl reload nginx"
echo ""

echo "7. Check API service file:"
echo "   sudo grep -n '7777\|3025' /etc/systemd/system/sesterce-calculator-api.service"
echo ""

echo "8. Restart everything:"
echo "   sudo systemctl restart nginx"
echo "   sudo systemctl restart sesterce-calculator-api"
echo ""

echo "9. Verify services are running:"
echo "   sudo systemctl status nginx"
echo "   sudo systemctl status sesterce-calculator-api"
echo "   curl -I http://localhost:3025"
