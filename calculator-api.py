#!/usr/bin/env python3
"""
GPU SuperCluster Calculator API
Secure backend service for TCO calculations with JWT authentication
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import time
import os
import jwt
import json
from datetime import datetime, timedelta, timezone
from functools import wraps

app = Flask(__name__)

# Configure CORS for your domain only
CORS(app, origins=['http://localhost:3000', 'http://localhost:3025', 'https://yourdomain.com'])

# Secret keys
API_SECRET = os.environ.get('CALCULATOR_API_SECRET', 'change-this-secret-key-in-production')
JWT_SECRET = os.environ.get('JWT_SECRET', 'jwt-secret-key-change-in-production')

# User roles and permissions
USER_ROLES = {
    'admin': {
        'description': 'Full system access including user management',
        'permissions': ['calculate', 'view_logs', 'manage_users', 'system_admin']
    },
    'analyst': {
        'description': 'Advanced calculator access with detailed analysis',
        'permissions': ['calculate', 'advanced_features', 'export_data']
    },
    'user': {
        'description': 'Basic calculator access',
        'permissions': ['calculate', 'basic_features']
    },
    'viewer': {
        'description': 'Read-only access to calculations',
        'permissions': ['view_only']
    }
}

# Secure user database (hashed passwords with expiry dates)
# App created 4 weeks ago (early September 2025)
USERS = {
    'David': {
        'password_hash': hashlib.sha256('Sk7walk3r!'.encode()).hexdigest(),
        'role': 'admin',
        'created_at': '2025-09-03T10:30:00Z',  # App creator - 4 weeks ago
        'expires_at': None,  # Admin users don't expire
        'last_login': '2025-09-30T14:22:00Z',
        'is_active': True
    },
    'Thomas': {
        'password_hash': hashlib.sha256('Th0mas@99'.encode()).hexdigest(),
        'role': 'analyst',
        'created_at': '2025-09-05T09:15:00Z',  # Early team member
        'expires_at': '2025-11-05T09:15:00Z',  # 2 months from creation
        'last_login': '2025-09-28T11:45:00Z',
        'is_active': True
    },
    'Kiko': {
        'password_hash': hashlib.sha256('K1ko#2025'.encode()).hexdigest(),
        'role': 'user',
        'created_at': '2025-09-10T16:20:00Z',  # Regular user
        'expires_at': '2025-10-24T16:20:00Z',  # 2 weeks from today
        'last_login': '2025-09-29T08:30:00Z',
        'is_active': True
    },
    'Maciej': {
        'password_hash': hashlib.sha256('Mac1ej*77'.encode()).hexdigest(),
        'role': 'analyst',
        'created_at': '2025-09-12T13:45:00Z',  # Analyst role
        'expires_at': '2025-11-12T13:45:00Z',  # 2 months from creation
        'last_login': '2025-09-27T16:10:00Z',
        'is_active': True
    },
    'admin': {
        'password_hash': hashlib.sha256('Vader@66'.encode()).hexdigest(),
        'role': 'admin',
        'created_at': '2025-09-03T10:00:00Z',  # Super admin created with app
        'expires_at': None,  # Super admin never expires
        'last_login': '2025-10-01T09:00:00Z',  # Today
        'is_active': True
    }
}

# Rate limiting (simple implementation)
request_times = {}
RATE_LIMIT = 10  # requests per minute

# Login logging
LOGIN_LOG_FILE = 'login_access.log'
login_attempts = []  # In-memory log for quick access

# User activity logging
ACTIVITY_LOG_FILE = 'user_activity.log'
user_activities = []  # In-memory log for quick access

def log_login_attempt(client_ip, username, success, user_agent=None):
    """Log login attempts with IP, timestamp, and outcome"""
    timestamp = datetime.now(timezone.utc).isoformat()
    log_entry = {
        'timestamp': timestamp,
        'ip_address': client_ip,
        'username': username,
        'success': success,
        'user_agent': user_agent or 'Unknown'
    }
    
    # Add to in-memory log (keep last 1000 entries)
    login_attempts.append(log_entry)
    if len(login_attempts) > 1000:
        login_attempts.pop(0)
    
    # Write to file log
    try:
        with open(LOGIN_LOG_FILE, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    except Exception as e:
        print(f"Failed to write login log: {e}")

def log_user_activity(client_ip, username, activity_type, details, user_agent=None):
    """Log user activities (tab clicks, actions, etc.)"""
    timestamp = datetime.now(timezone.utc).isoformat()
    log_entry = {
        'timestamp': timestamp,
        'ip_address': client_ip,
        'username': username,
        'activity_type': activity_type,  # 'tab_click', 'calculation', 'override_change', etc.
        'details': details,  # specific tab name, action details, etc.
        'user_agent': user_agent or 'Unknown'
    }
    
    # Add to in-memory log (keep last 5000 entries)
    user_activities.append(log_entry)
    if len(user_activities) > 5000:
        user_activities.pop(0)
    
    # Write to file log
    try:
        with open(ACTIVITY_LOG_FILE, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    except Exception as e:
        print(f"Failed to write activity log: {e}")

def check_rate_limit(client_ip):
    current_time = time.time()
    if client_ip in request_times:
        # Remove old timestamps
        request_times[client_ip] = [t for t in request_times[client_ip] if current_time - t < 60]
        if len(request_times[client_ip]) >= RATE_LIMIT:
            return False
        request_times[client_ip].append(current_time)
    else:
        request_times[client_ip] = [current_time]
    return True

# JWT Authentication functions
def generate_token(username, role):
    """Generate JWT token for authenticated user"""
    payload = {
        'username': username,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return user info"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        user_info = verify_token(token)
        if not user_info:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.user = user_info
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'user') or request.user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Authentication endpoints
def get_client_ip():
    """Get real client IP address, handling proxies"""
    # Check for forwarded IP headers (common with proxies/load balancers)
    if 'X-Forwarded-For' in request.headers:
        # X-Forwarded-For can contain multiple IPs, get the first one
        ip = request.headers['X-Forwarded-For'].split(',')[0].strip()
        return ip
    elif 'X-Real-IP' in request.headers:
        return request.headers['X-Real-IP']
    elif 'CF-Connecting-IP' in request.headers:  # Cloudflare
        return request.headers['CF-Connecting-IP']
    else:
        return request.remote_addr

@app.route('/api/login', methods=['POST'])
def login():
    """Secure login endpoint"""
    client_ip = get_client_ip()
    
    # Rate limiting
    if not check_rate_limit(client_ip):
        return jsonify({'error': 'Rate limit exceeded. Try again later.'}), 429
    
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password required'}), 400
    
    username = data['username']
    password = data['password']
    user_agent = request.headers.get('User-Agent', 'Unknown')
    
    # Check user exists
    if username not in USERS:
        log_login_attempt(client_ip, username, False, user_agent)
        time.sleep(1)  # Prevent timing attacks
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user = USERS[username]
    
    # Check if user is active
    if not user.get('is_active', True):
        log_login_attempt(client_ip, username, False, user_agent)
        time.sleep(1)
        return jsonify({'error': 'Account is disabled'}), 401
    
    # Check if user account has expired
    if user.get('expires_at'):
        expires_at = datetime.fromisoformat(user['expires_at'].replace('Z', '+00:00'))
        if datetime.now(timezone.utc) > expires_at:
            log_login_attempt(client_ip, username, False, user_agent)
            time.sleep(1)
            return jsonify({'error': 'Account has expired'}), 401
    
    # Verify password
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    if password_hash != user['password_hash']:
        log_login_attempt(client_ip, username, False, user_agent)
        time.sleep(1)  # Prevent timing attacks
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Log successful login
    log_login_attempt(client_ip, username, True, user_agent)
    
    # Update last login time
    USERS[username]['last_login'] = datetime.now(timezone.utc).isoformat()
    
    # Generate JWT token
    token = generate_token(username, user['role'])
    
    return jsonify({
        'token': token,
        'username': username,
        'role': user['role'],
        'expires_in': 86400  # 24 hours
    })

@app.route('/api/verify', methods=['POST'])
@require_auth
def verify_token_endpoint():
    """Verify token validity"""
    return jsonify({
        'valid': True,
        'username': request.user['username'],
        'role': request.user['role']
    })

@app.route('/api/log-activity', methods=['POST'])
@require_auth
def log_activity():
    """Log user activity (tab clicks, actions, etc.)"""
    client_ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', 'Unknown')
    username = request.user['username']
    print(f"DEBUG: Activity logged by user: {username}, role: {request.user.get('role')}")
    
    data = request.get_json()
    if not data or 'activity_type' not in data or 'details' not in data:
        return jsonify({'error': 'activity_type and details required'}), 400
    
    activity_type = data['activity_type']
    details = data['details']
    
    # Log the activity
    log_user_activity(client_ip, username, activity_type, details, user_agent)
    
    return jsonify({'status': 'logged'})

@app.route('/api/access-logs', methods=['GET'])
@require_auth
def get_access_logs():
    """Get access logs - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    # Return recent login attempts (last 100)
    recent_attempts = login_attempts[-100:] if len(login_attempts) > 100 else login_attempts
    
    # Return recent user activities (last 200)
    recent_activities = user_activities[-200:] if len(user_activities) > 200 else user_activities
    
    return jsonify({
        'total_login_attempts': len(login_attempts),
        'recent_login_attempts': recent_attempts,
        'total_activities': len(user_activities),
        'recent_activities': recent_activities,
        'login_log_file': LOGIN_LOG_FILE,
        'activity_log_file': ACTIVITY_LOG_FILE
    })

