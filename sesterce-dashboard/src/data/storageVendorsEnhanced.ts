// Production-Proven Storage Vendor Data for Large-Scale GPU Clusters
// Based on Q3-Q4 2024 deployments and vendor specifications

export interface StorageVendor {
  name: string;
  tier: 'production' | 'enterprise' | 'emerging';
  performance: {
    throughput: string;
    iops?: string;
    latency: string;
    gpuDirect?: string;
  };
  scalability: {
    maxGPUs: number;
    architecture: string;
  };
  costPerPB: {
    software?: number;
    hardware?: number;
    total: number;
    model: string;
  };
  powerPerPB: number; // kW per PB
  deployments: string[];
  certifications: string[];
  minScale: number; // Minimum GPUs for this vendor
  maxScale: number; // Maximum recommended GPUs
}

export interface StorageTier {
  name: string;
  percentage: {
    trainingHeavy: number;
    balanced: number;
    costOptimized: number;
  };
  technology: string;
  performance: string;
  powerPerPB: number; // kW per PB
  vendors: string[];
  costRange: {
    min: number;
    max: number;
  };
  latencyRequirement: string;
}

// Production-Proven Vendors (10,000+ GPU Scale)
export const productionVendors: Record<string, StorageVendor> = {
  weka: {
    name: "WEKA",
    tier: 'production',
    performance: {
      throughput: "720 GB/s per cluster",
      iops: "18.3M IOPS",
      latency: "<100 microseconds",
      gpuDirect: "113.13 GB/s to 16 GPUs"
    },
    scalability: {
      maxGPUs: 32000,
      architecture: "Software-defined parallel filesystem"
    },
    costPerPB: {
      software: 75000,
      hardware: 400000,
      total: 475000,
      model: "Software licensing + commodity hardware"
    },
    powerPerPB: 25,
    deployments: ["Stability AI", "Oracle Cloud"],
    certifications: ["NVIDIA SuperPOD", "GPUDirect"],
    minScale: 1000,
    maxScale: 32000
  },

  vastdata: {
    name: "VAST Data",
    tier: 'production',
    performance: {
      throughput: "TB/s class",
      latency: "<50 microseconds",
    },
    scalability: {
      maxGPUs: 100000,
      architecture: "DASE with QLC/3D XPoint"
    },
    costPerPB: {
      total: 650000,
      model: "Gemini subscription (HW at cost)"
    },
    powerPerPB: 15, // 40% power savings claimed
    deployments: ["CoreWeave", "Lambda Labs"],
    certifications: ["NVIDIA SuperPOD", "100k+ GPU validated"],
    minScale: 5000,
    maxScale: 200000
  },

  ddn: {
    name: "DDN EXAScaler/Infinia",
    tier: 'production',
    performance: {
      throughput: "1.1+ TB/s (Infinia), 120 GB/s (EXAScaler)",
      iops: "3M read, 1M write",
      latency: "<100 microseconds"
    },
    scalability: {
      maxGPUs: 100000,
      architecture: "Parallel filesystem with KV acceleration"
    },
    costPerPB: {
      hardware: 700000,
      software: 300000,
      total: 1000000,
      model: "Appliance or software-only"
    },
    powerPerPB: 30,
    deployments: ["100k GPU customer", "NVIDIA certified"],
    certifications: ["NVIDIA SuperPOD", "Blackwell validated"],
    minScale: 10000,
    maxScale: 200000
  },

  purestorage: {
    name: "Pure Storage FlashBlade",
    tier: 'production',
    performance: {
      throughput: "3.4 TB/s per rack (current), 10+ TB/s (EXA 2025)",
      latency: "<500 microseconds"
    },
    scalability: {
      maxGPUs: 50000,
      architecture: "Disaggregated metadata with scale-out"
    },
    costPerPB: {
      hardware: 800000,
      total: 800000,
      model: "Evergreen subscription with refresh"
    },
    powerPerPB: 35,
    deployments: ["Meta RSC: 175 PB FlashArray + 10 PB FlashBlade"],
    certifications: ["NVIDIA SuperPOD"],
    minScale: 1000,
    maxScale: 50000
  }
};

