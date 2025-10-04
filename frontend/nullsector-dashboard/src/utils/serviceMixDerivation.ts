import { InfrastructureConfig } from '../components/common/InfrastructureConfiguration';

export interface ServiceMixRecommendation {
  tier1_bareMetalWhale: number;
  tier2_orchestratedK8s: number;
  tier3_managedMLOps: number;
  tier4_inferenceService: number;
}

export interface InfrastructureCapabilities {
  totalGPUs: number;
  gpuGeneration: string;
  isTrainingOptimized: boolean;
  isInferenceOptimized: boolean;
  hasHighBandwidth: boolean;
  supportsLargeScaleTraining: boolean;
  networkBandwidthGBps: number;
  storageProfile: {
    highPerfRatio: number;
    totalBandwidthGBps: number;
    hasObjectStorage: boolean;
    supportsMLoPs: boolean;
  };
  canSupportDenseTraining: boolean;
  efficiency: number;
}

export interface ServiceConstraint {
  type: 'network' | 'storage' | 'compute' | 'scale' | 'power';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  impact: string;
}

export interface WorkloadDistribution {
  [key: string]: {
    training: number;
    inference: number;
  };
}

// GPU specifications for analysis
const GPU_SPECS = {
  'H100 SXM': { tdp: 700, trainingOptimized: true, inferenceOptimized: false, generation: 'H100' },
  'H100 PCIe': { tdp: 350, trainingOptimized: true, inferenceOptimized: true, generation: 'H100' },
  'H200': { tdp: 700, trainingOptimized: true, inferenceOptimized: false, generation: 'H200' },
  'A100 80GB': { tdp: 400, trainingOptimized: true, inferenceOptimized: false, generation: 'A100' },
  'A100 40GB': { tdp: 250, trainingOptimized: true, inferenceOptimized: true, generation: 'A100' },
  'L40S': { tdp: 350, trainingOptimized: false, inferenceOptimized: true, generation: 'L40S' }
};

// Network bandwidth mapping
const NETWORK_BANDWIDTH = {
  'InfiniBand NDR 400Gb (Training optimized)': 400,
  'InfiniBand HDR 200Gb (Balanced)': 200,
  'Ethernet 400GbE RoCEv2 (Cost optimized)': 320, // RoCE overhead
  'Ethernet 200GbE (Legacy)': 160
};

export function analyzeInfrastructureCapabilities(infrastructure: InfrastructureConfig): InfrastructureCapabilities {
  const gpuSpec = GPU_SPECS[infrastructure.compute.gpuModel as keyof typeof GPU_SPECS];
  const networkBandwidth = NETWORK_BANDWIDTH[infrastructure.networking.fabricType as keyof typeof NETWORK_BANDWIDTH];
  
  // Calculate storage characteristics
  const totalStorageCapacity = 
    infrastructure.storage.ultraHighPerf.capacity * (infrastructure.storage.ultraHighPerf.unit === 'TB' ? 1 : 1000) +
    infrastructure.storage.highPerf.capacity * (infrastructure.storage.highPerf.unit === 'TB' ? 1 : 1000) +
    infrastructure.storage.mediumPerf.capacity * (infrastructure.storage.mediumPerf.unit === 'TB' ? 1 : 1000) +
    infrastructure.storage.capacityTier.capacity * (infrastructure.storage.capacityTier.unit === 'TB' ? 1 : 1000);
  
  const highPerfCapacity = 
    infrastructure.storage.ultraHighPerf.capacity * (infrastructure.storage.ultraHighPerf.unit === 'TB' ? 1 : 1000) +
    infrastructure.storage.highPerf.capacity * (infrastructure.storage.highPerf.unit === 'TB' ? 1 : 1000);
  
  const highPerfRatio = totalStorageCapacity > 0 ? highPerfCapacity / totalStorageCapacity : 0;
  
  // Calculate storage bandwidth (simplified)
  const storageBandwidth = 
    infrastructure.storage.ultraHighPerf.capacity * 2.5 + // 250 GB/s per 100TB
    infrastructure.storage.highPerf.capacity * 100 + // 100 GB/s per PB
    infrastructure.storage.mediumPerf.capacity * 1 + // 100 GB/s per 100TB
    infrastructure.storage.capacityTier.capacity * 10; // 10 GB/s per PB
  
  return {
    totalGPUs: infrastructure.compute.totalGPUs,
    gpuGeneration: gpuSpec.generation,
    isTrainingOptimized: gpuSpec.trainingOptimized,
    isInferenceOptimized: gpuSpec.inferenceOptimized,
    hasHighBandwidth: networkBandwidth >= 300,
    supportsLargeScaleTraining: infrastructure.networking.topologyType.includes('Non-blocking'),
    networkBandwidthGBps: networkBandwidth,
    storageProfile: {
      highPerfRatio,
      totalBandwidthGBps: storageBandwidth,
      hasObjectStorage: infrastructure.storage.objectStore.capacity > 0,
      supportsMLoPs: infrastructure.storage.objectStore.capacity >= 2 // 2PB minimum for MLOps
    },
    canSupportDenseTraining: infrastructure.power.coolingType.includes('Liquid') && infrastructure.power.totalPowerCapacity > 20,
    efficiency: infrastructure.power.pue
  };
}

