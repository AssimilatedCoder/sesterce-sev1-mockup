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

print_status "Environment variables generated"

# Build the application images
print_info "Building Docker images..."
if docker-compose build; then
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
if docker-compose up -d; then
    print_status "Services started successfully"
else
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be healthy
print_info "Waiting for services to be ready..."
sleep 10

# Check service health
print_info "Checking service health..."
if docker-compose ps | grep -q "Up"; then
    print_status "All services are running"

    # Show service status
    echo ""
    echo "📊 Service Status:"
    docker-compose ps

    echo ""
    echo "🎉 NullSector Calculator is now running!"
    echo "🌐 Access the application at: http://localhost:2053"
    echo "🔒 API: http://localhost:7779 (internal only)"
    echo "📊 Dashboard: http://localhost:2053/sev1/ (internal routing)"
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
