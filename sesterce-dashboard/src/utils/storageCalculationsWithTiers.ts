// Enhanced storage calculations with selected tiers architecture
import { StorageConfig, StorageResults } from './storageCalculationsEnhanced';
import { storageArchitectures } from '../data/storageArchitectures';
import { calculateEnhancedStorage as calculateBase } from './storageCalculationsEnhanced';

export function calculateStorageWithSelectedTiers(config: StorageConfig): StorageResults {
  // If no selected tiers, use the base calculation
  if (!config.selectedTiers || config.selectedTiers.length === 0) {
    return calculateBase(config);
  }

  // Get base results
  const baseResults = calculateBase(config);
  
  // Override with selected tier calculations
  if (config.selectedTiers && config.tierDistributionPercentages && config.totalCapacityPB) {
    const { selectedTiers, tierDistributionPercentages, totalCapacityPB } = config;
    
    // Calculate costs based on selected tiers
    let totalCapex = 0;
    let totalOpex = 0;
    let total5YearTCO = 0;
    let totalPowerKW = 0;
    let aggregateThroughputTBps = 0;
    
    const tierBreakdown: Record<string, any> = {};
    
    selectedTiers.forEach(tierId => {
      const tier = storageArchitectures[tierId];
      const percentage = tierDistributionPercentages[tierId] || 0;
      const capacityPB = totalCapacityPB * (percentage / 100);
      
      if (tier && capacityPB > 0) {
        const tierCapex = capacityPB * tier.costPerPB.capex;
        const tierOpex = capacityPB * tier.costPerPB.opex;
        const tier5Year = capacityPB * tier.costPerPB.total5Year;
        const tierPower = capacityPB * tier.infrastructure.powerPerPB;
        
        // Parse throughput to get numeric value
        const throughputMatch = tier.performance.throughputPerPB.match(/(\d+(?:\.\d+)?)/);
        const throughputValue = throughputMatch ? parseFloat(throughputMatch[1]) : 0;
        const throughputUnit = tier.performance.throughputPerPB.includes('TB/s') ? 1000 : 1;
        const tierThroughput = (capacityPB * throughputValue * throughputUnit) / 1000; // Convert to TB/s
        
        totalCapex += tierCapex;
        totalOpex += tierOpex;
        total5YearTCO += tier5Year;
        totalPowerKW += tierPower;
        aggregateThroughputTBps += tierThroughput;
        
        tierBreakdown[tierId] = {
          name: tier.name,
          capacityPB,
          percentage,
          capex: tierCapex,
          opex: tierOpex,
          tco5Year: tier5Year,
          powerKW: tierPower,
          throughputTBps: tierThroughput,
          latency: tier.performance.latency,
          vendorName: tier.vendors[0],
          mediaType: tier.infrastructure.mediaType,
          efficiency: tier.infrastructure.efficiency,
          usableCapacityPB: capacityPB * tier.infrastructure.efficiency
        };
      }
    });
    
    // Calculate raw capacity needed (accounting for efficiency)
    const avgEfficiency = selectedTiers.reduce((sum, tierId) => {
      const tier = storageArchitectures[tierId];
      const percentage = tierDistributionPercentages[tierId] || 0;
      return sum + (tier?.infrastructure.efficiency || 0.8) * (percentage / 100);
    }, 0);
    
    const rawCapacityPB = totalCapacityPB / avgEfficiency;
    
    // Override base results with selected tier calculations
    baseResults.totalCapacity.totalPB = totalCapacityPB;
    baseResults.totalCapacity.rawPB = rawCapacityPB;
    baseResults.totalCapacity.tierBreakdown = tierBreakdown;
    
    baseResults.costs.capex.total = totalCapex;
    baseResults.costs.opex.annual = totalOpex;
    baseResults.costs.tco5Year = total5YearTCO;
    baseResults.costs.costPerTB = totalCapex / (totalCapacityPB * 1000);
    baseResults.costs.costPerGPU = totalCapex / config.gpuCount;
    
    baseResults.powerConsumption.totalKW = totalPowerKW;
    
    // Update performance metrics based on selected tiers
    baseResults.performance.aggregateThroughputTBps = aggregateThroughputTBps;
    
    // Generate vendor recommendation based on selected tiers
    const primaryTier = selectedTiers.reduce((primary, tierId) => {
      const percentage = tierDistributionPercentages[tierId] || 0;
      const primaryPercentage = tierDistributionPercentages[primary] || 0;
      return percentage > primaryPercentage ? tierId : primary;
    }, selectedTiers[0]);
    
    const primaryArchitecture = storageArchitectures[primaryTier];
    if (primaryArchitecture) {
      baseResults.vendors.primary = primaryArchitecture.vendors[0];
      baseResults.vendors.secondary = selectedTiers.length > 1 ? 
        storageArchitectures[selectedTiers.find(t => t !== primaryTier) || '']?.vendors[0] || 'Multi-vendor' : 
        'Single vendor';
      baseResults.vendors.architecture = `${selectedTiers.length}-tier architecture`;
      baseResults.vendors.rationale = `User-selected configuration with ${selectedTiers.map(t => storageArchitectures[t]?.name).join(', ')}`;
    }
  }
  
  return baseResults;
}

