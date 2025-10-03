// Workload Performance Requirements Calculator
// Calculates storage and infrastructure needs based on service tier mix and workload types

export interface ServiceTierConfig {
  id: string;
  name: string;
  description: string;
  clusterPercent: number;
  trainingPercent: number;
  inferencePercent: number; // Auto-calculated as 100 - trainingPercent
  typicalCustomers: string;
  slaRequirement: string;
}

export interface WorkloadPerformanceFactors {
  training: {
    bandwidth: number;  // GB/s per 100 GPUs
    iops: number;       // IOPS per 100 GPUs
    capacity: number;   // TB per 100 GPUs
    latency: number;    // Max acceptable latency (ms)
  };
  inference: {
    bandwidth: number;  // GB/s per 100 GPUs
    iops: number;       // IOPS per 100 GPUs
    capacity: number;   // TB per 100 GPUs
    latency: number;    // Max acceptable latency (ms)
  };
}

export interface StorageRequirements {
  totalBandwidth: number;    // GB/s
  totalIOPS: number;         // IOPS
  totalCapacity: number;     // TB
  performanceTierDistribution: {
    extreme: number;   // % needing VAST Universal/WEKA
    high: number;      // % needing Pure/NetApp
    balanced: number;  // % needing Ceph NVMe
    cost: number;      // % needing Ceph HDD
  };
  rawStorageMultiplier: number; // Accounting for replication/EC
}

export interface InfrastructureRequirements {
  network: {
    minimumBandwidth: number;     // Tb/s bisection bandwidth
    infinibandSwitches: number;   // NDR switches needed
    storageNetworkPorts: number;  // 200GbE ports needed
  };
  power: {
    storagePowerKW: number;       // Additional storage power
    coolingTons: number;          // Additional cooling needed
    additionalRacks: number;      // Extra racks for storage
  };
  software: {
    vastLicense: number;          // $ based on capacity
    kubernetesLicense: number;    // $ if applicable
    monitoringStack: number;      // $ for observability
  };
}

// Performance factors based on real-world GPU cluster deployments
export const PERFORMANCE_FACTORS: WorkloadPerformanceFactors = {
  training: {
    bandwidth: 250,  // GB/s per 100 GPUs (checkpoint writes, dataset streaming)
    iops: 50000,     // IOPS per 100 GPUs (metadata operations)
    capacity: 500,   // TB per 100 GPUs (datasets, checkpoints, logs)
    latency: 1       // <1ms for training efficiency
  },
  inference: {
    bandwidth: 50,   // GB/s per 100 GPUs (model serving, batch processing)
    iops: 200000,    // IOPS per 100 GPUs (frequent model weight access)
    capacity: 100,   // TB per 100 GPUs (models, cache, results)
    latency: 5       // <5ms acceptable for most inference
  }
};

// Default service tier configurations
export const DEFAULT_SERVICE_TIERS: ServiceTierConfig[] = [
  {
    id: 'tier1_whale',
    name: 'Tier 1: Bare Metal GPU Access',
    description: 'Direct hardware access for whale customers',
    clusterPercent: 25,
    trainingPercent: 80,
    inferencePercent: 20,
    typicalCustomers: 'OpenAI, Anthropic, Cohere',
    slaRequirement: '99.9% uptime, dedicated partitions'
  },
  {
    id: 'tier2_orchestrated',
    name: 'Tier 2: Orchestrated Kubernetes',
    description: 'Managed Kubernetes with GPU scheduling',
    clusterPercent: 50,
    trainingPercent: 60,
    inferencePercent: 40,
    typicalCustomers: 'Enterprise AI teams, Research labs',
    slaRequirement: '99.5% uptime, shared with QoS'
  },
  {
    id: 'tier3_inference',
    name: 'Tier 3: Inference-as-a-Service',
    description: 'API-based inference services',
    clusterPercent: 25,
    trainingPercent: 10,
    inferencePercent: 90,
    typicalCustomers: 'SaaS providers, API services',
    slaRequirement: '99.0% uptime, best effort'
  }
];

/**
 * Calculate storage requirements based on service tier configuration
 */