export function deriveOptimalServiceMix(capabilities: InfrastructureCapabilities): ServiceMixRecommendation {
  let mix: ServiceMixRecommendation = {
    tier1_bareMetalWhale: 0,
    tier2_orchestratedK8s: 0,
    tier3_managedMLOps: 0,
    tier4_inferenceService: 0
  };
  
  // Decision tree based on infrastructure capabilities
  
  // Check for whale customer suitability (Tier 1)
  if (capabilities.totalGPUs >= 5000 && 
      capabilities.hasHighBandwidth && 
      capabilities.supportsLargeScaleTraining &&
      capabilities.canSupportDenseTraining &&
      capabilities.storageProfile.highPerfRatio > 0.4) {
    mix.tier1_bareMetalWhale = Math.min(30, Math.floor(capabilities.totalGPUs / 1000) * 5); // 5% per 1000 GPUs, max 30%
  }
  
  // Check for training suitability (Tier 2 & 3)
  if (capabilities.isTrainingOptimized && capabilities.storageProfile.highPerfRatio > 0.2) {
    const trainingCapacity = Math.min(60, capabilities.storageProfile.highPerfRatio * 80);
    
    // Split between K8s and MLOps based on object storage and scale
    if (capabilities.storageProfile.supportsMLoPs && capabilities.totalGPUs >= 1000) {
      // Favor MLOps for mid-market with good object storage
      mix.tier3_managedMLOps = Math.round(trainingCapacity * 0.65);
      mix.tier2_orchestratedK8s = Math.round(trainingCapacity * 0.35);
    } else if (capabilities.totalGPUs >= 2000) {
      // Favor K8s for larger scale without MLOps infrastructure
      mix.tier2_orchestratedK8s = Math.round(trainingCapacity * 0.7);
      mix.tier3_managedMLOps = Math.round(trainingCapacity * 0.3);
    } else {
      // Smaller scale - focus on MLOps if supported
      if (capabilities.storageProfile.supportsMLoPs) {
        mix.tier3_managedMLOps = Math.round(trainingCapacity * 0.8);
        mix.tier2_orchestratedK8s = Math.round(trainingCapacity * 0.2);
      } else {
        mix.tier2_orchestratedK8s = Math.round(trainingCapacity);
      }
    }
  }
  
  // Check for inference suitability (Tier 4)
  const currentAllocation = mix.tier1_bareMetalWhale + mix.tier2_orchestratedK8s + mix.tier3_managedMLOps;
  const remainingCapacity = 100 - currentAllocation;
  
  if (capabilities.isInferenceOptimized || remainingCapacity > 20) {
    // Inference can use remaining capacity efficiently
    mix.tier4_inferenceService = Math.min(50, remainingCapacity);
  }
  
  // Fill any remaining capacity with balanced allocation
  const finalAllocation = Object.values(mix).reduce((a, b) => a + b, 0);
  if (finalAllocation < 100) {
    const remaining = 100 - finalAllocation;
    
    // Distribute remaining based on infrastructure strengths
    if (capabilities.storageProfile.supportsMLoPs) {
      mix.tier3_managedMLOps += Math.round(remaining * 0.6);
      mix.tier4_inferenceService += Math.round(remaining * 0.4);
    } else {
      mix.tier2_orchestratedK8s += Math.round(remaining * 0.5);
      mix.tier4_inferenceService += Math.round(remaining * 0.5);
    }
  }
  
  // Normalize to exactly 100%
  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    const keys = Object.keys(mix) as (keyof ServiceMixRecommendation)[];
    keys.forEach(key => {
      mix[key] = Math.round((mix[key] / total) * 100);
    });
    
    // Handle rounding errors
    const newTotal = Object.values(mix).reduce((a, b) => a + b, 0);
    if (newTotal !== 100) {
      const diff = 100 - newTotal;
      // Add difference to the largest allocation
      const maxKey = keys.reduce((a, b) => mix[a] > mix[b] ? a : b);
      mix[maxKey] += diff;
    }
  }
  
  return mix;
}