@app.route('/api/reset-logs', methods=['POST'])
@require_auth
def reset_logs():
    """Reset all logs - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    global login_attempts, user_activities
    
    try:
        # Clear in-memory logs
        login_attempts.clear()
        user_activities.clear()
        
        # Clear log files
        try:
            with open(LOGIN_LOG_FILE, 'w') as f:
                f.write('')  # Clear the file
        except Exception:
            pass  # File might not exist yet
            
        try:
            with open(ACTIVITY_LOG_FILE, 'w') as f:
                f.write('')  # Clear the file
        except Exception:
            pass  # File might not exist yet
        
        # Log the reset action
        client_ip = get_client_ip()
        user_agent = request.headers.get('User-Agent', 'Unknown')
        username = request.user['username']
        print(f"DEBUG: Reset logs called by user: {username}, role: {request.user.get('role')}")
        log_user_activity(client_ip, username, 'admin_action', 'Reset all access logs', user_agent)
        
        return jsonify({
            'status': 'success',
            'message': 'All access logs have been cleared',
            'cleared_by': username,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to reset logs: {str(e)}'}), 500

# GPU specifications (hidden from client)
GPU_SPECS = {
    'gb200': {
        'power': 1200,
        'price': 70000,
        'cooling_options': ['liquid'],
        'network_ports': 18,
        'memory': 192
    },
    'gb300': {
        'power': 1400,
        'price': 85000,
        'cooling_options': ['liquid'],
        'network_ports': 18,
        'memory': 288
    },
    'h100-sxm': {
        'power': 700,
        'price': 30000,
        'cooling_options': ['air', 'liquid'],
        'network_ports': 18,
        'memory': 80
    },
    'h100-pcie': {
        'power': 350,
        'price': 25000,
        'cooling_options': ['air'],
        'network_ports': 2,
        'memory': 80
    }
}

# Region rates (hidden from client)
REGION_RATES = {
    'us-east': {'name': 'US East', 'rate': 0.10},
    'us-west': {'name': 'US West', 'rate': 0.12},
    'eu-west': {'name': 'Europe West', 'rate': 0.15},
    'apac': {'name': 'Asia Pacific', 'rate': 0.18}
}

# Storage vendors (hidden from client)
STORAGE_VENDORS = {
    'vast': {'hot_per_gb': 0.02, 'warm_per_gb': 0.01, 'cold_per_gb': 0.005, 'archive_per_gb': 0.002},
    'weka': {'hot_per_gb': 0.025, 'warm_per_gb': 0.012, 'cold_per_gb': 0.006, 'archive_per_gb': 0.0025},
    'pfs': {'hot_per_gb': 0.018, 'warm_per_gb': 0.009, 'cold_per_gb': 0.0045, 'archive_per_gb': 0.0018},
    'ceph': {'hot_per_gb': 0.015, 'warm_per_gb': 0.008, 'cold_per_gb': 0.004, 'archive_per_gb': 0.0015}
}

# Network costs (hidden from client)
NETWORK_COSTS = {
    'infiniband': {
        'switch': 120000,
        'cable': 500,
        'transceiver': 1500,
        'per_gpu_bandwidth': 400
    },
    'ethernet': {
        'switch': 80000,
        'cable': 200,
        'transceiver': 800,
        'per_gpu_bandwidth': 400
    }
}

def validate_request(data):
    """Validate API request with signature"""
    if 'signature' not in data:
        return False
    
    # Create signature from request data + secret
    params = ''.join(str(data.get(k, '')) for k in sorted(data.keys()) if k != 'signature')
    expected_sig = hashlib.sha256((params + API_SECRET).encode()).hexdigest()
    
    return data['signature'] == expected_sig

@app.route('/api/calculate', methods=['POST'])
@require_auth
def calculate():
    # Rate limiting
    client_ip = request.remote_addr
    if not check_rate_limit(client_ip):
        return jsonify({'error': 'Rate limit exceeded'}), 429
    
    data = request.json
    
    # Validate request
    if not validate_request(data):
        return jsonify({'error': 'Invalid request'}), 403
    
    try:
        # Extract parameters
        gpu_model = data.get('gpuModel', 'h100-sxm')
        num_gpus = int(data.get('numGPUs', 1000))
        cooling_type = data.get('coolingType', 'air')
        region = data.get('region', 'us-east')
        utilization = int(data.get('utilization', 90))
        depreciation = int(data.get('depreciation', 4))
        storage_capacity = int(data.get('storageCapacity', 50))
        storage_vendor = data.get('storageVendor', 'vast')
        
        # Validate inputs
        if gpu_model not in GPU_SPECS:
            return jsonify({'error': 'Invalid GPU model'}), 400
        if num_gpus < 1000 or num_gpus > 200000:
            return jsonify({'error': 'GPU count must be between 1000 and 200000'}), 400
        if region not in REGION_RATES:
            return jsonify({'error': 'Invalid region'}), 400
        
        # Get specifications
        spec = GPU_SPECS[gpu_model]
        region_rate = REGION_RATES[region]['rate']
        
        # Core calculations
        gpu_capex = spec['price'] * num_gpus
        
        # Power calculations
        pue_factor = 1.1 if cooling_type == 'liquid' else 1.5
        total_power_mw = (spec['power'] * num_gpus * pue_factor) / 1_000_000
        
        # Storage calculations
        storage_costs = calculate_storage_costs(
            storage_capacity, 
            storage_vendor,
            data.get('hotPercent', 20),
            data.get('warmPercent', 35),
            data.get('coldPercent', 35),
            data.get('archivePercent', 10)
        )
        
        # Network calculations
        network_costs = calculate_network_costs(
            num_gpus,
            data.get('fabricType', 'infiniband'),
            data.get('oversubscription', '1:1')
        )
        
        # Total CAPEX
        total_capex = (
            gpu_capex +
            storage_costs['capex'] +
            network_costs['capex'] +
            gpu_capex * 0.15  # Infrastructure
        )
        
        # Annual OPEX
        annual_power_cost = total_power_mw * 1000 * region_rate * 8760
        annual_opex = (
            annual_power_cost +
            storage_costs['opex'] +
            network_costs['opex'] +
            total_capex * 0.03  # Maintenance
        )
        
        # Cost per GPU hour
        annual_gpu_hours = num_gpus * 8760 * (utilization / 100)
        cost_per_hour = (total_capex / depreciation + annual_opex) / annual_gpu_hours
        
        # 10-year TCO
        tco_10year = total_capex + (annual_opex * 10)
        
        return jsonify({
            'success': True,
            'results': {
                'totalCapex': round(total_capex),
                'annualOpex': round(annual_opex),
                'costPerHour': round(cost_per_hour, 2),
                'totalPowerMW': round(total_power_mw, 1),
                'pueValue': pue_factor,
                'storageGbMonth': round(storage_costs['gb_month'], 4),
                'networkBandwidth': round(network_costs['bandwidth'], 1),
                'tco10year': round(tco_10year),
                'breakdown': {
                    'capex': {
                        'gpu': gpu_capex,
                        'storage': storage_costs['capex'],
                        'network': network_costs['capex'],
                        'infrastructure': gpu_capex * 0.15
                    },
                    'opex': {
                        'power': annual_power_cost,
                        'storage': storage_costs['opex'],
                        'network': network_costs['opex'],
                        'maintenance': total_capex * 0.03
                    }
                }
            }
        })
    
    except Exception as e:
        app.logger.error(f"Calculation error: {str(e)}")
        return jsonify({'error': 'Calculation failed'}), 500

def calculate_storage_costs(capacity_pb, vendor, hot_pct, warm_pct, cold_pct, archive_pct):
    """Calculate storage costs (hidden implementation)"""
    vendor_rates = STORAGE_VENDORS.get(vendor, STORAGE_VENDORS['vast'])
    
    capacity_gb = capacity_pb * 1_000_000
    
    # Calculate tier capacities
    hot_gb = capacity_gb * (hot_pct / 100)
    warm_gb = capacity_gb * (warm_pct / 100)
    cold_gb = capacity_gb * (cold_pct / 100)
    archive_gb = capacity_gb * (archive_pct / 100)
    
    # Monthly costs
    monthly_cost = (
        hot_gb * vendor_rates['hot_per_gb'] +
        warm_gb * vendor_rates['warm_per_gb'] +
        cold_gb * vendor_rates['cold_per_gb'] +
        archive_gb * vendor_rates['archive_per_gb']
    )
    
    # CAPEX (storage hardware)
    capex = capacity_gb * 0.10  # $0.10/GB hardware cost
    
    return {
        'capex': capex,
        'opex': monthly_cost * 12,  # Annual
        'gb_month': monthly_cost / capacity_gb if capacity_gb > 0 else 0
    }

def calculate_network_costs(num_gpus, fabric_type, oversubscription):
    """Calculate network costs (hidden implementation)"""
    fabric = NETWORK_COSTS.get(fabric_type, NETWORK_COSTS['infiniband'])
    
    # Parse oversubscription ratio
    ratio = 1.0
    if ':' in oversubscription:
        parts = oversubscription.split(':')
        ratio = float(parts[1]) / float(parts[0]) if float(parts[0]) > 0 else 1.0
    
    # Calculate required switches
    ports_per_switch = 64
    gpu_ports_needed = num_gpus / ratio
    num_switches = int((gpu_ports_needed / ports_per_switch) + 0.5)
    
    # Calculate costs
    switch_cost = num_switches * fabric['switch']
    cable_cost = num_gpus * fabric['cable']
    transceiver_cost = num_gpus * 2 * fabric['transceiver']  # 2 per GPU
    
    total_capex = switch_cost + cable_cost + transceiver_cost
    
    # Calculate bandwidth
    bandwidth_tbps = (num_gpus * fabric['per_gpu_bandwidth']) / 1000
    
    return {
        'capex': total_capex,
        'opex': total_capex * 0.05,  # 5% annual maintenance
        'bandwidth': bandwidth_tbps
    }

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

# User Management API Endpoints (Admin only)

@app.route('/api/users', methods=['GET'])
@require_auth
def get_users():
    """Get all users - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    # Return user list without password hashes
    users_list = []
    for username, user_data in USERS.items():
        users_list.append({
            'username': username,
            'role': user_data['role'],
            'created_at': user_data.get('created_at'),
            'expires_at': user_data.get('expires_at'),
            'last_login': user_data.get('last_login'),
            'is_active': user_data.get('is_active', True)
        })
    
    return jsonify({'users': users_list})

