// Software Stack Data and Pricing

import { SoftwareComponent, SoftwareStack } from '../types/softwareStack';

// Individual Software Components
export const softwareComponents: Record<string, SoftwareComponent> = {
  // Infrastructure Automation
  dellOmnia: {
    category: 'infrastructure',
    software: 'Dell Omnia',
    vendor: 'Dell',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'Open-source bare metal provisioning and management',
    includesSupport: false
  },
  dellOmniaSupport: {
    category: 'support',
    software: 'Dell ProSupport',
    vendor: 'Dell',
    licensingModel: 'subscription',
    costPerGPUPerYear: 174, // 200K/1152 GPUs
    setupCost: 0,
    dependencies: ['dellOmnia'],
    description: 'Enterprise support for Dell Omnia',
    includesSupport: true,
    supportTier: 'enterprise'
  },
  canonicalMAAS: {
    category: 'infrastructure',
    software: 'Canonical MAAS',
    vendor: 'Canonical',
    licensingModel: 'freemium',
    costPerGPUPerYear: 65, // Ubuntu Advantage pricing
    setupCost: 0,
    dependencies: [],
    description: 'Ubuntu Metal as a Service for bare metal provisioning',
    includesSupport: true,
    supportTier: 'business'
  },
  bytePlus: {
    category: 'infrastructure',
    software: 'BytePlus Platform',
    vendor: 'BytePlus',
    licensingModel: 'subscription',
    costPerGPUPerYear: 434, // €500K/1152 GPUs
    setupCost: 50000,
    dependencies: [],
    description: 'Full stack including orchestration, monitoring, multi-tenancy',
    includesSupport: true,
    supportTier: 'enterprise'
  },

  // Configuration Management
  ansibleTower: {
    category: 'configuration',
    software: 'Ansible Tower',
    vendor: 'Red Hat',
    licensingModel: 'subscription',
    costPerGPUPerYear: 41, // $47K/1152 GPUs (Premium)
    setupCost: 0,
    dependencies: [],
    description: 'Enterprise automation platform',
    includesSupport: true,
    supportTier: 'enterprise'
  },
  ansibleAWX: {
    category: 'configuration',
    software: 'Ansible AWX',
    vendor: 'Community',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'Open-source version of Ansible Tower',
    includesSupport: false
  },
  terraformCloud: {
    category: 'configuration',
    software: 'Terraform Cloud',
    vendor: 'HashiCorp',
    licensingModel: 'subscription',
    costPerGPUPerYear: 87, // $100K/1152 GPUs (mid-range)
    setupCost: 10000,
    dependencies: [],
    description: 'Infrastructure as Code platform',
    includesSupport: true,
    supportTier: 'business'
  },

  // Kubernetes Distributions
  vanillaK8s: {
    category: 'kubernetes',
    software: 'Vanilla Kubernetes',
    vendor: 'CNCF',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'Pure open-source Kubernetes',
    includesSupport: false
  },
  rke2: {
    category: 'kubernetes',
    software: 'RKE2',
    vendor: 'Rancher/SUSE',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'Security-focused Kubernetes distribution',
    includesSupport: false
  },
  rancherPrime: {
    category: 'support',
    software: 'Rancher Prime Support',
    vendor: 'SUSE',
    licensingModel: 'subscription',
    costPerGPUPerYear: 87, // $100K/1152 GPUs
    setupCost: 0,
    dependencies: ['rke2'],
    description: 'Enterprise support for RKE2/Rancher',
    includesSupport: true,
    supportTier: 'enterprise'
  },
  openshift: {
    category: 'kubernetes',
    software: 'Red Hat OpenShift',
    vendor: 'Red Hat',
    licensingModel: 'subscription',
    costPerGPUPerYear: 2000, // Mid-range enterprise pricing
    setupCost: 50000,
    dependencies: [],
    description: 'Enterprise Kubernetes platform',
    includesSupport: true,
    supportTier: 'enterprise'
  },
  canonicalK8s: {
    category: 'kubernetes',
    software: 'Canonical Kubernetes',
    vendor: 'Canonical',
    licensingModel: 'subscription',
    costPerGPUPerYear: 450, // Mid-range Ubuntu pricing
    setupCost: 0,
    dependencies: [],
    description: 'Ubuntu-based Kubernetes with support',
    includesSupport: true,
    supportTier: 'business'
  },
  spectroCloudPalette: {
    category: 'kubernetes',
    software: 'Spectro Cloud Palette',
    vendor: 'Spectro Cloud',
    licensingModel: 'subscription',
    costPerGPUPerYear: 260, // $300K/1152 GPUs
    setupCost: 25000,
    dependencies: [],
    description: 'Multi-cluster Kubernetes management platform',
    includesSupport: true,
    supportTier: 'enterprise'
  },

  // GPU Management
  nvidiaAIEnterprise: {
    category: 'gpu',
    software: 'NVIDIA AI Enterprise',
    vendor: 'NVIDIA',
    licensingModel: 'subscription',
    costPerGPUPerYear: 3500,
    setupCost: 0,
    dependencies: [],
    description: 'Full NVIDIA software stack with enterprise support',
    includesSupport: true,
    supportTier: 'enterprise'
  },
  nvidiaBaseCommand: {
    category: 'gpu',
    software: 'NVIDIA Base Command',
    vendor: 'NVIDIA',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0, // Free tier
    setupCost: 0,
    dependencies: [],
    description: 'NVIDIA cluster management (free up to 8 GPUs/node)',
    includesSupport: false
  },
  nvidiaGPUOperator: {
    category: 'gpu',
    software: 'NVIDIA GPU Operator',
    vendor: 'NVIDIA',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: ['kubernetes'],
    description: 'Kubernetes operator for GPU management',
    includesSupport: false
  },
  runAI: {
    category: 'scheduler',
    software: 'Run:ai',
    vendor: 'Run:ai',
    licensingModel: 'subscription',
    costPerGPUPerYear: 750, // Mid-range pricing
    setupCost: 50000,
    dependencies: ['kubernetes', 'gpu'],
    description: 'Advanced GPU scheduling and fractional allocation',
    includesSupport: true,
    supportTier: 'enterprise'
  },

  // Workload Schedulers
  slurm: {
    category: 'scheduler',
    software: 'Slurm',
    vendor: 'SchedMD',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'HPC workload manager',
    includesSupport: false
  },
  slurmSupport: {
    category: 'support',
    software: 'Slurm Support',
    vendor: 'SchedMD',
    licensingModel: 'subscription',
    costPerGPUPerYear: 26, // $30K/1152 GPUs
    setupCost: 0,
    dependencies: ['slurm'],
    description: 'Commercial support for Slurm',
    includesSupport: true,
    supportTier: 'business'
  },
  volcanoScheduler: {
    category: 'scheduler',
    software: 'Volcano Scheduler',
    vendor: 'CNCF',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: ['kubernetes'],
    description: 'Kubernetes-native batch scheduler',
    includesSupport: false
  },

  // Monitoring
  prometheusGrafana: {
    category: 'monitoring',
    software: 'Prometheus + Grafana',
    vendor: 'CNCF/Grafana Labs',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'Open-source monitoring stack',
    includesSupport: false
  },
  grafanaEnterprise: {
    category: 'monitoring',
    software: 'Grafana Enterprise',
    vendor: 'Grafana Labs',
    licensingModel: 'subscription',
    costPerGPUPerYear: 52, // $60K/1152 GPUs (100 users)
    setupCost: 0,
    dependencies: ['prometheusGrafana'],
    description: 'Enterprise features and support for Grafana',
    includesSupport: true,
    supportTier: 'enterprise'
  },
  nvidiaDCGM: {
    category: 'monitoring',
    software: 'NVIDIA DCGM',
    vendor: 'NVIDIA',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'GPU-specific monitoring and management',
    includesSupport: false
  },
  datadog: {
    category: 'monitoring',
    software: 'Datadog',
    vendor: 'Datadog',
    licensingModel: 'subscription',
    costPerGPUPerYear: 1800, // $150/host/month average
    setupCost: 10000,
    dependencies: [],
    description: 'Cloud monitoring platform',
    includesSupport: true,
    supportTier: 'enterprise'
  },

  // MLOps
  kubeflow: {
    category: 'mlops',
    software: 'Kubeflow',
    vendor: 'Google/CNCF',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: ['kubernetes'],
    description: 'ML workflows on Kubernetes',
    includesSupport: false
  },
  mlflow: {
    category: 'mlops',
    software: 'MLflow',
    vendor: 'Databricks',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'ML lifecycle management',
    includesSupport: false
  },
  wandb: {
    category: 'mlops',
    software: 'Weights & Biases',
    vendor: 'W&B',
    licensingModel: 'subscription',
    costPerGPUPerYear: 130, // $150K/1152 GPUs
    setupCost: 10000,
    dependencies: [],
    description: 'ML experiment tracking and optimization',
    includesSupport: true,
    supportTier: 'business'
  },

  // Storage
  vastData: {
    category: 'storage',
    software: 'VAST Data Universal Storage',
    vendor: 'VAST Data',
    licensingModel: 'subscription',
    costPerGPUPerYear: 3000, // Capacity-based, estimated per GPU
    setupCost: 100000,
    dependencies: [],
    description: 'High-performance all-flash storage',
    includesSupport: true,
    supportTier: 'enterprise'
  },
  weka: {
    category: 'storage',
    software: 'WEKA',
    vendor: 'WEKA',
    licensingModel: 'subscription',
    costPerGPUPerYear: 3500, // Performance tier pricing
    setupCost: 50000,
    dependencies: [],
    description: 'Software-defined parallel file system',
    includesSupport: true,
    supportTier: 'enterprise'
  },
  ceph: {
    category: 'storage',
    software: 'Ceph',
    vendor: 'Ceph Foundation',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'Open-source distributed storage',
    includesSupport: false
  },
  canonicalCephSupport: {
    category: 'support',
    software: 'Ubuntu Ceph Support',
    vendor: 'Canonical',
    licensingModel: 'subscription',
    costPerGPUPerYear: 87, // Ubuntu Advantage pricing
    setupCost: 0,
    dependencies: ['ceph'],
    description: 'Canonical support for Ceph',
    includesSupport: true,
    supportTier: 'business'
  },
  minio: {
    category: 'storage',
    software: 'MinIO',
    vendor: 'MinIO',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    description: 'S3-compatible object storage',
    includesSupport: false
  }
};

