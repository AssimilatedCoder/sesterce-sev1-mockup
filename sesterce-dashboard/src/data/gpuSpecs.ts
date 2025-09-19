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
}

export const gpuSpecs: Record<string, GPUSpec> = {
  'gb200': {
    name: 'GB200 NVL72',
    powerPerGPU: 1200,
    memoryPerGPU: 188, // 13.5TB / 72 GPUs ≈ 188GB per GPU (from design doc)
    unitPrice: 65000,
    rackSize: 72,
    rackPower: 126000, // 126kW average (120-132kW range from design doc)
    coolingOptions: ['liquid'],
    pue: { liquid: 1.09 },
    reference: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/'
  },
  'gb300': {
    name: 'GB300 NVL72',
    powerPerGPU: 1400,
    memoryPerGPU: 288, // 20.7TB / 72 GPUs ≈ 288GB per GPU (from design doc)
    unitPrice: 85000,
    rackSize: 72,
    rackPower: 137500, // 137.5kW average (135-140kW range from design doc)
    coolingOptions: ['liquid'],
    pue: { liquid: 1.08 },
    reference: 'https://www.nvidia.com/en-us/data-center/gb300-nvl72/'
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
    reference: 'https://www.nvidia.com/en-us/data-center/h100/'
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
    reference: 'https://www.nvidia.com/en-us/data-center/h100/'
  }
};
