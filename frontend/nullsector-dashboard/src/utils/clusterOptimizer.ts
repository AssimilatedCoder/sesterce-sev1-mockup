/**
 * Cluster Optimization Engine for Basic Configuration Mode
 * Automatically optimizes service tiers and infrastructure based on constraints
 */
import { gpuSpecs } from '../data/gpuSpecs';
export interface OptimizationConstraints {
  gpuPowerBudget: number;
  maxGPUsFromPower: number;
  powerConstrained: boolean;
  storagePerGPU: number;
  storageConstrained: boolean;
  scale: 'small' | 'medium' | 'large' | 'hyperscale';
  gpuModel: string;
}

export interface ServiceTierAllocation {
  bareMetalWhale: number;
  orchestratedK8s: number;
  managedMLOps: number;
  inferenceService: number;
}

export interface StorageTierAllocation {
  ultraHighPerf: number;
  highPerf: number;
  mediumPerf: number;
  capacityTier: number;
  objectStore: number;
}

export interface InfrastructureRecommendations {
  network: string;
  cooling: string;
  racks: number;
}

export interface FinancialMetrics {
  capex: number; // In millions
  annualOpex: number; // In millions
  annualRevenue: number; // In millions
  totalTCO: number; // 5-year TCO in millions
  roi: number; // Percentage
  paybackMonths: number;
}

export interface OptimizationReason {
  icon: string;
  text: string;
}

export interface OptimizedConfiguration {
  serviceTiers: ServiceTierAllocation;
  storageTiers: StorageTierAllocation;
  infrastructure: InfrastructureRecommendations;
  financial: FinancialMetrics;
  reasoning: OptimizationReason[];
  constraints: OptimizationConstraints;
}

 

export class ClusterOptimizer {
  private gpus: number;
  private power: number; // in kW
  private storage: number; // in PB
  private constraints: OptimizationConstraints;
  private selectedGpuKey?: string;
  private selectedNetworking?: string;

  constructor(gpus: number, powerMW: number, storagePB: number, gpuKey?: string, networkingType?: string) {
    this.gpus = gpus;
    this.power = powerMW * 1000; // Convert MW to kW
    this.storage = storagePB;
    this.selectedGpuKey = gpuKey;
    this.selectedNetworking = networkingType;
    this.constraints = this.analyzeConstraints();
  }

  private analyzeConstraints(): OptimizationConstraints {
    const gpuPowerBudget = this.power * 0.7; // 70% for GPUs
    const maxGPUsFromPower = Math.floor(gpuPowerBudget / 0.7); // 700W per GPU average
    const powerConstrained = this.gpus * 0.7 > gpuPowerBudget;
    
    const storagePerGPU = (this.storage * 1000) / this.gpus; // TB per GPU
    const storageConstrained = storagePerGPU < 20; // Less than 20TB per GPU is constrained
    
    const selectedName = this.selectedGpuKey && gpuSpecs[this.selectedGpuKey] ? gpuSpecs[this.selectedGpuKey].name : this.selectOptimalGPU(powerConstrained);
    return {
      gpuPowerBudget,
      maxGPUsFromPower,
      powerConstrained,
      storagePerGPU,
      storageConstrained,
      scale: this.categorizeScale(),
      gpuModel: selectedName
    };
  }

  private categorizeScale(): 'small' | 'medium' | 'large' | 'hyperscale' {
    if (this.gpus >= 10000) return 'hyperscale';
    if (this.gpus >= 2000) return 'large';
    if (this.gpus >= 500) return 'medium';
    return 'small';
  }

  private selectOptimalGPU(powerConstrained: boolean): string {
    const powerPerGPU = (this.power * 0.7) / this.gpus; // kW per GPU
    const powerPerGPUWatts = powerPerGPU * 1000;

    // Prefer user-selected GPU if provided
    if (this.selectedGpuKey && gpuSpecs[this.selectedGpuKey]) {
      return gpuSpecs[this.selectedGpuKey].name;
    }

    if (this.constraints?.scale === 'hyperscale' && powerPerGPUWatts >= 700) {
      return 'H100 SXM'; // Best for large training
    } else if (this.constraints?.scale === 'large' && powerPerGPUWatts >= 500) {
      return 'H100 PCIe'; // Good balance
    } else if (powerPerGPUWatts >= 400) {
      return 'A100 80GB'; // Efficient option
    } else {
      return 'L40S'; // Inference optimized, lower power
    }
  }

