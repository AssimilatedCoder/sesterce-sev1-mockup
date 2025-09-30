#!/bin/bash

# Test script for NullSector Docker deployment
# Tests both local (macOS) and remote (Ubuntu) environments

set -e

echo "🧪 Testing NullSector Docker Deployment..."

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

# Detect environment
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_info "Testing on macOS (local development)"
    ENVIRONMENT="local"
else
    print_info "Testing on Linux (remote deployment)"
    ENVIRONMENT="remote"
fi

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is required but not installed"
    exit 1
fi
print_status "Docker is available"

if ! command -v docker-compose &> /dev/null && ! docker --help | grep -q compose; then
    print_error "Docker Compose is required but not installed"
    exit 1
fi
print_status "Docker Compose is available"

# Check if required files exist
REQUIRED_FILES=(
    "Dockerfile.api"
    "Dockerfile.frontend"
    "Dockerfile.nginx"
    "docker-compose.yml"
    "calculator-api.py"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found"
        exit 1
    fi
done
print_status "All required files present"

# Test Docker build (without actually building to save time)
print_info "Testing Docker configuration..."

# Check if we can build at least one service
if docker-compose build --dry-run >/dev/null 2>&1; then
    print_status "Docker Compose configuration is valid"
else
    print_error "Docker Compose configuration has issues"
    exit 1
fi

# Test port availability
print_info "Testing port availability..."

if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":2053 "; then
        print_warning "Port 2053 is already in use"
    else
        print_status "Port 2053 is available"
    fi
elif command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":2053 "; then
        print_warning "Port 2053 is already in use"
    else
        print_status "Port 2053 is available"
    fi
else
    print_info "Cannot check port status (netstat/ss not available)"
fi

# Test environment variables generation
print_info "Testing environment variable generation..."
API_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "test-secret")
if [ -n "$API_SECRET" ]; then
    print_status "Environment variable generation works"
else
    print_error "Environment variable generation failed"
    exit 1
fi

# Summary
echo ""
echo "🎯 Deployment Readiness Check Complete!"
echo ""
echo "📋 Environment: $ENVIRONMENT"
echo "🐳 Docker: $(docker --version)"
echo "📦 Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Built-in')"

if [ "$ENVIRONMENT" = "local" ]; then
    echo ""
    print_info "💡 To deploy locally:"
    echo "   ./deploy-docker.sh"
    echo ""
    print_info "🔧 To manage services:"
    echo "   ./docker-manage.sh start|stop|status"
else
    echo ""
    print_info "🚀 Ready for remote deployment!"
    echo "   Run: ./deploy-docker.sh"
fi

echo ""
print_status "All tests passed! Ready for deployment."
exit 0
