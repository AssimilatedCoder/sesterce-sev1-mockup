#!/bin/bash

# Docker-based Deployment Script for NullSector Calculator
# This script deploys the entire application using Docker containers

set -e

echo "🐳 Deploying NullSector Calculator with Docker..."

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

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is required but not installed"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker --help | grep -q compose; then
    print_error "Docker Compose is required but not installed"
    exit 1
fi

# Detect environment (local dev vs remote deployment)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Local development
    print_info "Detected macOS environment - running local development deployment"
    COMPOSE_CMD="docker-compose"
else
    # Linux - Remote deployment
    print_info "Detected Linux environment - running remote production deployment"
    COMPOSE_CMD="docker-compose"

    # Pre-deployment checks for remote Ubuntu server
    print_info "🔍 Running pre-deployment checks for remote server..."

    # Check if Docker daemon is running
    if command -v systemctl >/dev/null 2>&1; then
        if ! systemctl is-active --quiet docker; then
            print_warning "Docker daemon is not running"
            print_info "💡 Fix: sudo systemctl start docker"
            print_info "💡 Enable on boot: sudo systemctl enable docker"
        else
            print_status "Docker daemon: RUNNING"
        fi
    else
        # Fallback for systems without systemctl
        if docker ps >/dev/null 2>&1; then
            print_status "Docker daemon: RUNNING"
        else
            print_warning "Cannot check Docker daemon status"
        fi
    fi

    # Check port 2053 availability using ss (more reliable for Docker)
    PORT_2053_INFO=""
    if command -v ss >/dev/null 2>&1; then
        PORT_2053_INFO=$(ss -tuln | grep :2053 2>/dev/null | head -1)
    elif command -v netstat >/dev/null 2>&1; then
        PORT_2053_INFO=$(netstat -tulpn 2>/dev/null | grep :2053 | head -1)
    fi

    if [ -n "$PORT_2053_INFO" ]; then
        # Check if it's a Docker container or external process
        if curl -s --max-time 5 http://localhost:2053 >/dev/null 2>&1; then
            print_status "Port 2053: AVAILABLE (existing Docker service will be replaced)"
        else
            print_warning "Port 2053 is already in use by another application"
            print_info "  Details: $PORT_2053_INFO"
            print_info "💡 Fix: sudo ./kill-port-2053.sh"
        fi
    else
        print_status "Port 2053: AVAILABLE"
    fi

    # Check UFW firewall for port 2053
    if command -v ufw >/dev/null 2>&1; then
        UFW_STATUS=$(ufw status 2>/dev/null | grep -E "^Status:" | cut -d' ' -f2 || echo "unknown")
        if [ "$UFW_STATUS" = "active" ]; then
            if ufw status | grep -q "2053.*ALLOW"; then
                print_status "UFW: Port 2053 is allowed"
            else
                print_warning "UFW: Port 2053 is NOT allowed"
                print_info "💡 Fix: sudo ufw allow 2053"
            fi
        else
            print_info "UFW: $UFW_STATUS (ports should be accessible)"
        fi
    else
        print_info "UFW: Not installed"
    fi

    print_info "Pre-deployment checks complete!"
fi

# Generate secure environment variables for the API
print_info "Generating secure environment variables..."
API_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# Create .env file for the API container
cat > .env << EOF
# Secure API Configuration
CALCULATOR_API_SECRET=$API_SECRET
JWT_SECRET=$JWT_SECRET
FLASK_ENV=production
FLASK_DEBUG=False
EOF

# Also create a .env file for docker-compose if it doesn't exist
if [ ! -f ".env.local" ]; then
    cp .env .env.local
fi

print_status "Environment variables generated"

# Build the application images
print_info "Building Docker images..."
if $COMPOSE_CMD build; then
    print_status "Docker images built successfully"
else
    print_error "Failed to build Docker images"
    exit 1
fi

# Create necessary directories
print_info "Creating log directories..."
mkdir -p logs

# Start the services
print_info "Starting NullSector services..."
if $COMPOSE_CMD up -d; then
    print_status "Services started successfully"
else
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be healthy
print_info "Waiting for services to be ready..."
print_info "Note: Health checks have start_period delays (API: 40s, Frontend: 30s, Nginx: 30s)"
sleep 45  # Wait for maximum start_period (40s) plus buffer

# Check service health
print_info "Checking service health..."
if $COMPOSE_CMD ps | grep -q "Up"; then
    print_status "All services are running"

    # Show service status
    echo ""
    echo "📊 Service Status:"
    docker-compose ps

    echo ""
    echo "🎉 NullSector TCO Calculator is now running!"
    echo "🌐 Access the application at: http://localhost:2053"
    echo "🔒 API: http://localhost:7779 (internal only)"
    echo ""
    echo "🛡️  Security Features:"
    echo "   • All services run in isolated containers"
    echo "   • Non-root user execution"
    echo "   • Rate limiting and security headers"
    echo "   • JWT authentication for API"
    echo ""
    echo "🔧 Management Commands:"
    echo "   Stop:  docker-compose down"
    echo "   Logs:  docker-compose logs -f"
    echo "   Restart: docker-compose restart"
    echo "   Status: docker-compose ps"
    echo ""
    print_warning "Note: Port changed from 3025 to 2053 as requested"

else
    print_warning "Some services may not be fully ready yet"
    echo "Check status with: docker-compose ps"
    echo "View logs with: docker-compose logs"
fi

# Post-deployment verification for remote Ubuntu server
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_info "🔍 Running post-deployment verification..."

    # Services should already be ready after the main wait period

    # Check if port 2053 is accessible by testing the application
    print_info "🔄 Testing port 2053 accessibility..."
    if curl -s --max-time 10 http://localhost:2053 >/dev/null 2>&1; then
        print_status "✅ Port 2053: ACCESSIBLE and responding"
        print_info "🎉 Deployment successful! Application accessible at:"
        echo "   🌐 http://localhost:2053"
        echo "   🔒 http://YOUR_SERVER_IP:2053"
    else
        print_warning "⚠️  Port 2053: Not accessible"
        print_info "💡 Troubleshooting: Run ./troubleshoot-remote.sh"
    fi

    # Test application accessibility
    APP_TEST=$(curl -s --max-time 10 -I http://localhost:2053 2>/dev/null | head -1 || echo "failed")
    if [[ $APP_TEST =~ "200 OK" ]]; then
        print_status "✅ Application: RESPONDING ($APP_TEST)"
    else
        print_warning "⚠️  Application: Not responding ($APP_TEST)"
        print_info "💡 Check: ./docker-manage.sh logs nginx"
    fi
fi