@app.route('/api/roles', methods=['GET'])
@require_auth
def get_roles():
    """Get available user roles - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    return jsonify({'roles': USER_ROLES}), 200

@app.route('/api/users', methods=['POST'])
@require_auth
def create_user():
    """Create a new user - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request data required'}), 400
    
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role = data.get('role', 'user').strip()
    expires_days = data.get('expires_days', 14)  # Default 2 weeks
    
    # Validation
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    if username in USERS:
        return jsonify({'error': 'Username already exists'}), 400
    
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    if role not in USER_ROLES:
        valid_roles = ', '.join(USER_ROLES.keys())
        return jsonify({'error': f'Invalid role. Must be one of: {valid_roles}'}), 400
    
    # Calculate expiry date (admin users don't expire)
    expires_at = None
    if role != 'admin' and expires_days > 0:
        expires_at = (datetime.now(timezone.utc) + timedelta(days=expires_days)).isoformat()
    
    # Create user
    USERS[username] = {
        'password_hash': hashlib.sha256(password.encode()).hexdigest(),
        'role': role,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'expires_at': expires_at,
        'last_login': None,
        'is_active': True
    }
    
    # Log the action
    client_ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', 'Unknown')
    log_user_activity(client_ip, request.user['username'], 'user_management', 
                     f'Created user: {username} (role: {role})', user_agent)
    
    return jsonify({
        'message': 'User created successfully',
        'username': username,
        'role': role,
        'expires_at': expires_at
    })