export function calculateStorageRequirements(
  serviceTiers: ServiceTierConfig[],
  totalGPUs: number
): StorageRequirements {
  let requirements: StorageRequirements = {
    totalBandwidth: 0,
    totalIOPS: 0,
    totalCapacity: 0,
    performanceTierDistribution: {
      extreme: 0,
      high: 0,
      balanced: 0,
      cost: 0
    },
    rawStorageMultiplier: 1.0
  };

  serviceTiers.forEach(tier => {
    const gpusInTier = (tier.clusterPercent / 100) * totalGPUs;
    const trainingGPUs = gpusInTier * (tier.trainingPercent / 100);
    const inferenceGPUs = gpusInTier * (tier.inferencePercent / 100);

    // Calculate bandwidth requirements
    requirements.totalBandwidth += 
      (trainingGPUs / 100) * PERFORMANCE_FACTORS.training.bandwidth +
      (inferenceGPUs / 100) * PERFORMANCE_FACTORS.inference.bandwidth;

    // Calculate IOPS requirements
    requirements.totalIOPS += 
      (trainingGPUs / 100) * PERFORMANCE_FACTORS.training.iops +
      (inferenceGPUs / 100) * PERFORMANCE_FACTORS.inference.iops;

    // Calculate capacity requirements
    requirements.totalCapacity += 
      (trainingGPUs / 100) * PERFORMANCE_FACTORS.training.capacity +
      (inferenceGPUs / 100) * PERFORMANCE_FACTORS.inference.capacity;

    // Determine performance tier distribution based on workload mix
    if (tier.trainingPercent > 70) {
      // Training-heavy workloads need extreme performance
      requirements.performanceTierDistribution.extreme += tier.clusterPercent;
    } else if (tier.trainingPercent > 40) {
      // Mixed workloads need high performance
      requirements.performanceTierDistribution.high += tier.clusterPercent;
    } else if (tier.trainingPercent > 15) {
      // Inference-heavy but some training needs balanced
      requirements.performanceTierDistribution.balanced += tier.clusterPercent;
    } else {
      // Pure inference can use cost-optimized
      requirements.performanceTierDistribution.cost += tier.clusterPercent;
    }
  });

  // Calculate raw storage multiplier based on tier distribution
  // Extreme/High tiers use replication (3x), Balanced uses EC (1.375x), Cost uses EC (1.375x)
  const extremeWeight = requirements.performanceTierDistribution.extreme / 100;
  const highWeight = requirements.performanceTierDistribution.high / 100;
  const balancedWeight = requirements.performanceTierDistribution.balanced / 100;
  const costWeight = requirements.performanceTierDistribution.cost / 100;

  requirements.rawStorageMultiplier = 
    extremeWeight * 3.0 +      // 3-way replication
    highWeight * 2.0 +         // RAID-6 equivalent
    balancedWeight * 1.375 +   // Erasure coding 8+3
    costWeight * 1.375;        // Erasure coding 8+3

  return requirements;
}

/**
 * Calculate infrastructure requirements based on storage needs
 */
export function calculateInfrastructureRequirements(
  storageReqs: StorageRequirements,
  totalGPUs: number
): InfrastructureRequirements {
  // Network calculations
  const minimumBandwidth = storageReqs.totalBandwidth / 1000; // Convert to Tb/s
  const infinibandSwitches = Math.ceil(totalGPUs / 2000); // 2000 GPUs per spine switch
  const storageNetworkPorts = Math.ceil(storageReqs.totalCapacity / 100); // 1 port per 100TB

  // Power calculations (based on storage power consumption)
  const storagePowerKW = storageReqs.totalCapacity * 0.5; // 0.5kW per TB average
  const coolingTons = storagePowerKW * 0.3; // 0.3 tons cooling per kW
  const additionalRacks = Math.ceil(storageReqs.totalCapacity / 500); // 500TB per rack

  // Software licensing (simplified estimates)
  const vastCapacityPB = (storageReqs.performanceTierDistribution.extreme / 100) * 
                         (storageReqs.totalCapacity / 1000);
  const vastLicense = vastCapacityPB * 50000; // $50K per PB for VAST

  const kubernetesLicense = totalGPUs * 100; // $100 per GPU for enterprise K8s
  const monitoringStack = totalGPUs * 50; // $50 per GPU for monitoring

  return {
    network: {
      minimumBandwidth,
      infinibandSwitches,
      storageNetworkPorts
    },
    power: {
      storagePowerKW,
      coolingTons,
      additionalRacks
    },
    software: {
      vastLicense,
      kubernetesLicense,
      monitoringStack
    }
  };
}

