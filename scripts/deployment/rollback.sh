#!/bin/bash

# NullSector Tools Rollback Script
# Usage: ./rollback.sh [TARGET_VERSION]

set -e  # Exit on any error

TARGET_VERSION=${1:-current}
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

# Health check function
health_check() {
    local max_attempts=20
    local attempt=1
    
    log_info "Performing health check..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:2053/health > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed, retrying in 3 seconds..."
        sleep 3
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Verify target version exists
verify_version() {
    log_info "Verifying target version: $TARGET_VERSION"
    
    # Check if images exist for target version
    if ! docker image inspect $REGISTRY_PREFIX/dashboard:$TARGET_VERSION > /dev/null 2>&1; then
        log_error "Image $REGISTRY_PREFIX/dashboard:$TARGET_VERSION not found"
        log_info "Available versions:"
        docker images $REGISTRY_PREFIX/dashboard --format "table {{.Tag}}\t{{.CreatedAt}}" | head -10
        exit 1
    fi
    
    log_success "Target version verified"
}

# Create rollback backup
create_rollback_backup() {
    log_info "Creating rollback backup..."
    
    ROLLBACK_BACKUP_DIR="./backups/rollback_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$ROLLBACK_BACKUP_DIR"
    
    # Save current state
    if docker-compose ps -q | grep -q .; then
        docker-compose config > "$ROLLBACK_BACKUP_DIR/pre-rollback-compose.yml"
        docker-compose ps > "$ROLLBACK_BACKUP_DIR/pre-rollback-status.txt"
        log_success "Rollback backup created in $ROLLBACK_BACKUP_DIR"
    fi
}

# Perform rollback
perform_rollback() {
    log_warning "Rolling back to version: $TARGET_VERSION"
    
    # Stop current services gracefully
    log_info "Stopping current services..."
    docker-compose down --timeout 30
    
    # Start with target version
    log_info "Starting services with version $TARGET_VERSION..."
    VERSION=$TARGET_VERSION docker-compose up -d
    
    # Wait for services to initialize
    sleep 15
    
    # Verify rollback success
    if health_check; then
        log_success "Rollback to version $TARGET_VERSION completed successfully!"
        
        # Log rollback
        echo "$(date): Rolled back to version $TARGET_VERSION" >> deployment.log
        
        # Show status
        show_rollback_status
        
        return 0
    else
        log_error "Rollback verification failed"
        return 1
    fi
}

# Show rollback status
show_rollback_status() {
    log_info "Post-Rollback Status:"
    echo "====================="
    docker-compose ps
    echo ""
    
    log_info "Active Image Versions:"
    echo "======================"
    docker-compose images
    echo ""
    
    log_info "System Resources:"
    echo "=================="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# List available versions for rollback
list_versions() {
    log_info "Available versions for rollback:"
    echo "================================="
    
    # Show local images
    echo "Local Images:"
    docker images $REGISTRY_PREFIX/dashboard --format "table {{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -10
    echo ""
    
    # Show current deployment
    echo "Current Deployment:"
    if docker-compose ps -q | grep -q .; then
        docker-compose ps --format "table {{.Name}}\t{{.Image}}\t{{.Status}}"
    else
        echo "No services currently running"
    fi
}

# Emergency rollback (fastest possible)
emergency_rollback() {
    log_error "EMERGENCY ROLLBACK INITIATED"
    log_warning "This will immediately stop all services and start the last known good version"
    
    # Immediate stop
    docker-compose kill
    
    # Start with 'current' tagged version (should be last known good)
    VERSION=current docker-compose up -d
    
    sleep 10
    if health_check; then
        log_success "Emergency rollback successful"
    else
        log_error "Emergency rollback failed - manual intervention required"
        log_error "Try: docker-compose down && docker-compose up -d"
    fi
}

# Interactive rollback selection
interactive_rollback() {
    list_versions
    echo ""
    read -p "Enter version to rollback to (or 'current' for last known good): " selected_version
    
    if [ -n "$selected_version" ]; then
        TARGET_VERSION=$selected_version
        verify_version
        create_rollback_backup
        perform_rollback
    else
        log_error "No version selected"
        exit 1
    fi
}

# Main execution
main() {
    echo "NullSector Tools Rollback Script"
    echo "================================="
    echo "Target Version: $TARGET_VERSION"
    echo ""
    
    case "$TARGET_VERSION" in
        "list")
            list_versions
            exit 0
            ;;
        "emergency")
            emergency_rollback
            exit $?
            ;;
        "interactive")
            interactive_rollback
            exit $?
            ;;
        *)
            verify_version
            create_rollback_backup
            
            if perform_rollback; then
                log_success "Rollback operation completed successfully!"
                exit 0
            else
                log_error "Rollback operation failed!"
                log_info "You can try:"
                log_info "  ./rollback.sh emergency    - Emergency rollback to last known good"
                log_info "  ./rollback.sh list         - List available versions"
                log_info "  ./rollback.sh interactive  - Interactive version selection"
                exit 1
            fi
            ;;
    esac
}

# Handle different rollback scenarios
if [ $# -eq 0 ]; then
    echo "Usage: $0 [VERSION|list|emergency|interactive]"
    echo ""
    echo "Examples:"
    echo "  $0 1.9.4        - Rollback to specific version"
    echo "  $0 current      - Rollback to last known good version"
    echo "  $0 list         - List available versions"
    echo "  $0 emergency    - Emergency rollback (fastest)"
    echo "  $0 interactive  - Interactive version selection"
    echo ""
    exit 1
fi

main
