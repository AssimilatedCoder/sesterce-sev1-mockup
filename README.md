# Sesterce GPU SuperCluster Calculator

A production-grade calculator for designing, costing, and monetizing large-scale GPU clusters (10,000–200,000 GPUs) based on NVIDIA GB200/GB300 NVL72 systems. Features sophisticated networking algorithms, dynamic service tier pricing, and comprehensive TCO analysis with transparent calculation logic.

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (React/TypeScript)"
        UI[User Interface]
        State[State Management]
        Calc[Client Calculations]
    end
    
    subgraph "Backend (Flask/Python)"
        Auth[JWT Authentication]
        API[Secure API Endpoints]
        Logic[Server-side Logic]
    end
    
    subgraph "Infrastructure"
        Nginx[Nginx Reverse Proxy]
        SSL[Security Headers]
    end
    
    UI --> State
    State --> Calc
    Calc --> API
    API --> Auth
    Auth --> Logic
    Nginx --> UI
    Nginx --> API
    SSL --> Nginx
```

## 🧮 Core Calculation Engine

### End-to-End Calculation Flow

```mermaid
flowchart TD
    A[User Inputs] --> B{GPU Model Selection}
    B --> C[System Sizing Algorithm]
    C --> D[Power & Cooling Calculations]
    C --> E[Network Architecture Selection]
    E --> F[Switch & Cable Sizing]
    F --> G[DPU Requirements]
    C --> H[Storage Network Sizing]
    D --> I[OPEX Calculations]
    F --> J[Network CAPEX]
    G --> J
    H --> K[Storage CAPEX/OPEX]
    I --> L[Total TCO]
    J --> L
    K --> L
    L --> M[$/GPU-hour Baseline]
    M --> N[Service Tier Pricing]
    N --> O[Revenue & ROI Analysis]
    
    style A fill:#e1f5fe
    style L fill:#f3e5f5
    style O fill:#e8f5e8
```

### System Sizing Logic

```mermaid
flowchart LR
    subgraph "Input Processing"
        A[Requested GPUs] --> B{GPU Model?}
        B -->|GB200/GB300| C[72 GPUs/Rack]
        B -->|H100 SXM| D[8 GPUs/System]
        B -->|H100 PCIe| E[8 GPUs/System]
    end
    
    subgraph "Sizing Calculation"
        C --> F[Systems = ceil(GPUs/72)]
        D --> G[Systems = ceil(GPUs/8)]
        E --> G
        F --> H[Actual GPUs = Systems × 72]
        G --> I[Actual GPUs = Systems × 8]
    end
    
    subgraph "Power Calculation"
        H --> J[GB Power: 120kW/rack]
        I --> K[H100 Power: 6.5kW/system]
        J --> L[Total IT Load]
        K --> L
        L --> M[PUE Application]
        M --> N[Total Facility Power]
    end
```

## 🌐 Networking Architecture Algorithm

### Architecture Selection by Scale

```mermaid
flowchart TD
    A[GPU Count Input] --> B{Scale Analysis}
    B -->|≤ 2,000 GPUs| C[2-Tier Leaf-Spine]
    B -->|2,001-10,000 GPUs| D[3-Tier with Pods]
    B -->|> 10,000 GPUs| E[3-Tier Multi-Pod + Core]
    
    C --> F[Simple Leaf-Spine Fabric]
    D --> G[Pod-based Architecture]
    E --> H[Core-Spine-Leaf Hierarchy]
    
    F --> I[Leaf Switches: ceil(Racks/2)]
    F --> J[Spine Switches: max(6, leafCount/4)]
    
    G --> K[Pods: ceil(GPUs/1008)]
    K --> L[Leaf per Pod: ceil(1008/64)]
    L --> M[Spine per Pod: max(6, leafs×9/128)]
    
    H --> N[Core Groups: ceil(Pods/6)]
    N --> O[Core Switches: Groups×12]
    O --> P[Pod Interconnect Matrix]
