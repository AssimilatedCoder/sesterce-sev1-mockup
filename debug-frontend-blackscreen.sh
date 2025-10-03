#!/bin/bash

# Frontend Black Screen Debug Script
# This script captures comprehensive logs to diagnose the black screen issue

set -e

echo "🔍 Frontend Black Screen Investigation Script"
echo "=============================================="
echo "Timestamp: $(date)"
echo ""

# Create debug directory
DEBUG_DIR="debug-logs-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEBUG_DIR"

echo "📁 Creating debug directory: $DEBUG_DIR"
echo ""

# Function to capture logs with timestamps
capture_logs() {
    local service=$1
    local logfile="$DEBUG_DIR/${service}-logs.txt"
    echo "📋 Capturing $service logs..."
    
    # Get recent logs (last 500 lines)
    docker logs --tail 500 "nullsector-$service" > "$logfile" 2>&1
    
    # Also capture real-time logs for monitoring
    echo "🔄 Starting real-time $service log monitoring..."
    docker logs -f "nullsector-$service" > "$DEBUG_DIR/${service}-realtime.log" 2>&1 &
    
    # Store the PID for cleanup
    echo $! >> "$DEBUG_DIR/log_pids.txt"
}

# Function to capture system resources
capture_system_info() {
    echo "💻 Capturing system information..."
    
    # Docker container stats
    echo "=== Docker Container Stats ===" > "$DEBUG_DIR/system-info.txt"
    docker stats --no-stream >> "$DEBUG_DIR/system-info.txt" 2>&1
    
    echo "" >> "$DEBUG_DIR/system-info.txt"
    echo "=== Docker Container Status ===" >> "$DEBUG_DIR/system-info.txt"
    docker ps -a >> "$DEBUG_DIR/system-info.txt" 2>&1
    
    echo "" >> "$DEBUG_DIR/system-info.txt"
    echo "=== System Memory Usage ===" >> "$DEBUG_DIR/system-info.txt"
    if command -v free >/dev/null 2>&1; then
        free -h >> "$DEBUG_DIR/system-info.txt" 2>&1
    elif command -v vm_stat >/dev/null 2>&1; then
        vm_stat >> "$DEBUG_DIR/system-info.txt" 2>&1
    fi
    
    echo "" >> "$DEBUG_DIR/system-info.txt"
    echo "=== Disk Usage ===" >> "$DEBUG_DIR/system-info.txt"
    df -h >> "$DEBUG_DIR/system-info.txt" 2>&1
    
    echo "" >> "$DEBUG_DIR/system-info.txt"
    echo "=== Docker System Info ===" >> "$DEBUG_DIR/system-info.txt"
    docker system df >> "$DEBUG_DIR/system-info.txt" 2>&1
}

# Function to capture network information
capture_network_info() {
    echo "🌐 Capturing network information..."
    
    echo "=== Network Connectivity Tests ===" > "$DEBUG_DIR/network-info.txt"
    
    # Test frontend accessibility
    echo "Frontend Health Check:" >> "$DEBUG_DIR/network-info.txt"
    curl -I http://localhost:2053 >> "$DEBUG_DIR/network-info.txt" 2>&1 || echo "Frontend unreachable" >> "$DEBUG_DIR/network-info.txt"
    
    echo "" >> "$DEBUG_DIR/network-info.txt"
    echo "API Health Check:" >> "$DEBUG_DIR/network-info.txt"
    curl -I http://localhost:2053/api/health >> "$DEBUG_DIR/network-info.txt" 2>&1 || echo "API unreachable" >> "$DEBUG_DIR/network-info.txt"
    
    echo "" >> "$DEBUG_DIR/network-info.txt"
    echo "Docker Network Info:" >> "$DEBUG_DIR/network-info.txt"
    docker network ls >> "$DEBUG_DIR/network-info.txt" 2>&1
    
    echo "" >> "$DEBUG_DIR/network-info.txt"
    echo "Port Usage:" >> "$DEBUG_DIR/network-info.txt"
    if command -v netstat >/dev/null 2>&1; then
        netstat -tulpn | grep -E ':(2053|7779|80|443)' >> "$DEBUG_DIR/network-info.txt" 2>&1
    elif command -v lsof >/dev/null 2>&1; then
        lsof -i :2053 -i :7779 -i :80 -i :443 >> "$DEBUG_DIR/network-info.txt" 2>&1
    fi
}

