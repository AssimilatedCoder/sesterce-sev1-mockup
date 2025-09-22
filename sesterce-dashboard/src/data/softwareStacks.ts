// Software Stack Pricing and Configuration Data
// Based on 2024-2025 market analysis and production deployments

export interface SoftwareComponent {
  id: string;
  name: string;
  vendor: string;
  category: 'infrastructure' | 'orchestration' | 'gpu-management' | 'workload-scheduler' | 'monitoring' | 'mlops' | 'storage' | 'networking' | 'security';
  licensingModel: 'subscription' | 'perpetual' | 'opensource' | 'freemium';
  costPerGPUPerYear: number;
  setupCost: number;
  minimumLicense?: number; // Minimum license quantity
  dependencies: string[];
  requiredExpertise: 'basic' | 'intermediate' | 'advanced';
  supportTiers?: {
    community: number;
    business: number;
    enterprise: number;
  };
  notes?: string;
}

export interface SoftwareStack {
  id: string;
  name: string;
  description: string;
  targetScale: 'small' | 'medium' | 'large' | 'mega'; // <1k, 1k-10k, 10k-50k, 50k+ GPUs
  components: string[]; // Component IDs
  totalCostPerGPU: number; // Calculated
  requiredFTEs: number;
  deploymentTime: string; // e.g., "2-4 hours", "1-2 days"
  maturityLevel: 'production' | 'stable' | 'emerging';
  vendorLockIn: 'none' | 'low' | 'medium' | 'high';
  complianceSupport: string[]; // e.g., ['HIPAA', 'SOC2', 'SecNumCloud']
}

