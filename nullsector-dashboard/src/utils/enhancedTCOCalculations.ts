// Enhanced TCO Calculations integrating service-tier-driven architecture
// Calculates costs based on calculated storage and infrastructure requirements

import { 
  ServiceTierConfig, 
  StorageRequirements, 
  InfrastructureRequirements,
  getRecommendedStorageArchitecture 
} from './workloadPerformanceCalculations';

export interface EnhancedTCOResults {
  capex: {
    gpuSystems: number;
    calculatedStorage: number;
    networkingInfrastructure: number;
    powerCoolingInfrastructure: number;
    total: number;
  };
  opex: {
    annual: {
      power: number;
      cooling: number;
      staff: number;
      maintenance: number;
      softwareLicensing: number;
      storageOperations: number;
      total: number;
    };
    fiveYear: number;
  };
  tco: {
    fiveYear: number;
    perGPU: number;
    perServiceTier: Record<string, number>;
  };
  revenueModel: {
    estimatedAnnualRevenue: number;
    revenuePerGPU: number;
    grossMargin: number;
    paybackPeriod: number;
  };
  breakdown: {
    storageByTier: Array<{
      tier: string;
      capacityPB: number;
      capex: number;
      opex: number;
      rationale: string;
    }>;
    infrastructureDetails: {
      networkCapex: number;
      powerCapex: number;
      softwareCapex: number;
    };
  };
}

export interface EnhancedTCOConfig {
  // GPU Configuration
  gpuModel: string;
  numGPUs: number;
  coolingType: 'air' | 'liquid';
  
  // Financial Parameters
  electricityRate: number; // USD per kWh
  currency: 'USD' | 'EUR' | 'GBP';
  utilization: number; // %
  depreciation: number; // years
  
  // Service Tier Configuration
  serviceTiers: ServiceTierConfig[];
  storageRequirements: StorageRequirements;
  infrastructureRequirements: InfrastructureRequirements;
  
  // Overrides
  tcoOverrides?: {
    gpuPriceOverride?: number;
    powerPriceOverride?: number;
    staffCostOverride?: number;
    maintenancePercentOverride?: number;
  };
}

// GPU specifications with updated pricing
const GPU_SPECS = {
  'gb200': { price: 70000, power: 2700, memory: 192 },
  'gb300': { price: 85000, power: 3200, memory: 288 },
  'h100-sxm': { price: 40000, power: 700, memory: 80 },
  'h100-pcie': { price: 32000, power: 350, memory: 80 },
  'h200': { price: 45000, power: 700, memory: 141 },
  'mi300x': { price: 15000, power: 750, memory: 192 }
};

// Storage tier costs (5-year TCO per PB)
const STORAGE_TIER_COSTS = {
  'VAST Universal': { capex: 650000, opex: 130000, total5Year: 1300000 },
  'WEKA Parallel': { capex: 475000, opex: 95000, total5Year: 950000 },
  'DDN EXAScaler': { capex: 1000000, opex: 200000, total5Year: 2000000 },
  'Pure FlashBlade': { capex: 700000, opex: 140000, total5Year: 1400000 },
  'NetApp AFF': { capex: 700000, opex: 140000, total5Year: 1400000 },
  'Ceph All-NVMe': { capex: 350000, opex: 70000, total5Year: 700000 },
  'Ceph HDD Cache': { capex: 100000, opex: 20000, total5Year: 200000 },
  'Dell PowerScale': { capex: 400000, opex: 80000, total5Year: 800000 }
};

// Service tier revenue models (annual revenue per GPU)
const SERVICE_TIER_REVENUE = {
  'tier1_whale': 50000,      // $50K per GPU for bare metal access
  'tier2_orchestrated': 35000, // $35K per GPU for managed K8s
  'tier3_inference': 25000   // $25K per GPU for inference services
};

/**
 * Calculate enhanced TCO based on service-tier-driven architecture
 */
