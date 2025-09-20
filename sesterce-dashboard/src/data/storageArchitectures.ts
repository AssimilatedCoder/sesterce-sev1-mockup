// Storage Architecture Definitions with Performance/Cost Characteristics
// Based on real-world production deployments and vendor specifications

export interface StorageArchitecture {
  id: string;
  name: string;
  category: 'extreme' | 'high-performance' | 'balanced' | 'cost-optimized';
  description: string;
  vendors: string[];
  performance: {
    throughputPerPB: string;
    iopsPerPB: string;
    latency: string;
  };
  costPerPB: {
    capex: number;
    opex: number; // Annual
    total5Year: number;
  };
  useCases: string[];
  infrastructure: {
    mediaType: 'all-nvme' | 'nvme-ssd' | 'ssd-hdd' | 'hdd' | 'cloud';
    redundancy: string;
    efficiency: number; // Usable vs Raw ratio
    powerPerPB: number; // kW per PB
  };
  scalability: {
    minCapacityPB: number;
    maxCapacityPB: number;
    sweetSpotPB: number;
  };
}

export const storageArchitectures: Record<string, StorageArchitecture> = {
  // EXTREME PERFORMANCE TIER
  'vast-universal': {
    id: 'vast-universal',
    name: 'VAST Universal Storage',
    category: 'extreme',
    description: 'All-flash disaggregated architecture with QLC economics',
    vendors: ['VAST Data'],
    performance: {
      throughputPerPB: '1+ TB/s',
      iopsPerPB: '10M+',
      latency: '<50μs'
    },
    costPerPB: {
      capex: 650000,
      opex: 130000,
      total5Year: 1300000
    },
    useCases: ['AI/ML training', 'Checkpointing', 'Real-time analytics'],
    infrastructure: {
      mediaType: 'all-nvme',
      redundancy: 'Erasure coding 17+2',
      efficiency: 0.89, // 89% usable
      powerPerPB: 15 // kW per PB - VAST claims 40% power savings
    },
    scalability: {
      minCapacityPB: 2,
      maxCapacityPB: 1000,
      sweetSpotPB: 50
    }
  },

  'weka-parallel': {
    id: 'weka-parallel',
    name: 'WEKA Parallel Filesystem',
    category: 'extreme',
    description: 'Software-defined parallel filesystem on commodity hardware',
    vendors: ['WEKA'],
    performance: {
      throughputPerPB: '720 GB/s',
      iopsPerPB: '18M+',
      latency: '<100μs'
    },
    costPerPB: {
      capex: 475000,
      opex: 95000,
      total5Year: 950000
    },
    useCases: ['GPUDirect storage', 'HPC workloads', 'Real-time AI'],
    infrastructure: {
      mediaType: 'all-nvme',
      redundancy: 'Distributed erasure coding',
      efficiency: 0.85,
      powerPerPB: 25 // kW per PB
    },
    scalability: {
      minCapacityPB: 1,
      maxCapacityPB: 100,
      sweetSpotPB: 20
    }
  },

  'ddn-exascaler': {
    id: 'ddn-exascaler',
    name: 'DDN EXAScaler/Infinia',
    category: 'extreme',
    description: 'Purpose-built AI storage with hardware acceleration',
    vendors: ['DDN'],
    performance: {
      throughputPerPB: '1.1+ TB/s',
      iopsPerPB: '3M+',
      latency: '<100μs'
    },
    costPerPB: {
      capex: 1000000,
      opex: 200000,
      total5Year: 2000000
    },
    useCases: ['Large-scale AI', '100k+ GPU clusters', 'Supercomputing'],
    infrastructure: {
      mediaType: 'all-nvme',
      redundancy: 'RAID-6 + replication',
      efficiency: 0.80,
      powerPerPB: 30 // kW per PB
    },
    scalability: {
      minCapacityPB: 5,
      maxCapacityPB: 500,
      sweetSpotPB: 100
    }
  },

  // HIGH PERFORMANCE TIER
  'pure-flashblade': {
    id: 'pure-flashblade',
    name: 'Pure FlashBlade//E',
    category: 'high-performance',
    description: 'Enterprise all-flash with Evergreen subscription',
    vendors: ['Pure Storage'],
    performance: {
      throughputPerPB: '3.4 TB/s',
      iopsPerPB: '1M+',
      latency: '<500μs'
    },
    costPerPB: {
      capex: 800000,
      opex: 160000,
      total5Year: 1600000
    },
    useCases: ['Enterprise AI/ML', 'Analytics', 'Mixed workloads'],
    infrastructure: {
      mediaType: 'all-nvme',
      redundancy: 'RAID-6 equivalent',
      efficiency: 0.83,
      powerPerPB: 35 // kW per PB
    },
    scalability: {
      minCapacityPB: 1,
      maxCapacityPB: 150,
      sweetSpotPB: 25
    }
  },

  'netapp-aff': {
    id: 'netapp-aff',
    name: 'NetApp AFF A-Series',
    category: 'high-performance',
    description: 'Enterprise NAS/SAN with proven reliability',
    vendors: ['NetApp'],
    performance: {
      throughputPerPB: '350 GB/s',
      iopsPerPB: '2M+',
      latency: '<1ms'
    },
    costPerPB: {
      capex: 700000,
      opex: 140000,
      total5Year: 1400000
    },
    useCases: ['Enterprise workloads', 'Mixed AI/ML', 'Traditional apps'],
    infrastructure: {
      mediaType: 'all-nvme',
      redundancy: 'RAID-DP + SnapMirror',
      efficiency: 0.85,
      powerPerPB: 32 // kW per PB
    },
    scalability: {
      minCapacityPB: 0.5,
      maxCapacityPB: 50,
      sweetSpotPB: 10
    }
  },

  // BALANCED TIER (CEPH-BASED)
  'ceph-nvme': {
    id: 'ceph-nvme',
    name: 'Ceph All-NVMe Tier',
    category: 'balanced',
    description: 'Ubuntu-based Ceph on all-NVMe hardware (Canonical supported)',
    vendors: ['Canonical Ubuntu Ceph', 'SUSE Enterprise Storage', 'Proxmox Ceph'],
    performance: {
      throughputPerPB: '100 GB/s',
      iopsPerPB: '500K',
      latency: '<2ms'
    },
    costPerPB: {
      capex: 350000,
      opex: 70000,
      total5Year: 700000
    },
    useCases: ['Cost-conscious AI', 'Development clusters', 'Warm data'],
    infrastructure: {
      mediaType: 'all-nvme',
      redundancy: 'Erasure coding 8+3',
      efficiency: 0.73,
      powerPerPB: 20 // kW per PB - open source efficiency
    },
    scalability: {
      minCapacityPB: 1,
      maxCapacityPB: 100,
      sweetSpotPB: 20
    }
  },

  'ceph-hybrid': {
    id: 'ceph-hybrid',
    name: 'Ceph Hybrid NVMe/SSD',
    category: 'balanced',
    description: 'Ubuntu Ceph with NVMe caching and SSD capacity (Canonical)',
    vendors: ['Canonical Ubuntu Ceph', 'SUSE Enterprise Storage', 'Proxmox Ceph'],
    performance: {
      throughputPerPB: '50 GB/s',
      iopsPerPB: '200K',
      latency: '<5ms'
    },
    costPerPB: {
      capex: 200000,
      opex: 40000,
      total5Year: 400000
    },
    useCases: ['Warm datasets', 'Backup tier', 'Archive staging'],
    infrastructure: {
      mediaType: 'nvme-ssd',
      redundancy: 'Erasure coding 8+3',
      efficiency: 0.73,
      powerPerPB: 12 // kW per PB - hybrid efficiency
    },
    scalability: {
      minCapacityPB: 2,
      maxCapacityPB: 500,
      sweetSpotPB: 50
    }
  },

  // COST-OPTIMIZED TIER
  'ceph-hdd': {
    id: 'ceph-hdd',
    name: 'Ceph HDD with SSD Cache',
    category: 'cost-optimized',
    description: 'High-capacity Ubuntu Ceph with SSD metadata/caching (Canonical)',
    vendors: ['Canonical Ubuntu Ceph', 'SUSE Enterprise Storage', 'Proxmox Ceph'],
    performance: {
      throughputPerPB: '10 GB/s',
      iopsPerPB: '10K',
      latency: '<20ms'
    },
    costPerPB: {
      capex: 100000,
      opex: 20000,
      total5Year: 200000
    },
    useCases: ['Cold storage', 'Long-term archive', 'Compliance data'],
    infrastructure: {
      mediaType: 'ssd-hdd',
      redundancy: 'Erasure coding 8+3',
      efficiency: 0.73,
      powerPerPB: 8 // kW per PB - HDD power efficiency
    },
    scalability: {
      minCapacityPB: 5,
      maxCapacityPB: 1000,
      sweetSpotPB: 100
    }
  },

  'dell-powerscale': {
    id: 'dell-powerscale',
    name: 'Dell PowerScale (Isilon)',
    category: 'balanced',
    description: 'Enterprise scale-out NAS',
    vendors: ['Dell EMC'],
    performance: {
      throughputPerPB: '100 GB/s',
      iopsPerPB: '100K',
      latency: '<5ms'
    },
    costPerPB: {
      capex: 600000,
      opex: 120000,
      total5Year: 1200000
    },
    useCases: ['Enterprise file services', 'Mixed workloads', 'Archive'],
    infrastructure: {
      mediaType: 'nvme-ssd',
      redundancy: 'Reed-Solomon erasure coding',
      efficiency: 0.80,
      powerPerPB: 28 // kW per PB
    },
    scalability: {
      minCapacityPB: 1,
      maxCapacityPB: 100,
      sweetSpotPB: 25
    }
  },

  // CLOUD/OBJECT TIER
  's3-compatible': {
    id: 's3-compatible',
    name: 'S3-Compatible Object (MinIO/Wasabi)',
    category: 'cost-optimized',
    description: 'Object storage for archive and backup',
    vendors: ['MinIO', 'Wasabi', 'Backblaze'],
    performance: {
      throughputPerPB: '5 GB/s',
      iopsPerPB: '1K',
      latency: '<100ms'
    },
    costPerPB: {
      capex: 50000,
      opex: 180000, // $0.015/GB/month
      total5Year: 950000
    },
    useCases: ['Long-term archive', 'Compliance', 'Disaster recovery'],
    infrastructure: {
      mediaType: 'cloud',
      redundancy: '11 9s durability',
      efficiency: 1.0, // No overhead in cloud
      powerPerPB: 0 // Cloud provider handles power
    },
    scalability: {
      minCapacityPB: 0.1,
      maxCapacityPB: 10000,
      sweetSpotPB: 100
    }
  }
};