// Software Component Catalog
export const softwareComponents: Record<string, SoftwareComponent> = {
  // Infrastructure Automation & OS
  'dell-omnia': {
    id: 'dell-omnia',
    name: 'Dell Omnia',
    vendor: 'Dell',
    category: 'infrastructure',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    notes: 'Apache 2.0 license, Dell support contract recommended ($50K-200K/yr)'
  },
  
  'dell-prosupport': {
    id: 'dell-prosupport',
    name: 'Dell ProSupport',
    vendor: 'Dell',
    category: 'infrastructure',
    licensingModel: 'subscription',
    costPerGPUPerYear: 174, // $200K/1152 GPUs
    setupCost: 0,
    dependencies: ['dell-omnia'],
    requiredExpertise: 'basic',
    notes: 'Enterprise support for Omnia deployments'
  },
  
  'ubuntu-pro-full': {
    id: 'ubuntu-pro-full',
    name: 'Ubuntu Pro + 24/7 Support',
    vendor: 'Canonical',
    category: 'infrastructure',
    licensingModel: 'subscription',
    costPerGPUPerYear: 850, // $3,400/node/yr ÷ 4 GPUs per node (18 nodes per 72 GPU system)
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'basic',
    notes: 'Enterprise 24/7/365 support, includes MAAS, Observability, Security. Canonical pricing is per-node ($3,400/node/yr), not per-GPU.'
  },
  
  'ubuntu-pro-infra': {
    id: 'ubuntu-pro-infra',
    name: 'Ubuntu Pro (Infrastructure)',
    vendor: 'Canonical',
    category: 'infrastructure',
    licensingModel: 'subscription',
    costPerGPUPerYear: 188, // $750/node/yr ÷ 4 GPUs per node (18 nodes per 72 GPU system)
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'basic',
    notes: '24/7/365 infrastructure focus support. Canonical pricing is per-node ($750/node/yr), not per-GPU.'
  },
  
  'canonical-maas': {
    id: 'canonical-maas',
    name: 'Canonical MAAS',
    vendor: 'Canonical',
    category: 'infrastructure',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    notes: 'Free core, included with Ubuntu Pro'
  },
  
  'bytplus': {
    id: 'bytplus',
    name: 'BytePlus Platform',
    vendor: 'BytePlus',
    category: 'infrastructure',
    licensingModel: 'subscription',
    costPerGPUPerYear: 260, // €300K for 1152 GPUs average
    setupCost: 100000,
    dependencies: [],
    requiredExpertise: 'basic',
    notes: 'Full stack including orchestration, monitoring, multi-tenancy'
  },
  
  // Configuration Management
  'ansible-tower': {
    id: 'ansible-tower',
    name: 'Ansible Tower',
    vendor: 'Red Hat',
    category: 'infrastructure',
    licensingModel: 'subscription',
    costPerGPUPerYear: 41, // $47K/year for 1152 GPUs
    setupCost: 0,
    minimumLicense: 100,
    dependencies: [],
    requiredExpertise: 'intermediate',
    notes: 'Standard: $14K/yr (100 nodes), Premium: $47K/yr'
  },
  
  'terraform-cloud': {
    id: 'terraform-cloud',
    name: 'Terraform Cloud',
    vendor: 'HashiCorp',
    category: 'infrastructure',
    licensingModel: 'subscription',
    costPerGPUPerYear: 87, // $100K/year for 1152 GPUs
    setupCost: 20000,
    dependencies: [],
    requiredExpertise: 'advanced',
    notes: 'Business tier pricing, scales with usage'
  },
  
  // Kubernetes Distributions
  'vanilla-k8s': {
    id: 'vanilla-k8s',
    name: 'Vanilla Kubernetes',
    vendor: 'CNCF',
    category: 'orchestration',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'advanced',
    notes: 'Requires 2-3 FTE engineers (~$300-450K/yr total)'
  },
  
  'rke2': {
    id: 'rke2',
    name: 'RKE2 (Rancher)',
    vendor: 'SUSE',
    category: 'orchestration',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    supportTiers: {
      community: 0,
      business: 87, // ~$1K/node/yr
      enterprise: 174
    },
    notes: 'Rancher Prime support available'
  },
  
  'openshift': {
    id: 'openshift',
    name: 'Red Hat OpenShift',
    vendor: 'Red Hat',
    category: 'orchestration',
    licensingModel: 'subscription',
    costPerGPUPerYear: 2500, // Mid-range estimate
    setupCost: 50000,
    dependencies: [],
    requiredExpertise: 'intermediate',
    notes: 'Includes enterprise support and additional features'
  },
  
  'canonical-k8s': {
    id: 'canonical-k8s',
    name: 'Canonical Kubernetes',
    vendor: 'Canonical',
    category: 'orchestration',
    licensingModel: 'subscription',
    costPerGPUPerYear: 188, // $750/node/yr ÷ 4 GPUs per node (18 nodes per 72 GPU system)
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    notes: '24/7 support, closest to upstream, NVIDIA validated. Canonical pricing is per-node ($750/node/yr), not per-GPU.'
  },
  
  'spectro-palette': {
    id: 'spectro-palette',
    name: 'Spectro Cloud Palette',
    vendor: 'Spectro Cloud',
    category: 'orchestration',
    licensingModel: 'subscription',
    costPerGPUPerYear: 260, // $300K/1152 GPUs
    setupCost: 50000,
    dependencies: [],
    requiredExpertise: 'basic',
    notes: 'Multi-cluster management included'
  },
  
  // GPU Management & Software
  'nvidia-ai-enterprise': {
    id: 'nvidia-ai-enterprise',
    name: 'NVIDIA AI Enterprise',
    vendor: 'NVIDIA',
    category: 'gpu-management',
    licensingModel: 'subscription',
    costPerGPUPerYear: 3500,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'basic',
    notes: 'Includes drivers, CUDA, containers, support'
  },
  
  'nvidia-base-command': {
    id: 'nvidia-base-command',
    name: 'NVIDIA Base Command',
    vendor: 'NVIDIA',
    category: 'gpu-management',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    supportTiers: {
      community: 0,
      business: 87,
      enterprise: 174
    },
    notes: 'Free up to 8 GPUs/node, enterprise support extra'
  },
  
  'nvidia-gpu-operator': {
    id: 'nvidia-gpu-operator',
    name: 'NVIDIA GPU Operator',
    vendor: 'NVIDIA',
    category: 'gpu-management',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: ['vanilla-k8s'],
    requiredExpertise: 'intermediate',
    notes: 'Apache 2.0, included in NVAIE'
  },
  
  'run-ai': {
    id: 'run-ai',
    name: 'Run:ai',
    vendor: 'Run:ai',
    category: 'gpu-management',
    licensingModel: 'subscription',
    costPerGPUPerYear: 750, // Mid-range estimate
    setupCost: 50000,
    dependencies: ['vanilla-k8s'],
    requiredExpertise: 'intermediate',
    notes: 'Advanced scheduling and fractional GPUs'
  },
  
  // Workload Schedulers
  'slurm': {
    id: 'slurm',
    name: 'Slurm',
    vendor: 'SchedMD',
    category: 'workload-scheduler',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    supportTiers: {
      community: 0,
      business: 13,
      enterprise: 26
    },
    notes: 'SchedMD support contracts available'
  },
  
  'pbs-pro': {
    id: 'pbs-pro',
    name: 'PBS Pro',
    vendor: 'Altair',
    category: 'workload-scheduler',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    supportTiers: {
      community: 0,
      business: 22,
      enterprise: 43
    },
    notes: 'Altair support available'
  },
  
  'lsf': {
    id: 'lsf',
    name: 'IBM Spectrum LSF',
    vendor: 'IBM',
    category: 'workload-scheduler',
    licensingModel: 'subscription',
    costPerGPUPerYear: 350, // Mid-range estimate
    setupCost: 50000,
    dependencies: [],
    requiredExpertise: 'intermediate',
    notes: 'Enterprise HPC scheduler'
  },
  
  'volcano': {
    id: 'volcano',
    name: 'Volcano Scheduler',
    vendor: 'CNCF',
    category: 'workload-scheduler',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: ['vanilla-k8s'],
    requiredExpertise: 'advanced',
    notes: 'Apache 2.0, K8s native batch scheduler'
  },
  
  // Monitoring & Observability
  'prometheus-grafana': {
    id: 'prometheus-grafana',
    name: 'Prometheus + Grafana (OSS)',
    vendor: 'CNCF/Grafana Labs',
    category: 'monitoring',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    notes: 'Grafana Enterprise: $50-100/user/mo available'
  },
  
  'canonical-observability': {
    id: 'canonical-observability',
    name: 'Canonical Observability Stack',
    vendor: 'Canonical',
    category: 'monitoring',
    licensingModel: 'subscription',
    costPerGPUPerYear: 0, // Included with Ubuntu Pro
    setupCost: 0,
    dependencies: ['ubuntu-pro-full'],
    requiredExpertise: 'basic',
    notes: 'Prometheus, Grafana, Loki, Tempo - included with Ubuntu Pro'
  },
  
  'dcgm': {
    id: 'dcgm',
    name: 'NVIDIA DCGM',
    vendor: 'NVIDIA',
    category: 'monitoring',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'basic',
    notes: 'Apache 2.0, GPU-specific metrics'
  },
  
  'datadog': {
    id: 'datadog',
    name: 'Datadog',
    vendor: 'Datadog',
    category: 'monitoring',
    licensingModel: 'subscription',
    costPerGPUPerYear: 1800, // $150/host/month average
    setupCost: 10000,
    dependencies: [],
    requiredExpertise: 'basic',
    notes: '$100-200/host/month pricing'
  },
  
  'elastic-stack': {
    id: 'elastic-stack',
    name: 'Elastic Stack',
    vendor: 'Elastic',
    category: 'monitoring',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    supportTiers: {
      community: 0,
      business: 54,
      enterprise: 109
    },
    notes: 'Basic free, Gold/Platinum tiers'
  },
  
  // MLOps Platforms
  'kubeflow': {
    id: 'kubeflow',
    name: 'Kubeflow (OSS)',
    vendor: 'Google/CNCF',
    category: 'mlops',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: ['vanilla-k8s'],
    requiredExpertise: 'advanced',
    notes: 'Apache 2.0, requires K8s expertise'
  },
  
  'kubeflow-enterprise': {
    id: 'kubeflow-enterprise',
    name: 'Kubeflow Enterprise Support',
    vendor: 'Canonical',
    category: 'mlops',
    licensingModel: 'subscription',
    costPerGPUPerYear: 250, // $1,000/node/yr ÷ 4 GPUs per node (18 nodes per 72 GPU system)
    setupCost: 0,
    dependencies: ['kubeflow'],
    requiredExpertise: 'intermediate',
    notes: '24/7 support via Canonical. Pricing is per-node ($1,000/node/yr), not per-GPU.'
  },
  
  'mlflow': {
    id: 'mlflow',
    name: 'MLflow (OSS)',
    vendor: 'Databricks',
    category: 'mlops',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    notes: 'Apache 2.0, Databricks hosted version available'
  },
  
  'mlflow-enterprise': {
    id: 'mlflow-enterprise',
    name: 'MLflow Enterprise Support',
    vendor: 'Canonical',
    category: 'mlops',
    licensingModel: 'subscription',
    costPerGPUPerYear: 125, // $500/node/yr ÷ 4 GPUs per node (18 nodes per 72 GPU system)
    setupCost: 0,
    dependencies: ['mlflow'],
    requiredExpertise: 'basic',
    notes: '24/7 support via Canonical. Pricing is per-node ($500/node/yr), not per-GPU.'
  },
  
  'wandb': {
    id: 'wandb',
    name: 'Weights & Biases',
    vendor: 'Weights & Biases',
    category: 'mlops',
    licensingModel: 'subscription',
    costPerGPUPerYear: 130, // $150K/1152 GPUs average
    setupCost: 20000,
    dependencies: [],
    requiredExpertise: 'basic',
    notes: 'Teams pricing, usage-based'
  },
  
  // Storage Management Software (not storage hardware)
  'ceph-management': {
    id: 'ceph-management',
    name: 'Ceph Management Tools',
    vendor: 'Canonical/Red Hat',
    category: 'storage',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'advanced',
    supportTiers: {
      community: 0,
      business: 50, // Canonical support
      enterprise: 100 // Red Hat support
    },
    notes: 'Management and monitoring tools for Ceph clusters'
  },
  
  // Security Components
  'falco': {
    id: 'falco',
    name: 'Falco Runtime Security',
    vendor: 'CNCF',
    category: 'security',
    licensingModel: 'opensource',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: ['vanilla-k8s'],
    requiredExpertise: 'advanced',
    notes: 'Apache 2.0, runtime security monitoring'
  },
  
  'vault': {
    id: 'vault',
    name: 'HashiCorp Vault',
    vendor: 'HashiCorp',
    category: 'security',
    licensingModel: 'freemium',
    costPerGPUPerYear: 0,
    setupCost: 0,
    dependencies: [],
    requiredExpertise: 'intermediate',
    supportTiers: {
      community: 0,
      business: 43,
      enterprise: 87
    },
    notes: 'Secrets management platform'
  }
};

