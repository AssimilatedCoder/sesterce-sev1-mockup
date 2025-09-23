# Sesterce GPU SuperCluster Calculator

A production-grade calculator for designing, costing, and monetizing large-scale GPU clusters (10,000–200,000 GPUs) based on NVIDIA GB200/GB300 NVL72 systems. Features sophisticated networking algorithms, dynamic service tier pricing, and comprehensive TCO analysis.

## 🧮 Complete Calculation Breakdown

### **CAPEX Categories**
```
Hardware CAPEX:
├── GPU Systems
│   ├── GB200 NVL72: $3,000,000 per rack (72 GPUs)
│   ├── GB300 NVL72: $3,500,000 per rack (72 GPUs)
│   ├── H100 SXM: $400,000 per system (8 GPUs)
│   └── H100 PCIe: $320,000 per system (8 GPUs)
│
├── Networking Equipment
│   ├── Leaf Switches: $95,000-$180,000 each
│   ├── Spine Switches: $120,000-$180,000 each
│   ├── Core Switches: $180,000-$250,000 each
│   ├── Cables & Transceivers: $400-$900 each
│   └── DPUs (BlueField-3): $2,500 each
│
├── Storage Infrastructure
│   ├── VAST Universal: $8-12 per TB/month
│   ├── WEKA Data Platform: $6-10 per TB/month
│   ├── Pure FlashBlade: $4-8 per TB/month
│   └── Ceph (DIY): $2-4 per TB/month
│
├── Power & Cooling Infrastructure
│   ├── UPS Systems: $150-200 per kW
│   ├── PDUs: $50-100 per kW
│   ├── Cooling (Liquid): $300-500 per kW
│   └── Facility Build-out: $1,000-2,000 per kW
│
└── Software Stack (Upfront)
    ├── Operating System: $0-5,000 per node
    ├── Container Platform: $0-15,000 per node
    ├── ML/AI Frameworks: $0-25,000 per node
    └── Management Tools: $5,000-50,000 per node
```

### **OPEX Categories (Annual)**
```
Operational Expenses:
├── Power & Energy
│   ├── Electricity: $0.05-0.25 per kWh (region dependent)
│   ├── PUE Multiplier: 1.05-1.50 (climate dependent)
│   └── Total Power Cost: MW × 8760 hours × rate × PUE
│
├── Cooling & Facilities
│   ├── Cooling OPEX: 15-25% of power cost
│   ├── Facility Maintenance: 2-5% of facility CAPEX
│   └── Insurance: 0.5-1% of total CAPEX
│
├── Staffing Costs
│   ├── Site Reliability Engineers: $150,000-250,000 each
│   ├── Network Engineers: $120,000-200,000 each
│   ├── Storage Engineers: $110,000-180,000 each
│   ├── Security Engineers: $140,000-220,000 each
│   ├── Data Center Technicians: $60,000-100,000 each
│   └── Management Overhead: 20-30% of staff costs
│
├── Software Licensing (Annual)
│   ├── Operating System: $500-3,000 per node/year
│   ├── Container Platform: $1,000-8,000 per node/year
│   ├── Monitoring/Observability: $2,000-10,000 per node/year
│   ├── Security Software: $1,500-5,000 per node/year
│   └── ML/AI Platform Licenses: $5,000-25,000 per node/year
│
├── Network & Connectivity
│   ├── Internet Transit: $0.50-2.00 per Mbps/month
│   ├── Private Peering: $500-2,000 per port/month
│   ├── Cross-connects: $200-500 per connection/month
│   └── CDN Services: $0.02-0.10 per GB transferred
│
├── Storage OPEX
│   ├── VAST/WEKA Support: 15-25% of license cost
│   ├── Backup Services: $0.01-0.05 per GB/month
│   ├── Archive Storage: $0.001-0.01 per GB/month
│   └── Data Transfer: $0.02-0.10 per GB
│
└── Maintenance & Support
    ├── Hardware Maintenance: 8-15% of hardware CAPEX
    ├── Software Support: 15-25% of software CAPEX
    ├── Vendor Support Contracts: $50,000-200,000/year
    └── Spare Parts Inventory: 5-10% of hardware CAPEX
```

## 🌐 Networking Architecture Scaling

### **Architecture Selection Logic**
```
GPU Count → Architecture Decision:

≤ 2,000 GPUs: 2-Tier Leaf-Spine
├── Leaf Switches: ceil(Racks/2) 
├── Spine Switches: max(6, leafCount/4)
└── Simple fabric, single failure domain

2,001-10,000 GPUs: 3-Tier with Pods  
├── Pods: ceil(GPUs/1008)
├── Leaf per Pod: ceil(1008/64) = 16
├── Spine per Pod: max(6, 16×9/128) = 6
└── Pod isolation, manageable scale

> 10,000 GPUs: 3-Tier Multi-Pod with Core
├── Core Groups: ceil(Pods/6) 
├── Core Switches: Groups×12
├── Pod Interconnect: Full mesh via core
└── Massive scale, hierarchical design
```

