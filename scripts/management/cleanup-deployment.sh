#!/bin/bash

# NullSector Deployment Cleanup Script
# Safely cleans up Docker containers, networks, and build cache

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

echo "🧹 NullSector Deployment Cleanup"
echo "================================="

# Docker compose file
COMPOSE_FILE="config/docker/docker-compose.yml"
COMPOSE_CMD="docker-compose"

# Detect compose command
if docker --help | grep -q compose; then
    COMPOSE_CMD="docker compose"
fi

print_info "Using compose command: $COMPOSE_CMD"

# Stop and remove containers
print_info "Stopping NullSector services..."
if $COMPOSE_CMD -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null; then
    print_status "Services stopped successfully"
else
    print_warning "No running services found or already stopped"
fi

# Remove containers by name (in case they exist outside compose)
print_info "Removing NullSector containers..."
CONTAINERS_REMOVED=0
for container in nullsector-api nullsector-frontend nullsector-nginx; do
    if docker rm -f "$container" 2>/dev/null; then
        print_status "Removed container: $container"
        ((CONTAINERS_REMOVED++))
    fi
done

if [ $CONTAINERS_REMOVED -eq 0 ]; then
    print_info "No containers to remove"
else
    print_status "Removed $CONTAINERS_REMOVED containers"
fi

# Clean up images (optional - ask user)
if [ "$1" = "--images" ] || [ "$1" = "-i" ]; then
    print_info "Removing NullSector Docker images..."
    IMAGES_REMOVED=0
    for image in docker-api docker-frontend docker-nginx; do
        if docker rmi -f "$image" 2>/dev/null; then
            print_status "Removed image: $image"
            ((IMAGES_REMOVED++))
        fi
    done
    
    if [ $IMAGES_REMOVED -eq 0 ]; then
        print_info "No images to remove"
    else
        print_status "Removed $IMAGES_REMOVED images"
    fi
fi

# Clean up networks
print_info "Cleaning up unused networks..."
if docker network prune -f 2>/dev/null; then
    print_status "Unused networks cleaned up"
else
    print_info "No unused networks to clean up"
fi

# Clean up build cache
print_info "Cleaning up Docker build cache..."
if docker builder prune -f 2>/dev/null; then
    print_status "Build cache cleaned up"
else
    print_info "No build cache to clean up"
fi

# Show current Docker status
print_info "Current Docker status:"
echo ""
echo "📊 Running Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10

echo ""
echo "💾 Docker System Usage:"
docker system df 2>/dev/null || echo "Unable to get system usage"

echo ""
echo "🎯 NullSector Specific Resources:"
echo "Containers:"
docker ps -a --filter "name=nullsector" --format "table {{.Names}}\t{{.Status}}" || echo "No NullSector containers found"

echo ""
echo "Images:"
docker images --filter "reference=docker-*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" || echo "No NullSector images found"

echo ""
echo "Volumes:"
docker volume ls --filter "name=user_data" --format "table {{.Name}}\t{{.Driver}}" || echo "No user data volumes found"

echo ""
print_status "Cleanup completed!"

if [ "$1" != "--images" ] && [ "$1" != "-i" ]; then
    print_info "💡 To also remove Docker images, run: $0 --images"
fi

print_info "🚀 Ready for fresh deployment with: ./manage.sh deploy"