// Pre-defined Software Stacks
export const softwareStacks: Record<string, SoftwareStack> = {
  'omnia-enterprise': {
    id: 'omnia-enterprise',
    name: 'Dell Omnia Enterprise Stack',
    description: 'Open source focused with enterprise support',
    targetScale: 'large',
    components: [
      'dell-omnia',
      'dell-prosupport',
      'ansible-tower',
      'rke2',
      'nvidia-ai-enterprise',
      'volcano',
      'prometheus-grafana',
      'dcgm',
      'kubeflow',
      'ceph-management'
    ],
    totalCostPerGPU: 3700, // Reduced without storage hardware costs
    requiredFTEs: 2,
    deploymentTime: '2-4 hours',
    maturityLevel: 'production',
    vendorLockIn: 'low',
    complianceSupport: ['SOC2', 'HIPAA']
  },
  
  'nvidia-maximum': {
    id: 'nvidia-maximum',
    name: 'NVIDIA Maximum Performance Stack',
    description: 'Full NVIDIA stack for maximum performance',
    targetScale: 'mega',
    components: [
      'nvidia-base-command',
      'terraform-cloud',
      'vanilla-k8s',
      'nvidia-gpu-operator',
      'nvidia-ai-enterprise',
      'run-ai',
      'dcgm',
      'datadog',
      'wandb'
    ],
    totalCostPerGPU: 3700, // Reduced without storage hardware costs
    requiredFTEs: 3,
    deploymentTime: '1-2 days',
    maturityLevel: 'production',
    vendorLockIn: 'high',
    complianceSupport: ['SOC2', 'HIPAA', 'ISO27001']
  },
  
  'bytplus-integrated': {
    id: 'bytplus-integrated',
    name: 'BytePlus Integrated Platform',
    description: 'ByteDance integrated platform (Chinese vendor - compliance limitations)',
    targetScale: 'large',
    components: [
      'bytplus',
      'nvidia-ai-enterprise',
      'ceph-management'
    ],
    totalCostPerGPU: 3760, // Reduced without storage hardware costs
    requiredFTEs: 1,
    deploymentTime: '4-8 hours',
    maturityLevel: 'stable',
    vendorLockIn: 'medium',
    complianceSupport: [] // ByteDance/TikTok - Chinese company, NOT suitable for European compliance
  },
  
  'opensource-optimized': {
    id: 'opensource-optimized',
    name: 'Open Source Cost-Optimized Stack',
    description: 'Maximum cost efficiency with open source',
    targetScale: 'medium',
    components: [
      'canonical-maas',
      'vanilla-k8s',
      'nvidia-gpu-operator',
      'volcano',
      'slurm',
      'prometheus-grafana',
      'dcgm',
      'mlflow',
      'kubeflow',
      'ceph-management',
      'falco'
    ],
    totalCostPerGPU: 500,
    requiredFTEs: 4,
    deploymentTime: '2-3 days',
    maturityLevel: 'stable',
    vendorLockIn: 'none',
    complianceSupport: []
  },
  
  'canonical-enterprise': {
    id: 'canonical-enterprise',
    name: 'Canonical Enterprise 24/7 Stack',
    description: 'Full enterprise 24/7 support stack based on Ubuntu Pro',
    targetScale: 'large',
    components: [
      'ubuntu-pro-full',
      'canonical-k8s',
      'nvidia-ai-enterprise',
      'volcano',
      'kubeflow-enterprise',
      'mlflow-enterprise',
      'canonical-observability',
      'dcgm',
      'vault'
    ],
    totalCostPerGPU: 4788, // Ubuntu Pro Full (850) + K8s (188) + NVIDIA AI Enterprise (3500) + MLOps (250)
    requiredFTEs: 2,
    deploymentTime: '1-2 days',
    maturityLevel: 'production',
    vendorLockIn: 'low',
    complianceSupport: ['SOC2', 'HIPAA', 'FIPS', 'CIS', 'DISA-STIG']
  },
  
  'hybrid-balanced': {
    id: 'hybrid-balanced',
    name: 'Hybrid Balanced Stack',
    description: 'Balance of cost, performance, and support',
    targetScale: 'large',
    components: [
      'ubuntu-pro-infra',
      'canonical-k8s',
      'nvidia-ai-enterprise',
      'volcano',
      'prometheus-grafana',
      'dcgm',
      'elastic-stack',
      'mlflow',
      'vault'
    ],
    totalCostPerGPU: 3876, // Corrected: Ubuntu Pro Infra (188) + K8s (188) + NVIDIA AI Enterprise (3500)
    requiredFTEs: 2.5,
    deploymentTime: '1-2 days',
    maturityLevel: 'production',
    vendorLockIn: 'medium',
    complianceSupport: ['SOC2', 'HIPAA']
  }
};

