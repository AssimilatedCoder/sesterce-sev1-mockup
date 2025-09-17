#!/usr/bin/env python3
"""
Production HTTP server for SEV-1 Dashboard
Serves the Grafana dashboard on all network interfaces for remote access.
"""

import http.server
import socketserver
import os
import signal
import sys
from pathlib import Path

# Configuration
PORT = 7777
HOST = "0.0.0.0"  # Listen on all interfaces for remote access
DIRECTORY = Path(__file__).parent

class ProductionHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers and security headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging format
        print(f"[{self.address_string()}] {format % args}")

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print(f"\n🛑 Server stopped by user")
    sys.exit(0)

def get_local_ip():
    """Get the local IP address for display"""
    import socket
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "localhost"

def main():
    """Start the production HTTP server"""
    
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Change to the directory containing the dashboard files
    os.chdir(DIRECTORY)
    
    # Validate required files exist
    dashboard_file = DIRECTORY / "sev1-warroom-dashboard.html"
    data_loader_file = DIRECTORY / "dashboard-data-loader.js"
    data_dir = DIRECTORY / "superpod_sev1_fake_telemetry"
    
    print(f"🚀 Starting SEV-1 Dashboard Production Server...")
    print(f"📁 Serving from: {DIRECTORY}")
    print()
    
    if not dashboard_file.exists():
        print(f"❌ Error: Dashboard file not found: {dashboard_file}")
        return 1
        
    if not data_loader_file.exists():
        print(f"❌ Error: Data loader file not found: {data_loader_file}")
        return 1
        
    if not data_dir.exists():
        print(f"❌ Error: Data directory not found: {data_dir}")
        return 1
        
    print(f"✅ Dashboard file: {dashboard_file.name}")
    print(f"✅ Data loader: {data_loader_file.name}")
    print(f"✅ Data directory: {data_dir.name} ({len(list(data_dir.glob('*.csv')))} CSV files)")
    print()
    
    # Get local IP for display
    local_ip = get_local_ip()
    
    # Create and start the server
    try:
        with socketserver.TCPServer((HOST, PORT), ProductionHTTPRequestHandler) as httpd:
            print(f"🌐 Server running on all interfaces:")
            print(f"   Local:    http://localhost:{PORT}/sev1-warroom-dashboard.html")
            print(f"   Network:  http://{local_ip}:{PORT}/sev1-warroom-dashboard.html")
            print(f"   External: http://YOUR_UBUNTU_IP:{PORT}/sev1-warroom-dashboard.html")
            print()
            print(f"🔄 Press Ctrl+C to stop the server")
            print(f"📊 Dashboard ready for remote access!")
            print()
            
            # Start serving requests
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Error: Port {PORT} is already in use")
            print(f"💡 Try: sudo lsof -ti:{PORT} | xargs sudo kill -9")
            print(f"💡 Or change PORT in {__file__}")
            return 1
        else:
            print(f"❌ Error starting server: {e}")
            return 1
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