// Enterprise Vendors (Smaller Scale)
export const enterpriseVendors: Record<string, StorageVendor> = {
  netapp: {
    name: "NetApp AFF",
    tier: 'enterprise',
    performance: {
      throughput: "351 GiB/s for 4-system cluster",
      latency: "<1 millisecond"
    },
    scalability: {
      maxGPUs: 10000,
      architecture: "Scale-out NAS with ONTAP"
    },
    costPerPB: {
      total: 700000,
      model: "Traditional enterprise licensing"
    },
    powerPerPB: 40,
    deployments: ["Enterprise AI deployments"],
    certifications: ["NVIDIA SuperPOD"],
    minScale: 100,
    maxScale: 10000
  },

  dell: {
    name: "Dell PowerScale",
    tier: 'enterprise',
    performance: {
      throughput: "2.5+ TB/s per cluster",
      latency: "<1 millisecond"
    },
    scalability: {
      maxGPUs: 16384,
      architecture: "Scale-out NAS (Isilon)"
    },
    costPerPB: {
      total: 600000,
      model: "Appliance with support"
    },
    powerPerPB: 45,
    deployments: ["Enterprise customers"],
    certifications: ["NVIDIA certified"],
    minScale: 500,
    maxScale: 16384
  },

  ceph: {
    name: "Ceph (Open Source)",
    tier: 'enterprise',
    performance: {
      throughput: "Variable based on hardware",
      latency: "<5 milliseconds"
    },
    scalability: {
      maxGPUs: 25000,
      architecture: "Distributed object/block/file"
    },
    costPerPB: {
      software: 0,
      hardware: 150000,
      total: 150000,
      model: "Open source + commodity hardware"
    },
    powerPerPB: 50,
    deployments: ["Cost-conscious deployments"],
    certifications: ["Community supported"],
    minScale: 100,
    maxScale: 25000
  }
};

// Storage Tier Definitions
export const storageTiers: Record<string, StorageTier> = {
  tier0: {
    name: "Ultra-Hot (Local NVMe)",
    percentage: {
      trainingHeavy: 0.20,
      balanced: 0.15,
      costOptimized: 0.10
    },
    technology: "Local NVMe on GPU servers",
    performance: "Sub-millisecond latency",
    powerPerPB: 5, // 95% power savings vs external
    vendors: ["Local NVMe"],
    costRange: {
      min: 2000000,
      max: 3000000
    },
    latencyRequirement: "<100 microseconds"
  },

  hotTier: {
    name: "Hot (Shared All-Flash)",
    percentage: {
      trainingHeavy: 0.35,
      balanced: 0.25,
      costOptimized: 0.15
    },
    technology: "All-NVMe shared storage",
    performance: "40-80 GB/s single node",
    powerPerPB: 30,
    vendors: ["weka", "vastdata", "ddn"],
    costRange: {
      min: 800000,
      max: 1200000
    },
    latencyRequirement: "<100 microseconds"
  },

  warmTier: {
    name: "Warm (Hybrid NVMe/SSD)",
    percentage: {
      trainingHeavy: 0.25,
      balanced: 0.30,
      costOptimized: 0.25
    },
    technology: "NVMe/SSD hybrid",
    performance: "4-8 GB/s single node",
    powerPerPB: 25,
    vendors: ["purestorage", "netapp"],
    costRange: {
      min: 300000,
      max: 600000
    },
    latencyRequirement: "<500 microseconds"
  },

  coldTier: {
    name: "Cold (HDD/Ceph)",
    percentage: {
      trainingHeavy: 0.15,
      balanced: 0.25,
      costOptimized: 0.40
    },
    technology: "HDD-based, Ceph clusters",
    performance: "1-2 GB/s single node",
    powerPerPB: 50,
    vendors: ["ceph", "dell"],
    costRange: {
      min: 100000,
      max: 250000
    },
    latencyRequirement: "<5 milliseconds"
  },

  archiveTier: {
    name: "Archive (Object Storage)",
    percentage: {
      trainingHeavy: 0.05,
      balanced: 0.05,
      costOptimized: 0.10
    },
    technology: "S3-compatible object storage",
    performance: "Best effort",
    powerPerPB: 60,
    vendors: ["ceph", "cloud"],
    costRange: {
      min: 50000,
      max: 200000
    },
    latencyRequirement: "Minutes"
  }
};

