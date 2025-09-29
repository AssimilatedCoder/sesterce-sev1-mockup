interface GPUSpec {
  name: string;
  powerPerGPU: number;
  memoryPerGPU: number;
  unitPrice: number;
  rackSize: number;
  rackPower: number; // Total rack power in watts
  coolingOptions: string[];
  pue: Record<string, number>;
  reference: string;
  // New fields for multi-vendor support
  vendor: 'nvidia' | 'amd';
  architecture: string;
  interconnect: 'nvlink' | 'pcie' | 'infinity-fabric' | 'upi';
  networkingRecommendation: 'infiniband' | 'ethernet' | 'roce' | 'cxi';
  multiTenantOptimal: boolean;
  warnings?: string[];
}

export const gpuSpecs: Record<string, GPUSpec> = {
  'gb200': {
    name: 'GB200 NVL72',
    powerPerGPU: 1542, // (126kW - 10.8kW Grace - 3.6kW NVLink - 0.6kW DPU) ÷ 72 GPUs = 1542W per GPU
    memoryPerGPU: 188, // 13.5TB / 72 GPUs ≈ 188GB per GPU (from design doc)
    unitPrice: 65000,
    rackSize: 72,
    rackPower: 126000, // 126kW average (120-132kW range from design doc)
    coolingOptions: ['liquid'],
    pue: { liquid: 1.09 },
    reference: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/',
    vendor: 'nvidia',
    architecture: 'Blackwell',
    interconnect: 'nvlink',
    networkingRecommendation: 'infiniband',
    multiTenantOptimal: true
  },
  'gb300': {
    name: 'GB300 NVL72',
    powerPerGPU: 1715, // (137.5kW - 12.6kW Grace - 4.5kW NVLink - 0.6kW DPU) ÷ 72 GPUs = 1715W per GPU
    memoryPerGPU: 288, // 20.7TB / 72 GPUs ≈ 288GB per GPU (from design doc)
    unitPrice: 85000,
    rackSize: 72,
    rackPower: 141200, // 141.2kW calculated (123.5kW GPU + 12.6kW Grace + 4.5kW NVLink + 0.6kW DPU)
    coolingOptions: ['liquid'],
    pue: { liquid: 1.08 },
    reference: 'https://www.nvidia.com/en-us/data-center/gb300-nvl72/',
    vendor: 'nvidia',
    architecture: 'Blackwell',
    interconnect: 'nvlink',
    networkingRecommendation: 'infiniband',
    multiTenantOptimal: true
  },
  'h100-sxm': {
    name: 'H100 SXM5',
    powerPerGPU: 700,
    memoryPerGPU: 80,
    unitPrice: 28000,
    rackSize: 8, // DGX H100 systems have 8 GPUs
    rackPower: 10400, // ~10.4kW per DGX H100 system
    coolingOptions: ['air', 'liquid'],
    pue: { air: 1.4, liquid: 1.1 },
    reference: 'https://www.nvidia.com/en-us/data-center/h100/',
    vendor: 'nvidia',
    architecture: 'Hopper',
    interconnect: 'nvlink',
    networkingRecommendation: 'infiniband',
    multiTenantOptimal: true
  },
  'h100-pcie': {
    name: 'H100 PCIe',
    powerPerGPU: 350,
    memoryPerGPU: 80,
    unitPrice: 22000,
    rackSize: 8, // Typical server configuration
    rackPower: 5600, // ~5.6kW for 8x PCIe cards + server
    coolingOptions: ['air'],
    pue: { air: 1.5 },
    reference: 'https://www.nvidia.com/en-us/data-center/h100/',
    vendor: 'nvidia',
    architecture: 'Hopper',
    interconnect: 'pcie',
    networkingRecommendation: 'ethernet',
    multiTenantOptimal: true
  },
  // New: NVIDIA H200 family
  'h200-sxm': {
    name: 'H200 SXM',
    powerPerGPU: 700, // SXM configurable up to ~700W
    memoryPerGPU: 141, // 141 GB HBM3e
    unitPrice: 33000, // market estimate 33-35k
    rackSize: 8, // OEM nodes with 8x SXM GPUs
    rackPower: 11000, // ~11kW per 8x SXM node (vendor TDP + platform overhead)
    coolingOptions: ['air', 'liquid'],
    pue: { air: 1.4, liquid: 1.1 },
    reference: 'https://www.nvidia.com/en-us/data-center/h200/',
    vendor: 'nvidia',
    architecture: 'Hopper',
    interconnect: 'nvlink',
    networkingRecommendation: 'infiniband',
    multiTenantOptimal: true
  },
  'h200-pcie': {
    name: 'H200 PCIe',
    powerPerGPU: 600, // PCIe variant lower than SXM
    memoryPerGPU: 141,
    unitPrice: 30000,
    rackSize: 8, // common 8x PCIe server
    rackPower: 8000, // ~8kW node incl. CPUs/IO
    coolingOptions: ['air'],
    pue: { air: 1.5 },
    reference: 'https://www.nvidia.com/en-us/data-center/h200/',
    vendor: 'nvidia',
    architecture: 'Hopper',
    interconnect: 'pcie',
    networkingRecommendation: 'ethernet',
    multiTenantOptimal: true
  },
  
  // NVIDIA RTX 6000 Blackwell (Professional/Multi-tenant)
  'rtx6000-blackwell': {
    name: 'RTX 6000 Blackwell',
    powerPerGPU: 300, // Professional card, lower TDP
    memoryPerGPU: 48, // 48GB GDDR6X
    unitPrice: 8000, // Professional pricing
    rackSize: 4, // 4x GPUs per 2U server (multi-tenant optimal)
    rackPower: 2800, // ~2.8kW for 4x RTX6000 + server
    coolingOptions: ['air'],
    pue: { air: 1.3 },
    reference: '/assets/NVIDIA RTX 6000 blackwell Generation - Complete Technical Pack.pdf',
    vendor: 'nvidia',
    architecture: 'Blackwell',
    interconnect: 'pcie',
    networkingRecommendation: 'ethernet',
    multiTenantOptimal: true,
    warnings: ['No NVLink - limited multi-GPU scaling', 'Optimized for multi-tenant workloads', 'Professional driver stack']
  },

  // AMD MI355X (Instinct Platform)
  'mi355x': {
    name: 'AMD MI355X',
    powerPerGPU: 750, // High-performance AI accelerator
    memoryPerGPU: 192, // 192GB HBM3e
    unitPrice: 45000, // Enterprise AI pricing
    rackSize: 8, // 8x GPUs per server
    rackPower: 12000, // ~12kW per 8x MI355X server
    coolingOptions: ['air', 'liquid'],
    pue: { air: 1.4, liquid: 1.2 },
    reference: '/assets/AMD MI355X and Instinct Platform - Complete Technical Pack.pdf',
    vendor: 'amd',
    architecture: 'CDNA3',
    interconnect: 'infinity-fabric',
    networkingRecommendation: 'roce',
    multiTenantOptimal: true,
    warnings: ['AMD ROCm software stack required', 'Different networking topology vs NVIDIA', 'Infinity Fabric interconnect']
  },

  // AMD MI300X (Current generation for comparison)
  'mi300x': {
    name: 'AMD MI300X',
    powerPerGPU: 750,
    memoryPerGPU: 192,
    unitPrice: 40000,
    rackSize: 8,
    rackPower: 11500,
    coolingOptions: ['air', 'liquid'],
    pue: { air: 1.4, liquid: 1.2 },
    reference: 'https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html',
    vendor: 'amd',
    architecture: 'CDNA3',
    interconnect: 'infinity-fabric',
    networkingRecommendation: 'roce',
    multiTenantOptimal: true,
    warnings: ['AMD ROCm software stack required', 'Different networking topology vs NVIDIA']
  }
};