// Recommended tier combinations for different use cases
export const recommendedCombinations: Record<string, {
  name: string;
  description: string;
  tiers: string[];
  distribution: Record<string, number>; // Percentage distribution
  totalCostPerPB: number;
  rationale: string;
}> = {
  'vast-ceph-optimal': {
    name: 'VAST + Ubuntu Ceph Multi-Tier (Recommended)',
    description: 'Optimal balance of extreme performance and economics with Canonical Ubuntu Ceph',
    tiers: ['vast-universal', 'ceph-nvme', 'ceph-hybrid', 'ceph-hdd'],
    distribution: {
      'vast-universal': 25,
      'ceph-nvme': 25,
      'ceph-hybrid': 30,
      'ceph-hdd': 20
    },
    totalCostPerPB: 615000, // Weighted average 5-year TCO
    rationale: 'VAST provides extreme performance for hot data and checkpoints, while Ceph tiers offer excellent economics for warm/cold data'
  },

  'all-flash-performance': {
    name: 'All-Flash Maximum Performance',
    description: 'Maximum performance, suitable for latency-sensitive workloads',
    tiers: ['weka-parallel', 'vast-universal', 'pure-flashblade'],
    distribution: {
      'weka-parallel': 30,
      'vast-universal': 40,
      'pure-flashblade': 30
    },
    totalCostPerPB: 1283000,
    rationale: 'All-flash architecture ensures consistent sub-millisecond latency across all data'
  },

  'cost-optimized-scale': {
    name: 'Cost-Optimized at Scale',
    description: 'Minimum cost per PB for large-scale deployments',
    tiers: ['ceph-nvme', 'ceph-hybrid', 'ceph-hdd', 's3-compatible'],
    distribution: {
      'ceph-nvme': 15,
      'ceph-hybrid': 25,
      'ceph-hdd': 40,
      's3-compatible': 20
    },
    totalCostPerPB: 435000,
    rationale: 'Ceph-based tiers with object archive provide the lowest TCO for petabyte-scale deployments'
  },

  'enterprise-balanced': {
    name: 'Enterprise Balanced',
    description: 'Traditional enterprise vendors with proven support',
    tiers: ['pure-flashblade', 'netapp-aff', 'dell-powerscale'],
    distribution: {
      'pure-flashblade': 30,
      'netapp-aff': 30,
      'dell-powerscale': 40
    },
    totalCostPerPB: 1400000,
    rationale: 'Enterprise-grade support and integration with existing infrastructure'
  }
};