  private optimizeServiceTiers(): ServiceTierAllocation {
    let tiers: ServiceTierAllocation = {
      bareMetalWhale: 0,
      orchestratedK8s: 0,
      managedMLOps: 0,
      inferenceService: 0
    };

    // Decision tree based on constraints and scale
    if (this.constraints.scale === 'hyperscale') {
      // Hyperscale: can support whales
      if (!this.constraints.powerConstrained && !this.constraints.storageConstrained) {
        // Optimal conditions - maximize whale revenue
        tiers.bareMetalWhale = 30;
        tiers.orchestratedK8s = 25;
        tiers.managedMLOps = 30;
        tiers.inferenceService = 15;
      } else if (this.constraints.storageConstrained) {
        // Storage limited - focus on compute-intensive
        tiers.bareMetalWhale = 20;
        tiers.orchestratedK8s = 30;
        tiers.managedMLOps = 20;
        tiers.inferenceService = 30;
      } else {
        // Power limited - focus on efficiency
        tiers.bareMetalWhale = 15;
        tiers.orchestratedK8s = 25;
        tiers.managedMLOps = 35;
        tiers.inferenceService = 25;
      }
    } else if (this.constraints.scale === 'large') {
      // Large scale: limited whale capacity
      if (!this.constraints.storageConstrained) {
        tiers.bareMetalWhale = 10;
        tiers.orchestratedK8s = 30;
        tiers.managedMLOps = 40; // Sweet spot for this scale
        tiers.inferenceService = 20;
      } else {
        tiers.bareMetalWhale = 5;
        tiers.orchestratedK8s = 25;
        tiers.managedMLOps = 35;
        tiers.inferenceService = 35; // More inference when storage limited
      }
    } else if (this.constraints.scale === 'medium') {
      // Medium scale: focus on managed services
      tiers.bareMetalWhale = 0; // Too small for whales
      tiers.orchestratedK8s = 25;
      tiers.managedMLOps = 50; // Primary focus
      tiers.inferenceService = 25;
    } else {
      // Small scale: inference and MLOps only
      tiers.bareMetalWhale = 0;
      tiers.orchestratedK8s = 15;
      tiers.managedMLOps = 45;
      tiers.inferenceService = 40; // Maximize inference
    }

    // Adjust based on GPU model
    if (this.constraints.gpuModel.includes('L40')) {
      // Inference optimized GPU - shift allocation
      const trainingReduction = (tiers.bareMetalWhale + tiers.orchestratedK8s) * 0.3;
      tiers.bareMetalWhale *= 0.7;
      tiers.orchestratedK8s *= 0.7;
      tiers.inferenceService += trainingReduction;
    }

    return this.normalizeTiers(tiers);
  }

  private normalizeTiers(tiers: ServiceTierAllocation): ServiceTierAllocation {
    const total = Object.values(tiers).reduce((a, b) => a + b, 0);
    if (total === 0) return tiers;
    
    Object.keys(tiers).forEach(key => {
      (tiers as any)[key] = Math.round(((tiers as any)[key] / total) * 100);
    });
    return tiers;
  }

  private optimizeStorageTiers(): StorageTierAllocation {
    const tiers = this.optimizeServiceTiers();
    const storagePerGPU = this.constraints.storagePerGPU;

    // Calculate storage needs based on service tiers
    const trainingIntensive = (tiers.bareMetalWhale * 0.8 + tiers.orchestratedK8s * 0.65 + 
                              tiers.managedMLOps * 0.55) / 100;

    let storage: StorageTierAllocation = {
      ultraHighPerf: 0,
      highPerf: 0,
      mediumPerf: 0,
      capacityTier: 0,
      objectStore: 0
    };

    if (storagePerGPU >= 50) {
      // Abundant storage - optimal mix
      storage.ultraHighPerf = tiers.bareMetalWhale > 20 ? 5 : 0;
      storage.highPerf = 30 * trainingIntensive;
      storage.mediumPerf = 25;
      storage.capacityTier = 30;
      storage.objectStore = 15;
    } else if (storagePerGPU >= 20) {
      // Adequate storage - balanced
      storage.ultraHighPerf = tiers.bareMetalWhale > 25 ? 3 : 0;
      storage.highPerf = 25 * trainingIntensive;
      storage.mediumPerf = 30;
      storage.capacityTier = 35;
      storage.objectStore = 10;
    } else {
      // Constrained storage - optimize for inference
      storage.ultraHighPerf = 0;
      storage.highPerf = 15 * trainingIntensive;
      storage.mediumPerf = 35;
      storage.capacityTier = 40;
      storage.objectStore = 10;
    }

    // Normalize to 100%
    const total = Object.values(storage).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(storage).forEach(key => {
        (storage as any)[key] = Math.round(((storage as any)[key] / total) * 100);
      });
    }

