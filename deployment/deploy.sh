#!/bin/bash

# NullSector Tools Deployment Script
# Usage: ./deploy.sh [VERSION] [ENVIRONMENT]

set -e  # Exit on any error

VERSION=${1:-latest}
ENVIRONMENT=${2:-production}
REGISTRY_PREFIX=${REGISTRY_PREFIX:-nullsector}
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.yml}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if docker and docker-compose are available
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Backup current deployment
backup_current() {
    log_info "Creating backup of current deployment..."
    
    # Create backup directory with timestamp
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Export current images
    if docker-compose ps -q | grep -q .; then
        docker-compose config > "$BACKUP_DIR/docker-compose.backup.yml"
        log_success "Current configuration backed up to $BACKUP_DIR"
    else
        log_warning "No running services found to backup"
    fi
}

# Pull new images
pull_images() {
    log_info "Pulling images for version: $VERSION"
    
    # Set version in environment
    export VERSION=$VERSION
    
    # Pull all images defined in docker-compose
    if ! docker-compose pull; then
        log_error "Failed to pull images for version $VERSION"
        exit 1
    fi
    
    log_success "Images pulled successfully"
}

# Health check function
health_check() {
    local max_attempts=30
    local attempt=1
    
    log_info "Performing health check..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:2053/health > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Deploy new version
deploy() {
    log_info "Deploying NullSector Tools version: $VERSION to $ENVIRONMENT"
    
    # Stop current services gracefully
    log_info "Stopping current services..."
    docker-compose down --timeout 30
    
    # Start services with new version
    log_info "Starting services with version $VERSION..."
    VERSION=$VERSION docker-compose up -d
    
    # Wait a moment for services to initialize
    sleep 10
    
    # Perform health check
    if health_check; then
        log_success "Deployment successful!"
        
        # Tag as current if deploying a specific version
        if [ "$VERSION" != "latest" ]; then
            log_info "Tagging version $VERSION as current..."
            docker tag $REGISTRY_PREFIX/dashboard:$VERSION $REGISTRY_PREFIX/dashboard:current
            docker tag $REGISTRY_PREFIX/api:$VERSION $REGISTRY_PREFIX/api:current
            docker tag $REGISTRY_PREFIX/nginx:$VERSION $REGISTRY_PREFIX/nginx:current
        fi
        
        # Log deployment
        echo "$(date): Deployed version $VERSION to $ENVIRONMENT" >> deployment.log
        
        return 0
    else
        log_error "Deployment failed - initiating rollback"
        rollback_deployment
        return 1
    fi
}

# Rollback to previous version
rollback_deployment() {
    log_warning "Rolling back to previous version..."
    
    # Stop failed deployment
    docker-compose down --timeout 30
    
    # Start with 'current' tagged images
    VERSION=current docker-compose up -d
    
    # Wait and check
    sleep 10
    if health_check; then
        log_success "Rollback successful"
    else
        log_error "Rollback failed - manual intervention required"
        exit 1
    fi
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old versions (keep last 5)
    docker images $REGISTRY_PREFIX/dashboard --format "table {{.Tag}}" | \
        grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | \
        sort -V | \
        head -n -5 | \
        xargs -r -I {} docker rmi $REGISTRY_PREFIX/dashboard:{} || true
    
    log_success "Cleanup completed"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo "===================="
    docker-compose ps
    echo ""
    
    log_info "Image Versions:"
    echo "==============="
    docker-compose images
    echo ""
    
    log_info "Resource Usage:"
    echo "==============="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Main execution
main() {
    echo "NullSector Tools Deployment Script"
    echo "=================================="
    echo "Version: $VERSION"
    echo "Environment: $ENVIRONMENT"
    echo "Registry: $REGISTRY_PREFIX"
    echo ""
    
    check_prerequisites
    backup_current
    pull_images
    
    if deploy; then
        cleanup
        show_status
        
        log_success "Deployment completed successfully!"
        log_info "Application is available at: https://your-domain.com"
        
        exit 0
    else
        log_error "Deployment failed!"
        exit 1
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "rollback")
        rollback_deployment
        ;;
    *)
        main
        ;;
esac
