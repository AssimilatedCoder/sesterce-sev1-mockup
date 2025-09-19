// Enhanced Storage Calculations for Production GPU Clusters
// Based on real-world deployments and vendor specifications

import { 
  productionVendors, 
  enterpriseVendors, 
  storageTiers, 
  tenantProfiles,
  scaleThresholds 
} from '../data/storageVendorsEnhanced';

export interface StorageConfig {
  gpuCount: number;
  gpuModel: string;
  workloadMix: {
    training: number;
    inference: number;
    finetuning: number;
  };
  tenantMix: {
    whale: number;
    medium: number;
    small: number;
  };
  budget: 'unlimited' | 'optimized' | 'cost-conscious';
  storageVendor: 'auto' | string;
  tierDistribution?: 'trainingHeavy' | 'balanced' | 'costOptimized';
  // New fields for selected tiers architecture
  selectedTiers?: string[];
  tierDistributionPercentages?: Record<string, number>;
  totalCapacityPB?: number;
}

export interface StorageResults {
  totalCapacity: {
    totalPB: number;
    tierBreakdown: Record<string, number>;
    rawPB?: number; // Optional for enhanced calculations
  };
  bandwidth: {
    requiredTBps: number;
    sustainedTBps: number;
    burstTBps: number;
    networkOverhead: number;
  };
  vendors: {
    primary: string;
    secondary: string;
    rationale: string;
    architecture?: string; // Optional for enhanced calculations
  };
  costs: {
    capex: {
      total: number;
      byTier: Record<string, number>;
      byVendor: Record<string, number>;
    };
    opex: {
      annual: number;
      power: number;
      support: number;
      admin: number;
    };
    tco5Year: number;
    costPerGPU: number;
    costPerTB: number;
  };
  performance: {
    latency: Record<string, string>;
    iops: Record<string, number>;
    aggregateThroughputTBps?: number; // Optional for enhanced calculations
    throughput: Record<string, number>;
  };
  checkpoints: {
    modelSize: number; // TB
    frequency: number; // minutes
    retention: number;
    storageRequired: number; // TB
  };
  warnings: string[];
  powerConsumption: {
    totalKW: number;
    byTier: Record<string, number>;
    percentOfDatacenter: number;
  };
}

// Main calculation function
export function calculateEnhancedStorage(config: StorageConfig): StorageResults {
  // Step 1: Calculate base storage requirements
  const baseCapacity = calculateBaseCapacity(config);
  
  // Step 2: Calculate checkpoint requirements
  const checkpointData = calculateCheckpointStorage(config);
  
  // Step 3: Determine optimal vendors
  const vendorSelection = selectOptimalVendors(config);
  
  // Step 4: Calculate tier distribution
  const tierDistribution = calculateTierDistribution(config, baseCapacity + checkpointData.storageRequired);
  
  // Step 5: Calculate bandwidth requirements
  const bandwidthReqs = calculateBandwidthRequirements(config);
  
  // Step 6: Calculate costs
  const costs = calculateDetailedCosts(config, tierDistribution, vendorSelection);
  
  // Step 7: Calculate power consumption
  const power = calculatePowerConsumption(tierDistribution);
  
  // Step 8: Generate warnings
  const warnings = generateWarnings(config, power);
  
  return {
    totalCapacity: {
      totalPB: (baseCapacity + checkpointData.storageRequired) / 1000,
      tierBreakdown: tierDistribution
    },
    bandwidth: bandwidthReqs,
    vendors: vendorSelection,
    costs,
    performance: calculatePerformanceMetrics(vendorSelection, tierDistribution),
    checkpoints: checkpointData,
    warnings,
    powerConsumption: power
  };
}

// Calculate base storage capacity requirements
function calculateBaseCapacity(config: StorageConfig): number {
  const { gpuCount, workloadMix, tenantMix } = config;
  
  // Base capacity per GPU varies by tenant type and workload
  let basePerGPU = 0;
  
  // Tenant-based capacity calculation
  basePerGPU += tenantProfiles.whale.capacityPerGPU * (tenantMix.whale / 100) * gpuCount;
  basePerGPU += tenantProfiles.medium.capacityPerGPU * (tenantMix.medium / 100) * gpuCount;
  basePerGPU += tenantProfiles.small.capacityPerGPU * (tenantMix.small / 100) * gpuCount;
  
  // Workload multipliers
  const trainingMultiplier = 1.5;
  const inferenceMultiplier = 0.8;
  const finetuningMultiplier = 1.2;
  
  const workloadFactor = 
    (workloadMix.training / 100) * trainingMultiplier +
    (workloadMix.inference / 100) * inferenceMultiplier +
    (workloadMix.finetuning / 100) * finetuningMultiplier;
  
  // Base formula: (GPU_Count × Base_Per_GPU × Workload_Factor) + Dataset_Overhead
  const datasetOverhead = gpuCount * 0.5; // 500GB per GPU for datasets
  const totalCapacity = basePerGPU * workloadFactor + datasetOverhead;
  
  return totalCapacity; // TB
}