@app.route('/api/users/<username>', methods=['PUT'])
@require_auth
def update_user(username):
    """Update user - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    if username not in USERS:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request data required'}), 400
    
    user = USERS[username]
    updated_fields = []
    
    # Update role
    if 'role' in data:
        new_role = data['role'].strip()
        if new_role in ['admin', 'user']:
            user['role'] = new_role
            updated_fields.append(f'role: {new_role}')
            
            # If changing to admin, remove expiry
            if new_role == 'admin':
                user['expires_at'] = None
                updated_fields.append('removed expiry (admin user)')
    
    # Update active status
    if 'is_active' in data:
        user['is_active'] = bool(data['is_active'])
        updated_fields.append(f'active: {user["is_active"]}')
    
    # Update expiry date
    if 'expires_days' in data and user['role'] != 'admin':
        expires_days = int(data['expires_days'])
        if expires_days > 0:
            user['expires_at'] = (datetime.now(timezone.utc) + timedelta(days=expires_days)).isoformat()
            updated_fields.append(f'expires in {expires_days} days')
        else:
            user['expires_at'] = None
            updated_fields.append('removed expiry')
    
    # Log the action
    client_ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', 'Unknown')
    log_user_activity(client_ip, request.user['username'], 'user_management', 
                     f'Updated user {username}: {", ".join(updated_fields)}', user_agent)
    
    return jsonify({
        'message': 'User updated successfully',
        'updated_fields': updated_fields
    })

@app.route('/api/users/<username>/password', methods=['PUT'])
@require_auth
def reset_user_password(username):
    """Reset user password - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    if username not in USERS:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request data required'}), 400
    
    new_password = data.get('password', '').strip()
    
    if not new_password:
        return jsonify({'error': 'New password is required'}), 400
    
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    # Update password
    USERS[username]['password_hash'] = hashlib.sha256(new_password.encode()).hexdigest()
    
    # Log the action
    client_ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', 'Unknown')
    log_user_activity(client_ip, request.user['username'], 'user_management', 
                     f'Reset password for user: {username}', user_agent)
    
    return jsonify({'message': 'Password reset successfully'})

