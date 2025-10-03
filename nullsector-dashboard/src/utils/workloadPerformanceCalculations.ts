// Workload Performance Requirements Calculator
// Calculates storage and infrastructure needs based on service tier mix and workload types

export interface ServiceTierConfig {
  id: string;
  name: string;
  description: string;
  type: 'bareMetalWhale' | 'orchestratedK8s' | 'managedMLOps' | 'inferenceService';
  clusterPercent: number;
  trainingPercent: number;
  inferencePercent: number; // Auto-calculated as 100 - trainingPercent
  typicalCustomers: string;
  slaRequirement: string;
  serviceCategory: 'IaaS' | 'PaaS' | 'SaaS';
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

// Performance factors based on real-world GPU cluster deployments and service tier types
export const PERFORMANCE_FACTORS: Record<string, WorkloadPerformanceFactors> = {
  bareMetalWhale: {
    training: {
      bandwidth: 300,  // GB/s per 100 GPUs - massive model checkpoints
      iops: 50000,     // IOPS per 100 GPUs
      capacity: 600,   // TB per 100 GPUs
      latency: 5       // <5ms for optimal training
    },
    inference: {
      bandwidth: 60,   // GB/s per 100 GPUs
      iops: 150000,    // IOPS per 100 GPUs
      capacity: 120,   // TB per 100 GPUs
      latency: 10      // <10ms for real-time inference
    }
  },
  orchestratedK8s: {
    training: {
      bandwidth: 220,  // GB/s per 100 GPUs - standard training workloads
      iops: 75000,     // IOPS per 100 GPUs
      capacity: 450,   // TB per 100 GPUs
      latency: 10      // <10ms acceptable
    },
    inference: {
      bandwidth: 50,   // GB/s per 100 GPUs
      iops: 200000,    // IOPS per 100 GPUs
      capacity: 100,   // TB per 100 GPUs
      latency: 15      // <15ms acceptable
    }
  },
  managedMLOps: {
    training: {
      bandwidth: 180,  // GB/s per 100 GPUs - managed, optimized I/O
      iops: 100000,    // Higher IOPS for experiment tracking
      capacity: 400,   // TB per 100 GPUs - includes versioning overhead
      latency: 15      // <15ms acceptable with platform overhead
    },
    inference: {
      bandwidth: 70,   // Higher than basic due to A/B testing
      iops: 250000,    // High IOPS for model registry access
      capacity: 150,   // More models cached for experimentation
      latency: 12      // <12ms for managed serving
    }
  },
  inferenceService: {
    training: {
      bandwidth: 40,   // GB/s per 100 GPUs - minimal training, mostly fine-tuning
      iops: 30000,     // IOPS per 100 GPUs
      capacity: 50,    // TB per 100 GPUs
      latency: 20      // <20ms acceptable for batch training
    },
    inference: {
      bandwidth: 80,   // GB/s per 100 GPUs - optimized for serving
      iops: 300000,    // IOPS per 100 GPUs - very high for API serving
      capacity: 200,   // TB per 100 GPUs - large model cache
      latency: 5       // <5ms for API response times
    }
  }
};

// Default service tier configurations
export const DEFAULT_SERVICE_TIERS: ServiceTierConfig[] = [
  {
    id: 'tier1_whale',
    name: 'Tier 1: Bare Metal GPU Access',
    description: 'Direct hardware access for whale customers',
    type: 'bareMetalWhale',
    clusterPercent: 20,
    trainingPercent: 80,
    inferencePercent: 20,
    typicalCustomers: 'OpenAI, Anthropic, Cohere, Meta AI',
    slaRequirement: '99.9% uptime, dedicated partitions',
    serviceCategory: 'IaaS'
  },
  {
    id: 'tier2_orchestrated',
    name: 'Tier 2: Orchestrated Kubernetes',
    description: 'Managed Kubernetes with GPU scheduling',
    type: 'orchestratedK8s',
    clusterPercent: 30,
    trainingPercent: 65,
    inferencePercent: 35,
    typicalCustomers: 'Fortune 500 ML teams, Fintech companies',
    slaRequirement: '99.5% uptime, shared with QoS',
    serviceCategory: 'PaaS'
  },
  {
    id: 'tier3_mlops',
    name: 'Tier 3: Managed MLOps Platform',
    description: 'Full MLOps stack with experiment tracking, model registry, and pipeline orchestration',
    type: 'managedMLOps',
    clusterPercent: 35,
    trainingPercent: 55,
    inferencePercent: 45,
    typicalCustomers: 'Mid-market enterprises, Healthcare AI, Retail analytics teams',
    slaRequirement: '99.0% uptime, managed platform SLA',
    serviceCategory: 'PaaS'
  },
  {
    id: 'tier4_inference',
    name: 'Tier 4: Inference-as-a-Service',
    description: 'API-based inference services with serverless scaling',
    type: 'inferenceService',
    clusterPercent: 15,
    trainingPercent: 10,
    inferencePercent: 90,
    typicalCustomers: 'SaaS providers, API services, Chatbot companies',
    slaRequirement: '99.0% uptime, best effort',
    serviceCategory: 'SaaS'
  }
];

/**
 * Calculate MLOps-specific storage overhead
 */
function calculateMLOpsOverhead(gpusInTier: number, trainingPercent: number) {
  const experiments = gpusInTier * 2; // Assume 2 experiments per GPU per month
  const trainingRatio = trainingPercent / 100;
  
  return {
    // Artifact storage (model checkpoints, experiment tracking)
    artifactStorage: experiments * 0.5 * trainingRatio, // TB
    
    // Dataset versioning storage
    datasetStorage: gpusInTier * 2 * trainingRatio, // TB per GPU
    
    // Metadata and metrics storage
    metadataStorage: experiments * 0.01, // TB (small but critical)
    metadataIOPS: experiments * 100, // High IOPS for queries
    
    // Feature store requirements
    featureStore: gpusInTier * 0.5, // TB
    
    // Artifact bandwidth for uploads
    artifactBandwidth: Math.min(50, gpusInTier * 0.5) // GB/s, capped at 50
  };
}

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