    return storage;
  }

  private deriveNetworkRequirements(serviceTiers: ServiceTierAllocation): string {
    // Network selection based on service mix
    const needsHighBandwidth = serviceTiers.bareMetalWhale > 20 || 
                               (serviceTiers.bareMetalWhale + serviceTiers.orchestratedK8s) > 50;

    // Respect user-selected networking when provided
    if (this.selectedNetworking === 'roce-800') return 'Ethernet 800GbE RoCEv2';
    if (this.selectedNetworking === 'roce-400') return 'Ethernet 400GbE RoCEv2';
    if (this.selectedNetworking === 'roce-200') return 'Ethernet 200GbE RoCEv2';

    if (this.constraints.scale === 'hyperscale' && needsHighBandwidth) {
      return 'InfiniBand NDR 400Gb (Non-blocking)';
    } else if (this.constraints.scale === 'large' && needsHighBandwidth) {
      return 'InfiniBand HDR 200Gb (2:1 oversubscribed)';
    } else if (needsHighBandwidth) {
      return 'Ethernet 400GbE RoCEv2';
    } else {
      return 'Ethernet 200GbE';
    }
  }

  private deriveCoolingRequirements(): string {
    const powerDensity = this.power / Math.ceil(this.gpus / 8); // Power per node (8 GPUs per node)

    if (powerDensity > 10 || this.constraints.scale === 'hyperscale') {
      return 'Liquid Cooled (Direct-to-chip)';
    } else if (powerDensity > 6) {
      return 'Hybrid Air/Liquid';
    } else {
      return 'Air Cooled (Hot aisle containment)';
    }
  }

  private calculateRackCount(): number {
    // Use rack sizing from the selected GPU spec when available
    let rackSize = 8; // default GPUs per node
    if (this.selectedGpuKey && gpuSpecs[this.selectedGpuKey]) {
      rackSize = gpuSpecs[this.selectedGpuKey].rackSize;
    }
    const nodes = Math.ceil(this.gpus / rackSize);
    const racksForCompute = Math.ceil(nodes / 4); // assume 4 nodes per rack typical
    const racksForNetworking = Math.ceil(racksForCompute * 0.1);
    const racksForStorage = Math.ceil(this.storage / 5);
    return racksForCompute + racksForNetworking + racksForStorage;
  }

  private getGPUCost(model: string): number {
    // Look up by selected key if available, else fall back by model name
    if (this.selectedGpuKey && gpuSpecs[this.selectedGpuKey]) {
      return gpuSpecs[this.selectedGpuKey].unitPrice;
    }
    const entry = Object.values(gpuSpecs).find(s => s.name === model);
    return entry ? entry.unitPrice : 25000;
  }

  private calculateRevenuePerGPU(serviceTiers: ServiceTierAllocation): number {
    // Weighted average revenue per GPU hour
    const hourlyRates = {
      bareMetalWhale: 2.50,
      orchestratedK8s: 3.20,
      managedMLOps: 4.50,
      inferenceService: 5.00
    };

    let weightedRate = 0;
    Object.keys(serviceTiers).forEach(tier => {
      weightedRate += ((serviceTiers as any)[tier] / 100) * (hourlyRates as any)[tier];
    });

    return weightedRate;
  }

  private calculateFinancials(serviceTiers: ServiceTierAllocation): FinancialMetrics {
    // CapEx calculation
    const gpuCost = this.gpus * this.getGPUCost(this.constraints.gpuModel);
    // Networking cost: scale with selected networking
    const networkingUnit = this.selectedNetworking === 'roce-800' ? 25000 : this.selectedNetworking === 'roce-400' ? 18000 : 12000;
    const networkCost = this.gpus * networkingUnit;
    const storageCost = this.storage * 100000; // $100k per PB average
    const facilityCost = (this.power / 1000) * 2000000; // $2M per MW

    const capex = gpuCost + networkCost + storageCost + facilityCost;

    // OpEx calculation (annual)
    // Power cost informed by PUE from spec when available (defaults if not)
    const pue = (() => {
      if (this.selectedGpuKey && gpuSpecs[this.selectedGpuKey]) {
        const spec = gpuSpecs[this.selectedGpuKey];
        return (spec.pue?.liquid ?? spec.pue?.air ?? 1.3);
      }
      return 1.3;
    })();
    const powerCost = this.power * pue * 8760 * 0.07; // $0.07 per kWh
    const staffCost = Math.ceil(this.gpus / 500) * 200000; // 1 FTE per 500 GPUs
    const maintenanceCost = capex * 0.05; // 5% of CapEx

    const annualOpex = powerCost + staffCost + maintenanceCost;

    // Revenue calculation
    const revenuePerGPU = this.calculateRevenuePerGPU(serviceTiers);
    const annualRevenue = this.gpus * revenuePerGPU * 8760 * 0.7; // 70% utilization

    const totalTCO = capex + annualOpex * 5; // 5 year
    const roi = ((annualRevenue * 5 - totalTCO) / capex) * 100;
    const paybackMonths = capex / (annualRevenue - annualOpex) * 12;

    return {
      capex: Math.round(capex / 1000000), // In millions
      annualOpex: Math.round(annualOpex / 1000000),
      annualRevenue: Math.round(annualRevenue / 1000000),
      totalTCO: Math.round(totalTCO / 1000000),
      roi: Math.round(roi),
      paybackMonths: Math.round(paybackMonths)
    };
  }

  private generateOptimizationReasoning(serviceTiers: ServiceTierAllocation): OptimizationReason[] {
    const reasons: OptimizationReason[] = [];

    // Scale-based reasoning
    if (this.constraints.scale === 'hyperscale') {
      reasons.push({
        icon: '🏢',
        text: `At ${this.gpus.toLocaleString()} GPUs, you have hyperscale capacity ideal for whale customers and large enterprise deployments.`
      });
    } else if (this.constraints.scale === 'small') {
      reasons.push({
        icon: '🎯',
        text: `With ${this.gpus.toLocaleString()} GPUs, focusing on managed services and inference maximizes revenue per GPU.`
      });
    }

    // Constraint-based reasoning
    if (this.constraints.storageConstrained) {
      reasons.push({
        icon: '💾',
        text: `Storage ratio of ${this.constraints.storagePerGPU.toFixed(0)} TB/GPU suggests optimizing for inference and model serving workloads.`
      });
    }

    if (this.constraints.powerConstrained) {
      reasons.push({
        icon: '⚡',
        text: 'Power constraints detected. Configuration optimized for energy-efficient workloads and lower-power GPU models.'
      });
    }

    // Service tier reasoning
    if (serviceTiers.managedMLOps >= 35) {
      reasons.push({
        icon: '🤖',
        text: `MLOps platform (${serviceTiers.managedMLOps}%) provides highest margins with ${this.constraints.gpuModel} GPUs at this scale.`
      });
    }

    if (serviceTiers.bareMetalWhale > 20) {
      reasons.push({
        icon: '🐋',
        text: 'Infrastructure supports whale customers requiring dedicated bare-metal access for large-scale training.'
      });
    }

    // GPU model reasoning
    reasons.push({
      icon: '🔧',
      text: `${this.constraints.gpuModel} selected for optimal price/performance at ${(this.power * 0.7 / this.gpus).toFixed(1)}kW per GPU.`
    });

    return reasons;
  }

  public calculateOptimalConfiguration(): OptimizedConfiguration {
    const serviceTiers = this.optimizeServiceTiers();
    const storageTiers = this.optimizeStorageTiers();

    // Derive infrastructure requirements
    const infrastructure: InfrastructureRecommendations = {
      network: this.deriveNetworkRequirements(serviceTiers),
      cooling: this.deriveCoolingRequirements(),
      racks: this.calculateRackCount()
    };

    // Calculate financial metrics
    const financial = this.calculateFinancials(serviceTiers);

    // Generate explanation
    const reasoning = this.generateOptimizationReasoning(serviceTiers);

    return {
      serviceTiers,
      storageTiers,
      infrastructure,
      financial,
      reasoning,
      constraints: this.constraints
    };
  }
}

