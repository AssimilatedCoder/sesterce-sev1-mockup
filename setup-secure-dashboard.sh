#!/bin/bash

# Setup script for Sesterce Secure Dashboard with API Backend

echo "🔒 Setting up Sesterce Secure Dashboard with API Backend..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$SCRIPT_DIR/sesterce-dashboard"
BUILD_DIR="$REACT_DIR/build"
API_FILE="$SCRIPT_DIR/calculator-api.py"

# Check if we're on Ubuntu or macOS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    IS_UBUNTU=true
    NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
    NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
    NGINX_LOG_DIR="/var/log/nginx"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    IS_UBUNTU=false
    NGINX_SITES_AVAILABLE="/usr/local/etc/nginx/servers"
    NGINX_SITES_ENABLED="/usr/local/etc/nginx/servers"
    NGINX_LOG_DIR="/usr/local/var/log/nginx"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

echo "🖥️  Detected OS: $([ "$IS_UBUNTU" = true ] && echo "Ubuntu/Linux" || echo "macOS")"

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    # Check Python 3
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
        missing_deps+=("pip")
    fi
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        missing_deps+=("nginx")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo "❌ Missing dependencies: ${missing_deps[*]}"
        
        if [ "$IS_UBUNTU" = true ]; then
            echo "📦 Installing missing dependencies on Ubuntu..."
            sudo apt-get update
            
            for dep in "${missing_deps[@]}"; do
                case $dep in
                    node)
                        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                        ;;
                    python3)
                        sudo apt-get install -y python3
                        ;;
                    pip)
                        sudo apt-get install -y python3-pip
                        ;;
                    nginx)
                        sudo apt-get install -y nginx
                        ;;
                esac
            done
        else
            echo "Please install missing dependencies:"
            for dep in "${missing_deps[@]}"; do
                case $dep in
                    node)
                        echo "   brew install node"
                        ;;
                    python3)
                        echo "   brew install python3"
                        ;;
                    pip)
                        echo "   brew install python3  # includes pip"
                        ;;
                    nginx)
                        echo "   brew install nginx"
                        ;;
                esac
            done
            exit 1
        fi
    fi
}

# Install Python dependencies for API
install_python_deps() {
    echo "📦 Installing Python dependencies for API..."
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install flask flask-cors gunicorn
    
    echo "✅ Python dependencies installed"
}

# Setup API service
setup_api_service() {
    echo "🔧 Setting up API service..."
    
    if [ "$IS_UBUNTU" = true ]; then
        # Create systemd service for API
        sudo tee /etc/systemd/system/sesterce-calculator-api.service > /dev/null <<EOF
[Unit]
Description=Sesterce Calculator API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR
Environment="PATH=$SCRIPT_DIR/venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=$SCRIPT_DIR/venv/bin/gunicorn -w 4 -b 127.0.0.1:7778 calculator-api:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        
        # Reload systemd and enable service
        sudo systemctl daemon-reload
        sudo systemctl enable sesterce-calculator-api
        
        echo "✅ API service configured"
    else
        echo "ℹ️  On macOS, you'll need to run the API manually or use launchd"
    fi
}