// Production Deployment References
export const productionDeployments = {
  xaiColossus: {
    gpus: 100000,
    storage: "Supermicro all-flash NVMe distributed",
    network: "NVIDIA Spectrum-X Ethernet 400GbE",
    bandwidth: "3.6 Tbps per server",
    deploymentTime: "122 days",
    architecture: "Ethernet over InfiniBand for scale"
  },

  metaRSC: {
    gpus: 16000,
    storage: {
      primary: "175 PB Pure FlashArray",
      cache: "46 PB intermediate cache",
      hot: "10 PB FlashBlade"
    },
    targetBandwidth: "16 TB/s at full scale",
    network: "NVIDIA Quantum 1600 Gb/s InfiniBand"
  },

  microsoftOpenAI: {
    storage: "Azure Blob Storage exabyte-scale",
    performance: "10 Tbps throughput",
    improvements: "20x storage limit increase"
  }
};

// Multi-Tenancy Profiles
export const tenantProfiles = {
  whale: {
    name: "Whale (>1000 GPUs)",
    gpuRange: { min: 1000, max: 200000 },
    capacityPerGPU: 10, // TB per GPU
    bandwidthPerGPU: 3.0, // GB/s per GPU
    sla: "99.9% uptime",
    latency: "<100μs",
    architecture: "Dedicated storage partitions",
    oversubscription: 1.0,
    qosWeight: 1.0
  },

  medium: {
    name: "Medium (100-1000 GPUs)",
    gpuRange: { min: 100, max: 1000 },
    capacityPerGPU: 5, // TB per GPU
    bandwidthPerGPU: 2.0, // GB/s per GPU
    sla: "99.9% uptime",
    latency: "<500μs",
    architecture: "Shared with guaranteed minimums",
    oversubscription: 3.0,
    qosWeight: 0.7
  },

  small: {
    name: "Small (<100 GPUs)",
    gpuRange: { min: 1, max: 100 },
    capacityPerGPU: 1, // TB per GPU
    bandwidthPerGPU: 0.5, // GB/s per GPU
    sla: "99% uptime",
    latency: "<1ms",
    architecture: "Best effort pools",
    oversubscription: 8.0,
    qosWeight: 0.3
  }
};

// Scale Thresholds and Warnings
export const scaleThresholds = {
  networkTransition: {
    gpuCount: 32768,
    warning: "Network architecture must transition to 3-layer fat-tree",
    action: "Implement spine-leaf-core topology"
  },

  metadataBottleneck: {
    gpuCount: 10000,
    warning: "Metadata operations become critical",
    action: "Implement dedicated metadata servers or VAST/WEKA architecture"
  },

  powerLimit: {
    percentage: 6,
    warning: "Storage should not exceed 6% of datacenter power",
    action: "Prioritize Tier 0 local NVMe for power efficiency"
  },

  checkpointStorm: {
    gpuCount: 200000,
    warning: "Checkpoints required every 45 seconds",
    action: "Burst bandwidth must be 10x sustained rate"
  },

  clusterSplit: {
    gpuCount: 100000,
    warning: "Consider multiple independent clusters",
    action: "Implement federated architecture beyond 100k GPUs"
  }
};