// Stack recommendation logic
export function recommendStack(requirements: {
  gpuCount: number;
  budget: 'low' | 'medium' | 'high' | 'unlimited';
  expertise: 'basic' | 'intermediate' | 'advanced';
  supportNeeds: 'community' | 'business' | 'enterprise';
  complianceRequirements: string[];
  primaryUseCase: 'training' | 'inference' | 'mixed';
  multiTenancy: boolean;
  vendorPreference?: 'nvidia' | 'dell' | 'opensource' | 'agnostic';
}): string {
  // Compliance-driven selection
  if (requirements.complianceRequirements.includes('SecNumCloud')) {
    // SecNumCloud requires European digital sovereignty - exclude Chinese vendors
    return 'hybrid-balanced'; // European-friendly stack with Canonical/SUSE
  }
  
  // Budget-driven selection
  if (requirements.budget === 'low' && requirements.expertise === 'advanced') {
    return 'opensource-optimized';
  }
  
  if (requirements.budget === 'unlimited' && requirements.supportNeeds === 'enterprise') {
    return 'nvidia-maximum';
  }
  
  // Enterprise support needs
  if (requirements.supportNeeds === 'enterprise' && requirements.gpuCount >= 1000) {
    return 'canonical-enterprise'; // Best enterprise 24/7 support
  }
  
  // Vendor preference
  if (requirements.vendorPreference === 'dell') {
    return 'omnia-enterprise';
  }
  
  if (requirements.vendorPreference === 'nvidia') {
    return 'nvidia-maximum';
  }
  
  // Scale-based selection
  if (requirements.gpuCount < 1000) {
    return requirements.budget === 'low' ? 'opensource-optimized' : 'hybrid-balanced';
  }
  
  if (requirements.gpuCount >= 50000) {
    return requirements.supportNeeds === 'enterprise' ? 'nvidia-maximum' : 'omnia-enterprise';
  }
  
  // Default balanced approach
  return 'canonical-enterprise';
}

