#!/bin/bash

# NullSector Project Management Script
# Centralized management for all project operations

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

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

show_help() {
    echo "NullSector Project Manager"
    echo "========================="
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "DEPLOYMENT COMMANDS:"
    echo "  deploy              Deploy the application using Docker"
    echo "  deploy-secure       Deploy with HTTPS/SSL configuration"
    echo "  stop               Stop all services"
    echo "  restart            Restart all services"
    echo "  status             Show service status"
    echo ""
    echo "MANAGEMENT COMMANDS:"
    echo "  logs               Show application logs"
    echo "  logs-api           Show API logs only"
    echo "  logs-frontend      Show frontend logs only"
    echo "  logs-nginx         Show nginx logs only"
    echo "  backup-db          Create database backup"
    echo "  update             Update and restart services"
    echo ""
    echo "TESTING COMMANDS:"
    echo "  test               Run all tests"
    echo "  test-persistence   Test user data persistence"
    echo "  test-deployment    Test deployment functionality"
    echo "  verify             Verify system health"
    echo ""
    echo "TROUBLESHOOTING COMMANDS:"
    echo "  debug              Run debugging checks"
    echo "  troubleshoot       Run troubleshooting tools"
    echo "  check-ports        Check port availability"
    echo "  clean              Clean up temporary files"
    echo ""
    echo "SETUP COMMANDS:"
    echo "  setup-dev          Setup development environment"
    echo "  setup-nginx        Setup nginx configuration"
    echo "  setup-github       Setup GitHub integration"
    echo ""
    echo "INFORMATION COMMANDS:"
    echo "  info               Show project information"
    echo "  structure          Show directory structure"
    echo "  help               Show this help message"
}

show_info() {
    echo "🏗️  NullSector GPU SuperCluster Calculator"
    echo "=========================================="
    echo ""
    echo "📁 Project Structure:"
    echo "   Root: $PROJECT_ROOT"
    echo "   Backend: backend/"
    echo "   Frontend: frontend/nullsector-dashboard/"
    echo "   Config: config/"
    echo "   Scripts: scripts/"
    echo "   Docs: docs/"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Production: http://localhost:2053"
    echo "   API: http://localhost:7779 (internal)"
    echo "   Development: http://localhost:3000"
    echo ""
    echo "🔑 Default Admin Credentials:"
    echo "   Username: admin"
    echo "   Password: Vader@66"
}

show_structure() {
    echo "📁 Project Directory Structure:"
    echo "==============================="
    tree -L 2 -a "$PROJECT_ROOT" 2>/dev/null || find "$PROJECT_ROOT" -maxdepth 2 -type d | sort
}

# Deployment functions
deploy() {
    print_info "Starting deployment..."
    ./scripts/deployment/deploy-docker.sh
}

deploy_secure() {
    print_info "Starting secure deployment..."
    ./scripts/deployment/deploy-secure.sh
}

stop_services() {
    print_info "Stopping all services..."
    docker-compose -f config/docker/docker-compose.yml down
}

restart_services() {
    print_info "Restarting all services..."
    docker-compose -f config/docker/docker-compose.yml restart
}

show_status() {
    print_info "Service status:"
    docker-compose -f config/docker/docker-compose.yml ps
}

# Management functions
show_logs() {
    case "$1" in
        "api")
            docker-compose -f config/docker/docker-compose.yml logs -f nullsector-api
            ;;
        "frontend")
            docker-compose -f config/docker/docker-compose.yml logs -f nullsector-frontend
            ;;
        "nginx")
            docker-compose -f config/docker/docker-compose.yml logs -f nullsector-nginx
            ;;
        *)
            docker-compose -f config/docker/docker-compose.yml logs -f
            ;;
    esac
}

backup_database() {
    print_info "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker exec nullsector-api python3 -c "
from user_database import get_user_database
db = get_user_database()
db.backup_database('/app/data/backup_${timestamp}.db')
print('Backup created: /app/data/backup_${timestamp}.db')
"
}

update_services() {
    print_info "Updating services..."
    ./scripts/management/update-and-restart.sh
}

# Testing functions
run_tests() {
    print_info "Running all tests..."
    ./scripts/testing/test-user-persistence.py
    ./scripts/testing/verify-user-persistence.sh
}

test_persistence() {
    print_info "Testing user persistence..."
    ./scripts/testing/test-user-persistence.py
}

test_deployment() {
    print_info "Testing deployment..."
    ./scripts/testing/test-deployment.sh
}

verify_system() {
    print_info "Verifying system health..."
    ./scripts/testing/verify-user-persistence.sh
}

# Troubleshooting functions
debug_system() {
    print_info "Running debug checks..."
    ./scripts/troubleshooting/debug-frontend-blackscreen.sh
}

troubleshoot_system() {
    print_info "Running troubleshooting tools..."
    ./scripts/troubleshooting/troubleshoot-remote.sh
}

check_ports() {
    print_info "Checking port availability..."
    ./scripts/troubleshooting/check-status.sh
}

clean_system() {
    print_info "Cleaning up temporary files..."
    rm -f api.pid
    rm -rf __pycache__
    rm -rf logs/*.tmp
    print_status "Cleanup complete"
}

# Setup functions
setup_dev() {
    print_info "Setting up development environment..."
    ./scripts/setup/setup-react-dashboard.sh
}

setup_nginx() {
    print_info "Setting up nginx..."
    ./scripts/setup/setup-nginx.sh
}

setup_github() {
    print_info "Setting up GitHub integration..."
    ./scripts/setup/setup-github.sh
}

# Main command handler
case "$1" in
    # Deployment commands
    "deploy")
        deploy
        ;;
    "deploy-secure")
        deploy_secure
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    
    # Management commands
    "logs")
        show_logs "$2"
        ;;
    "logs-api")
        show_logs "api"
        ;;
    "logs-frontend")
        show_logs "frontend"
        ;;
    "logs-nginx")
        show_logs "nginx"
        ;;
    "backup-db")
        backup_database
        ;;
    "update")
        update_services
        ;;
    
    # Testing commands
    "test")
        run_tests
        ;;
    "test-persistence")
        test_persistence
        ;;
    "test-deployment")
        test_deployment
        ;;
    "verify")
        verify_system
        ;;
    
    # Troubleshooting commands
    "debug")
        debug_system
        ;;
    "troubleshoot")
        troubleshoot_system
        ;;
    "check-ports")
        check_ports
        ;;
    "clean")
        clean_system
        ;;
    
    # Setup commands
    "setup-dev")
        setup_dev
        ;;
    "setup-nginx")
        setup_nginx
        ;;
    "setup-github")
        setup_github
        ;;
    
    # Information commands
    "info")
        show_info
        ;;
    "structure")
        show_structure
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