```

### Detailed Network Component Sizing

```mermaid
graph TB
    subgraph "Pod Architecture (1,008 GPUs)"
        A[14 Racks × 72 GPUs] --> B[28 Leaf Switches]
        B --> C[Dual-homed ToR]
        C --> D[Rails per GPU: 9]
        D --> E[Spine Requirement]
        E --> F[16 Spine Switches]
        F --> G[N+2 Redundancy]
    end
    
    subgraph "Switch Specifications"
        H[Spectrum-4 400G: 128 ports]
        I[Spectrum-4 800G: 64 ports]
        J[Quantum-3 800G: 144 ports]
    end
    
    subgraph "Cable Calculations"
        K[Intra-Pod: Leaf×Rails×GPUs/Leaf]
        L[Inter-Pod: Core×Spine×Pods]
        M[Total Cables = Intra + Inter]
    end
    
    B --> H
    F --> I
    F --> J
    E --> K
    O --> L
```

### Storage Network Sizing Algorithm

```mermaid
flowchart LR
    subgraph "Training Storage (VAST/WEKA)"
        A[GPUs] --> B[Bandwidth = GPUs/1000 × 1.6 Tbps]
        B --> C[400G Ports = ceil(Bandwidth×1000/400)]
        C --> D[64×400G Switches = ceil(Bandwidth/25.6)]
    end
    
    subgraph "Object Storage (Ceph)"
        E[GPUs] --> F[100G Ports = GPUs/10]
        F --> G[32×100G Switches = ceil(GPUs/320)]
    end
    
    subgraph "Network Integration"
        D --> H[Training Network Fabric]
        G --> I[Object Storage Fabric]
        H --> J[Converged Data Center]
        I --> J
    end
```

## 💰 Service Tier Pricing Model

### Service Tier Distribution Logic

```mermaid
flowchart TD
    A[Default Distribution<br/>T1:30% T2:35% T3:25% T4:10%] --> B{User Adjusts Slider}
    B --> C[Track Touched Sliders]
    C --> D{First Adjustment?}
    D -->|Yes| E[Redistribute Equally<br/>Across 3 Untouched]
    D -->|No| F{Second Adjustment?}
    F -->|Yes| G[Redistribute Equally<br/>Across 2 Untouched]
    F -->|No| H[Proportional Adjustment<br/>Among Remaining Untouched]
    
    E --> I[Validate Total = 100%]
    G --> I
    H --> I
    I --> J{All Sliders Touched?}
    J -->|No| K[Continue Progressive Logic]
    J -->|Yes| L[Equal Distribution Among Others]
    
    style A fill:#e3f2fd
    style I fill:#fff3e0
    style L fill:#f1f8e9
```

### Revenue Calculation Flow

```mermaid
graph LR
    subgraph "Base Cost Calculation"
        A[Total CAPEX] --> B[Annual Depreciation]
        C[Annual OPEX] --> D[Total Annual Cost]
        B --> D
        D --> E[Effective GPU Hours]
        E --> F[Base $/GPU-hour]
    end
    
    subgraph "Tier Pricing"
        F --> G[Tier 1: 1.0× Multiplier]
        F --> H[Tier 2: 1.45× Multiplier]
        F --> I[Tier 3: 2.2× Multiplier]
        F --> J[Tier 4: 3.0× Multiplier]
    end
    
    subgraph "Revenue Calculation"
        G --> K[T1 Revenue = Rate × GPUs × % × Hours]
        H --> L[T2 Revenue = Rate × GPUs × % × Hours]
        I --> M[T3 Revenue = Rate × GPUs × % × Hours]
        J --> N[T4 Revenue = Rate × GPUs × % × Hours]
        K --> O[Total Annual Revenue]
        L --> O
        M --> O
        N --> O
    end
```

## 🛠️ Quick Start

### Local Development
```bash
# Frontend
cd sesterce-dashboard
npm install
npm start

# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python calculator-api.py
```

### Production Deployment
```bash
# Automated setup
./deploy-secure.sh

# Manual nginx setup
./start-nginx.sh

# Access at http://localhost:3025
```

### Authentication
- **Admin**: `admin` / `Vader@66`
- **Users**: `Youssef` / `Y0da!777`, `Maciej` / `H0th#88!`

---

**© 2025 Sesterce. All rights reserved.**