// Calculate checkpoint storage requirements based on failure rates
function calculateCheckpointStorage(config: StorageConfig) {
  const { gpuCount } = config;
  
  // Model size based on cluster scale (production patterns)
  let modelSize = 0.1; // TB - default for small clusters
  if (gpuCount >= 100000) {
    modelSize = 15; // 1T parameters
  } else if (gpuCount >= 50000) {
    modelSize = 5.29; // 405B parameters
  } else if (gpuCount >= 10000) {
    modelSize = 0.912; // 70B parameters
  } else if (gpuCount >= 5000) {
    modelSize = 0.105; // 8B parameters
  }
  
  // Failure-driven checkpoint frequency (from MLCommons data)
  const failureRate = 0.0065; // failures per thousand node-days
  const nodeCount = Math.ceil(gpuCount / 8); // Assuming 8 GPUs per node
  const checkpointFrequencyHours = 1 / (nodeCount * failureRate * 24);
  const checkpointFrequencyMinutes = checkpointFrequencyHours * 60;
  
  // Retention based on cluster scale and criticality
  let retention = 20; // Default checkpoints to keep
  if (gpuCount >= 50000) retention = 100; // Research scale
  else if (gpuCount >= 10000) retention = 50; // Production scale
  
  const redundancy = 3; // 3x replication for reliability
  const storageRequired = modelSize * retention * redundancy;
  
  return {
    modelSize,
    frequency: Math.max(checkpointFrequencyMinutes, 1.5), // Minimum 1.5 minutes
    retention,
    storageRequired
  };
}

// Select optimal vendors based on scale and requirements
function selectOptimalVendors(config: StorageConfig) {
  const { gpuCount, budget, workloadMix, storageVendor } = config;
  
  if (storageVendor !== 'auto') {
    const vendor = productionVendors[storageVendor] || enterpriseVendors[storageVendor];
    return {
      primary: storageVendor,
      secondary: 'ceph',
      rationale: `User selected ${vendor?.name || storageVendor}`
    };
  }
  
  // Automated selection based on scale
  if (gpuCount >= 100000) {
    // Mega-scale: Only proven vendors
    if (budget === 'unlimited') {
      return {
        primary: 'vastdata',
        secondary: 'ddn',
        rationale: 'Mega-scale deployment requires proven vendors with 100k+ GPU validation'
      };
    } else {
      return {
        primary: 'weka',
        secondary: 'ceph',
        rationale: 'Cost-optimized mega-scale with software-defined primary storage'
      };
    }
  } else if (gpuCount >= 25000) {
    // Large scale: Mix of vendors
    if (workloadMix.training > 70) {
      return {
        primary: 'ddn',
        secondary: 'purestorage',
        rationale: 'Training-heavy workload requires parallel filesystem performance'
      };
    } else {
      return {
        primary: 'purestorage',
        secondary: 'netapp',
        rationale: 'Mixed workload benefits from enterprise NAS/SAN architecture'
      };
    }
  } else if (gpuCount >= 5000) {
    // Medium scale
    return {
      primary: 'weka',
      secondary: 'ceph',
      rationale: 'Medium scale deployment with software-defined storage'
    };
  } else {
    // Small scale
    return {
      primary: 'dell',
      secondary: 'ceph',
      rationale: 'Small scale deployment with traditional enterprise storage'
    };
  }
}

// Calculate tier distribution based on workload
function calculateTierDistribution(config: StorageConfig, totalCapacityTB: number) {
  const { workloadMix } = config;
  
  // Determine distribution type based on workload
  let distributionType: 'trainingHeavy' | 'balanced' | 'costOptimized' = 'balanced';
  
  if (workloadMix.training > 60) {
    distributionType = 'trainingHeavy';
  } else if (config.budget === 'cost-conscious') {
    distributionType = 'costOptimized';
  }
  
  const distribution: Record<string, number> = {};
  
  Object.keys(storageTiers).forEach(tierKey => {
    const tier = storageTiers[tierKey];
    const percentage = tier.percentage[distributionType];
    distribution[tierKey] = (totalCapacityTB * percentage) / 1000; // Convert to PB
  });
  
  return distribution;
}

// Calculate bandwidth requirements
function calculateBandwidthRequirements(config: StorageConfig) {
  const { gpuCount, workloadMix } = config;
  
  // Per-GPU bandwidth requirements (GiB/s)
  const trainingBW = 2.7;
  const inferenceBW = 0.3;
  const finetuningBW = 2.0;
  
  // Calculate weighted bandwidth per GPU
  const avgBWPerGPU = 
    (workloadMix.training / 100) * trainingBW +
    (workloadMix.inference / 100) * inferenceBW +
    (workloadMix.finetuning / 100) * finetuningBW;
  
  // Total sustained bandwidth
  const sustainedTBps = (gpuCount * avgBWPerGPU * 1.074) / 1000; // Convert GiB/s to TB/s
  
  // Burst bandwidth for checkpoints (5-10x sustained)
  const burstMultiplier = gpuCount > 50000 ? 10 : 5;
  const burstTBps = sustainedTBps * burstMultiplier;
  
  // Network overhead factor
  const networkOverhead = sustainedTBps * 0.3;
  
  return {
    requiredTBps: sustainedTBps + networkOverhead,
    sustainedTBps,
    burstTBps,
    networkOverhead
  };
}

