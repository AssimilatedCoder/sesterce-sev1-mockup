// Raw Storage Calculations for Ceph and other storage systems
// Accounts for replication overhead, erasure coding, and metadata

import { storageArchitectures, StorageArchitecture } from '../data/storageArchitectures';

export interface RawStorageBreakdown {
  usableCapacityPB: number;
  rawCapacityPB: number;
  overheadPB: number;
  overheadPercentage: number;
  redundancyType: string;
  details: {
    replicationFactor?: number;
    erasureCoding?: {
      dataChunks: number;
      codingChunks: number;
      efficiency: number;
    };
    metadataOverhead: number;
    spareCapacity: number;
  };
}

export interface StorageRawCalculation {
  tierBreakdown: Record<string, RawStorageBreakdown>;
  totalUsablePB: number;
  totalRawPB: number;
  totalOverheadPB: number;
  averageEfficiency: number;
  recommendations: string[];
}

/**
 * Calculate raw storage requirements for a given storage tier configuration
 */
export function calculateRawStorageRequirements(
  tierDistribution: Record<string, number>, // Percentage distribution
  totalUsableCapacityPB: number
): StorageRawCalculation {
  const tierBreakdown: Record<string, RawStorageBreakdown> = {};
  let totalRawPB = 0;
  let totalOverheadPB = 0;
  const recommendations: string[] = [];

  // Calculate for each tier
  Object.entries(tierDistribution).forEach(([tierId, percentage]) => {
    if (percentage > 0) {
      const tier = storageArchitectures[tierId];
      if (tier) {
        const usableCapacityPB = totalUsableCapacityPB * (percentage / 100);
        const breakdown = calculateTierRawStorage(tier, usableCapacityPB);
        
        tierBreakdown[tierId] = breakdown;
        totalRawPB += breakdown.rawCapacityPB;
        totalOverheadPB += breakdown.overheadPB;

        // Add recommendations based on configuration
        if (tier.cephConfig) {
          if (tier.cephConfig.type === 'replication' && tier.cephConfig.replicas === 3) {
            recommendations.push(`${tier.name}: Consider erasure coding for better storage efficiency (3x replication = 67% overhead)`);
          }
          if (tier.cephConfig.type === 'erasure_coding' && usableCapacityPB > 50) {
            recommendations.push(`${tier.name}: Erasure coding is optimal for large-scale deployments (${Math.round((1 - tier.infrastructure.efficiency) * 100)}% overhead)`);
          }
        }
      }
    }
  });

  const averageEfficiency = totalUsableCapacityPB / totalRawPB;

  return {
    tierBreakdown,
    totalUsablePB: totalUsableCapacityPB,
    totalRawPB,
    totalOverheadPB,
    averageEfficiency,
    recommendations
  };
}

/**
 * Calculate raw storage for a specific tier
 */
function calculateTierRawStorage(
  tier: StorageArchitecture, 
  usableCapacityPB: number
): RawStorageBreakdown {
  let rawCapacityPB: number;
  let redundancyType: string;
  let details: RawStorageBreakdown['details'];

  if (tier.cephConfig) {
    // Use Ceph-specific calculations
    rawCapacityPB = usableCapacityPB * tier.cephConfig.rawMultiplier;
    
    if (tier.cephConfig.type === 'replication') {
      redundancyType = `${tier.cephConfig.replicas}-way replication`;
      details = {
        replicationFactor: tier.cephConfig.replicas,
        metadataOverhead: usableCapacityPB * 0.02, // 2% metadata overhead
        spareCapacity: usableCapacityPB * 0.05 // 5% spare capacity
      };
    } else {
      // Erasure coding
      const dataChunks = tier.cephConfig.dataChunks!;
      const codingChunks = tier.cephConfig.codingChunks!;
      redundancyType = `Erasure coding ${dataChunks}+${codingChunks}`;
      details = {
        erasureCoding: {
          dataChunks,
          codingChunks,
          efficiency: dataChunks / (dataChunks + codingChunks)
        },
        metadataOverhead: usableCapacityPB * 0.03, // 3% metadata overhead for EC
        spareCapacity: usableCapacityPB * 0.05 // 5% spare capacity
      };
    }
  } else {
    // Use generic efficiency calculation
    rawCapacityPB = usableCapacityPB / tier.infrastructure.efficiency;
    redundancyType = tier.infrastructure.redundancy;
    details = {
      metadataOverhead: usableCapacityPB * 0.02,
      spareCapacity: usableCapacityPB * 0.03
    };
  }

  // Add metadata and spare capacity to raw calculation
  rawCapacityPB += details.metadataOverhead + details.spareCapacity;

  const overheadPB = rawCapacityPB - usableCapacityPB;
  const overheadPercentage = (overheadPB / rawCapacityPB) * 100;

  return {
    usableCapacityPB,
    rawCapacityPB,
    overheadPB,
    overheadPercentage,
    redundancyType,
    details
  };
}

/**
 * Get recommendations for optimizing storage configuration
 */
export function getStorageOptimizationRecommendations(
  calculation: StorageRawCalculation,
  gpuCount: number
): string[] {
  const recommendations: string[] = [...calculation.recommendations];

  // Scale-based recommendations
  if (gpuCount >= 50000) {
    recommendations.push("Large scale (50K+ GPUs): Erasure coding strongly recommended for cost efficiency");
    if (calculation.averageEfficiency < 0.7) {
      recommendations.push("Consider optimizing erasure coding schemes - current efficiency is below 70%");
    }
  } else if (gpuCount >= 10000) {
    recommendations.push("Medium scale (10K+ GPUs): Mix of replication and erasure coding recommended");
  } else {
    recommendations.push("Small scale (<10K GPUs): 3-way replication acceptable for simplicity");
  }

  // Efficiency recommendations
  if (calculation.totalOverheadPB > calculation.totalUsablePB) {
    recommendations.push("WARNING: Storage overhead exceeds usable capacity - review configuration");
  }

  if (calculation.averageEfficiency < 0.5) {
    recommendations.push("Low storage efficiency detected - consider erasure coding over replication");
  }

  return recommendations;
}

/**
 * Calculate cost impact of raw storage requirements
 */
export function calculateRawStorageCostImpact(
  calculation: StorageRawCalculation,
  tierDistribution: Record<string, number>
): {
  additionalCapexUSD: number;
  additionalOpexUSD: number;
  costPerUsablePB: number;
  breakdown: Record<string, { capex: number; opex: number; }>;
} {
  let additionalCapexUSD = 0;
  let additionalOpexUSD = 0;
  const breakdown: Record<string, { capex: number; opex: number; }> = {};

  Object.entries(calculation.tierBreakdown).forEach(([tierId, tierCalc]) => {
    const tier = storageArchitectures[tierId];
    if (tier) {
      const additionalCapacityPB = tierCalc.overheadPB;
      const tierCapex = additionalCapacityPB * tier.costPerPB.capex;
      const tierOpex = additionalCapacityPB * tier.costPerPB.opex;
      
      additionalCapexUSD += tierCapex;
      additionalOpexUSD += tierOpex;
      
      breakdown[tierId] = {
        capex: tierCapex,
        opex: tierOpex
      };
    }
  });

  const costPerUsablePB = (additionalCapexUSD + additionalOpexUSD * 5) / calculation.totalUsablePB;

  return {
    additionalCapexUSD,
    additionalOpexUSD,
    costPerUsablePB,
    breakdown
  };
}