# Update Nginx configuration for API
update_nginx_config() {
    echo "🔧 Updating Nginx configuration for API..."
    
    # Create updated Nginx config
    cat > "$SCRIPT_DIR/nginx-secure-dashboard.conf" <<EOF
# Nginx configuration for Sesterce Secure Dashboard with API

# Rate limiting for API
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/m;

server {
    listen 7777;
    server_name _;
    
    # Increase maximum upload size
    client_max_body_size 10M;
    
    # React app root
    root $BUILD_DIR;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Serve React app
    location / {
        try_files \$uri /index.html;
        
        # CORS headers for local development
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
    }
    
    # API proxy with rate limiting
    location /api/ {
        proxy_pass http://127.0.0.1:7778;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Rate limiting
        limit_req zone=api_limit burst=10 nodelay;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Serve synthetic data
    location /superpod_sev1_fake_telemetry/ {
        alias $BUILD_DIR/superpod_sev1_fake_telemetry/;
        autoindex off;
    }
    
    # Serve dashboard HTML
    location /sev1-warroom-dashboard.html {
        alias $BUILD_DIR/sev1-warroom-dashboard.html;
    }
    
    # Serve dashboard data loader
    location /dashboard-data-loader.js {
        alias $BUILD_DIR/dashboard-data-loader.js;
    }
    
    # Logging
    access_log $NGINX_LOG_DIR/sesterce-secure-access.log;
    error_log $NGINX_LOG_DIR/sesterce-secure-error.log;
}
EOF
    
    echo "✅ Nginx configuration created"
}

# Create environment file
create_env_file() {
    echo "🔐 Creating environment configuration..."
    
    # Generate a random API secret
    API_SECRET=$(openssl rand -hex 32)
    
    # Create .env file for React
    cat > "$REACT_DIR/.env.production" <<EOF
GENERATE_SOURCEMAP=false
REACT_APP_CALCULATOR_API_URL=/api
REACT_APP_CALCULATOR_API_SECRET=$API_SECRET
EOF
    
    # Create .env file for API
    cat > "$SCRIPT_DIR/.env" <<EOF
CALCULATOR_API_SECRET=$API_SECRET
FLASK_ENV=production
EOF
    
    echo "✅ Environment files created with secure API secret"
}

# Build React app
build_react_app() {
    echo "🏗️  Building React app..."
    
    cd "$REACT_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing React dependencies..."
        npm install
    fi
    
    # Build with production settings
    npm run build
    
    # Copy additional assets
    echo "📁 Copying additional assets..."
    cp -r "$SCRIPT_DIR/superpod_sev1_fake_telemetry" "$BUILD_DIR/" 2>/dev/null || true
    cp "$SCRIPT_DIR/sev1-warroom-dashboard.html" "$BUILD_DIR/" 2>/dev/null || true
    cp "$SCRIPT_DIR/dashboard-data-loader.js" "$BUILD_DIR/" 2>/dev/null || true
    cp -r "$SCRIPT_DIR/assets/sesterce.jpg" "$REACT_DIR/public/" 2>/dev/null || true
    
    cd "$SCRIPT_DIR"
    
    echo "✅ React app built"
}

# Main setup flow
main() {
    echo "🔍 Checking dependencies..."
    check_dependencies
    
    echo "🐍 Setting up Python environment..."
    install_python_deps
    
    echo "🔧 Configuring API service..."
    setup_api_service
    
    echo "📝 Creating secure configuration..."
    create_env_file
    update_nginx_config
    
    echo "🏗️  Building application..."
    build_react_app
    
    echo ""
    echo "✅ Secure dashboard setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo ""
    echo "1. Start the API service:"
    if [ "$IS_UBUNTU" = true ]; then
        echo "   sudo systemctl start sesterce-calculator-api"
        echo "   sudo systemctl status sesterce-calculator-api"
    else
        echo "   source venv/bin/activate"
        echo "   gunicorn -w 4 -b 127.0.0.1:7778 calculator-api:app"
    fi
    echo ""
    echo "2. Configure and start Nginx:"
    echo "   sudo cp nginx-secure-dashboard.conf $NGINX_SITES_AVAILABLE/sesterce-secure"
    if [ "$IS_UBUNTU" = true ]; then
        echo "   sudo ln -sf $NGINX_SITES_AVAILABLE/sesterce-secure $NGINX_SITES_ENABLED/"
    fi
    echo "   sudo nginx -t"
    echo "   sudo systemctl restart nginx"
    echo ""
    echo "3. Update React app to use secure component:"
    echo "   Edit src/App.tsx to import GPUSuperclusterCalculatorSecure"
    echo ""
    echo "4. Access the secure dashboard at:"
    echo "   http://localhost:7777"
    echo ""
    echo "🔐 API Secret stored in .env files - keep these secure!"
    echo ""
}

# Run main setup
main
