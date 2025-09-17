#!/usr/bin/env python3
"""
Simple HTTP server to serve the Grafana SEV-1 dashboard and synthetic data files.
This allows the dashboard to load CSV files via fetch() without CORS issues.
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Configuration
PORT = 8080
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers to allow local file access
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    """Start the HTTP server and open the dashboard in a browser."""
    
    # Change to the directory containing the dashboard files
    os.chdir(DIRECTORY)
    
    # Create the server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Starting Grafana SEV-1 Dashboard Server...")
        print(f"📊 Dashboard URL: http://localhost:{PORT}/sev1-warroom-dashboard.html")
        print(f"📁 Serving files from: {DIRECTORY}")
        print(f"🔄 Press Ctrl+C to stop the server")
        print()
        
        # Check if required files exist
        dashboard_file = DIRECTORY / "sev1-warroom-dashboard.html"
        data_loader_file = DIRECTORY / "dashboard-data-loader.js"
        data_dir = DIRECTORY / "superpod_sev1_fake_telemetry"
        
        if not dashboard_file.exists():
            print(f"❌ Error: Dashboard file not found: {dashboard_file}")
            return
            
        if not data_loader_file.exists():
            print(f"❌ Error: Data loader file not found: {data_loader_file}")
            return
            
        if not data_dir.exists():
            print(f"❌ Error: Data directory not found: {data_dir}")
            return
            
        print(f"✅ Dashboard file: {dashboard_file.name}")
        print(f"✅ Data loader: {data_loader_file.name}")
        print(f"✅ Data directory: {data_dir.name} ({len(list(data_dir.glob('*.csv')))} CSV files)")
        print()
        
        # Open the dashboard in the default browser
        dashboard_url = f"http://localhost:{PORT}/sev1-warroom-dashboard.html"
        print(f"🌐 Opening dashboard in browser: {dashboard_url}")
        webbrowser.open(dashboard_url)
        
        # Start serving
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped by user")
            httpd.shutdown()

if __name__ == "__main__":
    main()
