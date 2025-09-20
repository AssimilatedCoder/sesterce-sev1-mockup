#!/usr/bin/env python3
"""
GPU SuperCluster Calculator API
Secure backend service for TCO calculations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import time
import os

app = Flask(__name__)

# Configure CORS for your domain only
CORS(app, origins=['http://localhost:3025', 'https://yourdomain.com'])

# Secret key for API validation (change this!)
API_SECRET = os.environ.get('CALCULATOR_API_SECRET', 'change-this-secret-key')

# Rate limiting (simple implementation)
request_times = {}
RATE_LIMIT = 10  # requests per minute

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

if __name__ == '__main__':
    # For production, use gunicorn or similar
    app.run(host='127.0.0.1', port=7778, debug=False)