// Calculate detailed costs
function calculateDetailedCosts(
  config: StorageConfig, 
  tierDistribution: Record<string, number>, 
  vendorSelection: any
) {
  const capexByTier: Record<string, number> = {};
  const capexByVendor: Record<string, number> = {};
  let totalCapex = 0;
  
  // Calculate CAPEX by tier
  Object.keys(tierDistribution).forEach(tierKey => {
    const capacityPB = tierDistribution[tierKey];
    const tier = storageTiers[tierKey];
    
    if (tierKey === 'tier0') {
      // Local NVMe pricing
      const costPerPB = tier.costRange.min;
      capexByTier[tierKey] = capacityPB * costPerPB;
    } else {
      // Use vendor pricing for other tiers
      const primaryVendor = productionVendors[vendorSelection.primary] || enterpriseVendors[vendorSelection.primary];
      const costPerPB = primaryVendor?.costPerPB.total || tier.costRange.min;
      capexByTier[tierKey] = capacityPB * costPerPB;
    }
    
    totalCapex += capexByTier[tierKey];
  });
  
  // Calculate OPEX
  const powerCost = calculatePowerCosts(tierDistribution);
  const supportCost = totalCapex * 0.20; // 20% of CAPEX annually
  const adminCost = Math.ceil(config.gpuCount / 5000) * 150000; // $150K per storage admin per 5000 GPUs
  
  const annualOpex = powerCost + supportCost + adminCost;
  const tco5Year = totalCapex + (annualOpex * 5);
  
  return {
    capex: {
      total: totalCapex,
      byTier: capexByTier,
      byVendor: capexByVendor
    },
    opex: {
      annual: annualOpex,
      power: powerCost,
      support: supportCost,
      admin: adminCost
    },
    tco5Year,
    costPerGPU: tco5Year / config.gpuCount,
    costPerTB: totalCapex / (Object.values(tierDistribution).reduce((a, b) => a + b, 0) * 1000) // Convert PB to TB
  };
}

// Calculate power consumption
function calculatePowerConsumption(tierDistribution: Record<string, number>) {
  const powerByTier: Record<string, number> = {};
  let totalKW = 0;
  
  Object.keys(tierDistribution).forEach(tierKey => {
    const capacityPB = tierDistribution[tierKey];
    const tier = storageTiers[tierKey];
    const tierPower = capacityPB * tier.powerPerPB;
    
    powerByTier[tierKey] = tierPower;
    totalKW += tierPower;
  });
  
  return {
    totalKW,
    byTier: powerByTier,
    percentOfDatacenter: 0 // Will be calculated based on total datacenter power
  };
}

// Calculate power costs
function calculatePowerCosts(tierDistribution: Record<string, number>): number {
  const power = calculatePowerConsumption(tierDistribution);
  const costPerKWMonth = 350; // $350/kW/month average
  return power.totalKW * costPerKWMonth * 12; // Annual cost
}

// Calculate performance metrics
function calculatePerformanceMetrics(vendorSelection: any, tierDistribution: Record<string, number>) {
  const primaryVendor = productionVendors[vendorSelection.primary] || enterpriseVendors[vendorSelection.primary];
  
  return {
    latency: {
      tier0: '<100μs',
      hotTier: primaryVendor?.performance.latency || '<500μs',
      warmTier: '<1ms',
      coldTier: '<5ms',
      archiveTier: 'Minutes'
    },
    iops: {
      total: parseInt(primaryVendor?.performance.iops?.replace(/[^\d]/g, '') || '1000000'),
      read: parseInt(primaryVendor?.performance.iops?.replace(/[^\d]/g, '') || '1000000') * 0.7,
      write: parseInt(primaryVendor?.performance.iops?.replace(/[^\d]/g, '') || '1000000') * 0.3
    },
    throughput: {
      sustained: parseFloat(primaryVendor?.performance.throughput.replace(/[^\d.]/g, '') || '100'),
      burst: parseFloat(primaryVendor?.performance.throughput.replace(/[^\d.]/g, '') || '100') * 2
    }
  };
}

// Generate warnings based on scale and configuration
function generateWarnings(config: StorageConfig, power: any): string[] {
  const warnings: string[] = [];
  const { gpuCount } = config;
  
  // Check scale thresholds
  if (gpuCount >= scaleThresholds.networkTransition.gpuCount) {
    warnings.push(scaleThresholds.networkTransition.warning);
  }
  
  if (gpuCount >= scaleThresholds.metadataBottleneck.gpuCount) {
    warnings.push(scaleThresholds.metadataBottleneck.warning);
  }
  
  if (gpuCount >= scaleThresholds.checkpointStorm.gpuCount) {
    warnings.push(scaleThresholds.checkpointStorm.warning);
  }
  
  if (gpuCount >= scaleThresholds.clusterSplit.gpuCount) {
    warnings.push(scaleThresholds.clusterSplit.warning);
  }
  
  // Power consumption warning
  // Note: This will be calculated when total datacenter power is known
  
  return warnings;
}