// Helper functions for UI components
export function getMinPowerRequired(gpuCount: number): number {
  // 700W per GPU minimum + 30% overhead
  return Math.ceil((gpuCount * 0.7 * 1.3) / 1000);
}

export function getMinStorageRequired(gpuCount: number): number {
  // Minimum 10TB per GPU
  return Math.ceil(gpuCount * 10 / 1000);
}

export function getPowerUtilization(gpuCount: number, powerCapacity: number): number {
  const required = getMinPowerRequired(gpuCount);
  return Math.min(100, (required / powerCapacity) * 100);
}

export function getPowerStatus(utilization: number): { status: string; className: string } {
  if (utilization > 95) return { status: 'Critical: Insufficient power', className: 'status-critical' };
  if (utilization > 80) return { status: 'Warning: Limited headroom', className: 'status-warning' };
  if (utilization > 60) return { status: 'Good: Adequate power', className: 'status-good' };
  return { status: 'Excellent: Ample headroom', className: 'status-good' };
}

export function getStorageRatioStatus(storagePerGPU: number): { status: string; className: string } {
  if (storagePerGPU < 10) return { status: '❌ Too low for training', className: 'status-critical' };
  if (storagePerGPU < 20) return { status: '⚠️ Limited training capacity', className: 'status-warning' };
  if (storagePerGPU < 50) return { status: '✓ Good balance', className: 'status-good' };
  return { status: '✓ Excellent for all workloads', className: 'status-good' };
}
