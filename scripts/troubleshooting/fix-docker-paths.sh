#!/bin/bash

# Fix Docker Path Issues Script
# This script fixes any remaining path issues in Docker configurations

set -e

# Get the project root directory and change to it
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

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

echo "🔧 Fixing Docker Path Issues..."

# Check if all required files exist
print_info "Checking required files..."

REQUIRED_FILES=(
    "config/docker/Dockerfile.api"
    "config/docker/Dockerfile.frontend" 
    "config/docker/Dockerfile.nginx"
    "config/docker/docker-compose.yml"
    "backend/api/calculator-api.py"
    "backend/database/user_database.py"
    "backend/requirements.txt"
    "frontend/nullsector-dashboard/package.json"
    "config/nginx/nginx-frontend.conf"
    "config/nginx/nginx-production-ssl.conf"
    "config/nginx/nginx.conf"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_error "Missing ${#MISSING_FILES[@]} required files"
    exit 1
else
    print_status "All required files found"
fi

# Check Docker configuration syntax
print_info "Validating Docker configurations..."

if docker-compose -f config/docker/docker-compose.yml config >/dev/null 2>&1; then
    print_status "Docker Compose configuration is valid"
else
    print_error "Docker Compose configuration has syntax errors"
    docker-compose -f config/docker/docker-compose.yml config
    exit 1
fi

# Test Docker build context
print_info "Testing Docker build contexts..."

# Check if we can access the build context files
if [ -f "frontend/nullsector-dashboard/package.json" ]; then
    print_status "Frontend build context accessible"
else
    print_error "Frontend build context not accessible"
    exit 1
fi

if [ -f "backend/api/calculator-api.py" ]; then
    print_status "Backend build context accessible"
else
    print_error "Backend build context not accessible"
    exit 1
fi

# Clean up any previous failed builds
print_info "Cleaning up previous builds..."
docker system prune -f >/dev/null 2>&1 || true

print_status "Docker path issues fixed!"
print_info "You can now run: ./manage.sh deploy"
