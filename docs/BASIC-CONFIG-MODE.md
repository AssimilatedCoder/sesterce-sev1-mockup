# Basic Configuration Mode - User Guide

## Overview

The Basic Configuration Mode provides a streamlined, AI-powered interface for designing GPU clusters with automatic optimization. Users only need to specify three core parameters, and the system intelligently determines the optimal service tier distribution, storage configuration, and infrastructure setup.

## Key Features

### 🎯 **Simplified Input**
- **3 Input Parameters Only**: GPU count, power capacity, storage capacity
- **Interactive Sliders**: Real-time validation and feedback
- **Quick Select Buttons**: Pre-configured values for common scenarios
- **Smart Validation**: Automatic constraint checking and warnings

### 🤖 **AI-Powered Optimization**
- **Scale-Aware Algorithms**: Different strategies for small/medium/large/hyperscale clusters
- **Constraint-Based Decisions**: Considers power and storage limitations
- **Revenue Maximization**: Optimizes service mix for highest ROI
- **Infrastructure Matching**: Auto-selects networking, cooling, and GPU models

### 📊 **Comprehensive Results**
- **Service Tier Distribution**: Optimized allocation across 4 service tiers
- **Storage Performance Mix**: Automatic distribution across storage tiers
- **Financial Projections**: Revenue, TCO, ROI, and payback calculations
- **Infrastructure Recommendations**: Complete technical specifications

## How to Use

### 1. Access Basic Config Mode

1. **Navigate to**: http://localhost:2053
2. **Login** with your credentials
3. **Basic Config tab** opens by default (first tab in Configuration section)

### 2. Configure Your Cluster

#### **GPU Compute Configuration**
- **Range**: 100 - 50,000 GPUs
- **Quick Select**: 500, 1K, 5K, 10K, 25K buttons
- **Auto GPU Selection**: System recommends optimal GPU model
- **Real-time Updates**: Results update as you adjust the slider

#### **Power Capacity Configuration**
- **Range**: Minimum required - 100 MW
- **Dynamic Minimum**: Automatically calculated based on GPU count
- **Status Indicators**:
  - 🟢 **Excellent** (<60% utilization): Ample headroom for growth
  - 🟢 **Good** (60-80%): Adequate power with some headroom
  - 🟡 **Warning** (80-95%): Limited headroom, consider more power
  - 🔴 **Critical** (>95%): Insufficient power for reliable operation

#### **Storage Capacity Configuration**
- **Range**: Minimum required - 500 PB
- **Dynamic Minimum**: Based on 10TB per GPU minimum
- **Ratio Display**: Shows TB per GPU for workload assessment
- **Status Indicators**:
  - ❌ **Too low for training** (<10 TB/GPU): Insufficient for training workloads
  - ⚠️ **Limited training capacity** (10-20 TB/GPU): Basic training support
  - ✓ **Good balance** (20-50 TB/GPU): Supports mixed workloads
  - ✓ **Excellent for all workloads** (>50 TB/GPU): Optimal for any use case

### 3. Review AI-Optimized Results

#### **Service Mix Visualization**
The system automatically distributes your GPUs across four service tiers:

- **Tier 1: Bare Metal (Whales)** - $2.50/GPU-hour
  - Dedicated hardware for large customers
  - High-bandwidth, low-latency requirements
  - Minimum cluster size requirements apply

- **Tier 2: Orchestrated K8s** - $3.20/GPU-hour
  - Kubernetes-managed multi-tenant workloads
  - Balanced performance and flexibility
  - Good for enterprise customers

- **Tier 3: Managed MLOps** - $4.50/GPU-hour
  - Full-stack ML platform with automation
  - Highest margins for medium-scale deployments
  - Includes data pipelines and model management

- **Tier 4: Inference-as-a-Service** - $5.00/GPU-hour
  - API-based model serving
  - High utilization and revenue per GPU
  - Optimized for smaller, frequent requests

#### **Storage Performance Mix**
Automatic distribution across storage tiers based on workload requirements:

- **⚡ Ultra-High Performance**: NVMe for whale customer checkpoints
- **🚀 High Performance (VAST)**: Active training datasets
- **💾 Medium Performance (SSD)**: Model serving and warm data
- **📦 Capacity Tier (HDD)**: Archives and cold data
- **☁️ Object Storage (S3)**: MLOps artifacts and backups

#### **Infrastructure Recommendations**
- **GPU Model**: Auto-selected based on scale and power constraints
- **Network Fabric**: Optimized for service mix (InfiniBand/Ethernet)
- **Cooling Solution**: Based on power density (Air/Hybrid/Liquid)
- **Rack Configuration**: Total infrastructure footprint

#### **Financial Metrics**
- **Projected Annual Revenue**: Based on service mix and utilization
- **5-Year TCO**: Total cost of ownership including CapEx and OpEx
- **ROI**: Return on investment percentage
- **Payback Period**: Months to break even on initial investment

### 4. Understanding the Optimization

The **"Why This Configuration?"** section explains the reasoning behind each decision:

- **Scale-based decisions**: How cluster size affects service tier allocation
- **Constraint impacts**: How power/storage limitations influence the design
- **Revenue optimization**: Why certain service mixes maximize profitability
- **Technical requirements**: Infrastructure choices based on workload demands

### 5. Switch to Advanced Mode

When you need more control:

1. **Click "Switch to Advanced Configuration"** at the bottom
2. **All optimized values are automatically populated** in Advanced mode
3. **Fine-tune any parameter** as needed
4. **Original Basic inputs are preserved** for reference