# Function to capture application-specific information
capture_app_info() {
    echo "🔧 Capturing application information..."
    
    # Check React build info
    echo "=== React Build Information ===" > "$DEBUG_DIR/app-info.txt"
    if [ -f "nullsector-dashboard/build/static/js/main.*.js" ]; then
        ls -la nullsector-dashboard/build/static/js/ >> "$DEBUG_DIR/app-info.txt" 2>&1
        echo "Build files found" >> "$DEBUG_DIR/app-info.txt"
    else
        echo "No build files found" >> "$DEBUG_DIR/app-info.txt"
    fi
    
    echo "" >> "$DEBUG_DIR/app-info.txt"
    echo "=== Package.json Info ===" >> "$DEBUG_DIR/app-info.txt"
    if [ -f "nullsector-dashboard/package.json" ]; then
        grep -E '"name"|"version"|"dependencies"' nullsector-dashboard/package.json >> "$DEBUG_DIR/app-info.txt" 2>&1
    fi
    
    echo "" >> "$DEBUG_DIR/app-info.txt"
    echo "=== Environment Variables ===" >> "$DEBUG_DIR/app-info.txt"
    docker exec nullsector-frontend env | grep -E 'REACT_|NODE_|npm_' >> "$DEBUG_DIR/app-info.txt" 2>&1 || echo "Could not access frontend env" >> "$DEBUG_DIR/app-info.txt"
}

# Function to test frontend responsiveness
test_frontend_responsiveness() {
    echo "🧪 Testing frontend responsiveness..."
    
    echo "=== Frontend Response Tests ===" > "$DEBUG_DIR/response-tests.txt"
    echo "Test started at: $(date)" >> "$DEBUG_DIR/response-tests.txt"
    
    for i in {1..10}; do
        echo "Test $i at $(date):" >> "$DEBUG_DIR/response-tests.txt"
        
        # Test main page
        if curl -s -m 5 http://localhost:2053 > /dev/null; then
            echo "  ✅ Main page responsive" >> "$DEBUG_DIR/response-tests.txt"
        else
            echo "  ❌ Main page unresponsive" >> "$DEBUG_DIR/response-tests.txt"
        fi
        
        # Test static assets
        if curl -s -m 5 http://localhost:2053/static/js/main.*.js > /dev/null 2>&1; then
            echo "  ✅ Static assets accessible" >> "$DEBUG_DIR/response-tests.txt"
        else
            echo "  ❌ Static assets inaccessible" >> "$DEBUG_DIR/response-tests.txt"
        fi
        
        sleep 2
    done
}

# Function to capture browser console logs (if possible)
capture_browser_info() {
    echo "🌐 Capturing browser-related information..."
    
    echo "=== Browser Console Simulation ===" > "$DEBUG_DIR/browser-info.txt"
    echo "Note: For actual browser console logs, check browser developer tools" >> "$DEBUG_DIR/browser-info.txt"
    echo "" >> "$DEBUG_DIR/browser-info.txt"
    
    # Test JavaScript loading
    echo "JavaScript Loading Test:" >> "$DEBUG_DIR/browser-info.txt"
    if curl -s http://localhost:2053 | grep -q "static/js/main"; then
        echo "  ✅ JavaScript files referenced in HTML" >> "$DEBUG_DIR/browser-info.txt"
    else
        echo "  ❌ JavaScript files not found in HTML" >> "$DEBUG_DIR/browser-info.txt"
    fi
    
    # Check for common error patterns in HTML
    echo "" >> "$DEBUG_DIR/browser-info.txt"
    echo "HTML Content Analysis:" >> "$DEBUG_DIR/browser-info.txt"
    curl -s http://localhost:2053 | head -20 >> "$DEBUG_DIR/browser-info.txt" 2>&1
}

# Function to monitor memory usage over time
monitor_memory_usage() {
    echo "📊 Starting memory usage monitoring..."
    
    echo "=== Memory Usage Over Time ===" > "$DEBUG_DIR/memory-monitoring.txt"
    echo "Monitoring started at: $(date)" >> "$DEBUG_DIR/memory-monitoring.txt"
    
    # Monitor for 2 minutes with 10-second intervals
    for i in {1..12}; do
        echo "" >> "$DEBUG_DIR/memory-monitoring.txt"
        echo "Sample $i at $(date):" >> "$DEBUG_DIR/memory-monitoring.txt"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep nullsector >> "$DEBUG_DIR/memory-monitoring.txt" 2>&1
        sleep 10
    done &
    
    # Store the PID for cleanup
    echo $! >> "$DEBUG_DIR/log_pids.txt"
}

