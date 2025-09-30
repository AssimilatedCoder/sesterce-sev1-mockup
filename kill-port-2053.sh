#!/bin/bash

# Script to kill any process using port 2053
echo "🔍 Checking for processes using port 2053..."

# Find process using port 2053
PID=$(lsof -ti:2053)

if [ -n "$PID" ]; then
    echo "📋 Found process $PID using port 2053"
    echo "🔪 Killing process $PID..."
    kill -9 $PID
    sleep 1

    # Verify it's killed
    if lsof -ti:2053 > /dev/null; then
        echo "❌ Failed to kill process on port 2053"
        exit 1
    else
        echo "✅ Successfully killed process on port 2053"
    fi
else
    echo "✅ No process found using port 2053"
fi

echo "🚀 Port 2053 is now free for use"