export function identifyServiceConstraints(capabilities: InfrastructureCapabilities): ServiceConstraint[] {
  const constraints: ServiceConstraint[] = [];
  
  // Network constraints
  if (!capabilities.hasHighBandwidth) {
    constraints.push({
      type: 'network',
      severity: 'warning',
      message: 'Limited network bandwidth restricts large-scale distributed training',
      impact: 'Reduce Tier 1 (Whale) allocation to <10% or upgrade to NDR InfiniBand'
    });
  }
  
  if (!capabilities.supportsLargeScaleTraining) {
    constraints.push({
      type: 'network',
      severity: 'warning',
      message: 'Oversubscribed network topology may limit training scale',
      impact: 'Consider non-blocking topology for whale customers'
    });
  }
  
  // Storage constraints
  if (capabilities.storageProfile.highPerfRatio < 0.2) {
    constraints.push({
      type: 'storage',
      severity: 'critical',
      message: 'Insufficient high-performance storage for training workloads',
      impact: 'Focus on inference workloads (Tier 4) or upgrade storage to 20%+ high-performance'
    });
  }
  
  if (!capabilities.storageProfile.supportsMLoPs) {
    constraints.push({
      type: 'storage',
      severity: 'info',
      message: 'Limited object storage capacity restricts MLOps platform features',
      impact: 'Consider adding 2PB+ object storage for Tier 3 (MLOps) services'
    });
  }
  
  // GPU constraints
  if (capabilities.isInferenceOptimized && !capabilities.isTrainingOptimized) {
    constraints.push({
      type: 'compute',
      severity: 'info',
      message: 'GPU selection optimized for inference workloads',
      impact: 'Recommended focus on Tier 4 (Inference) and Tier 3 (MLOps inference)'
    });
  }
  
  // Scale constraints
  if (capabilities.totalGPUs < 500) {
    constraints.push({
      type: 'scale',
      severity: 'info',
      message: 'Sub-scale deployment for enterprise customers',
      impact: 'Focus on Tier 2-4 services for better unit economics'
    });
  }
  
  if (capabilities.totalGPUs > 20000 && !capabilities.hasHighBandwidth) {
    constraints.push({
      type: 'scale',
      severity: 'critical',
      message: 'Large scale deployment requires high-bandwidth networking',
      impact: 'Upgrade to NDR InfiniBand or limit scale to <10k GPUs'
    });
  }
  
  // Power constraints
  if (!capabilities.canSupportDenseTraining && capabilities.totalGPUs > 5000) {
    constraints.push({
      type: 'power',
      severity: 'warning',
      message: 'Air cooling limits density for large-scale training',
      impact: 'Consider liquid cooling for better density and efficiency'
    });
  }
  
  if (capabilities.efficiency > 1.4) {
    constraints.push({
      type: 'power',
      severity: 'warning',
      message: 'High PUE increases operational costs significantly',
      impact: 'Improve cooling efficiency to reduce OpEx by 20-30%'
    });
  }
  
  return constraints;
}

