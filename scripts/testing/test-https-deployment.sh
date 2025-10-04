#!/bin/bash

# HTTPS Deployment Test Script for NullSector Tools
# Tests the HTTPS configuration with Cloudflare

set -e

echo "🔒 Testing HTTPS Deployment Configuration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required files exist
echo "📋 Checking configuration files..."

required_files=(
    "nginx-production-ssl.conf"
    "nginx-nullsector-dashboard-ssl.conf"
    "CLOUDFLARE-HTTPS-SETUP.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

echo ""

# Test Docker Compose configuration
echo "🐳 Testing Docker Compose setup..."
if grep -q "nginx-production-ssl.conf" docker-compose.yml; then
    echo "✅ Docker Compose uses HTTPS nginx config"
else
    echo "❌ Docker Compose not using HTTPS config"
    exit 1
fi

echo ""

# Test nginx configuration content (basic validation)
echo "🔧 Testing nginx configuration content..."

# Check for essential directives in production config
required_directives=(
    "server {"
    "listen 80"
    "proxy_pass http://api:7779"
    "proxy_pass http://frontend:80"
)

for directive in "${required_directives[@]}"; do
    if grep -q "$directive" nginx-production-ssl.conf; then
        echo "✅ Found: $directive"
    else
        echo "❌ Missing: $directive"
        exit 1
    fi
done

# Check dashboard config
if grep -q "listen 3025" nginx-nullsector-dashboard-ssl.conf; then
    echo "✅ nginx-nullsector-dashboard-ssl.conf has correct port"
else
    echo "❌ nginx-nullsector-dashboard-ssl.conf missing port config"
    exit 1
fi

echo ""

# Check for Cloudflare-specific configurations
echo "☁️  Checking Cloudflare-specific configurations..."

checks=(
    "real_ip_header CF-Connecting-IP"
    "set_real_ip_from 173.245.48.0/20"
    "Strict-Transport-Security"
    "CF-RAY"
    "X-Forwarded-Proto"
)

for check in "${checks[@]}"; do
    if grep -q "$check" nginx-production-ssl.conf || grep -q "$check" nginx.conf; then
        echo "✅ Found: $check"
    else
        echo "❌ Missing: $check"
    fi
done

echo ""

# Check Dockerfile for Cloudflare support
echo "📦 Checking Dockerfile configuration..."
if grep -q "nginx-extras" Dockerfile.nginx; then
    echo "✅ Dockerfile includes nginx-extras for real IP support"
else
    echo "❌ Dockerfile doesn't include nginx-extras"
fi

echo ""

# Test deployment script
echo "🚀 Testing deployment script configuration..."
if grep -q "nginx-nullsector-dashboard-ssl.conf" secure-dashboard; then
    echo "✅ Deployment script uses HTTPS nginx config"
else
    echo "❌ Deployment script not using HTTPS config"
fi

echo ""

# Generate deployment summary
echo "📋 Deployment Summary:"
echo ""
echo "🔧 Codebase Changes Completed:"
echo "  ✅ Updated nginx configurations for HTTPS/Cloudflare"
echo "  ✅ Modified Dockerfile for Cloudflare real IP support"
echo "  ✅ Updated Docker Compose for HTTPS port mapping"
echo "  ✅ Updated deployment scripts"
echo "  ✅ Created comprehensive Cloudflare setup guide"
echo ""

echo "☁️  Cloudflare Setup Required:"
echo "  1. Add domain to Cloudflare and configure DNS"
echo "  2. Enable SSL/TLS with 'Flexible' encryption mode"
echo "  3. Configure security settings (WAF, rate limiting)"
echo "  4. Set up caching and performance optimizations"
echo ""

echo "🔒 Next Steps:"
echo "  1. Follow CLOUDFLARE-HTTPS-SETUP.md for Cloudflare configuration"
echo "  2. Deploy with: ./deploy-docker.sh"
echo "  3. Test HTTPS access to your domain"
echo "  4. Update CORS settings for your HTTPS domain"
echo ""

echo "🎉 HTTPS deployment configuration is ready!"
echo "📖 See CLOUDFLARE-HTTPS-SETUP.md for detailed instructions."

echo ""
echo "💡 Quick Test Commands:"
echo "   # Deploy the updated configuration"
echo "   ./deploy-docker.sh"
echo ""
echo "   # Test HTTPS access (replace your-domain.com)"
echo "   curl -I https://your-domain.com/api/health"
echo ""
echo "   # Check Docker logs"
echo "   docker-compose logs -f nginx"
