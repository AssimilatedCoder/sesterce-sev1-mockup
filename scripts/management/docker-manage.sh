#!/bin/bash

# Docker Management Script for NullSector Calculator
# Provides simple commands to manage the Docker containers

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
    COMPOSE_CMD="docker-compose"
else
    # Linux - Remote deployment
    COMPOSE_CMD="docker-compose"
fi

case "$1" in
    start)
        print_info "Starting NullSector Docker containers..."
        if $COMPOSE_CMD up -d; then
            print_status "Containers started successfully"
            echo ""
            echo "🌐 Access the application at: http://localhost:2053"
        else
            print_error "Failed to start containers"
            exit 1
        fi
        ;;

    stop)
        print_info "Stopping NullSector Docker containers..."
        if $COMPOSE_CMD down; then
            print_status "Containers stopped successfully"
        else
            print_error "Failed to stop containers"
            exit 1
        fi
        ;;

    restart)
        print_info "Restarting NullSector Docker containers..."
        if $COMPOSE_CMD restart; then
            print_status "Containers restarted successfully"
        else
            print_error "Failed to restart containers"
            exit 1
        fi
        ;;

    build)
        print_info "Building NullSector Docker images..."
        if $COMPOSE_CMD build; then
            print_status "Images built successfully"
        else
            print_error "Failed to build images"
            exit 1
        fi
        ;;

    logs)
        print_info "Showing container logs..."
        if [ -n "$2" ]; then
            $COMPOSE_CMD logs -f "$2"
        else
            $COMPOSE_CMD logs -f
        fi
        ;;

    status)
        print_info "Container status:"
        $COMPOSE_CMD ps
        echo ""
        print_info "Service health:"
        echo "  API Health: $(curl -s http://localhost:7779/api/health || echo '❌ Unreachable')"
        echo "  Frontend Health: $(curl -s http://localhost:8080/health || echo '❌ Unreachable')"
        echo "  Nginx Health: $(curl -s http://localhost:80/health || echo '❌ Unreachable')"
        ;;

    clean)
        print_warning "This will remove all containers, images, and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Cleaning up Docker resources..."
            $COMPOSE_CMD down --volumes --rmi all
            docker system prune -f
            print_status "Cleanup completed"
        else
            print_info "Cleanup cancelled"
        fi
        ;;

    deploy)
        print_info "Deploying NullSector with Docker..."
        ./deploy-docker.sh
        ;;

    *)
        echo "🐳 NullSector Docker Management Script"
        echo ""
        echo "Usage: $0 {start|stop|restart|build|logs|status|clean|deploy}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all containers"
        echo "  stop    - Stop all containers"
        echo "  restart - Restart all containers"
        echo "  build   - Build Docker images"
        echo "  logs    - Show container logs (add service name for specific logs)"
        echo "  status  - Show container status and health"
        echo "  clean   - Remove all containers, images, and volumes"
        echo "  deploy  - Run full deployment (build + start)"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs api"
        echo "  $0 status"
        echo "  $0 deploy"
        exit 1
        ;;
esac