// Pre-defined Software Stacks
export const softwareStacks: Record<string, SoftwareStack> = {
  omniaStack: {
    id: 'omnia',
    name: 'Dell Omnia Enterprise Stack',
    description: 'Open-source focused stack with Dell hardware optimization',
    components: [
      softwareComponents.dellOmnia,
      softwareComponents.dellOmniaSupport,
      softwareComponents.ansibleTower,
      softwareComponents.rke2,
      softwareComponents.rancherPrime,
      softwareComponents.nvidiaAIEnterprise,
      softwareComponents.volcanoScheduler,
      softwareComponents.slurm,
      softwareComponents.prometheusGrafana,
      softwareComponents.nvidiaDCGM,
      softwareComponents.kubeflow,
      softwareComponents.ceph,
      softwareComponents.canonicalCephSupport
    ],
    totalCostPerGPU: 3989, // Sum of all components
    requiredFTEs: 2,
    setupTime: '2-4 hours',
    pros: [
      'Rapid deployment with Dell hardware',
      'Strong community support',
      'Cost-effective with open-source components',
      'Proven at scale'
    ],
    cons: [
      'Requires Dell hardware for optimal performance',
      'Limited multi-vendor support',
      'Requires Linux/Ansible expertise'
    ],
    bestFor: [
      'Dell hardware environments',
      'Teams with strong Linux expertise',
      'Cost-conscious deployments'
    ]
  },

  nvidiaStack: {
    id: 'nvidia',
    name: 'NVIDIA-Centric Performance Stack',
    description: 'Maximum performance stack with full NVIDIA optimization',
    components: [
      softwareComponents.nvidiaBaseCommand,
      softwareComponents.terraformCloud,
      softwareComponents.vanillaK8s,
      softwareComponents.nvidiaGPUOperator,
      softwareComponents.nvidiaAIEnterprise,
      softwareComponents.runAI,
      softwareComponents.datadog,
      softwareComponents.nvidiaDCGM,
      softwareComponents.wandb,
      softwareComponents.vastData
    ],
    totalCostPerGPU: 5667,
    requiredFTEs: 3,
    setupTime: '1-2 weeks',
    pros: [
      'Maximum GPU performance and utilization',
      'Full vendor support from NVIDIA',
      'Advanced scheduling with Run:ai',
      'Enterprise-grade monitoring'
    ],
    cons: [
      'High licensing costs',
      'Vendor lock-in to NVIDIA ecosystem',
      'Complex setup and configuration'
    ],
    bestFor: [
      'Performance-critical workloads',
      'Organizations with large budgets',
      'Teams requiring enterprise support'
    ]
  },

  bytePlusStack: {
    id: 'byteplus',
    name: 'BytePlus Integrated Platform',
    description: 'Turnkey solution with European compliance focus',
    components: [
      softwareComponents.bytePlus, // Includes MAAS, Palette, monitoring
      softwareComponents.nvidiaAIEnterprise,
      softwareComponents.volcanoScheduler,
      softwareComponents.ceph,
      softwareComponents.vastData // Optional upgrade
    ],
    totalCostPerGPU: 3934,
    requiredFTEs: 1,
    setupTime: '2-3 days',
    pros: [
      'Integrated turnkey solution',
      'SecNumCloud compliance pathway',
      'Minimal operational overhead',
      'Includes multi-tenancy out of the box'
    ],
    cons: [
      'Vendor lock-in to BytePlus',
      'Less customization flexibility',
      'European market focus'
    ],
    bestFor: [
      'European organizations',
      'Teams needing compliance (SecNumCloud)',
      'Rapid deployment requirements'
    ]
  },

  hybridOpenStack: {
    id: 'hybrid',
    name: 'Hybrid Open-Source Stack',
    description: 'Cost-optimized stack using primarily open-source components',
    components: [
      softwareComponents.canonicalMAAS,
      softwareComponents.ansibleAWX,
      softwareComponents.rke2,
      softwareComponents.nvidiaGPUOperator,
      softwareComponents.volcanoScheduler,
      softwareComponents.slurm,
      softwareComponents.prometheusGrafana,
      softwareComponents.nvidiaDCGM,
      softwareComponents.mlflow,
      softwareComponents.ceph,
      softwareComponents.minio
    ],
    totalCostPerGPU: 65, // Only MAAS support
    requiredFTEs: 4,
    setupTime: '1-2 weeks',
    pros: [
      'Extremely cost-effective',
      'No vendor lock-in',
      'Full customization flexibility',
      'Strong community support'
    ],
    cons: [
      'Requires significant in-house expertise',
      'No enterprise support SLAs',
      'Higher operational overhead',
      'Longer setup time'
    ],
    bestFor: [
      'Development and testing environments',
      'Organizations with strong technical teams',
      'Budget-critical deployments',
      'Proof of concept clusters'
    ]
  },

  enterpriseStack: {
    id: 'enterprise',
    name: 'Full Enterprise Stack',
    description: 'Maximum support and features for mission-critical deployments',
    components: [
      softwareComponents.canonicalMAAS,
      softwareComponents.ansibleTower,
      softwareComponents.openshift,
      softwareComponents.nvidiaAIEnterprise,
      softwareComponents.runAI,
      softwareComponents.slurmSupport,
      softwareComponents.datadog,
      softwareComponents.grafanaEnterprise,
      softwareComponents.wandb,
      softwareComponents.weka
    ],
    totalCostPerGPU: 8358,
    requiredFTEs: 2,
    setupTime: '2-3 weeks',
    pros: [
      'Enterprise support for all components',
      'Maximum reliability and uptime',
      'Advanced features and capabilities',
      'Compliance-ready'
    ],
    cons: [
      'Very high cost',
      'Complex licensing management',
      'Potential over-engineering for smaller deployments'
    ],
    bestFor: [
      'Fortune 500 companies',
      'Mission-critical AI workloads',
      'Regulated industries',
      'Maximum uptime requirements'
    ]
  }
};
