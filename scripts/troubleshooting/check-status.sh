#!/bin/bash

# Status checker for NullSector Docker deployment
# Provides comprehensive status information for all services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "🔍 NullSector TCO Calculator - Comprehensive Status Check"
echo "=================================================="

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker --help | grep -q compose; then
    print_error "Docker Compose not available"
    exit 1
fi

echo ""
print_info "🐳 Docker Container Status:"
echo "---------------------------"

# Show container status
if docker-compose ps >/dev/null 2>&1; then
    docker-compose ps
else
    print_error "No docker-compose services found. Run ./deploy-docker.sh first."
    exit 1
fi

echo ""
print_info "🔌 Port Status (External):"
echo "--------------------------"

# Check if port 2053 is listening
if command -v netstat &> /dev/null; then
    PORT_CHECK=$(netstat -tuln 2>/dev/null | grep :2053 || echo "")
elif command -v ss &> /dev/null; then
    PORT_CHECK=$(ss -tuln 2>/dev/null | grep :2053 || echo "")
else
    PORT_CHECK="Cannot check port status"
fi

if [ -n "$PORT_CHECK" ]; then
    print_status "Port 2053: LISTENING (nginx external)"
else
    print_warning "Port 2053: Not listening (nginx may not be running)"
fi

echo ""
print_info "🔗 Internal Port Status:"
echo "-----------------------"

# Check nginx internal port 80
if docker exec nullsector-nginx ss -tuln 2>/dev/null | grep -q :80; then
    print_status "Nginx internal port 80: LISTENING"
else
    print_warning "Nginx internal port 80: Not listening"
fi

echo ""
print_info "🏥 Service Health Checks:"
echo "------------------------"

# Check API health (through nginx proxy) with retry
print_info "🔄 Checking API health (may take a moment for services to be ready)..."
for i in {1..3}; do
    if curl -s --max-time 10 http://localhost:2053/api/health >/dev/null 2>&1; then
        API_STATUS=$(curl -s http://localhost:2053/api/health)
        print_status "API Health: $API_STATUS"
        break
    else
        if [ $i -eq 3 ]; then
            print_error "API Health: UNREACHABLE"
        else
            sleep 2
        fi
    fi
done

# Check Frontend health (through nginx proxy) with retry
print_info "🔄 Checking Frontend health..."
for i in {1..3}; do
    if curl -s --max-time 10 http://localhost:2053/health >/dev/null 2>&1; then
        FRONTEND_STATUS=$(curl -s http://localhost:2053/health)
        print_status "Frontend Health: $FRONTEND_STATUS"
        break
    else
        if [ $i -eq 3 ]; then
            print_error "Frontend Health: UNREACHABLE"
        else
            sleep 2
        fi
    fi
done

# Check Nginx health (port 2053) with retry
print_info "🔄 Checking Nginx health..."
for i in {1..3}; do
    if curl -s --max-time 10 http://localhost:2053/health >/dev/null 2>&1; then
        NGINX_STATUS=$(curl -s http://localhost:2053/health)
        print_status "Nginx Health: $NGINX_STATUS"
        break
    else
        if [ $i -eq 3 ]; then
            print_error "Nginx Health: UNREACHABLE"
        else
            sleep 2
        fi
    fi
done

echo ""
print_info "🌐 Application Access Test:"
echo "---------------------------"

# Test main application endpoint
if curl -s --max-time 10 -I http://localhost:2053 >/dev/null 2>&1; then
    HTTP_STATUS=$(curl -s -I http://localhost:2053 | head -1)
    print_status "Application: RESPONDING ($HTTP_STATUS)"
else
    print_error "Application: NOT RESPONDING"
fi

echo ""
print_info "📊 Resource Usage:"
echo "-----------------"

# Show resource usage if docker stats is available
if command -v docker &> /dev/null; then
    echo "Container resource usage:"
    docker stats --no-stream nullsector-api nullsector-frontend nullsector-nginx 2>/dev/null || echo "  (docker stats not available or containers not running)"
fi

echo ""
print_info "📝 Quick Actions:"
echo "----------------"
echo "• View logs:           ./docker-manage.sh logs [service-name]"
echo "• Restart services:    ./docker-manage.sh restart"
echo "• Stop everything:     ./docker-manage.sh stop"
echo "• Full deployment:     ./deploy-docker.sh"

echo ""
echo "=================================================="
echo "Status check complete! 🚀"