// Calculate actual costs including dependencies
// NOTE: Canonical pricing is per-node, not per-GPU. We convert to per-GPU for TCO calculations
// based on GB200 NVL72 architecture: 18 nodes per 72 GPUs (4 GPUs per node)
export function calculateStackCost(
  stackId: string, 
  gpuCount: number, 
  years: number = 3,
  supportTier: 'community' | 'business' | 'enterprise' = 'business'
): {
  upfrontCost: number;
  annualCost: number;
  totalTCO: number;
  perGPUCost: number;
  breakdown: Array<{
    component: string;
    category: string;
    annualCost: number;
    setupCost: number;
  }>;
} {
  const stack = softwareStacks[stackId];
  if (!stack) throw new Error(`Stack ${stackId} not found`);
  
  let upfrontCost = 0;
  let annualCost = 0;
  const breakdown: any[] = [];
  
  // Calculate costs for each component
  stack.components.forEach(componentId => {
    const component = softwareComponents[componentId];
    if (!component) return;
    
    // For per-node pricing (Canonical components), calculate based on nodes, not GPUs
    let componentAnnualCost;
    if (['ubuntu-pro-full', 'ubuntu-pro-infra', 'canonical-k8s', 'kubeflow-enterprise', 'mlflow-enterprise', 'canonical-observability'].includes(componentId)) {
      // These are per-node pricing: calculate nodes first (4 GPUs per node in GB200 NVL72)
      const nodeCount = Math.ceil(gpuCount / 4);
      const actualNodeCost = component.costPerGPUPerYear * 4; // Convert back to per-node cost
      componentAnnualCost = actualNodeCost * nodeCount;
    } else {
      // Standard per-GPU pricing
      componentAnnualCost = component.costPerGPUPerYear * gpuCount;
    }
    
    // Apply support tier pricing if available
    if (component.supportTiers && supportTier !== 'community') {
      if (['ubuntu-pro-full', 'ubuntu-pro-infra', 'canonical-k8s', 'kubeflow-enterprise', 'mlflow-enterprise'].includes(componentId)) {
        const nodeCount = Math.ceil(gpuCount / 4);
        componentAnnualCost = component.supportTiers[supportTier] * 4 * nodeCount; // Per-node tier pricing
      } else {
        componentAnnualCost = component.supportTiers[supportTier] * gpuCount; // Per-GPU tier pricing
      }
    }
    
    upfrontCost += component.setupCost;
    annualCost += componentAnnualCost;
    
    breakdown.push({
      component: component.name,
      category: component.category,
      annualCost: componentAnnualCost,
      setupCost: component.setupCost
    });
  });
  
  // Add FTE costs
  const fteAnnualCost = stack.requiredFTEs * 150000; // $150K per FTE
  annualCost += fteAnnualCost;
  
  breakdown.push({
    component: 'Engineering Staff',
    category: 'operational',
    annualCost: fteAnnualCost,
    setupCost: 0
  });
  
  const totalTCO = upfrontCost + (annualCost * years);
  const perGPUCost = totalTCO / gpuCount / years;
  
  return {
    upfrontCost,
    annualCost,
    totalTCO,
    perGPUCost,
    breakdown
  };
}

// Stack optimization recommendations
export function optimizeStack(
  currentStackId: string,
  requirements: any
): Array<{
  recommendation: string;
  currentCost: number;
  alternativeCost: number;
  savings: number;
  tradeoffs: string[];
}> {
  const recommendations: any[] = [];
  const currentCost = calculateStackCost(currentStackId, requirements.gpuCount);
  
  // Check all other stacks
  Object.entries(softwareStacks).forEach(([stackId, stack]) => {
    if (stackId === currentStackId) return;
    
    const altCost = calculateStackCost(stackId, requirements.gpuCount);
    
    if (altCost.perGPUCost < currentCost.perGPUCost * 0.8) {
      recommendations.push({
        recommendation: `Switch to ${stack.name}`,
        currentCost: currentCost.perGPUCost,
        alternativeCost: altCost.perGPUCost,
        savings: currentCost.perGPUCost - altCost.perGPUCost,
        tradeoffs: [
          `Requires ${stack.requiredFTEs} FTEs vs current`,
          `${stack.vendorLockIn} vendor lock-in`,
          `${stack.deploymentTime} deployment time`
        ]
      });
    }
  });
  
  return recommendations;
}
