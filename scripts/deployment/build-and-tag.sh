#!/bin/bash

# NullSector Tools Build and Tag Script
# Usage: ./build-and-tag.sh [VERSION] [REGISTRY_PREFIX]

set -e  # Exit on any error

VERSION=${1:-$(date +%Y%m%d-%H%M%S)}
REGISTRY_PREFIX=${2:-nullsector}
BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

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

# Validate version format
validate_version() {
    if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] && [[ ! $VERSION =~ ^[0-9]{8}-[0-9]{6}$ ]]; then
        log_warning "Version format should be X.Y.Z (semantic) or YYYYMMDD-HHMMSS (timestamp)"
        read -p "Continue with version '$VERSION'? (y/N): " confirm
        if [[ $confirm != [yY] ]]; then
            log_error "Build cancelled"
            exit 1
        fi
    fi
}

# Update version in source files
update_version_files() {
    log_info "Updating version in source files..."
    
    # Update package.json
    if [ -f "nullsector-dashboard/package.json" ]; then
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" nullsector-dashboard/package.json
        log_success "Updated package.json version"
    fi
    
    # Update version.ts
    if [ -f "nullsector-dashboard/src/config/version.ts" ]; then
        # Update the current version
        sed -i.bak "s/version: \".*\"/version: \"$VERSION\"/" nullsector-dashboard/src/config/version.ts
        sed -i.bak "s/buildDate: new Date().toISOString()/buildDate: \"$BUILD_DATE\"/" nullsector-dashboard/src/config/version.ts
        
        log_success "Updated version.ts"
    fi
    
    # Clean up backup files
    find . -name "*.bak" -delete 2>/dev/null || true
}

# Build Docker images
build_images() {
    log_info "Building Docker images for version: $VERSION"
    
    # Build frontend
    log_info "Building frontend image..."
    docker build \
        --build-arg VERSION=$VERSION \
        --build-arg BUILD_DATE=$BUILD_DATE \
        --build-arg GIT_COMMIT=$GIT_COMMIT \
        -t $REGISTRY_PREFIX/dashboard:$VERSION \
        -f nullsector-dashboard/Dockerfile \
        ./nullsector-dashboard
    
    # Build API
    log_info "Building API image..."
    docker build \
        --build-arg VERSION=$VERSION \
        --build-arg BUILD_DATE=$BUILD_DATE \
        --build-arg GIT_COMMIT=$GIT_COMMIT \
        -t $REGISTRY_PREFIX/api:$VERSION \
        -f Dockerfile.api \
        .
    
    # Build Nginx
    log_info "Building Nginx image..."
    docker build \
        --build-arg VERSION=$VERSION \
        --build-arg BUILD_DATE=$BUILD_DATE \
        --build-arg GIT_COMMIT=$GIT_COMMIT \
        -t $REGISTRY_PREFIX/nginx:$VERSION \
        -f Dockerfile.nginx \
        .
    
    log_success "All images built successfully"
}

