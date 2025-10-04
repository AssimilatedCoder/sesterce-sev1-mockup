#!/bin/bash

# Remote Ubuntu Troubleshooting Script for NullSector TCO Calculator
# Comprehensive diagnostics for deployment issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🔧 NullSector TCO Calculator - Remote Ubuntu Troubleshooting"
echo "=========================================================="

# Check if running as root (needed for some checks)
if [ "$EUID" -ne 0 ]; then
    print_warning "Some checks require root privileges. Run with: sudo $0"
fi

# Check if we're actually on Ubuntu (not macOS simulation)
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$(uname -s)" == "Darwin" ]]; then
    print_warning "⚠️  This script is designed for Ubuntu Linux, not macOS"
    print_info "For Ubuntu deployment troubleshooting, run this script on your Ubuntu server"
    exit 1
fi

echo ""
print_info "📋 System Information:"
echo "---------------------"

# OS Information
echo "Operating System: $(lsb_release -d 2>/dev/null | cut -f2 || echo 'Ubuntu (unknown version)')"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"

# Check if we're in Docker or on bare metal
if [ -f /.dockerenv ]; then
    print_warning "Running inside Docker container - some checks may not apply"
elif grep -q docker /proc/1/cgroup 2>/dev/null; then
    print_warning "Running in Docker container - some checks may not apply"
else
    print_info "Running on bare metal Ubuntu"
fi

echo ""
print_info "🐳 Docker Status:"
echo "----------------"

# Docker daemon status
if command -v systemctl >/dev/null 2>&1; then
    if systemctl is-active --quiet docker; then
        print_status "Docker daemon: RUNNING"
        echo "Docker version: $(docker --version)"
        echo "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Not available')"
    else
        print_error "Docker daemon: NOT RUNNING"
        echo "💡 Fix: sudo systemctl start docker"
        exit 1
    fi
else
    # Fallback for systems without systemctl (like some containers)
    if docker ps >/dev/null 2>&1; then
        print_status "Docker daemon: RUNNING"
        echo "Docker version: $(docker --version)"
    else
        print_error "Docker daemon: NOT RUNNING or not accessible"
        exit 1
    fi
fi

# Check Docker user permissions
if docker ps >/dev/null 2>&1; then
    print_status "Docker permissions: OK"
else
    print_error "Docker permissions: FAILED"
    echo "💡 Fix: sudo usermod -aG docker $USER"
    echo "💡 Then: newgrp docker"
fi

echo ""
print_info "🔥 Firewall (UFW) Status:"
echo "------------------------"

# UFW status
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(ufw status 2>/dev/null | grep -E "^Status:" | cut -d' ' -f2 || echo "unknown")

    if [ "$UFW_STATUS" = "active" ]; then
        print_status "UFW: ACTIVE"

        # Check if port 2053 is allowed
        if ufw status | grep -q "2053.*ALLOW"; then
            print_status "Port 2053: ALLOWED in UFW"
        else
            print_warning "Port 2053: NOT FOUND in UFW rules"
            echo "💡 Fix: sudo ufw allow 2053"
        fi

        # Show relevant UFW rules
        echo "UFW Rules (relevant):"
        ufw status | grep -E "(2053|ALLOW|DENY)" || echo "No relevant rules found"

    else
        print_warning "UFW: $UFW_STATUS"
        echo "💡 Note: If UFW is inactive, ports should be accessible"
    fi
else
    print_warning "UFW not installed"
fi

echo ""
print_info "🔌 Port Analysis:"
echo "----------------"

# Check port 2053 usage using multiple methods
PORT_2053_INFO=""

# Method 1: Use lsof if available (most reliable for Docker containers)
if command -v lsof >/dev/null 2>&1; then
    PORT_2053_INFO=$(lsof -i :2053 2>/dev/null | head -2)
fi

# Method 2: Use netstat if lsof not available or didn't find anything
if [ -z "$PORT_2053_INFO" ] && command -v netstat >/dev/null 2>&1; then
    PORT_2053_INFO=$(netstat -tulpn 2>/dev/null | grep :2053 | head -1)