    // Get tier-specific performance factors
    const tierFactors = PERFORMANCE_FACTORS[tier.type] || PERFORMANCE_FACTORS.orchestratedK8s;

    // Calculate bandwidth requirements using tier-specific factors
    requirements.totalBandwidth += 
      (trainingGPUs / 100) * tierFactors.training.bandwidth +
      (inferenceGPUs / 100) * tierFactors.inference.bandwidth;

    // Calculate IOPS requirements using tier-specific factors
    requirements.totalIOPS += 
      (trainingGPUs / 100) * tierFactors.training.iops +
      (inferenceGPUs / 100) * tierFactors.inference.iops;

    // Calculate capacity requirements using tier-specific factors
    requirements.totalCapacity += 
      (trainingGPUs / 100) * tierFactors.training.capacity +
      (inferenceGPUs / 100) * tierFactors.inference.capacity;

    // Add MLOps-specific overhead for managed MLOps tier
    if (tier.type === 'managedMLOps') {
      const mlopsOverhead = calculateMLOpsOverhead(gpusInTier, tier.trainingPercent);
      requirements.totalCapacity += mlopsOverhead.artifactStorage + mlopsOverhead.datasetStorage + mlopsOverhead.metadataStorage;
      requirements.totalIOPS += mlopsOverhead.metadataIOPS;
      requirements.totalBandwidth += mlopsOverhead.artifactBandwidth;
    }

    // Determine performance tier distribution based on service tier type and workload mix
    switch (tier.type) {
      case 'bareMetalWhale':
        // Whales get dedicated ultra-high performance
        requirements.performanceTierDistribution.extreme += tier.clusterPercent * 0.6;
        requirements.performanceTierDistribution.high += tier.clusterPercent * 0.4;
        break;
        
      case 'orchestratedK8s':
        // Standard k8s gets high-perf mix based on training ratio
        if (tier.trainingPercent > 70) {
          requirements.performanceTierDistribution.extreme += tier.clusterPercent * 0.4;
          requirements.performanceTierDistribution.high += tier.clusterPercent * 0.6;
        } else {
          requirements.performanceTierDistribution.high += tier.clusterPercent * 0.7;
          requirements.performanceTierDistribution.balanced += tier.clusterPercent * 0.3;
        }
        break;
        
      case 'managedMLOps':
        // MLOps needs balanced with object storage considerations
        requirements.performanceTierDistribution.high += tier.clusterPercent * 0.3;
        requirements.performanceTierDistribution.balanced += tier.clusterPercent * 0.5;
        requirements.performanceTierDistribution.cost += tier.clusterPercent * 0.2; // Object storage
        break;
        
      case 'inferenceService':
        // Inference mostly needs fast cache and capacity
        if (tier.trainingPercent > 20) {
          requirements.performanceTierDistribution.balanced += tier.clusterPercent * 0.6;
          requirements.performanceTierDistribution.cost += tier.clusterPercent * 0.4;
        } else {
          requirements.performanceTierDistribution.balanced += tier.clusterPercent * 0.3;
          requirements.performanceTierDistribution.cost += tier.clusterPercent * 0.7;
        }
        break;
        
      default:
        // Fallback to original logic
        if (tier.trainingPercent > 70) {
          requirements.performanceTierDistribution.extreme += tier.clusterPercent;
        } else if (tier.trainingPercent > 40) {
          requirements.performanceTierDistribution.high += tier.clusterPercent;
        } else if (tier.trainingPercent > 15) {
          requirements.performanceTierDistribution.balanced += tier.clusterPercent;
        } else {
          requirements.performanceTierDistribution.cost += tier.clusterPercent;
        }
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
