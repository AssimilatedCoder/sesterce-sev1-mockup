export const gpuSpecs: any = {
  'gb200': {
    name: 'GB200 NVL72',
    powerPerGPU: 1200,
    memoryPerGPU: 192,
    unitPrice: 65000,
    rackSize: 72,
    coolingOptions: ['liquid'],
    pue: { liquid: 1.1 },
    reference: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/'
  },
  'gb300': {
    name: 'GB300 NVL72',
    powerPerGPU: 1400,
    memoryPerGPU: 288,
    unitPrice: 85000,
    rackSize: 72,
    coolingOptions: ['liquid'],
    pue: { liquid: 1.08 },
    reference: 'https://www.nvidia.com/en-us/data-center/gb300-nvl72/'
  },
  'h100-sxm': {
    name: 'H100 SXM5',
    powerPerGPU: 700,
    memoryPerGPU: 80,
    unitPrice: 28000,
    rackSize: 72,
    coolingOptions: ['air', 'liquid'],
    pue: { air: 1.4, liquid: 1.1 },
    reference: 'https://www.nvidia.com/en-us/data-center/h100/'
  },
  'h100-pcie': {
    name: 'H100 PCIe',
    powerPerGPU: 350,
    memoryPerGPU: 80,
    unitPrice: 22000,
    rackSize: 72,
    coolingOptions: ['air'],
    pue: { air: 1.5 },
    reference: 'https://www.nvidia.com/en-us/data-center/h100/'
  }
};
