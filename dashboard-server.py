#!/usr/bin/env python3
"""
Dashboard HTTP server for static SEV-1 dashboard
Serves the dashboard files with proper routing
"""

import http.server
import socketserver
import os
from pathlib import Path

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Redirect root path to dashboard
        if self.path == '/' or self.path == '':
            self.path = '/sev1-warroom-dashboard.html'

        # Call parent's do_GET method
        return super().do_GET()

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
        # Custom logging format with timestamp
        import time
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] [{self.address_string()}] {format % args}")

def main():
    """Start the dashboard HTTP server"""
    port = 7777
    host = "0.0.0.0"  # Listen on all interfaces

    # Change to the directory containing the dashboard files
    os.chdir('/app')

    print(f"🚀 Starting SEV-1 Dashboard Server on port {port}...")
    print(f"📁 Serving from: {os.getcwd()}")

    try:
        with socketserver.TCPServer((host, port), DashboardHandler) as httpd:
            print(f"🌐 Dashboard available at: http://localhost:{port}")
            print(f"📊 Default route redirects to: /sev1-warroom-dashboard.html")
            print("🔄 Press Ctrl+C to stop the server")
            # Start serving requests
            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Error: Port {port} is already in use")
        else:
            print(f"❌ Error starting server: {e}")
        exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        exit(1)

if __name__ == "__main__":
    main()
