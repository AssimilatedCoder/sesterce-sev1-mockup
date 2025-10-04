#!/bin/bash

# Script to kill any process using port 7778
echo "🔍 Checking for processes using port 7778..."

# Find process using port 7778
PID=$(lsof -ti:7778)

if [ -n "$PID" ]; then
    echo "📋 Found process $PID using port 7778"
    echo "🔪 Killing process $PID..."
    kill -9 $PID
    sleep 1
    
    # Verify it's killed
    if lsof -ti:7778 > /dev/null; then
        echo "❌ Failed to kill process on port 7778"
        exit 1
    else
        echo "✅ Successfully killed process on port 7778"
    fi
else
    echo "✅ No process found using port 7778"
fi

echo "🚀 Port 7778 is now free for use"