fi

# Method 3: Use ss if available
if [ -z "$PORT_2053_INFO" ] && command -v ss >/dev/null 2>&1; then
    PORT_2053_INFO=$(ss -tulpn 2>/dev/null | grep :2053 | head -1)
fi

if [ -n "$PORT_2053_INFO" ]; then
    print_status "Port 2053: IN USE"

    # Check if it's our Docker container
    if echo "$PORT_2053_INFO" | grep -q "docker\|nullsector-nginx"; then
        print_status "  Service: nullsector-nginx (Docker container)"
        print_info "  Status: Our application container"
    elif echo "$PORT_2053_INFO" | grep -q "nginx"; then
        print_status "  Service: nginx (Docker container)"
    elif echo "$PORT_2053_INFO" | grep -q "com.docke"; then
        print_status "  Service: Docker container (likely our nginx)"
        print_info "  Note: This is normal for Docker port binding"
    else
        print_warning "  Service: Other application"
        print_info "  Details: $PORT_2053_INFO"
    fi

else
    print_warning "Port 2053: NOT IN USE"
    echo "💡 This could indicate our nginx container is not running"
fi

echo ""
print_info "🌐 Network Connectivity:"
echo "-----------------------"

# Test external connectivity
if ping -c 1 -W 2 8.8.8.8 >/dev/null 2>&1; then
    print_status "Internet connectivity: OK"
else
    print_error "Internet connectivity: FAILED"
    echo "💡 Fix: Check network configuration"
fi

# Test local connectivity
if ping -c 1 -W 2 localhost >/dev/null 2>&1; then
    print_status "Localhost connectivity: OK"
else
    print_error "Localhost connectivity: FAILED"
    echo "💡 Fix: Check /etc/hosts file"
fi

echo ""
print_info "🐳 Docker Container Analysis:"
echo "----------------------------"

