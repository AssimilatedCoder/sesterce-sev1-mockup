#!/usr/bin/env python3
"""
Production HTTP server for SEV-1 Dashboard
Serves the Grafana dashboard on all network interfaces for remote access.
Includes intelligent port management and background execution.
"""

import http.server
import socketserver
import os
import signal
import sys
import subprocess
import time
import argparse
import socket
from pathlib import Path

# Configuration
PORT = 7777
HOST = "0.0.0.0"  # Listen on all interfaces for remote access
DIRECTORY = Path(__file__).parent
PID_FILE = DIRECTORY / "server.pid"

class ProductionHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
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
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] [{self.address_string()}] {format % args}")

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print(f"\n🛑 Server stopped by user")
    cleanup_pid_file()
    sys.exit(0)

def cleanup_pid_file():
    """Remove PID file on exit"""
    try:
        if PID_FILE.exists():
            PID_FILE.unlink()
    except Exception:
        pass

def get_local_ip():
    """Get the local IP address for display"""
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "localhost"

def find_process_on_port(port):
    """Find process using the specified port"""
    pids = []
    
    # Method 1: Try lsof (most reliable)
    try:
        result = subprocess.run(['lsof', '-ti', f':{port}'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0 and result.stdout.strip():
            pids = [int(pid) for pid in result.stdout.strip().split('\n') if pid.isdigit()]
            if pids:
                return pids
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Method 2: Try ss (modern replacement for netstat)
    try:
        result = subprocess.run(['ss', '-tlnp'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if f':{port} ' in line and 'LISTEN' in line:
                    # ss format: users:(("python3",pid=12345,fd=3))
                    if 'users:' in line:
                        import re
                        match = re.search(r'pid=(\d+)', line)
                        if match:
                            pids.append(int(match.group(1)))
            if pids:
                return pids
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Method 3: Try netstat (fallback)
    try:
        result = subprocess.run(['netstat', '-tlnp'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if f':{port} ' in line and 'LISTEN' in line:
                    parts = line.split()
                    if len(parts) > 6 and '/' in parts[6]:
                        pid_str = parts[6].split('/')[0]
                        if pid_str.isdigit():
                            pids.append(int(pid_str))
            if pids:
                return pids
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Method 4: Try direct socket test
    try:
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            result = s.connect_ex(('localhost', port))
            if result == 0:
                # Port is in use, but we can't determine PID
                # Return a dummy PID to indicate port is occupied
                return [-1]  # Special marker for "port in use but unknown PID"
    except Exception:
        pass
    
    return []

def kill_processes_on_port(port, max_retries=3):
    """Kill processes using the specified port with retry logic"""
    for attempt in range(max_retries):
        pids = find_process_on_port(port)
        
        if not pids:
            return True  # No processes found, port is free
        
        if attempt > 0:
            print(f"🔄 Retry attempt {attempt + 1}/{max_retries}")
        
        killed_any = False
        for pid in pids:
            try:
                # Handle special case of unknown PID (port in use but PID unknown)
                if pid == -1:
                    print(f"⚠️  Port {port} is in use but PID unknown")
                    # Try aggressive cleanup with system commands
                    try:
                        subprocess.run(['sudo', 'fuser', '-k', f'{port}/tcp'], 
                                     check=False, capture_output=True, timeout=5)
                        killed_any = True
                        print(f"🔨 Attempted to kill processes on port {port} with fuser")
                    except (subprocess.TimeoutExpired, FileNotFoundError):
                        pass
                    continue
                
                # Check if it's our own process
                if PID_FILE.exists():
                    try:
                        with open(PID_FILE, 'r') as f:
                            our_pid = int(f.read().strip())
                            if pid == our_pid:
                                print(f"🔄 Found existing server process (PID: {pid})")
                                os.kill(pid, signal.SIGTERM)
                                time.sleep(2)  # Give more time for graceful shutdown
                                killed_any = True
                                continue
                    except (ValueError, ProcessLookupError):
                        pass
                
                # Kill other processes
                print(f"🔪 Killing process on port {port} (PID: {pid})")
                
                # Try SIGTERM first
                try:
                    os.kill(pid, signal.SIGTERM)
                    time.sleep(1)
                    
                    # Check if process still exists
                    try:
                        os.kill(pid, 0)
                        # Still exists, try SIGKILL
                        print(f"🔨 Force killing process (PID: {pid})")
                        os.kill(pid, signal.SIGKILL)
                        time.sleep(1)
                    except ProcessLookupError:
                        pass  # Process is dead
                    
                    killed_any = True
                    
                except ProcessLookupError:
                    # Process already dead
                    killed_any = True
                except PermissionError:
                    print(f"⚠️  Permission denied killing PID {pid}")
                    # Try with sudo as fallback
                    try:
                        subprocess.run(['sudo', 'kill', '-9', str(pid)], 
                                     check=True, capture_output=True, timeout=5)
                        print(f"✅ Killed with sudo (PID: {pid})")
                        killed_any = True
                    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
                        print(f"❌ Failed to kill PID {pid} even with sudo")
                except Exception as e:
                    print(f"⚠️  Error killing PID {pid}: {e}")
            
            except Exception as e:
                print(f"⚠️  Unexpected error with PID {pid}: {e}")
        
        if killed_any:
            # Wait for processes to fully terminate and port to be released
            print(f"⏳ Waiting for port {port} to be released...")
            for wait_attempt in range(5):  # Wait up to 5 seconds
                time.sleep(1)
                if not find_process_on_port(port):
                    print(f"✅ Port {port} is now free")
                    return True
                print(f"   Still waiting... ({wait_attempt + 1}/5)")
        
        # If we get here, either nothing was killed or port is still in use
        if attempt < max_retries - 1:
            print(f"⏳ Waiting before retry...")
            time.sleep(2)
    
    # Final check
    remaining_pids = find_process_on_port(port)
    if remaining_pids:
        print(f"❌ Failed to free port {port}. Remaining PIDs: {remaining_pids}")
        print(f"💡 Manual cleanup: sudo lsof -ti:{port} | xargs sudo kill -9")
        return False
    
    return True

def daemonize():
    """Run the server as a daemon process"""
    try:
        # First fork
        pid = os.fork()
        if pid > 0:
            # Parent process - print info and exit
            print(f"🚀 Server starting in background (PID: {pid})")
            print(f"📝 PID file: {PID_FILE}")
            print(f"🔍 Check status: ps aux | grep {pid}")
            print(f"🛑 Stop server: kill {pid}")
            sys.exit(0)
    except OSError as e:
        print(f"❌ Fork failed: {e}")
        sys.exit(1)
    
    # Child process continues
    os.chdir("/")
    os.setsid()
    os.umask(0)
    
    try:
        # Second fork
        pid = os.fork()
        if pid > 0:
            sys.exit(0)
    except OSError as e:
        print(f"❌ Second fork failed: {e}")
        sys.exit(1)
    
    # Write PID file
    with open(PID_FILE, 'w') as f:
        f.write(str(os.getpid()))
    
    # Redirect standard file descriptors
    sys.stdout.flush()
    sys.stderr.flush()
    
    # Keep stdout/stderr for logging (don't redirect to /dev/null)
    # This allows us to see logs when running in background

def validate_files():
    """Validate required files exist"""
    dashboard_file = DIRECTORY / "sev1-warroom-dashboard.html"
    data_loader_file = DIRECTORY / "dashboard-data-loader.js"
    data_dir = DIRECTORY / "superpod_sev1_fake_telemetry"
    
    print(f"🚀 Starting SEV-1 Dashboard Production Server...")
    print(f"📁 Serving from: {DIRECTORY}")
    print()
    
    if not dashboard_file.exists():
        print(f"❌ Error: Dashboard file not found: {dashboard_file}")
        return False
        
    if not data_loader_file.exists():
        print(f"❌ Error: Data loader file not found: {data_loader_file}")
        return False
        
    if not data_dir.exists():
        print(f"❌ Error: Data directory not found: {data_dir}")
        return False
        
    print(f"✅ Dashboard file: {dashboard_file.name}")
    print(f"✅ Data loader: {data_loader_file.name}")
    print(f"✅ Data directory: {data_dir.name} ({len(list(data_dir.glob('*.csv')))} CSV files)")
    print()
    
    return True

def main():
    """Start the production HTTP server"""
    parser = argparse.ArgumentParser(description='SEV-1 Dashboard Server')
    parser.add_argument('--background', '-b', action='store_true', 
                       help='Run server in background (daemon mode)')
    parser.add_argument('--foreground', '-f', action='store_true', 
                       help='Run server in foreground (default)')
    parser.add_argument('--stop', action='store_true', 
                       help='Stop background server')
    parser.add_argument('--status', action='store_true', 
                       help='Check server status')
    parser.add_argument('--force-cleanup', action='store_true',
                       help='Force cleanup port 7777 (kills all processes)')
    parser.add_argument('--force', action='store_true',
                       help='Force start server (skip port check)')
    
    args = parser.parse_args()
    
    # Handle force cleanup command
    if args.force_cleanup:
        print(f"🔨 Force cleaning up port {PORT}...")
        pids = find_process_on_port(PORT)
        if not pids:
            print(f"✅ Port {PORT} is already free")
            return 0
        
        print(f"🔍 Found {len(pids)} process(es) on port {PORT}: {pids}")
        
        # Try aggressive cleanup
        for pid in pids:
            try:
                print(f"🔪 Force killing PID {pid}")
                os.kill(pid, signal.SIGKILL)
            except ProcessLookupError:
                print(f"   PID {pid} already dead")
            except PermissionError:
                try:
                    subprocess.run(['sudo', 'kill', '-9', str(pid)], 
                                 check=True, capture_output=True, timeout=5)
                    print(f"   Killed PID {pid} with sudo")
                except Exception:
                    print(f"   Failed to kill PID {pid}")
        
        # Wait and verify
        time.sleep(2)
        remaining = find_process_on_port(PORT)
        if remaining:
            print(f"❌ Still {len(remaining)} process(es) remaining: {remaining}")
            print(f"💡 Manual cleanup: sudo lsof -ti:{PORT} | xargs sudo kill -9")
            return 1
        else:
            print(f"✅ Port {PORT} successfully freed")
            cleanup_pid_file()
            return 0
    
    # Handle stop command
    if args.stop:
        if PID_FILE.exists():
            try:
                with open(PID_FILE, 'r') as f:
                    pid = int(f.read().strip())
                os.kill(pid, signal.SIGTERM)
                print(f"🛑 Stopped server (PID: {pid})")
                cleanup_pid_file()
                return 0
            except (ValueError, ProcessLookupError):
                print(f"❌ Server not running or PID file invalid")
                cleanup_pid_file()
                return 1
        else:
            print(f"❌ Server not running (no PID file)")
            return 1
    
    # Handle status command
    if args.status:
        if PID_FILE.exists():
            try:
                with open(PID_FILE, 'r') as f:
                    pid = int(f.read().strip())
                os.kill(pid, 0)  # Check if process exists
                local_ip = get_local_ip()
                print(f"✅ Server running (PID: {pid})")
                print(f"🌐 Dashboard: http://{local_ip}:{PORT}")
                return 0
            except (ValueError, ProcessLookupError):
                print(f"❌ Server not running (stale PID file)")
                cleanup_pid_file()
                return 1
        else:
            print(f"❌ Server not running")
            return 1
    
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Change to the directory containing the dashboard files
    os.chdir(DIRECTORY)
    
    # Validate required files exist
    if not validate_files():
        return 1
    
    # Determine run mode first
    run_background = args.background or (not args.foreground and not sys.stdin.isatty())
    
    if run_background:
        print(f"🌙 Starting in background mode...")
        daemonize()
        # After daemonizing, we're in the child process
        # Now check port in the actual process that will bind to it
    else:
        print(f"🌞 Starting in foreground mode...")
    
    # Check if port is in use and kill existing processes (unless --force is used)
    # Do this AFTER daemonizing so we check in the correct process
    if not args.force:
        if find_process_on_port(PORT):
            print(f"🔍 Port {PORT} is in use, attempting to free it...")
            if not kill_processes_on_port(PORT):
                print(f"❌ Could not free port {PORT}")
                print(f"💡 Try manual cleanup: sudo lsof -ti:{PORT} | xargs sudo kill -9")
                print(f"💡 Or use --force to skip port check: python3 server.py --force")
                return 1
    else:
        print(f"⚡ Force mode: Skipping port check for {PORT}")
    
    # Get local IP for display
    local_ip = get_local_ip()
    
    # Create and start the server
    try:
        with socketserver.TCPServer((HOST, PORT), ProductionHTTPRequestHandler) as httpd:
            if not run_background:
                print(f"🌐 SEV-1 Dashboard Server running on all interfaces:")
                print(f"   Local:    http://localhost:{PORT}")
                print(f"   Network:  http://{local_ip}:{PORT}")
                print(f"   External: http://YOUR_UBUNTU_IP:{PORT}")
                print()
                print(f"📊 Dashboard automatically loads at root URL")
                print(f"🔗 Share this: http://{local_ip}:{PORT}")
                print(f"🔄 Press Ctrl+C to stop the server")
                print()
            else:
                # Background mode - minimal output
                timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
                print(f"[{timestamp}] 🌐 SEV-1 Dashboard Server started")
                print(f"[{timestamp}] 🔗 Available at: http://{local_ip}:{PORT}")
            
            # Start serving requests
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno in [48, 98]:  # Address already in use (macOS/Linux)
            print(f"❌ Error: Port {PORT} is still in use after cleanup attempt")
            print(f"💡 Manual cleanup: sudo lsof -ti:{PORT} | xargs sudo kill -9")
            return 1
        else:
            print(f"❌ Error starting server: {e}")
            return 1
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1
    finally:
        cleanup_pid_file()

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)