### **Switch Count Calculations**
```
Per Pod (1,008 GPUs):
├── Racks: 14 (72 GPUs each)
├── Leaf Switches: 28 (2 per rack, dual-homed)
├── Spine Switches: max(6, ceil(28 × 9 rails / 128 ports)) = 16
└── Redundancy: N+2 minimum for maintenance

Cable Requirements:
├── Intra-Pod: 28 leafs × 9 rails × 16 GPUs/leaf = 4,032 cables
├── Inter-Pod: 16 spines × 64 ports × 4 pods = 4,096 cables  
└── Total: ~8,000+ cables per 4,000 GPU deployment

Switch Specifications:
├── Spectrum-4 400G: 128 ports, $95,000
├── Spectrum-4 800G: 64 ports, $120,000
└── Quantum-3 800G: 144 ports, $180,000
```

## 💰 Service Tier Pricing Model

### **Tier Structure & Multipliers**
```
Service Tiers (Default Distribution):

Tier 1: Bare Metal GPU Access (30%)
├── Base Multiplier: 1.0×
├── Target: Advanced ML teams
├── Features: Direct GPU access, SLURM/PBS
└── SLA: 99.5%

Tier 2: Orchestrated Kubernetes (35%)  
├── Base Multiplier: 1.45×
├── Target: Enterprise data science
├── Features: Managed K8s, GPU operators
└── SLA: 99.9%

Tier 3: Managed MLOps Platform (25%)
├── Base Multiplier: 2.2×
├── Target: Turnkey AI/ML users
├── Features: MLflow, AutoML, model registry
└── SLA: 99.95%

Tier 4: Inference-as-a-Service (10%)
├── Base Multiplier: 3.0×
├── Target: Production AI applications
├── Features: Auto-scaling, <50ms latency
└── SLA: 99.99%
```

### **Premium Service Modifiers**
```
Storage Performance:
├── Extreme (All-NVMe): +0.25× multiplier
├── High Performance: +0.15× multiplier  
├── Balanced: +0.08× multiplier
└── Cost Optimized: +0.02× multiplier

Compliance Certifications:
├── HIPAA Healthcare: +0.15× multiplier
├── FedRAMP Authorized: +0.25× multiplier
├── SecNumCloud: +0.30× multiplier
└── Air-gapped: +0.50× multiplier

Sustainability:
├── 100% Renewable: +0.10× multiplier
├── Carbon Neutral: +0.15× multiplier
└── Net Zero: +0.20× multiplier
```

### **Revenue Calculation Formula**
```
Base Cost Calculation:
├── Annual Depreciation = Total CAPEX ÷ Depreciation Years
├── Total Annual Cost = Annual Depreciation + Annual OPEX
├── Effective GPU Hours = Actual GPUs × 8760 × Utilization%
└── Base $/GPU-hour = Total Annual Cost ÷ Effective GPU Hours

Per-Tier Revenue:
├── Effective Rate = Base Cost × (Base Multiplier + Modifiers)
├── Tier Revenue = Rate × GPUs × Tier% × 8760 × Utilization
└── Total Revenue = Sum of all tier revenues

Blended Rate = Σ(Tier Rate × Tier Percentage)
```

## 🔧 Storage Network Sizing

### **Training Storage (VAST/WEKA)**
```
Bandwidth Calculation:
├── Rule: 1.6 Tbps per 1,000 GPUs minimum
├── 10,000 GPUs = 16 Tbps required
├── 400G ports needed = ceil(16,000 ÷ 400) = 40 ports
└── 64×400G switches = ceil(16 ÷ 25.6) = 1 switch

Port Distribution:
├── Frontend connections: 40 ports
├── Backend storage: 20 ports  
├── Redundancy: 2× (80 total ports)
└── Switch requirement: 2× 64-port switches
```

### **Object Storage (Ceph)**
```
Bandwidth Calculation:
├── Rule: 100G ports = GPUs ÷ 10
├── 10,000 GPUs = 1,000 × 100G ports
├── 32×100G switches = ceil(1,000 ÷ 32) = 32 switches
└── Total fabric: 32 switches, 1,000 ports
```

## 📊 Key Formulas

### **System Sizing**
- `systems_needed = ceil(requested_gpus / gpus_per_system)`
- `actual_gpus = systems_needed × gpus_per_system`
- `total_power_kw = systems_needed × power_per_system`

### **Network Scaling**  
- `pods = ceil(actual_gpus / gpus_per_pod)`
- `leaf_switches = pods × ceil(gpus_per_pod / gpus_per_leaf)`
- `spine_switches = max(6, ceil(leaf_switches × rails_per_gpu / spine_ports))`

### **TCO Calculation**
- `annual_depreciation = total_capex / depreciation_years`
- `gpu_hour_cost = (annual_depreciation + annual_opex) / (gpus × 8760 × utilization)`
- `blended_rate = Σ(tier_rate × tier_percentage)`

## 🚀 Deployment

### **Production (Nginx + Flask)**
```bash
./deploy-secure.sh              # Automated deployment
./start-nginx.sh                # Manual start
# Access: http://localhost:3025
```

### **Development**
```bash
cd sesterce-dashboard && npm start    # Frontend: port 3000
python calculator-api.py              # Backend: port 7779
```

## 🔑 Authentication
- Contact system administrator for login credentials
- JWT-based authentication with role-based access control

---

**© 2025 Sesterce Engineering. All rights reserved.**