export function inferWorkloadDistribution(
  infrastructure: InfrastructureConfig, 
  serviceMix: ServiceMixRecommendation
): WorkloadDistribution {
  const capabilities = analyzeInfrastructureCapabilities(infrastructure);
  const workloadDist: WorkloadDistribution = {};
  
  // For each service tier, determine training/inference split based on infrastructure
  Object.entries(serviceMix).forEach(([tier, allocation]) => {
    if (allocation === 0) return;
    
    switch(tier) {
      case 'tier1_bareMetalWhale':
        // Whales adjust based on available bandwidth and storage
        if (capabilities.hasHighBandwidth && capabilities.storageProfile.highPerfRatio > 0.5) {
          workloadDist[tier] = { training: 80, inference: 20 };
        } else if (capabilities.hasHighBandwidth) {
          workloadDist[tier] = { training: 70, inference: 30 };
        } else {
          workloadDist[tier] = { training: 60, inference: 40 };
        }
        break;
        
      case 'tier2_orchestratedK8s':
        // K8s users adapt to infrastructure capabilities
        if (capabilities.isTrainingOptimized && capabilities.storageProfile.highPerfRatio > 0.3) {
          workloadDist[tier] = { training: 65, inference: 35 };
        } else if (capabilities.isTrainingOptimized) {
          workloadDist[tier] = { training: 55, inference: 45 };
        } else {
          workloadDist[tier] = { training: 40, inference: 60 };
        }
        break;
        
      case 'tier3_managedMLOps':
        // MLOps balance based on GPU type and object storage
        if (capabilities.gpuGeneration === 'H100' && capabilities.storageProfile.supportsMLoPs) {
          workloadDist[tier] = { training: 55, inference: 45 };
        } else if (capabilities.isInferenceOptimized) {
          workloadDist[tier] = { training: 30, inference: 70 };
        } else if (capabilities.storageProfile.supportsMLoPs) {
          workloadDist[tier] = { training: 50, inference: 50 };
        } else {
          workloadDist[tier] = { training: 40, inference: 60 };
        }
        break;
        
      case 'tier4_inferenceService':
        // Inference service with minimal training
        workloadDist[tier] = { training: 10, inference: 90 };
        break;
    }
  });
  
  return workloadDist;
}

// Utility function to calculate total storage in TB
export function calculateTotalStorageCapacity(storage: InfrastructureConfig['storage']): number {
  return (
    storage.ultraHighPerf.capacity * (storage.ultraHighPerf.unit === 'TB' ? 1 : 1000) +
    storage.highPerf.capacity * (storage.highPerf.unit === 'TB' ? 1 : 1000) +
    storage.mediumPerf.capacity * (storage.mediumPerf.unit === 'TB' ? 1 : 1000) +
    storage.capacityTier.capacity * (storage.capacityTier.unit === 'TB' ? 1 : 1000) +
    storage.objectStore.capacity * (storage.objectStore.unit === 'TB' ? 1 : 1000)
  );
}

// Utility function to get GPU power consumption
export function getGPUPowerConsumption(gpuModel: string): number {
  const spec = GPU_SPECS[gpuModel as keyof typeof GPU_SPECS];
  return spec ? spec.tdp : 400; // Default to 400W if unknown
}