export function calculateEnhancedTCO(config: EnhancedTCOConfig): EnhancedTCOResults {
  const { 
    gpuModel, 
    numGPUs, 
    coolingType, 
    electricityRate, 
    utilization, 
    serviceTiers,
    storageRequirements,
    infrastructureRequirements,
    tcoOverrides = {}
  } = config;

  const gpuSpec = GPU_SPECS[gpuModel as keyof typeof GPU_SPECS];
  if (!gpuSpec) {
    throw new Error(`Unknown GPU model: ${gpuModel}`);
  }

  // CAPEX Calculations
  const gpuSystemsCapex = (tcoOverrides.gpuPriceOverride || gpuSpec.price) * numGPUs;
  
  // Calculate storage CAPEX from recommended architecture
  const recommendedStorage = getRecommendedStorageArchitecture(storageRequirements);
  const storageCapex = recommendedStorage.reduce((sum, arch) => {
    const tierCost = STORAGE_TIER_COSTS[arch.tier as keyof typeof STORAGE_TIER_COSTS];
    return sum + (arch.capacityPB * (tierCost?.capex || 0));
  }, 0);

  // Network infrastructure CAPEX (simplified)
  const networkCapex = infrastructureRequirements.network.infinibandSwitches * 150000 + // $150K per switch
                      infrastructureRequirements.network.storageNetworkPorts * 2000; // $2K per port

  // Power & cooling infrastructure CAPEX
  const powerCoolingCapex = infrastructureRequirements.power.storagePowerKW * 1500 + // $1.5K per kW
                           infrastructureRequirements.power.additionalRacks * 25000; // $25K per rack

  const totalCapex = gpuSystemsCapex + storageCapex + networkCapex + powerCoolingCapex;

  // OPEX Calculations
  const pueMultiplier = coolingType === 'liquid' ? 1.1 : 1.5;
  const totalPowerKW = (gpuSpec.power * numGPUs * (utilization / 100) * pueMultiplier) / 1000 +
                       infrastructureRequirements.power.storagePowerKW;
  
  const annualPowerCost = totalPowerKW * 8760 * (tcoOverrides.powerPriceOverride || electricityRate);
  const annualCoolingCost = annualPowerCost * 0.15; // 15% of power cost
  
  // Staff costs based on cluster complexity
  const complexityFactor = serviceTiers.length + (storageRequirements.performanceTierDistribution.extreme > 0 ? 2 : 0);
  const annualStaffCost = (tcoOverrides.staffCostOverride || 150000) * Math.ceil(numGPUs / 5000) * complexityFactor;
  
  // Maintenance costs
  const maintenancePercent = tcoOverrides.maintenancePercentOverride || 0.08;
  const annualMaintenanceCost = (gpuSystemsCapex + storageCapex) * maintenancePercent;
  
  // Software licensing (from infrastructure requirements)
  const annualSoftwareCost = infrastructureRequirements.software.kubernetesLicense +
                            infrastructureRequirements.software.monitoringStack +
                            (infrastructureRequirements.software.vastLicense / 5); // Amortize VAST over 5 years
  
  // Storage operations
  const storageOpex = recommendedStorage.reduce((sum, arch) => {
    const tierCost = STORAGE_TIER_COSTS[arch.tier as keyof typeof STORAGE_TIER_COSTS];
    return sum + (arch.capacityPB * (tierCost?.opex || 0));
  }, 0);

  const totalAnnualOpex = annualPowerCost + annualCoolingCost + annualStaffCost + 
                         annualMaintenanceCost + annualSoftwareCost + storageOpex;
  const fiveYearOpex = totalAnnualOpex * 5;

  // TCO Calculations
  const fiveYearTCO = totalCapex + fiveYearOpex;
  const tcoPerGPU = fiveYearTCO / numGPUs;

  // Per-service-tier TCO allocation
  const perServiceTierTCO: Record<string, number> = {};
  serviceTiers.forEach(tier => {
    const tierGPUs = (tier.clusterPercent / 100) * numGPUs;
    perServiceTierTCO[tier.id] = (tierGPUs / numGPUs) * fiveYearTCO;
  });

  // Revenue Model Calculations
  const estimatedAnnualRevenue = serviceTiers.reduce((sum, tier) => {
    const tierGPUs = (tier.clusterPercent / 100) * numGPUs;
    const revenuePerGPU = SERVICE_TIER_REVENUE[tier.id as keyof typeof SERVICE_TIER_REVENUE] || 30000;
    return sum + (tierGPUs * revenuePerGPU);
  }, 0);

  const revenuePerGPU = estimatedAnnualRevenue / numGPUs;
  const grossMargin = ((estimatedAnnualRevenue - totalAnnualOpex) / estimatedAnnualRevenue) * 100;
  const paybackPeriod = totalCapex / (estimatedAnnualRevenue - totalAnnualOpex);

  // Detailed breakdowns
  const storageByTier = recommendedStorage.map(arch => {
    const tierCost = STORAGE_TIER_COSTS[arch.tier as keyof typeof STORAGE_TIER_COSTS];
    return {
      tier: arch.tier,
      capacityPB: arch.capacityPB,
      capex: arch.capacityPB * (tierCost?.capex || 0),
      opex: arch.capacityPB * (tierCost?.opex || 0),
      rationale: arch.rationale
    };
  });

  return {
    capex: {
      gpuSystems: gpuSystemsCapex,
      calculatedStorage: storageCapex,
      networkingInfrastructure: networkCapex,
      powerCoolingInfrastructure: powerCoolingCapex,
      total: totalCapex
    },
    opex: {
      annual: {
        power: annualPowerCost,
        cooling: annualCoolingCost,
        staff: annualStaffCost,
        maintenance: annualMaintenanceCost,
        softwareLicensing: annualSoftwareCost,
        storageOperations: storageOpex,
        total: totalAnnualOpex
      },
      fiveYear: fiveYearOpex
    },
    tco: {
      fiveYear: fiveYearTCO,
      perGPU: tcoPerGPU,
      perServiceTier: perServiceTierTCO
    },
    revenueModel: {
      estimatedAnnualRevenue,
      revenuePerGPU,
      grossMargin,
      paybackPeriod
    },
    breakdown: {
      storageByTier,
      infrastructureDetails: {
        networkCapex,
        powerCapex: infrastructureRequirements.power.storagePowerKW * 1500,
        softwareCapex: infrastructureRequirements.software.vastLicense
      }
    }
  };
}

/**
 * Calculate ROI and financial metrics
 */
export function calculateROIMetrics(tcoResults: EnhancedTCOResults): {
  roi5Year: number;
  irr: number;
  npv: number;
  breakEvenMonths: number;
} {
  const { capex, revenueModel, opex } = tcoResults;
  const annualProfit = revenueModel.estimatedAnnualRevenue - opex.annual.total;
  
  // Simple ROI calculation
  const roi5Year = ((annualProfit * 5 - capex.total) / capex.total) * 100;
  
  // Simplified IRR (assuming constant cash flows)
  const irr = (annualProfit / capex.total) * 100;
  
  // NPV at 10% discount rate
  const discountRate = 0.10;
  let npv = -capex.total;
  for (let year = 1; year <= 5; year++) {
    npv += annualProfit / Math.pow(1 + discountRate, year);
  }
  
  // Break-even calculation
  const breakEvenMonths = capex.total / (annualProfit / 12);
  
  return {
    roi5Year,
    irr,
    npv,
    breakEvenMonths
  };
}