/**
 * Validate service tier configuration
 */
export function validateServiceTiers(serviceTiers: ServiceTierConfig[]): string[] {
  const warnings: string[] = [];

  // Check if cluster percentages sum to 100%
  const totalClusterPercent = serviceTiers.reduce((sum, tier) => sum + tier.clusterPercent, 0);
  if (Math.abs(totalClusterPercent - 100) > 0.1) {
    warnings.push(`Service tier percentages must sum to 100% (currently ${totalClusterPercent.toFixed(1)}%)`);
  }

  // Check individual tier workload splits
  serviceTiers.forEach(tier => {
    if (Math.abs(tier.trainingPercent + tier.inferencePercent - 100) > 0.1) {
      warnings.push(`${tier.name}: Training + Inference must sum to 100% (currently ${(tier.trainingPercent + tier.inferencePercent).toFixed(1)}%)`);
    }
  });

  // Performance warnings
  const totalTrainingPercent = serviceTiers.reduce((sum, tier) => 
    sum + (tier.clusterPercent / 100) * (tier.trainingPercent / 100), 0) * 100;

  if (totalTrainingPercent > 80) {
    warnings.push('High training workload (>80%) will require significant high-performance storage investment');
  }

  if (totalTrainingPercent < 20) {
    warnings.push('Low training workload (<20%) may indicate over-provisioned storage performance tiers');
  }

  return warnings;
}

/**
 * Get recommended storage architecture based on calculated requirements
 */
export function getRecommendedStorageArchitecture(
  storageReqs: StorageRequirements
): { tier: string; capacityPB: number; rationale: string }[] {
  const totalCapacityPB = storageReqs.totalCapacity / 1000;
  const architecture: { tier: string; capacityPB: number; rationale: string }[] = [];

  // Extreme performance tier
  if (storageReqs.performanceTierDistribution.extreme > 0) {
    const capacityPB = totalCapacityPB * (storageReqs.performanceTierDistribution.extreme / 100);
    architecture.push({
      tier: 'VAST Universal',
      capacityPB,
      rationale: `${storageReqs.performanceTierDistribution.extreme.toFixed(1)}% training-heavy workloads require <100μs latency`
    });
  }

  // High performance tier
  if (storageReqs.performanceTierDistribution.high > 0) {
    const capacityPB = totalCapacityPB * (storageReqs.performanceTierDistribution.high / 100);
    architecture.push({
      tier: 'Pure FlashBlade',
      capacityPB,
      rationale: `${storageReqs.performanceTierDistribution.high.toFixed(1)}% mixed workloads need <1ms latency`
    });
  }

  // Balanced performance tier
  if (storageReqs.performanceTierDistribution.balanced > 0) {
    const capacityPB = totalCapacityPB * (storageReqs.performanceTierDistribution.balanced / 100);
    architecture.push({
      tier: 'Ceph All-NVMe',
      capacityPB,
      rationale: `${storageReqs.performanceTierDistribution.balanced.toFixed(1)}% inference-heavy workloads acceptable with <5ms latency`
    });
  }

  // Cost-optimized tier
  if (storageReqs.performanceTierDistribution.cost > 0) {
    const capacityPB = totalCapacityPB * (storageReqs.performanceTierDistribution.cost / 100);
    architecture.push({
      tier: 'Ceph HDD Cache',
      capacityPB,
      rationale: `${storageReqs.performanceTierDistribution.cost.toFixed(1)}% pure inference workloads can use cost-optimized storage`
    });
  }

  return architecture;
}
