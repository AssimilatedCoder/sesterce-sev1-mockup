# GPU SuperCluster Calculator v5.0 Source Files

This archive contains all the source files for the GPU SuperCluster Calculator component.

## File Structure

### Main Calculator Components
- **GPUSuperclusterCalculator.tsx** - Main calculator component with all business logic, formulas, and UI (v4.0)
- **GPUSuperclusterCalculatorV5.tsx** - Latest v5.0 with comprehensive tab system
- **GPUSuperclusterCalculatorSecure.tsx** - Secure version that calls backend API (no client-side logic)
- **calculator-api.py** - Python Flask API containing all calculation logic (server-side)

### Calculator Tab Components (v5.0)
- **tabs/CalculatorTab.tsx** - Main calculator interface with all configuration options
- **tabs/NetworkingTab.tsx** - Network architecture analysis and topology
- **tabs/StorageTab.tsx** - Storage tier analysis and performance requirements
- **tabs/CoolingPowerTab.tsx** - Power and cooling infrastructure requirements
- **tabs/FormulasTab.tsx** - Complete calculation methodology and formulas
- **tabs/ReferencesTab.tsx** - Technical documentation and industry references

### Legacy Tab Components (v4.0)
- **calculator-tabs/StorageConfiguration.tsx** - Storage configuration UI component
- **calculator-tabs/NetworkingConfiguration.tsx** - Networking configuration UI component
- **calculator-tabs/AdvancedOptions.tsx** - Advanced options UI component
- **calculator-tabs/GPUSpecifications.tsx** - GPU specifications tab (placeholder)
- **calculator-tabs/StorageAnalysis.tsx** - Storage analysis tab (placeholder)

### Data and Utilities
- **data/gpuSpecs.ts** - GPU specifications database
- **utils/formatters.ts** - Number and unit formatting utilities

### Integration Files
- **App.tsx** - Main React app showing how calculator is integrated
- **TabNavigation.tsx** - Tab navigation component used in the app

## Key Technologies Used
- React with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Flask (Python) for backend API
- Chart.js (referenced but not included in calculator)

## Important Notes
1. The main calculation logic is in `GPUSuperclusterCalculatorV5.tsx`
2. For production use, implement `GPUSuperclusterCalculatorSecure.tsx` with `calculator-api.py`
3. All GPU pricing, power consumption, and cost formulas are contained in these files
4. The calculator includes comprehensive TCO (Total Cost of Ownership) calculations
5. v5.0 includes detailed references to GB200/GB300 infrastructure requirements

## Calculation Features
- GPU models: GB200 (120kW), GB300 (140kW), H100-SXM, H100-PCIe
- Mandatory liquid cooling for GB200/GB300
- Storage tiers: Hot (20%), Warm (35%), Cold (35%), Archive (10%)
- Network fabrics: InfiniBand, Ethernet with BlueField DPU support
- Regional pricing variations with PUE adjustments
- Power/cooling calculations with facility requirements
- 10-year TCO projections with depreciation models
- CAPEX/OPEX breakdowns with detailed cost analysis
- Infrastructure sizing (CDUs, switches, power distribution)
- Real-world deployment references (xAI Colossus, Meta)

## Reference Documentation Used

### NVIDIA Official Documentation
- **RA-11338-001**: NVIDIA DGX SuperPOD GB200 Reference Architecture
- **RA-11337-001**: NVIDIA DGX SuperPOD B300 Reference Architecture
- **RA-11339-001**: NVIDIA SuperPOD B300 XDR Reference Architecture
- **RA-11334-001**: NVIDIA DGX SuperPOD B200 Reference Architecture
- **RA-11336-001**: NVIDIA DGX SuperPOD H200 Reference Architecture
- NVIDIA Mission Control Software with GB200 NVL72 Systems Administration Guide
- NVIDIA BlueField-3 DPU Controller User Manual

### Storage Partner Documentation
- **DDN**: A3I Solutions for NVIDIA Cloud Partners & DGX SuperPOD Reference Architecture
- **NetApp**: AFF A90 Storage Systems with NVIDIA DGX SuperPOD Design Guide (NVA-1175)
- **IBM**: Storage Scale System 6000 with NVIDIA DGX SuperPOD Deployment Guide (IBM Redbooks)
- **VAST Data**: NVIDIA NCP White Paper 2025 & DGX SuperPOD VAST Reference Architecture (RA-11389-001)
- **Pure Storage**: FlashBlade NVIDIA DGX SuperPOD Deployment Guide

### Research Papers
- NVIDIA GB200 and GB300 Infrastructure Demands: Unprecedented Scale and Liquid Cooling Requirements for Next-Generation AI Deployments

All calculations and recommendations are based on these official reference architectures and validated deployment patterns.
