#!/bin/bash

# Post-update check script for NullSector
# Determines if redeployment is needed after git pull

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

echo "🔄 Post-Update Analysis - Do I need to redeploy?"
echo "==============================================="

# Check what files were changed in the last commit
echo ""
print_info "📋 Recent changes in this update:"
git log --name-only --oneline -1 | head -n -1

echo ""
print_info "🔍 Analyzing what was changed..."

# Check if critical files that require redeployment were modified
REDEPLOY_FILES=(
    "calculator-api.py"
    "Dockerfile.*"
    "docker-compose.yml"
    "nginx-*.conf"
    "requirements.txt"
    "package.json"
    "src/"
    "public/"
)

NEEDS_REDEPLOY=false

for file in "${REDEPLOY_FILES[@]}"; do
    if git diff --name-only HEAD~1 HEAD | grep -q "^${file}"; then
        print_warning "⚠️  Critical file changed: $file"
        NEEDS_REDEPLOY=true
    fi
done

echo ""
if [ "$NEEDS_REDEPLOY" = true ]; then
    print_warning "🔄 REDEPLOYMENT REQUIRED"
    echo ""
    echo "💡 Recommendation: Run the following commands:"
    echo "   ./deploy-docker.sh    # Rebuild and restart all services"
    echo ""
    echo "   OR if you just want to restart existing containers:"
    echo "   ./docker-manage.sh restart"
else
    print_status "✅ NO REDEPLOYMENT NEEDED"
    echo ""
    echo "💡 The changes were likely documentation, scripts, or non-runtime files."
    echo "   Your existing containers should continue working normally."
    echo ""
    echo "   Optional: You can restart services if you want:"
    echo "   ./docker-manage.sh restart"
fi

echo ""
print_info "🔧 Current container status:"
if docker-compose ps >/dev/null 2>&1; then
    echo "   Services are currently running"
    docker-compose ps | tail -n +2
else
    echo "   No services currently running"
fi

echo ""
print_info "📝 Quick verification:"
echo "   ./check-status.sh     # Check if everything is working"
echo "   curl -I http://localhost:2053  # Test application access"

echo ""
echo "==============================================="
echo "Analysis complete! 🚀"