# Function to create a comprehensive report
create_report() {
    echo "📄 Creating comprehensive report..."
    
    cat > "$DEBUG_DIR/INVESTIGATION_REPORT.md" << EOF
# Frontend Black Screen Investigation Report

**Generated**: $(date)
**Issue**: Frontend goes black screen after a few minutes of usage

## Summary of Captured Data

### 1. Log Files
- \`frontend-logs.txt\`: Recent frontend container logs
- \`api-logs.txt\`: Recent API container logs  
- \`nginx-logs.txt\`: Recent Nginx container logs
- \`*-realtime.log\`: Real-time log monitoring (ongoing)

### 2. System Information
- \`system-info.txt\`: Docker stats, container status, memory usage
- \`memory-monitoring.txt\`: Memory usage over time

### 3. Network Analysis
- \`network-info.txt\`: Connectivity tests, port usage, network status

### 4. Application Analysis
- \`app-info.txt\`: React build info, package details, environment variables
- \`response-tests.txt\`: Frontend responsiveness tests

### 5. Browser Analysis
- \`browser-info.txt\`: JavaScript loading tests, HTML content analysis

## Potential Causes to Investigate

### JavaScript/React Issues
1. **Memory Leaks**: Check for increasing memory usage in memory-monitoring.txt
2. **Unhandled Exceptions**: Look for JavaScript errors in frontend logs
3. **Component Lifecycle Issues**: Check for infinite re-renders or useEffect loops
4. **State Management Problems**: Look for state corruption or circular dependencies

### Infrastructure Issues
1. **Container Resource Limits**: Check if containers are hitting memory/CPU limits
2. **Network Connectivity**: Verify API connectivity remains stable
3. **Static Asset Loading**: Ensure JavaScript/CSS files are accessible

### Browser-Specific Issues
1. **Console Errors**: Check browser developer tools for JavaScript errors
2. **Network Tab**: Monitor for failed requests or timeouts
3. **Memory Tab**: Check for memory leaks in browser

## Next Steps

1. **Review Log Files**: Look for error patterns, especially around the time of black screen
2. **Monitor Memory Usage**: Check if memory usage increases over time
3. **Test in Different Browsers**: See if issue is browser-specific
4. **Enable React DevTools**: Use React Developer Tools to monitor component behavior
5. **Add Error Boundaries**: Implement more comprehensive error handling

## Browser Developer Tools Instructions

To capture browser console logs when the issue occurs:

1. Open browser developer tools (F12)
2. Go to Console tab
3. Enable "Preserve log" option
4. Use the application normally
5. When black screen occurs, save console output
6. Check Network tab for failed requests
7. Check Memory tab for memory leaks

EOF

    echo "✅ Investigation report created: $DEBUG_DIR/INVESTIGATION_REPORT.md"
}

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🧹 Cleaning up background processes..."
    
    if [ -f "$DEBUG_DIR/log_pids.txt" ]; then
        while read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done < "$DEBUG_DIR/log_pids.txt"
        rm -f "$DEBUG_DIR/log_pids.txt"
    fi
    
    echo "✅ Cleanup completed"
}

# Set up cleanup on script exit
trap cleanup EXIT

# Main execution
echo "🚀 Starting comprehensive frontend investigation..."
echo ""

# Check if Docker containers are running
if ! docker ps | grep -q nullsector; then
    echo "❌ NullSector containers are not running. Please start them first with:"
    echo "   ./deploy-docker.sh"
    exit 1
fi

# Capture all information
capture_logs "frontend"
capture_logs "api" 
capture_logs "nginx"
capture_system_info
capture_network_info
capture_app_info
test_frontend_responsiveness
capture_browser_info
monitor_memory_usage

echo ""
echo "⏱️  Monitoring in progress... The script will collect data for 2 minutes."
echo "   During this time, please use the application normally to try to reproduce the black screen issue."
echo "   Press Ctrl+C to stop monitoring early if the issue occurs."
echo ""

# Wait for monitoring to complete
sleep 120

# Create final report
create_report

echo ""
echo "🎉 Investigation completed!"
echo ""
echo "📁 All debug information saved to: $DEBUG_DIR/"
echo ""
echo "📋 Next steps:"
echo "   1. Review the INVESTIGATION_REPORT.md file"
echo "   2. Check the log files for error patterns"
echo "   3. Monitor memory usage trends"
echo "   4. Use browser developer tools for real-time debugging"
echo ""
echo "🔍 To continue monitoring in real-time:"
echo "   tail -f $DEBUG_DIR/*-realtime.log"
echo ""