# Tag images
tag_images() {
    log_info "Tagging images..."
    
    # Tag as latest if this is a semantic version
    if [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        docker tag $REGISTRY_PREFIX/dashboard:$VERSION $REGISTRY_PREFIX/dashboard:latest
        docker tag $REGISTRY_PREFIX/api:$VERSION $REGISTRY_PREFIX/api:latest
        docker tag $REGISTRY_PREFIX/nginx:$VERSION $REGISTRY_PREFIX/nginx:latest
        
        log_success "Tagged as latest"
    fi
    
    # Tag with major.minor if semantic version
    if [[ $VERSION =~ ^([0-9]+)\.([0-9]+)\.[0-9]+$ ]]; then
        MAJOR_MINOR="${BASH_REMATCH[1]}.${BASH_REMATCH[2]}"
        docker tag $REGISTRY_PREFIX/dashboard:$VERSION $REGISTRY_PREFIX/dashboard:$MAJOR_MINOR
        docker tag $REGISTRY_PREFIX/api:$VERSION $REGISTRY_PREFIX/api:$MAJOR_MINOR
        docker tag $REGISTRY_PREFIX/nginx:$VERSION $REGISTRY_PREFIX/nginx:$MAJOR_MINOR
        
        log_success "Tagged as $MAJOR_MINOR"
    fi
}

# Push images to registry
push_images() {
    log_info "Pushing images to registry..."
    
    # Check if we can push (registry login required)
    if ! docker info | grep -q "Registry:"; then
        log_warning "Docker registry not configured. Skipping push."
        log_info "To push images later, run:"
        log_info "  docker push $REGISTRY_PREFIX/dashboard:$VERSION"
        log_info "  docker push $REGISTRY_PREFIX/api:$VERSION"
        log_info "  docker push $REGISTRY_PREFIX/nginx:$VERSION"
        return 0
    fi
    
    # Push version-specific tags
    docker push $REGISTRY_PREFIX/dashboard:$VERSION
    docker push $REGISTRY_PREFIX/api:$VERSION
    docker push $REGISTRY_PREFIX/nginx:$VERSION
    
    # Push latest tags if they exist
    if docker image inspect $REGISTRY_PREFIX/dashboard:latest >/dev/null 2>&1; then
        docker push $REGISTRY_PREFIX/dashboard:latest
        docker push $REGISTRY_PREFIX/api:latest
        docker push $REGISTRY_PREFIX/nginx:latest
    fi
    
    log_success "Images pushed to registry"
}

# Generate build report
generate_report() {
    log_info "Generating build report..."
    
    REPORT_FILE="build-report-$VERSION.txt"
    
    cat > $REPORT_FILE << EOF
NullSector Tools Build Report
============================

Version: $VERSION
Build Date: $BUILD_DATE
Git Commit: $GIT_COMMIT
Registry: $REGISTRY_PREFIX

Images Built:
- $REGISTRY_PREFIX/dashboard:$VERSION
- $REGISTRY_PREFIX/api:$VERSION
- $REGISTRY_PREFIX/nginx:$VERSION

Image Sizes:
$(docker images $REGISTRY_PREFIX/dashboard:$VERSION --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}")
$(docker images $REGISTRY_PREFIX/api:$VERSION --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}")
$(docker images $REGISTRY_PREFIX/nginx:$VERSION --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}")

Build Environment:
- Docker Version: $(docker --version)
- Build Host: $(hostname)
- Build User: $(whoami)
- Build Time: $(date)

Deployment Commands:
- Deploy: VERSION=$VERSION docker-compose -f docker-compose.versioned.yml up -d
- Rollback: ./deployment/rollback.sh $VERSION

EOF
    
    log_success "Build report saved to $REPORT_FILE"
}

# Main execution
main() {
    echo "NullSector Tools Build & Tag Script"
    echo "==================================="
    echo "Version: $VERSION"
    echo "Registry: $REGISTRY_PREFIX"
    echo "Build Date: $BUILD_DATE"
    echo "Git Commit: $GIT_COMMIT"
    echo ""
    
    validate_version
    update_version_files
    build_images
    tag_images
    
    # Ask about pushing to registry
    read -p "Push images to registry? (y/N): " push_confirm
    if [[ $push_confirm == [yY] ]]; then
        push_images
    fi
    
    generate_report
    
    log_success "Build completed successfully!"
    log_info "To deploy this version:"
    log_info "  VERSION=$VERSION ./deployment/deploy.sh"
    log_info ""
    log_info "To test locally:"
    log_info "  VERSION=$VERSION docker-compose -f docker-compose.versioned.yml up -d"
}

# Handle script options
case "${1:-build}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [VERSION] [REGISTRY_PREFIX]"
        echo ""
        echo "Examples:"
        echo "  $0 1.9.5                    # Build version 1.9.5"
        echo "  $0 1.9.5 myregistry        # Build with custom registry"
        echo "  $0                          # Build with timestamp version"
        echo ""
        exit 0
        ;;
    *)
        main
        ;;
esac