## Optimization Algorithms

### Scale Classification

The system categorizes clusters into four scales, each with different optimization strategies:

#### **Small Scale** (<500 GPUs)
- **Focus**: Maximize revenue per GPU
- **Service Mix**: Heavy emphasis on MLOps (45%) and Inference (40%)
- **Whale Customers**: Not supported (insufficient scale)
- **Infrastructure**: Cost-optimized, Ethernet networking

#### **Medium Scale** (500-2,000 GPUs)
- **Focus**: Managed services sweet spot
- **Service Mix**: MLOps platform primary focus (50%)
- **Whale Customers**: Not supported
- **Infrastructure**: Balanced performance and cost

#### **Large Scale** (2,000-10,000 GPUs)
- **Focus**: Enterprise customers with some whale capacity
- **Service Mix**: Strong MLOps (40%) with limited whale support (10%)
- **Whale Customers**: Limited capacity for smaller whales
- **Infrastructure**: High-performance networking, hybrid cooling

#### **Hyperscale** (10,000+ GPUs)
- **Focus**: Full service spectrum including large whales
- **Service Mix**: Balanced across all tiers with whale support (30%)
- **Whale Customers**: Full support for largest customers
- **Infrastructure**: Premium everything - InfiniBand, liquid cooling

### Constraint Handling

#### **Power Constraints**
When power is limited (>80% utilization):
- **Shift to efficiency**: More MLOps and Inference services
- **Reduce whale allocation**: Lower power-intensive workloads
- **GPU model adjustment**: Select lower-power alternatives
- **Cooling optimization**: More efficient cooling solutions

#### **Storage Constraints**
When storage ratio is low (<20 TB/GPU):
- **Favor inference workloads**: Less storage-intensive
- **Reduce training allocation**: Minimize data-heavy workloads
- **Optimize storage tiers**: More capacity-focused distribution
- **Adjust service mix**: Higher inference service percentage

### Financial Modeling

#### **Revenue Calculation**
- **Utilization**: 70% average across all tiers
- **Pricing**: Tier-based hourly rates
- **Seasonal Adjustments**: Built into utilization assumptions
- **Growth Projections**: Conservative 5-year outlook

#### **Cost Components**
- **CapEx**: GPU hardware, networking, storage, facility
- **OpEx**: Power, staff, maintenance (5% of CapEx annually)
- **Depreciation**: 4-year schedule for compute hardware
- **Scaling Factors**: Economies of scale for larger deployments

## Best Practices

### **For Quick Sizing**
1. Start with expected customer demand for GPU count
2. Set power to standard datacenter capacity (15-30 MW typical)
3. Use 25-50 TB per GPU for balanced workloads
4. Review optimization reasoning before proceeding
5. Switch to Advanced mode only if fine-tuning is needed

### **For Business Case Development**
1. Create multiple Basic configs with different scales
2. Compare TCO/ROI across scenarios
3. Use financial metrics for investment decisions
4. Export configurations for stakeholder review

### **For Technical Planning**
1. Use infrastructure recommendations as starting point
2. Validate power and cooling requirements with facilities team
3. Review networking recommendations with infrastructure team
4. Consider storage tier distribution for procurement planning

## Troubleshooting

### **Common Issues**

#### **Sliders Not Responding**
- **Cause**: Browser cache or JavaScript errors
- **Solution**: Clear cache and refresh page

#### **Unrealistic Results**
- **Cause**: Extreme input values outside normal ranges
- **Solution**: Use Quick Select buttons for realistic starting points

#### **Advanced Mode Not Populating**
- **Cause**: Missing permissions or configuration errors
- **Solution**: Ensure admin/power user access level

#### **Financial Metrics Seem Wrong**
- **Cause**: Unusual constraint combinations
- **Solution**: Review "Why This Configuration?" explanations

### **Getting Help**

1. **Check the optimization reasoning** for explanation of decisions
2. **Use Advanced mode** for more detailed control
3. **Review logs** in browser developer console
4. **Contact system administrator** for access issues

## Technical Implementation

### **Architecture**
- **Frontend**: React with TypeScript
- **Optimization Engine**: Custom algorithms in `clusterOptimizer.ts`
- **State Management**: React hooks with real-time updates
- **Validation**: Client-side constraint checking
- **Integration**: Seamless handoff to Advanced mode

### **Performance**
- **Real-time Calculations**: Sub-second response times
- **Memoization**: Efficient re-calculation only when inputs change
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: Full keyboard navigation and screen reader support

### **Data Flow**
1. **User Input**: Slider adjustments trigger validation
2. **Constraint Analysis**: Power/storage/scale assessment
3. **Optimization**: AI algorithms determine optimal configuration
4. **Results Display**: Real-time updates with animations
5. **Advanced Handoff**: Populated configuration transfer

## Future Enhancements

### **Planned Features**
- **Configuration Templates**: Save and load common configurations
- **Comparison Mode**: Side-by-side scenario analysis
- **Export Functionality**: PDF reports and spreadsheet export
- **Historical Tracking**: Configuration version management
- **Advanced Constraints**: Custom business rules and requirements

### **Integration Opportunities**
- **Procurement Systems**: Direct integration with vendor catalogs
- **Monitoring Platforms**: Real-time performance validation
- **Financial Systems**: Automated TCO tracking and reporting
- **Capacity Planning**: Integration with demand forecasting tools

---

*This documentation covers the complete Basic Configuration Mode functionality. For Advanced mode features, see the Advanced Configuration Guide.*