// Validation rules for tier combinations
export const tierCombinationRules = {
  warnings: [
    {
      condition: (tiers: string[]) => {
        const hasExtreme = tiers.some(t => storageArchitectures[t]?.category === 'extreme');
        const hasCostOptimized = tiers.some(t => storageArchitectures[t]?.category === 'cost-optimized');
        return hasExtreme && !hasCostOptimized;
      },
      message: 'Consider adding cost-optimized tiers for better TCO. Extreme performance tiers alone may be over-provisioned for cold data.',
      severity: 'warning' as const
    },
    {
      condition: (tiers: string[]) => {
        const vendors = new Set(tiers.flatMap(t => storageArchitectures[t]?.vendors || []));
        return vendors.size > 3;
      },
      message: 'Multiple vendors increase operational complexity. Consider consolidating to 2-3 vendors maximum.',
      severity: 'warning' as const
    },
    {
      condition: (tiers: string[]) => {
        return tiers.length === 1 && storageArchitectures[tiers[0]]?.category === 'cost-optimized';
      },
      message: 'Single cost-optimized tier may not meet performance requirements for AI/ML workloads.',
      severity: 'error' as const
    }
  ],
  
  recommendations: [
    {
      condition: (tiers: string[], totalCapacityPB: number) => totalCapacityPB > 100,
      suggestion: 'At this scale, consider dedicated metadata tier with VAST or WEKA for optimal performance.'
    },
    {
      condition: (tiers: string[], totalCapacityPB: number) => {
        const hasCloudTier = tiers.includes('s3-compatible');
        return totalCapacityPB > 50 && !hasCloudTier;
      },
      suggestion: 'Consider adding S3-compatible object tier for cost-effective long-term archive.'
    }
  ]
};