// Calculate storage node breakdown for design tab
export function calculateStorageNodeBreakdown(config: StorageConfig, results: StorageResults): {
  totalNodes: number;
  nvmeNodes: number;
  ssdNodes: number;
  hddNodes: number;
  nodeDetails: Array<{
    tier: string;
    nodeType: string;
    nodeCount: number;
    drivesPerNode: number;
    driveCapacityTB: number;
    totalDrives: number;
    powerPerNodeKW: number;
  }>;
} {
  const nodeDetails: Array<any> = [];
  let nvmeNodes = 0;
  let ssdNodes = 0;
  let hddNodes = 0;
  
  if (config.selectedTiers && config.tierDistributionPercentages && config.totalCapacityPB) {
    config.selectedTiers.forEach(tierId => {
      const tier = storageArchitectures[tierId];
      const percentage = config.tierDistributionPercentages![tierId] || 0;
      const capacityPB = config.totalCapacityPB! * (percentage / 100);
      const rawCapacityPB = capacityPB / (tier?.infrastructure.efficiency || 0.8);
      const rawCapacityTB = rawCapacityPB * 1000;
      
      if (tier && rawCapacityTB > 0) {
        let nodeType = '';
        let drivesPerNode = 0;
        let driveCapacityTB = 0;
        let powerPerNodeKW = 0;
        
        // Determine node configuration based on media type
        switch (tier.infrastructure.mediaType) {
          case 'all-nvme':
            nodeType = '2U NVMe Storage Node';
            drivesPerNode = 24; // 24x NVMe drives per 2U node
            driveCapacityTB = 15.36; // 15.36TB NVMe drives
            powerPerNodeKW = 2.0; // 2kW per NVMe node
            break;
          case 'nvme-ssd':
            nodeType = '2U Hybrid Storage Node';
            drivesPerNode = 24; // Mix of NVMe and SSD
            driveCapacityTB = 7.68; // Mix of drive sizes
            powerPerNodeKW = 1.5;
            break;
          case 'ssd-hdd':
            nodeType = '4U Storage Node';
            drivesPerNode = 36; // 36 drives per 4U node
            driveCapacityTB = 16; // 16TB HDDs with SSD cache
            powerPerNodeKW = 0.8;
            break;
          case 'hdd':
            nodeType = '4U Dense Storage Node';
            drivesPerNode = 60; // 60 drives per 4U node
            driveCapacityTB = 20; // 20TB HDDs
            powerPerNodeKW = 1.0;
            break;
          case 'cloud':
            nodeType = 'Cloud Object Storage';
            drivesPerNode = 0; // N/A for cloud
            driveCapacityTB = 0;
            powerPerNodeKW = 0;
            break;
        }
        
        if (drivesPerNode > 0) {
          const totalDrives = Math.ceil(rawCapacityTB / driveCapacityTB);
          const nodeCount = Math.ceil(totalDrives / drivesPerNode);
          
          // Count nodes by type
          if (tier.infrastructure.mediaType === 'all-nvme') nvmeNodes += nodeCount;
          else if (tier.infrastructure.mediaType === 'nvme-ssd' || tier.infrastructure.mediaType === 'ssd-hdd') ssdNodes += nodeCount;
          else if (tier.infrastructure.mediaType === 'hdd') hddNodes += nodeCount;
          
          nodeDetails.push({
            tier: tier.name,
            nodeType,
            nodeCount,
            drivesPerNode,
            driveCapacityTB,
            totalDrives,
            powerPerNodeKW
          });
        }
      }
    });
  }
  
  return {
    totalNodes: nvmeNodes + ssdNodes + hddNodes,
    nvmeNodes,
    ssdNodes,
    hddNodes,
    nodeDetails
  };
}