@app.route('/api/users/<username>', methods=['DELETE'])
@require_auth
def delete_user(username):
    """Delete user - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    if username not in USERS:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent deleting the super admin
    if username == 'admin':
        return jsonify({'error': 'Cannot delete super admin account'}), 403
    
    # Delete user
    del USERS[username]
    
    # Log the action
    client_ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', 'Unknown')
    log_user_activity(client_ip, request.user['username'], 'user_management', 
                     f'Deleted user: {username}', user_agent)
    
    return jsonify({'message': 'User deleted successfully'})

@app.route('/api/generate-password', methods=['POST'])
@require_auth
def generate_password():
    """Generate a Star Wars inspired password - admin only"""
    if request.user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    # Simple Star Wars password generator (server-side version)
    import random
    
    characters = ['Luke', 'Leia', 'Han', 'Yoda', 'Obi', 'Rey', 'Finn', 'Poe', 'Vader', 'Kylo']
    numbers = random.randint(10, 99)
    special_chars = ['!', '@', '#', '$', '%', '&', '*']
    
    password = f"{random.choice(characters)}{numbers}{random.choice(special_chars)}"
    
    return jsonify({'password': password})

if __name__ == '__main__':
    print("🚀 Starting GPU SuperCluster Calculator API...")
    print("🔒 Security features enabled:")
    print("   • JWT Authentication")
    print("   • Rate limiting (10 req/min)")
    print("   • Secure password hashing")
    print("   • Request validation")
    print("   • CORS protection")
    print("   • User management (admin only)")
    print("🌐 Server starting on http://0.0.0.0:7779")
    
    # For production, use gunicorn or similar
    app.run(host='0.0.0.0', port=7779, debug=False)
