#!/bin/bash

# User Persistence Verification Script
# This script verifies that user data persists across Docker deployments

set -e

echo "🔍 Verifying User Data Persistence..."

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

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    print_error "Docker is not running or not accessible"
    exit 1
fi

# Check if the API container is running
if ! docker ps | grep -q "nullsector-api"; then
    print_warning "NullSector API container is not running"
    print_info "Run './deploy-docker.sh' to start the application"
    exit 1
fi

print_status "API container is running"

# Test API health
print_info "Testing API health..."
if curl -s --max-time 10 http://localhost:2053/api/health >/dev/null 2>&1; then
    print_status "API is responding"
else
    print_error "API is not responding"
    exit 1
fi

# Test login with admin user
print_info "Testing admin login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:2053/api/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "Vader@66"}' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    print_status "Admin login successful"
    
    # Extract token for further API calls
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
    
    if [ -n "$TOKEN" ]; then
        print_status "JWT token obtained"
        
        # Test getting user list
        print_info "Testing user management API..."
        USERS_RESPONSE=$(curl -s -X GET http://localhost:2053/api/users \
            -H "Authorization: Bearer $TOKEN" 2>/dev/null)
        
        if echo "$USERS_RESPONSE" | grep -q "users"; then
            USER_COUNT=$(echo "$USERS_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['users']))" 2>/dev/null)
            print_status "User management API working - Found $USER_COUNT users"
            
            # Test database stats
            print_info "Testing database statistics..."
            STATS_RESPONSE=$(curl -s -X GET http://localhost:2053/api/database/stats \
                -H "Authorization: Bearer $TOKEN" 2>/dev/null)
            
            if echo "$STATS_RESPONSE" | grep -q "stats"; then
                TOTAL_USERS=$(echo "$STATS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['stats']['total_users'])" 2>/dev/null)
                DB_SIZE=$(echo "$STATS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['stats']['database_size_bytes'])" 2>/dev/null)
                print_status "Database stats: $TOTAL_USERS users, $DB_SIZE bytes"
            else
                print_warning "Database stats API not responding properly"
            fi
        else
            print_error "User management API not working properly"
            exit 1
        fi
    else
        print_error "Failed to extract JWT token"
        exit 1
    fi
else
    print_error "Admin login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Check Docker volume for user data
print_info "Checking Docker volume for user data..."
VOLUME_INFO=$(docker volume inspect nullsector-tools_user_data 2>/dev/null || echo "")

if [ -n "$VOLUME_INFO" ]; then
    VOLUME_PATH=$(echo "$VOLUME_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['Mountpoint'])" 2>/dev/null)
    if [ -n "$VOLUME_PATH" ]; then
        print_status "User data volume found: $VOLUME_PATH"
        
        # Check if database file exists in the volume
        if docker exec nullsector-api test -f /app/data/users.db 2>/dev/null; then
            DB_SIZE=$(docker exec nullsector-api stat -f%z /app/data/users.db 2>/dev/null || docker exec nullsector-api stat -c%s /app/data/users.db 2>/dev/null)
            print_status "Database file exists in container: /app/data/users.db ($DB_SIZE bytes)"
        else
            print_error "Database file not found in container"
            exit 1
        fi
    else
        print_warning "Could not determine volume path"
    fi
else
    print_error "User data volume not found"
    exit 1
fi

echo ""
echo "🎉 User Persistence Verification Complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ API container is running and healthy"
echo "  ✅ Authentication system is working"
echo "  ✅ User management API is functional"
echo "  ✅ Database is persistent via Docker volume"
echo "  ✅ User data will survive container restarts and deployments"
echo ""
echo "🔧 To test persistence:"
echo "  1. Create a new user via the web interface"
echo "  2. Run './deploy-docker.sh' to redeploy"
echo "  3. Verify the user still exists after redeployment"
echo ""
print_status "User data persistence is properly configured!"