# Check our containers
if docker-compose ps >/dev/null 2>&1; then
    echo "Our application containers:"
    docker-compose ps

    # Check container health individually
    echo ""
    echo "Individual container status:"

    # API container
    if docker ps --filter name=nullsector-api | grep -q nullsector-api; then
        API_HEALTH=$(curl -s --max-time 5 http://localhost:7779/api/health 2>/dev/null || echo "failed")
        if [ "$API_HEALTH" = "failed" ]; then
            print_error "API Container: RUNNING but health check FAILED"
        else
            print_status "API Container: RUNNING and HEALTHY ($API_HEALTH)"
        fi
    else
        print_error "API Container: NOT RUNNING"
    fi

    # Frontend container
    if docker ps --filter name=nullsector-frontend | grep -q nullsector-frontend; then
        FRONTEND_TEST=$(curl -s --max-time 5 http://localhost:8080/health 2>/dev/null || echo "failed")
        if [ "$FRONTEND_TEST" = "failed" ]; then
            print_warning "Frontend Container: RUNNING but health check FAILED"
        else
            print_status "Frontend Container: RUNNING and HEALTHY ($FRONTEND_TEST)"
        fi
    else
        print_error "Frontend Container: NOT RUNNING"
    fi

    # Nginx container
    if docker ps --filter name=nullsector-nginx | grep -q nullsector-nginx; then
        NGINX_TEST=$(curl -s --max-time 5 http://localhost:80/health 2>/dev/null || echo "failed")
        if [ "$NGINX_TEST" = "failed" ]; then
            print_warning "Nginx Container: RUNNING but health check FAILED"
        else
            print_status "Nginx Container: RUNNING and HEALTHY ($NGINX_TEST)"
        fi
    else
        print_error "Nginx Container: NOT RUNNING"
    fi

else
    print_error "No docker-compose services found"
    echo "💡 Fix: Run ./deploy-docker.sh first"
fi

echo ""
print_info "🔍 Application Endpoint Tests:"
echo "-----------------------------"

# Test main application endpoint
APP_TEST=$(curl -s --max-time 10 -I http://localhost:2053 2>/dev/null | head -1 || echo "failed")
if [[ $APP_TEST =~ "200 OK" ]]; then
    print_status "Main Application (port 2053): ACCESSIBLE"
    print_info "  Response: $APP_TEST"
else
    print_error "Main Application (port 2053): NOT ACCESSIBLE"
    print_info "  Response: $APP_TEST"
    echo "💡 Fix: Check if nginx container is running and port 2053 is not blocked"
fi

# Test API endpoint
API_TEST=$(curl -s --max-time 5 http://localhost:7779/api/health 2>/dev/null || echo "failed")
if [ "$API_TEST" != "failed" ]; then
    print_status "API Endpoint: ACCESSIBLE"
    print_info "  Response: $API_TEST"
else
    print_error "API Endpoint: NOT ACCESSIBLE"
    echo "💡 Fix: Check if API container is running"
fi

echo ""
print_info "🚨 Common Issues & Solutions:"
echo "----------------------------"

# Check for common issues
ISSUES_FOUND=0

# Port conflicts - check if port is used by something other than our Docker container
if [ -n "$PORT_2053_INFO" ]; then
    if ! echo "$PORT_2053_INFO" | grep -q "docker\|nullsector-nginx\|com.docke"; then
        print_error "Port 2053 conflict detected!"
        print_info "  Details: $PORT_2053_INFO"
        echo "💡 Fix: Kill conflicting process: sudo lsof -ti:2053 | xargs sudo kill -9"
        ((ISSUES_FOUND++))
    fi
else
    print_warning "Port 2053 not detected - container may not be running"
    echo "💡 Check: docker-compose ps"
fi

# UFW blocking
if command -v ufw >/dev/null 2>&1 && [ "$(ufw status | grep -c "2053.*ALLOW")" -eq 0 ]; then
    print_error "UFW may be blocking port 2053!"
    echo "💡 Fix: sudo ufw allow 2053"
    ((ISSUES_FOUND++))
fi

# Docker daemon issues
if ! systemctl is-active --quiet docker; then
    print_error "Docker daemon not running!"
    echo "💡 Fix: sudo systemctl start docker"
    ((ISSUES_FOUND++))
fi

# Container health issues
if ! docker ps --filter name=nullsector-api --filter status=running | grep -q nullsector-api; then
    print_error "API container not running!"
    echo "💡 Fix: docker-compose up -d api"
    ((ISSUES_FOUND++))
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    print_status "No common issues detected!"
else
    print_warning "Found $ISSUES_FOUND potential issue(s) above"
fi

echo ""
print_info "📝 Quick Fix Commands:"
echo "---------------------"

if [ $ISSUES_FOUND -gt 0 ]; then
    echo "# Fix Docker daemon"
    echo "sudo systemctl start docker"
    echo "sudo systemctl enable docker"
    echo ""
    echo "# Fix port conflicts"
    echo "sudo lsof -ti:2053 | xargs sudo kill -9"
    echo ""
    echo "# Fix UFW"
    echo "sudo ufw allow 2053"
    echo ""
    echo "# Restart all services"
    echo "./docker-manage.sh restart"
    echo ""
    echo "# Check logs for specific errors"
    echo "./docker-manage.sh logs nginx"
    echo "./docker-manage.sh logs api"
    echo "./docker-manage.sh logs frontend"
fi

echo ""
print_info "✅ Final Verification:"
echo "--------------------"

# Final comprehensive test
FINAL_TEST=$(curl -s --max-time 5 -I http://localhost:2053 2>/dev/null | head -1 || echo "failed")
if [[ $FINAL_TEST =~ "200 OK" ]]; then
    print_status "🎉 TROUBLESHOOTING COMPLETE - Application is ACCESSIBLE!"
    echo "   Visit: http://localhost:2053"
else
    print_error "❌ TROUBLESHOOTING COMPLETE - Application still has issues"
    echo "   Check the logs and fix suggestions above"
fi

echo ""
echo "=========================================================="
echo "Remote troubleshooting complete! 🚀"
