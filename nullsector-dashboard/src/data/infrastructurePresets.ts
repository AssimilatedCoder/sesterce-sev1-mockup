import { InfrastructureConfig } from '../components/common/InfrastructureConfiguration';

export interface InfrastructurePreset {
  id: string;
  name: string;
  description: string;
  useCase: string;
  targetMarket: string;
  config: InfrastructureConfig;
}

export const INFRASTRUCTURE_PRESETS: InfrastructurePreset[] = [
  {
    id: 'small-enterprise',
    name: 'Small Enterprise',
    description: 'Entry-level GPU cluster for small to medium enterprises',
    useCase: 'Development, small-scale training, inference services',
    targetMarket: 'Startups, SMEs, Research labs',
    config: {
      compute: {
        gpuModel: 'A100 40GB',
        totalGPUs: 256,
        nodeConfiguration: 'Custom 4-GPU nodes',
        cpuToGpuRatio: '1:2 (Balanced)'
      },
      networking: {
        fabricType: 'Ethernet 200GbE (Legacy)',
        topologyType: 'Fat Tree (2:1 oversubscribed)',
        railConfiguration: 'Single Rail',
        storageNetworkSeparation: false
      },
      storage: {
        ultraHighPerf: { capacity: 0, unit: 'TB' },
        highPerf: { capacity: 0.5, unit: 'PB' },
        mediumPerf: { capacity: 100, unit: 'TB' },
        capacityTier: { capacity: 5, unit: 'PB' },
        objectStore: { capacity: 1, unit: 'PB' }
      },
      power: {
        totalPowerCapacity: 2,
        coolingType: 'Air Cooled (Standard)',
        powerRedundancy: 'N+1',
        pue: 1.4
      }
    }
  },
  {
    id: 'regional-cloud',
    name: 'Regional Cloud',
    description: 'Mid-scale deployment for regional cloud providers',
    useCase: 'Multi-tenant training, inference services, MLOps platform',
    targetMarket: 'Regional clouds, Service providers, Large enterprises',
    config: {
      compute: {
        gpuModel: 'H100 PCIe',
        totalGPUs: 2000,
        nodeConfiguration: 'Dell PowerEdge XE9680 (8x H100)',
        cpuToGpuRatio: '1:2 (Balanced)'
      },
      networking: {
        fabricType: 'InfiniBand HDR 200Gb (Balanced)',
        topologyType: 'Fat Tree (Non-blocking)',
        railConfiguration: 'Dual Rail (Redundant)',
        storageNetworkSeparation: true
      },
      storage: {
        ultraHighPerf: { capacity: 50, unit: 'TB' },
        highPerf: { capacity: 2, unit: 'PB' },
        mediumPerf: { capacity: 500, unit: 'TB' },
        capacityTier: { capacity: 20, unit: 'PB' },
        objectStore: { capacity: 5, unit: 'PB' }
      },
      power: {
        totalPowerCapacity: 15,
        coolingType: 'Liquid Cooled (Direct chip)',
        powerRedundancy: 'N+2',
        pue: 1.2
      }
    }
  },
  {
    id: 'hyperscale',
    name: 'Hyperscale',
    description: 'Large-scale deployment for hyperscale providers',
    useCase: 'Whale customers, large-scale training, full service portfolio',
    targetMarket: 'Hyperscalers, Major cloud providers, AI companies',
    config: {
      compute: {
        gpuModel: 'H100 SXM',
        totalGPUs: 25000,
        nodeConfiguration: 'DGX H100 (8x H100 SXM)',
        cpuToGpuRatio: '1:2 (Balanced)'
      },
      networking: {
        fabricType: 'InfiniBand NDR 400Gb (Training optimized)',
        topologyType: 'Fat Tree (Non-blocking)',
        railConfiguration: 'Quad Rail (Maximum bandwidth)',
        storageNetworkSeparation: true
      },
      storage: {
        ultraHighPerf: { capacity: 500, unit: 'TB' },
        highPerf: { capacity: 20, unit: 'PB' },
        mediumPerf: { capacity: 2, unit: 'PB' },
        capacityTier: { capacity: 200, unit: 'PB' },
        objectStore: { capacity: 50, unit: 'PB' }
      },
      power: {
        totalPowerCapacity: 50,
        coolingType: 'Liquid Cooled (Direct chip)',
        powerRedundancy: '2N',
        pue: 1.1
      }
    }
  },
  {
    id: 'inference-optimized',
    name: 'Inference Optimized',
    description: 'Specialized deployment for inference workloads',
    useCase: 'API services, real-time inference, edge deployment',
    targetMarket: 'SaaS providers, API companies, Edge computing',
    config: {
      compute: {
        gpuModel: 'L40S',
        totalGPUs: 1000,
        nodeConfiguration: 'Custom 8-GPU nodes',
        cpuToGpuRatio: '1:1 (CPU heavy)'
      },
      networking: {
        fabricType: 'Ethernet 400GbE RoCEv2 (Cost optimized)',
        topologyType: 'BCube (Cost optimized)',
        railConfiguration: 'Dual Rail (Redundant)',
        storageNetworkSeparation: false
      },
      storage: {
        ultraHighPerf: { capacity: 0, unit: 'TB' },
        highPerf: { capacity: 0.2, unit: 'PB' },
        mediumPerf: { capacity: 1, unit: 'PB' },
        capacityTier: { capacity: 10, unit: 'PB' },
        objectStore: { capacity: 2, unit: 'PB' }
      },
      power: {
        totalPowerCapacity: 8,
        coolingType: 'Hybrid Air/Liquid',
        powerRedundancy: 'N+1',
        pue: 1.3
      }
    }
  },
  {
    id: 'research-hpc',
    name: 'Research HPC',
    description: 'High-performance computing for research institutions',
    useCase: 'Scientific computing, large model training, research',
    targetMarket: 'Universities, Research institutes, National labs',
    config: {
      compute: {
        gpuModel: 'A100 80GB',
        totalGPUs: 512,
        nodeConfiguration: 'DGX H100 (8x H100 SXM)',
        cpuToGpuRatio: '1:1 (CPU heavy)'
      },
      networking: {
        fabricType: 'InfiniBand NDR 400Gb (Training optimized)',
        topologyType: 'Fat Tree (Non-blocking)',
        railConfiguration: 'Dual Rail (Redundant)',
        storageNetworkSeparation: true
      },
      storage: {
        ultraHighPerf: { capacity: 100, unit: 'TB' },
        highPerf: { capacity: 1, unit: 'PB' },
        mediumPerf: { capacity: 200, unit: 'TB' },
        capacityTier: { capacity: 10, unit: 'PB' },
        objectStore: { capacity: 2, unit: 'PB' }
      },
      power: {
        totalPowerCapacity: 5,
        coolingType: 'Liquid Cooled (Direct chip)',
        powerRedundancy: 'N+2',
        pue: 1.2
      }
    }
  },
  {
    id: 'edge-deployment',
    name: 'Edge Deployment',
    description: 'Distributed edge computing infrastructure',
    useCase: 'Edge inference, IoT processing, distributed AI',
    targetMarket: 'Telcos, CDN providers, Edge computing',
    config: {
      compute: {
        gpuModel: 'L40S',
        totalGPUs: 128,
        nodeConfiguration: 'Custom 4-GPU nodes',
        cpuToGpuRatio: '1:1 (CPU heavy)'
      },
      networking: {
        fabricType: 'Ethernet 200GbE (Legacy)',
        topologyType: 'BCube (Cost optimized)',
        railConfiguration: 'Single Rail',
        storageNetworkSeparation: false
      },
      storage: {
        ultraHighPerf: { capacity: 0, unit: 'TB' },
        highPerf: { capacity: 0.1, unit: 'PB' },
        mediumPerf: { capacity: 50, unit: 'TB' },
        capacityTier: { capacity: 2, unit: 'PB' },
        objectStore: { capacity: 0.5, unit: 'PB' }
      },
      power: {
        totalPowerCapacity: 1,
        coolingType: 'Air Cooled (Standard)',
        powerRedundancy: 'N+1',
        pue: 1.5
      }
    }
  }
];

export function getPresetById(id: string): InfrastructurePreset | undefined {
  return INFRASTRUCTURE_PRESETS.find(preset => preset.id === id);
}

export function getPresetsByMarket(market: string): InfrastructurePreset[] {
  return INFRASTRUCTURE_PRESETS.filter(preset => 
    preset.targetMarket.toLowerCase().includes(market.toLowerCase())
  );
}

export function getPresetsByScale(minGPUs: number, maxGPUs: number): InfrastructurePreset[] {
  return INFRASTRUCTURE_PRESETS.filter(preset => 
    preset.config.compute.totalGPUs >= minGPUs && 
    preset.config.compute.totalGPUs <= maxGPUs
  );
}
