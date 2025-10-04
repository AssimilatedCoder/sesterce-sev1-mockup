import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator, Cpu, HardDrive, Network, Thermometer, Zap, AlertTriangle,
  FileText, BookOpen, DollarSign, TrendingUp, Package, Settings, Shield
} from 'lucide-react';
import { gpuSpecs } from '../data/gpuSpecs';
import { storageVendors } from '../data/storageVendors';
import { calculateStorageWithSelectedTiers } from '../utils/storageCalculationsWithTiers';
import { calculateStackCost } from '../data/softwareStacks';
import { calculateEnterpriseInfrastructureCosts } from '../data/enterpriseInfrastructure';
import { CalculatorTabRedesigned } from './tabs/CalculatorTabRedesigned';
import { NetworkingTabEnhanced } from './tabs/NetworkingTabEnhanced';
import { StorageTabProductionEnhanced } from './tabs/StorageTabProductionEnhanced';
import { SoftwareStackTab } from './tabs/SoftwareStackTab';
import { CoolingPowerTabEnhanced } from './tabs/CoolingPowerTabEnhanced';
import { FormulasTabEnhanced } from './tabs/FormulasTabEnhanced';
import { ServicePricingTab } from './tabs/ServicePricingTab';
import { FinancialAnalyticsTab } from './tabs/FinancialAnalyticsTab';
import { CapexBreakdownTab } from './tabs/CapexBreakdownTab';
import { DocumentationTab } from './tabs/DocumentationTab';
import { ReferencesTab } from './tabs/ReferencesTab';
import { OperationsPlaybookTab } from './tabs/OperationsPlaybookTab';
import { AccessLogsTab } from './tabs/AccessLogsTab';
import { UserManagementTab } from './tabs/UserManagementTab';
import { LandingOverviewTab } from './tabs/LandingOverviewTab';
import { TCOOverrideTab, TCOOverrides } from './tabs/TCOOverrideTab';
import { BasicConfigTab } from './tabs/BasicConfigTab';
import { DetailedClusterDesign } from './tabs/DetailedClusterDesign';
import { ConfigurationIncompleteMessage } from './common/ConfigurationIncompleteMessage';
import { isConfigurationComplete, isBasicConfigurationSufficient } from '../utils/configurationValidator';
import { formatNumber } from '../utils/formatters';
import { CurrencySelector } from './common/CurrencySelector';
import { useCurrency } from '../hooks/useCurrency';
import { activityLogger } from '../utils/activityLogger';
import { getRecommendedRate, convertElectricityRate } from '../data/electricityPrices';

// Legacy region rates - kept for backward compatibility
// New location-based pricing system provides more accurate rates
const regionRates: Record<string, { rate: number; name: string; pue: number }> = {
  'us-texas': { rate: 0.047, name: 'US Texas', pue: 1.15 },
  'us-virginia': { rate: 0.085, name: 'US Virginia', pue: 1.2 },
  'us-california': { rate: 0.150, name: 'US California', pue: 1.25 },
  'europe': { rate: 0.120, name: 'Europe', pue: 1.15 },
  'asia': { rate: 0.100, name: 'Asia Pacific', pue: 1.3 }
};

// Network fabric specifications (updated per design document)
const networkFabrics: Record<string, {
  name: string;
  switchPrice: number;
  cablePrice: number;
  transceiverPrice: number;
  bandwidthPerGpu: number;
  portsPerSwitch: number;
}> = {
  'infiniband': {
    name: 'InfiniBand NDR',
    switchPrice: 120000,
    cablePrice: 500,
    transceiverPrice: 1500,
    bandwidthPerGpu: 400,
    portsPerSwitch: 64 // Design doc specifies 64-port switches
  },
  'ethernet': {
    name: 'Ethernet RoCEv2',
    switchPrice: 85000, // Spectrum-X or Nexus pricing
    cablePrice: 200,
    transceiverPrice: 800,
    bandwidthPerGpu: 400,
    portsPerSwitch: 64 // Design doc specifies 64-port switches
  },
  'infiniband-xdr': {
    name: 'InfiniBand XDR',
    switchPrice: 180000,
    cablePrice: 800,
    transceiverPrice: 2500,
    bandwidthPerGpu: 800,
    portsPerSwitch: 64
  },
  'ethernet-800g': {
    name: 'Ethernet RoCEv2 800GbE',
    switchPrice: 150000, // Higher-end 800G switches
    cablePrice: 400,
    transceiverPrice: 1200,
    bandwidthPerGpu: 800,
    portsPerSwitch: 64
  }
};

const GPUSuperclusterCalculator: React.FC = () => {
  // Get current user from session storage (set by login)
  const currentUser = sessionStorage.getItem('nullSectorUser');
  const isAdmin = currentUser === 'admin' || currentUser === 'David' || currentUser === 'Thomas' || currentUser === 'Kiko' || currentUser === 'Maciej';
  const isSuperAdmin = currentUser === 'admin'; // Only admin can see access logs
  const isPowerUser = isAdmin; // Power users have same access as admins for now
  
  // Determine user role for display
  const getUserRole = () => {
    if (isSuperAdmin) return 'admin';
    if (isAdmin) return 'power_user';
    return 'user';
  };
  
  // Debug logging
  console.log('Current user:', currentUser);
  console.log('Is admin:', isAdmin);
  console.log('Is super admin:', isSuperAdmin);
  
  // State management
  const [activeTab, setActiveTab] = useState('basic');
  const [isUsingBasicConfig, setIsUsingBasicConfig] = useState(true);
  const [basicConfigData, setBasicConfigData] = useState<{
    gpuCount: number;
    gpuModel: string;
    powerCapacity: number;
    storageCapacity: number;
    networkingType: string;
  } | null>({
    gpuCount: 5000,
    gpuModel: 'h100-sxm',
    powerCapacity: 15,
    storageCapacity: 125,
    networkingType: 'roce-400'
  });
  
  // Currency conversion hook (for future use in calculations)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currencyHook = useCurrency();
  
  // Redirect non-admin users away from admin-only tabs
  React.useEffect(() => {
    if (!isAdmin && activeTab === 'documentation') {
      setActiveTab('overview');
    }
    if (!isSuperAdmin && (activeTab === 'logs' || activeTab === 'users')) {
      setActiveTab('overview');
    }
  }, [activeTab, isAdmin, isSuperAdmin]);
  
  // Configuration state
  const [gpuModel, setGpuModel] = useState('gb200');
  const [numGPUs, setNumGPUs] = useState(10000);
  const [coolingType, setCoolingType] = useState('liquid');
  const [region, setRegion] = useState('us-west-2');
  const [utilization, setUtilization] = useState(90);
  const [depreciation, setDepreciation] = useState(4);
  
  // Storage configuration
  const [totalStorage, setTotalStorage] = useState(50);
  const [storageArchitecture, setStorageArchitecture] = useState('mixed');
  const [hotPercent, setHotPercent] = useState(20);
  const [warmPercent, setWarmPercent] = useState(35);
  const [coldPercent, setColdPercent] = useState(35);
  const [archivePercent, setArchivePercent] = useState(10);
  const [hotVendor, setHotVendor] = useState('vast');
  const [warmVendor, setWarmVendor] = useState('pure-e');
  const [coldVendor, setColdVendor] = useState('ceph');
  const [archiveVendor, setArchiveVendor] = useState('glacier');
  
  // Networking configuration
  const [fabricType, setFabricType] = useState('ethernet');
  const [topology, setTopology] = useState('fat-tree');
  const [oversubscription, setOversubscription] = useState('1:1');
  const [railsPerGPU, setRailsPerGPU] = useState(8);
  const [enableBluefield, setEnableBluefield] = useState(true);
  
  // Advanced options
  const [pueOverride, setPueOverride] = useState('');
  const [gpuPriceOverride, setGpuPriceOverride] = useState('');
  const [maintenancePercent, setMaintenancePercent] = useState(3);
  const [staffMultiplier, setStaffMultiplier] = useState(1);
  const [customEnergyRate, setCustomEnergyRate] = useState('');
  
  // Enhanced storage configuration
  const [workloadTraining, setWorkloadTraining] = useState(70);
  const [workloadInference, setWorkloadInference] = useState(20);
  const [workloadFinetuning, setWorkloadFinetuning] = useState(10);
  const [tenantWhale, setTenantWhale] = useState(60);
  const [tenantMedium, setTenantMedium] = useState(30);
  const [tenantSmall, setTenantSmall] = useState(10);
  
  // New enhanced storage architecture state
  const [selectedStorageTiers, setSelectedStorageTiers] = useState<string[]>([
    'vast-universal', 'ceph-nvme', 'ceph-hybrid', 'ceph-hdd'
  ]);
  const [storageTierDistribution, setStorageTierDistribution] = useState<Record<string, number>>({
    'vast-universal': 25,
    'ceph-nvme': 25,
    'ceph-hybrid': 30,
    'ceph-hdd': 20
  });
  const [storagePreset, setStoragePreset] = useState('vast-ceph-optimal');
  
  // Software stack configuration state
  const [softwareStack, setSoftwareStack] = useState('canonical-enterprise');
  const [supportTier, setSupportTier] = useState<'community' | 'business' | 'enterprise'>('business');
  const [budget, setBudget] = useState<'low' | 'medium' | 'high' | 'unlimited'>('medium');
  const [expertise, setExpertise] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [complianceRequirements, setComplianceRequirements] = useState<string[]>([]);

  // TCO Override state
  const [tcoOverrides, setTcoOverrides] = useState<TCOOverrides>(() => {
    try {
      const saved = localStorage.getItem('nullSectorTcoOverrides');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Service tier pricing distribution and modifiers
  const [tierDistribution, setTierDistribution] = useState<{ tier1: number; tier2: number; tier3: number; tier4: number }>(() => {
    try {
      const saved = localStorage.getItem('nullSectorTierDistribution');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { tier1: 30, tier2: 35, tier3: 25, tier4: 10 };
  });

  const [serviceModifiers, setServiceModifiers] = useState<{ 
    storage: { extreme: boolean; high: boolean; balanced: boolean; cost: boolean };
    compliance: { hipaa: boolean; fedramp: boolean; secnum: boolean; airgap: boolean };
    sustainability: { renewable: boolean; carbon: boolean; netzero: boolean };
  }>(() => {
    try {
      const saved = localStorage.getItem('nullSectorServiceModifiers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      storage: { extreme: false, high: false, balanced: true, cost: false },
      compliance: { hipaa: false, fedramp: false, secnum: false, airgap: false },
      sustainability: { renewable: true, carbon: false, netzero: false }
    };
  });

  useEffect(() => {
    try { localStorage.setItem('nullSectorTierDistribution', JSON.stringify(tierDistribution)); } catch {}
  }, [tierDistribution]);

  useEffect(() => {
    try { localStorage.setItem('nullSectorServiceModifiers', JSON.stringify(serviceModifiers)); } catch {}
  }, [serviceModifiers]);

  useEffect(() => {
    try { localStorage.setItem('nullSectorTcoOverrides', JSON.stringify(tcoOverrides)); } catch {}
  }, [tcoOverrides]);

  // Log page load
  useEffect(() => {
    activityLogger.logPageLoad('GPU Supercluster Calculator');
  }, []);

  // Enhanced tab click handler with activity logging
  const handleTabClick = async (tabId: string) => {
    // Find the tab info for logging
    const allTabs = tabGroups.flatMap(group => group.tabs);
    const tabInfo = allTabs.find(tab => tab.id === tabId);
    const tabLabel = tabInfo?.label || tabId;
    
    // Log the tab click
    await activityLogger.logTabClick(tabId, tabLabel);
    
    // Set the active tab
    setActiveTab(tabId);
  };
  
  // Results state
  const [results, setResults] = useState<any>(null);

  // Get GPU specifications
  const spec = gpuSpecs[gpuModel] || gpuSpecs['gb200'];
  const coolingRequired = spec.coolingOptions.length === 1 && spec.coolingOptions[0] === 'liquid';

  // Update cooling type and rails when GPU model changes
  useEffect(() => {
    if (spec?.coolingOptions?.length === 1) {
      setCoolingType(spec.coolingOptions[0]);
    }
    // Set default rails per GPU based on model
    if ((gpuModel || '').startsWith('gb')) {
      setRailsPerGPU(9);
    } else {
      setRailsPerGPU(8);
    }
  }, [gpuModel, spec?.coolingOptions]);

  // Calculate storage costs using vendor-specific pricing
  const calculateStorageCosts = () => {
    // Enhanced storage configuration for production-grade calculations
    const enhancedStorageConfig = {
      gpuCount: numGPUs,
      gpuModel: gpuModel,
      workloadMix: {
        training: workloadTraining,
        inference: workloadInference,
        finetuning: workloadFinetuning
      },
      tenantMix: {
        whale: tenantWhale,
        medium: tenantMedium,
        small: tenantSmall
      },
      budget: 'optimized' as const,
      storageVendor: 'auto' as const,
      tierDistribution: 'balanced' as const,
      // Pass the selected storage architecture
      selectedTiers: selectedStorageTiers,
      tierDistributionPercentages: storageTierDistribution,
      totalCapacityPB: totalStorage
    };

    // Calculate enhanced storage requirements
    const enhancedResults = calculateStorageWithSelectedTiers(enhancedStorageConfig);
    
    // Legacy compatibility - maintain existing structure for backward compatibility
    // Calculate storage costs per tier (with overrides)
    const effectiveTotalStorage = tcoOverrides.totalStorage || totalStorage;
    const effectiveHotPercent = tcoOverrides.hotPercent || hotPercent;
    const effectiveWarmPercent = tcoOverrides.warmPercent || warmPercent;
    const effectiveColdPercent = tcoOverrides.coldPercent || coldPercent;
    const effectiveArchivePercent = tcoOverrides.archivePercent || archivePercent;
    
    const hotCapacityPB = effectiveTotalStorage * (effectiveHotPercent / 100);
    const warmCapacityPB = effectiveTotalStorage * (effectiveWarmPercent / 100);
    const coldCapacityPB = effectiveTotalStorage * (effectiveColdPercent / 100);
    const archiveCapacityPB = effectiveTotalStorage * (effectiveArchivePercent / 100);
    
    // Use override prices if available
    const hotPrice = tcoOverrides.vastPricePerGB || storageVendors[hotVendor].pricePerGB;
    const warmPrice = tcoOverrides.purePricePerGB || storageVendors[warmVendor].pricePerGB;
    const coldPrice = tcoOverrides.cephPricePerGB || storageVendors[coldVendor].pricePerGB;
    const archivePrice = storageVendors[archiveVendor].pricePerGB;
    
    const hotCost = hotCapacityPB * 1000 * 1000 * hotPrice; // PB -> GB conversion
    const warmCost = warmCapacityPB * 1000 * 1000 * warmPrice;
    const coldCost = coldCapacityPB * 1000 * 1000 * coldPrice;
    const archiveCost = archiveCapacityPB * 1000 * 1000 * archivePrice;
    
    const hotPower = hotCapacityPB * 1000 * storageVendors[hotVendor].powerPerTB / 1000;
    const warmPower = warmCapacityPB * 1000 * storageVendors[warmVendor].powerPerTB / 1000;
    const coldPower = coldCapacityPB * 1000 * storageVendors[coldVendor].powerPerTB / 1000;
    const archivePower = archiveCapacityPB * 1000 * storageVendors[archiveVendor].powerPerTB / 1000;
    
    return {
      // Legacy structure for backward compatibility
      total: hotCost + warmCost + coldCost + archiveCost,
      hot: hotCost,
      warm: warmCost,
      cold: coldCost,
      archive: archiveCost,
      power: (hotPower + warmPower + coldPower + archivePower) / 1000, // MW
      breakdown: {
        hot: { capacity: hotCapacityPB, vendor: storageVendors[hotVendor].name, cost: hotCost },
        warm: { capacity: warmCapacityPB, vendor: storageVendors[warmVendor].name, cost: warmCost },
        cold: { capacity: coldCapacityPB, vendor: storageVendors[coldVendor].name, cost: coldCost },
        archive: { capacity: archiveCapacityPB, vendor: storageVendors[archiveVendor].name, cost: archiveCost }
      },
      
      // Enhanced storage results for production-grade analysis
      enhanced: enhancedResults
    };
  };

  // Calculate network costs based on topology and oversubscription
  const calculateNetworkCosts = () => {
    const fabric = networkFabrics[fabricType];
    const spec = gpuSpecs[gpuModel];
    const isGB200 = gpuModel === 'gb200';
    const isGB300 = gpuModel === 'gb300';
    const isAMD = spec?.vendor === 'amd';
    const isRTX = gpuModel.includes('rtx');
    
    // GPU architecture-specific networking considerations
    const gpusPerPod = isGB200 ? 1008 : 
                      isAMD ? 512 :  // AMD typically uses smaller pods for Infinity Fabric
                      isRTX ? 256 :  // RTX professional cards use smaller clusters
                      1024;          // Standard for H100/H200
    
    const numPods = Math.ceil(numGPUs / gpusPerPod);
    
    // Rails per GPU based on architecture and interconnect
    let railsPerGPU;
    if (isGB200 || isGB300) {
      railsPerGPU = 9; // NVLink + network rails
    } else if (isAMD) {
      railsPerGPU = 6; // AMD Infinity Fabric + network rails (refined)
    } else if (isRTX) {
      railsPerGPU = 4; // Professional cards, network-dependent (refined)
    } else {
      railsPerGPU = 8; // Standard H100/H200
    }
    
    // Adjust switch counts based on topology and oversubscription
    const oversubRatio = parseFloat(oversubscription.split(':')[0]);
    const effectiveRails = railsPerGPU / oversubRatio;
    
    let leafSwitches, spineSwitches, coreSwitches;
    
    if (topology === 'fat-tree') {
      // Pod-based calculations (4 leaf + 4 spine per pod from design doc)
      leafSwitches = numPods * 4;
      spineSwitches = numPods * 4;
      coreSwitches = numGPUs > 50000 ? 50 : (numGPUs > 25000 ? 10 : 2);
    } else if (topology === 'dragonfly') {
      leafSwitches = Math.ceil(numGPUs / 96);
      spineSwitches = Math.ceil(leafSwitches / 12);
      coreSwitches = Math.ceil(spineSwitches / 6);
    } else { // bcube
      leafSwitches = Math.ceil(numGPUs / 64);
      spineSwitches = Math.ceil(leafSwitches / 16);
      coreSwitches = Math.ceil(spineSwitches / 8);
    }
    
    const totalSwitches = leafSwitches + spineSwitches + coreSwitches;
    const totalPorts = numGPUs * effectiveRails;
    const cables = totalPorts;
    const transceivers = totalPorts * 2; // Both ends
    
    // DPU calculations (per design doc: 4 DPUs per NVL72 system)
    let dpuCount = 0;
    let dpuCost = 0;
    let dpuPower = 0;
    
    if (enableBluefield) {
      if (isGB200 || isGB300) {
        dpuCount = Math.ceil(numGPUs / 72) * 4; // 4 dual-port BlueField-3 per NVL72
      } else if (isAMD) {
        // AMD systems typically don't use BlueField DPUs - use native AMD networking
        dpuCount = 0;
        dpuCost = 0;
        dpuPower = 0;
      } else if (isRTX) {
        // RTX professional systems typically use fewer DPUs
        dpuCount = Math.ceil(numGPUs / 16); // 1 DPU per 16 GPUs for professional workloads
      } else {
        // For OEM 8-GPU nodes (H100/H200), assume one DPU per node
        dpuCount = Math.ceil(numGPUs / 8);
      }
      
      if (dpuCount > 0) {
        dpuCost = dpuCount * (tcoOverrides.dpuUnitPrice || 2500); // BlueField-3 SuperNIC price
        dpuPower = dpuCount * 150; // 150W per DPU (from design doc)
      }
    }
    
    const switchCost = totalSwitches * (tcoOverrides.switchPriceOverride || fabric.switchPrice);
    const cableCost = cables * (tcoOverrides.cablePriceOverride || fabric.cablePrice);
    const transceiverCost = transceivers * (tcoOverrides.transceiverPriceOverride || fabric.transceiverPrice);
    
    // Return structure compatible with NetworkingTabEnhanced
    return {
      total: switchCost + cableCost + transceiverCost + dpuCost,
      switches: switchCost,
      cableCost: cableCost,
      transceiverCost: transceiverCost,
      counts: {
        totalSwitches,
        leafSwitches,
        spineSwitches,
        coreSwitches,
        cables,
        transceivers
      },
      // Additional structure for NetworkingTabEnhanced compatibility
      topology: {
        leafSwitches,
        spineSwitches,
        coreSwitches,
        totalSwitches,
        pods: numPods,
        railsPerGPU
      },
      cables: {
        total: cables,
        intraPod: Math.floor(cables * 0.7), // Estimate
        interPod: Math.floor(cables * 0.3)
      },
      transceivers: transceivers,
      dpus: {
        count: dpuCount,
        cost: dpuCost,
        power: dpuPower
      },
      costs: {
        switches: switchCost,
        cables: cableCost,
        transceivers: transceiverCost,
        dpus: dpuCost,
        total: switchCost + cableCost + transceiverCost + dpuCost
      },
      power: {
        switches: totalSwitches * 1800, // Estimated switch power
        cables: cables * 3, // Estimated cable power
        transceivers: transceivers * 12, // Estimated transceiver power
        dpus: dpuPower,
        total: (totalSwitches * 1800) + (cables * 3) + (transceivers * 12) + dpuPower
      },
      bandwidth: {
        bisection: (coreSwitches * 64 * fabric.bandwidthPerGpu) / 8, // Gbps to GBps
        theoretical: numGPUs * fabric.bandwidthPerGpu * railsPerGPU / 8,
        perGPU: fabric.bandwidthPerGpu * railsPerGPU
      },
      switchSpec: {
        name: fabricType === 'infiniband' ? 'Quantum-2 QM9700' : 'Spectrum-4 SN5600',
        ports: 64,
        speed: fabric.bandwidthPerGpu,
        price: fabric.switchPrice,
        power: 1800 // Estimated
      }
    };
  };

  // Calculate comprehensive TCO
  const calculate = () => {
    // Log calculation activity
    activityLogger.logCalculation('TCO Calculation', {
      gpuModel,
      numGPUs,
      region,
      coolingType,
      utilization
    });

    // Get electricity rate using new location-based pricing system
    const getElectricityRate = (location: string) => {
      // First try to get rate from new location-based system
      const locationRate = getRecommendedRate(location);
      if (locationRate) {
        // Convert to USD for calculations (base currency)
        return convertElectricityRate(locationRate, 'USD');
      }
      
      // Fall back to legacy region rates for backward compatibility
      const regionData = regionRates[location];
      return regionData ? regionData.rate : 0.085; // Default to US Virginia rate
    };

    const regionData = regionRates[region] || { 
      rate: getElectricityRate(region), 
      name: region, 
      pue: 1.2 
    };
    
    if (!regionData) {
      console.error('❌ Region data not found for:', region);
      return;
    }
    
    if (!spec) {
      console.error('❌ GPU spec not found for:', gpuModel);
      return;
    }
    
    // Calculate actual systems needed (can't buy partial systems)
    const safeRackSize = spec?.rackSize || 8;
    const systemsNeeded = Math.ceil(numGPUs / safeRackSize);
    const actualGPUs = systemsNeeded * safeRackSize;
    
    // GPU costs - use override if provided, but calculate based on actual GPUs in complete systems
    const gpuUnitPrice = tcoOverrides.gpuUnitPrice || (gpuPriceOverride ? parseFloat(gpuPriceOverride) : spec.unitPrice);
    const gpuCapex = gpuUnitPrice * actualGPUs;
    
    // Calculate detailed storage
    const storage = calculateStorageCosts();
    
    // Calculate detailed networking
    const network = calculateNetworkCosts();
    
    // Power calculations using design document specifications
    const systemsTotal = systemsNeeded; // Use the systems we calculated above
    // For H100/H200 OEM nodes (8 GPUs per server), use node rackPower; for NVL72 use provided rack power
    const perSystemPower = spec?.rackPower || (spec?.powerPerGPU || 1000) * safeRackSize;
    const rackPowerTotal = systemsTotal * perSystemPower;
    const gpuPowerMW = rackPowerTotal / 1000000; // Use actual rack power from design doc
    const pueValue = tcoOverrides.pueOverride || (pueOverride ? parseFloat(pueOverride) : ((spec?.pue || {})[coolingType] || regionData.pue));
    
    // DPU power if enabled (per design doc: 4 DPUs per NVL72 system at 150W each)
    const dpuCount = enableBluefield ? 
      (gpuModel.startsWith('gb') ? systemsTotal * 4 : Math.ceil(actualGPUs / 8)) : 0;
    const dpuPowerMW = dpuCount * 150 / 1000000; // 150W per BlueField-3
    const dpuCapex = dpuCount * (tcoOverrides.dpuUnitPrice || 2500);
    
    // Total IT power including storage and DPUs
    const totalItPowerMW = gpuPowerMW + storage.power + dpuPowerMW;
    const totalPowerMW = totalItPowerMW * pueValue;
    // Use custom energy rate if provided, otherwise use region rate
    const energyRate = tcoOverrides.customEnergyRate || (customEnergyRate ? parseFloat(customEnergyRate) : regionData.rate);
    const annualPowerCost = totalPowerMW * 1000 * energyRate * 8760 * (tcoOverrides.powerCostMultiplier || 1);
    
    // Cooling infrastructure
    const numRacks = systemsTotal; // Use actual systems count
    const coolingCapex = coolingType === 'liquid' 
      ? gpuPowerMW * 1000 * (tcoOverrides.coolingCostPerKW || 400)  // $400/kW for liquid
      : gpuPowerMW * 1000 * (tcoOverrides.coolingCostPerKW || 300); // $300/kW for air
    
    // Calculate enterprise infrastructure (including detailed staff costs)
    const enterpriseInfra = calculateEnterpriseInfrastructureCosts(
      actualGPUs, 
      numRacks, 
      fabricType, 
      true, // includeOptional
      gpuModel
    );
    
    // Data center infrastructure
    const datacenterCapex = totalPowerMW * (tcoOverrides.datacenterCostPerMW || 10000000); // $10M/MW
    
    // Calculate software stack costs FIRST (before using in capex)
    const stackCost = calculateStackCost(softwareStack, actualGPUs, 3, supportTier);
    const softwareSetupCost = stackCost.upfrontCost;
    
    // Software and licensing
    const softwareCapex = softwareSetupCost; // Use dynamic software stack setup costs
    
    // Total CAPEX
    const totalCapex = gpuCapex + storage.total + network.total + coolingCapex + 
                      datacenterCapex + dpuCapex + softwareCapex;
    
    // Annual OPEX calculations
    const annualCoolingOpex = annualPowerCost * (tcoOverrides.coolingOpexMultiplier || (coolingType === 'liquid' ? 0.15 : 0.45));
    // Use detailed enterprise infrastructure staff costs instead of simple calculation
    const annualStaff = enterpriseInfra.totalAnnualOpex * (tcoOverrides.staffMultiplier || staffMultiplier);
    const annualMaintenance = (gpuCapex + network.total + storage.total) * ((tcoOverrides.maintenancePercent || maintenancePercent) / 100);
    const annualBandwidth = actualGPUs * (tcoOverrides.bandwidthCostPerGPU || 600); // $600/GPU/year (for actual GPUs)
    
    // Use the already calculated software stack costs (with override if available)
    const annualLicenses = tcoOverrides.softwareLicenseCostPerGPU 
      ? actualGPUs * tcoOverrides.softwareLicenseCostPerGPU 
      : stackCost.annualCost; // Use dynamic software stack pricing
    
    const storageOpex = totalStorage * 1000000 * 0.015 * 12; // $0.015/GB/month
    
    const annualOpex = annualPowerCost + annualCoolingOpex + annualStaff + 
                      annualMaintenance + annualBandwidth + annualLicenses + storageOpex;
    
    // Cost per GPU hour (based on actual GPUs, with overrides)
    const effectiveUtilization = tcoOverrides.utilization || utilization;
    const effectiveDepreciation = tcoOverrides.depreciation || depreciation;
    const annualGpuHours = actualGPUs * 8760 * (effectiveUtilization / 100);
    const annualDepreciation = totalCapex / effectiveDepreciation;
    const costPerHour = (annualDepreciation + annualOpex) / annualGpuHours;
    
    // Network bandwidth (Tbps)
    const bandwidthPerGPU = fabricType === 'infiniband' ? 3.6 : 3.2;
    const totalBandwidth = (actualGPUs * bandwidthPerGPU) / 1000;
    
    // Storage cost per GB/month
    const totalStorageGB = totalStorage * 1000 * 1000;
    const storageGbMonth = (storage.total / totalStorageGB) / 60;
    
    // 10-year TCO
    const tco10year = totalCapex + (annualOpex * 10);
    
    // Prepare detailed breakdowns
    const capexBreakdown = [
      { name: 'GPU Hardware', unit: `$${gpuUnitPrice.toLocaleString()}/GPU`, qty: `${actualGPUs.toLocaleString()} GPUs (${systemsTotal} systems)`, total: gpuCapex, pct: (gpuCapex/totalCapex*100).toFixed(1) },
      { name: 'Storage Systems (Total)', unit: 'Multi-vendor', qty: `${totalStorage} PB`, total: storage.total, pct: (storage.total/totalCapex*100).toFixed(1) },
      { name: '├─ Hot Tier', unit: storage.breakdown.hot.vendor, qty: `${storage.breakdown.hot.capacity.toFixed(1)} PB`, total: storage.hot, pct: (storage.hot/totalCapex*100).toFixed(1) },
      { name: '├─ Warm Tier', unit: storage.breakdown.warm.vendor, qty: `${storage.breakdown.warm.capacity.toFixed(1)} PB`, total: storage.warm, pct: (storage.warm/totalCapex*100).toFixed(1) },
      { name: '├─ Cold Tier', unit: storage.breakdown.cold.vendor, qty: `${storage.breakdown.cold.capacity.toFixed(1)} PB`, total: storage.cold, pct: (storage.cold/totalCapex*100).toFixed(1) },
      { name: '└─ Archive', unit: storage.breakdown.archive.vendor, qty: `${storage.breakdown.archive.capacity.toFixed(1)} PB`, total: storage.archive, pct: (storage.archive/totalCapex*100).toFixed(1) },
      { name: 'Networking Infrastructure', unit: 'Switches + Cables', qty: `${network.counts.totalSwitches} switches`, total: network.total, pct: (network.total/totalCapex*100).toFixed(1) },
      { name: '├─ Switches', unit: 'Leaf/Spine/Core', qty: `${network.counts.totalSwitches}`, total: network.switches, pct: (network.switches/totalCapex*100).toFixed(1) },
      { name: '├─ Cables', unit: `$${networkFabrics[fabricType].cablePrice}/cable`, qty: network.counts.cables.toLocaleString(), total: network.costs.cables, pct: (network.costs.cables/totalCapex*100).toFixed(1) },
      { name: '└─ Transceivers', unit: `$${networkFabrics[fabricType].transceiverPrice}/unit`, qty: network.counts.transceivers.toLocaleString(), total: network.costs.transceivers, pct: (network.costs.transceivers/totalCapex*100).toFixed(1) },
      { name: 'Data Center Infrastructure', unit: '$10M/MW', qty: `${totalPowerMW.toFixed(1)} MW`, total: datacenterCapex, pct: (datacenterCapex/totalCapex*100).toFixed(1) },
      { name: 'Cooling Infrastructure', unit: `$${coolingType === 'liquid' ? '400' : '300'}/kW`, qty: `${(gpuPowerMW*1000).toFixed(0)} kW`, total: coolingCapex, pct: (coolingCapex/totalCapex*100).toFixed(1) },
      { name: 'Software & Licensing Setup', unit: `${formatNumber(stackCost.upfrontCost / actualGPUs)}/GPU`, qty: actualGPUs.toLocaleString(), total: softwareCapex, pct: (softwareCapex/totalCapex*100).toFixed(1) }
    ];
    
    if (dpuCapex > 0) {
      capexBreakdown.push({ 
        name: 'BlueField-3 DPUs', 
        unit: '$2,500/DPU', 
        qty: Math.ceil(dpuCount).toLocaleString(), 
        total: dpuCapex, 
        pct: (dpuCapex/totalCapex*100).toFixed(1) 
      });
    }
    
    const opexBreakdown = [
      { name: 'Power Consumption', amount: annualPowerCost, pct: (annualPowerCost/annualOpex*100).toFixed(1), notes: `${totalPowerMW.toFixed(1)} MW @ $${regionData.rate.toFixed(4)}/kWh (${region})` },
      { name: 'Cooling Operations', amount: annualCoolingOpex, pct: (annualCoolingOpex/annualOpex*100).toFixed(1), notes: `${coolingType.charAt(0).toUpperCase() + coolingType.slice(1)} cooling` },
      { name: 'Staff & Personnel', amount: annualStaff, pct: (annualStaff/annualOpex*100).toFixed(1), notes: `${enterpriseInfra.breakdown.length} FTE roles (detailed breakdown available)` },
      { name: 'Hardware Maintenance', amount: annualMaintenance, pct: (annualMaintenance/annualOpex*100).toFixed(1), notes: `${maintenancePercent}% of hardware CAPEX` },
      { name: 'Storage Operations', amount: storageOpex, pct: (storageOpex/annualOpex*100).toFixed(1), notes: `$0.015/GB/month` },
      { name: 'Network Bandwidth', amount: annualBandwidth, pct: (annualBandwidth/annualOpex*100).toFixed(1), notes: '$600/GPU/year' },
      { name: 'Software Stack Licenses', amount: annualLicenses, pct: (annualLicenses/annualOpex*100).toFixed(1), notes: `${stackCost.breakdown.filter(c => c.category !== 'operational').map(c => c.component).join(', ')}` }
    ];
    
    setResults({
      totalCapex,
      annualOpex,
      costPerHour,
      totalPowerMW,
      pueValue,
      networkBandwidth: totalBandwidth,
      storageGbMonth,
      tco10year,
      capexBreakdown,
      opexBreakdown,
      storage,
      network,
      enterpriseInfra,
      // Individual CAPEX components for breakdown display
      gpuCapex,
      networkCapex: network.total,
      storageCapex: storage.total,
      coolingCapex,
      datacenterCapex,
      softwareCapex,
      details: {
        numRacks,
        numSwitches: network.counts.totalSwitches,
        dpuCount,
        utilization,
        topology,
        oversubscription,
        fabricType,
        storageArchitecture,
        requestedGPUs: numGPUs,
        actualGPUs: actualGPUs,
        systemsNeeded: systemsTotal,
        gpusPerSystem: safeRackSize,
        softwareStack: softwareStack,
        softwareStackCost: stackCost,
        supportTier: supportTier
      }
    });
  };

  // Handle switching from Basic to Advanced mode
  const handleSwitchToAdvanced = (basicConfig: any) => {
    // Populate advanced configuration with optimized values
    console.log('Switching to Advanced mode with config:', basicConfig);
    
    // Mark that we're no longer using basic config only
    setIsUsingBasicConfig(false);
    
    // Apply infrastructure settings from basic config
    if (basicConfig.infrastructure) {
      // Set GPU model directly from user selection
      setGpuModel(basicConfig.infrastructure.gpuModel);
      
      // Set GPU count
      setNumGPUs(basicConfig.infrastructure.totalGPUs);
      
      // Set cooling type based on recommendation
      const coolingMap: Record<string, string> = {
        'Liquid Cooled (Direct-to-chip)': 'liquid',
        'Hybrid Air/Liquid': 'hybrid',
        'Air Cooled (Hot aisle containment)': 'air'
      };
      const mappedCooling = coolingMap[basicConfig.infrastructure.cooling] || 'liquid';
      setCoolingType(mappedCooling);
      
      // Set storage capacity
      setTotalStorage(basicConfig.infrastructure.storageCapacity);
    }
    
    // Apply service tier distribution
    if (basicConfig.serviceTiers) {
      setTierDistribution({
        tier1: basicConfig.serviceTiers.tier1?.allocation || 0,
        tier2: basicConfig.serviceTiers.tier2?.allocation || 0,
        tier3: basicConfig.serviceTiers.tier3?.allocation || 0,
        tier4: basicConfig.serviceTiers.tier4?.allocation || 0
      });
    }
    
    // Apply storage tier distribution
    if (basicConfig.storageTiers) {
      const storageDistribution: Record<string, number> = {};
      
      // Map storage tiers to the expected format
      if (basicConfig.storageTiers.ultraHighPerf > 0) {
        storageDistribution['vast-universal'] = basicConfig.storageTiers.ultraHighPerf;
      }
      if (basicConfig.storageTiers.highPerf > 0) {
        storageDistribution['vast-performance'] = basicConfig.storageTiers.highPerf;
      }
      if (basicConfig.storageTiers.mediumPerf > 0) {
        storageDistribution['ceph-nvme'] = basicConfig.storageTiers.mediumPerf;
      }
      if (basicConfig.storageTiers.capacityTier > 0) {
        storageDistribution['ceph-hdd'] = basicConfig.storageTiers.capacityTier;
      }
      if (basicConfig.storageTiers.objectStore > 0) {
        storageDistribution['s3-compatible'] = basicConfig.storageTiers.objectStore;
      }
      
      setStorageTierDistribution(storageDistribution);
      
      // Update selected storage tiers
      const selectedTiers = Object.keys(storageDistribution).filter(tier => storageDistribution[tier] > 0);
      setSelectedStorageTiers(selectedTiers);
    }
    
    // Set reasonable defaults for other advanced settings
    setUtilization(70); // 70% utilization as used in basic calculations
    setDepreciation(4); // 4 years depreciation
    setStorageArchitecture('mixed'); // Mixed architecture
    
    // Set networking based on user selection
    const networkingType = basicConfig.infrastructure?.networking || 'roce-400';
    if (networkingType.includes('roce')) {
      setFabricType('ethernet');
      setTopology('fat-tree');
      // Set oversubscription based on networking speed
      if (networkingType === 'roce-800') {
        setOversubscription('1:1');
      } else {
        setOversubscription('2:1');
      }
    } else {
      setFabricType('infiniband');
      setTopology('fat-tree');
      setOversubscription('1:1');
    }
    
    // Set workload distribution based on service tiers
    const serviceTiers = basicConfig.serviceTiers;
    if (serviceTiers) {
      const trainingWeight = (serviceTiers.tier1?.allocation || 0) * 0.8 + 
                            (serviceTiers.tier2?.allocation || 0) * 0.65 + 
                            (serviceTiers.tier3?.allocation || 0) * 0.55;
      const inferenceWeight = (serviceTiers.tier4?.allocation || 0) * 0.9 + 
                             (serviceTiers.tier3?.allocation || 0) * 0.45;
      
      setWorkloadTraining(Math.round(trainingWeight));
      setWorkloadInference(Math.round(inferenceWeight));
      setWorkloadFinetuning(Math.max(0, 100 - Math.round(trainingWeight) - Math.round(inferenceWeight)));
    }
    
    // Switch to advanced tab
    setActiveTab('advanced');
    
    // Show success notification (if notification system exists)
    console.log('✅ Advanced mode populated with optimized values from Basic Config');
  };

  // Organized tab structure with logical groupings
  const tabGroups = [
    {
      title: 'Overview',
      tabs: [
        { id: 'overview', label: 'TCO Calculator Overview', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Configuration',
      tabs: [
        { id: 'basic', label: 'Basic Cluster Config', icon: <Zap className="w-4 h-4" />, description: 'Quick setup with automatic optimization', default: true },
        ...(isPowerUser || isAdmin ? [{ id: 'advanced', label: 'Advanced Cluster Config', icon: <Settings className="w-4 h-4" />, description: 'Full control over service tiers and infrastructure' }] : []),
        { id: 'overrides', label: 'TCO Overrides', icon: <DollarSign className="w-4 h-4" />, description: 'Fine-tune calculations' }
      ]
    },
    {
      title: 'Financials',
      tabs: [
        { id: 'financial', label: 'Revenue & EBITDA', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'capex', label: 'Complete CAPEX', icon: <Package className="w-4 h-4" /> },
        { id: 'pricing', label: 'Service Pricing', icon: <DollarSign className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Technical Analysis',
      tabs: [
        { id: 'detailed-design', label: 'Detailed Cluster Design', icon: <FileText className="w-4 h-4" />, description: 'Comprehensive technical design document' },
        { id: 'calculator', label: 'Advanced Config Details', icon: <Calculator className="w-4 h-4" /> },
        { id: 'networking', label: 'Networking', icon: <Network className="w-4 h-4" /> },
        { id: 'storage', label: 'Storage Analysis', icon: <HardDrive className="w-4 h-4" /> },
        { id: 'software', label: 'Software Stack', icon: <Cpu className="w-4 h-4" /> },
        { id: 'cooling', label: 'Cooling & Power', icon: <Thermometer className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Operations',
      tabs: [
        { id: 'operations', label: 'Operations Playbook', icon: <Settings className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Resources',
      tabs: [
        { id: 'formulas', label: 'Formulas', icon: <FileText className="w-4 h-4" /> },
        { id: 'references', label: 'References', icon: <FileText className="w-4 h-4" /> },
        ...(isAdmin ? [{ id: 'documentation', label: 'Documentation', icon: <BookOpen className="w-4 h-4" /> }] : [])
      ]
    },
    ...(isAdmin ? [{
      title: 'Admin',
      tabs: [
        ...(isSuperAdmin ? [
          { id: 'users', label: 'User Management', icon: <Settings className="w-4 h-4" /> },
          { id: 'logs', label: 'Access Logs', icon: <Shield className="w-4 h-4" /> }
        ] : [])
      ]
    }] : [])
  ];

  const config = {
    gpuModel,
    numGPUs,
    coolingType,
    region,
    utilization,
    depreciation,
    tierDistribution,
    totalStorage,
    storageArchitecture,
    hotPercent,
    warmPercent,
    coldPercent,
    archivePercent,
    hotVendor,
    warmVendor,
    coldVendor,
    archiveVendor,
    fabricType,
    topology,
    oversubscription,
    railsPerGPU,
    enableBluefield,
    pueOverride,
    gpuPriceOverride,
    maintenancePercent,
    staffMultiplier,
    customEnergyRate,
    workloadTraining,
    workloadInference,
    workloadFinetuning,
    tenantWhale,
    tenantMedium,
    tenantSmall,
    selectedStorageTiers,
    storageTierDistribution,
    storagePreset,
    softwareStack,
    supportTier,
    budget,
    expertise,
    complianceRequirements
  };

  // Check if configuration is complete for financial analysis
  const configValidation = useMemo(() => {
    // Check advanced config completeness
    const isConfigComplete = isConfigurationComplete(config);

    // Check basic config if we're using basic mode
    const isBasicConfigSufficient = isUsingBasicConfig && basicConfigData ?
      isBasicConfigurationSufficient(
        basicConfigData.gpuCount,
        basicConfigData.powerCapacity,
        basicConfigData.storageCapacity,
        basicConfigData.gpuModel,
        basicConfigData.networkingType
      ) : false;

    return {
      isConfigComplete,
      isBasicConfigSufficient,
      showFinancialTabs: isConfigComplete || (isUsingBasicConfig && isBasicConfigSufficient)
    };
  }, [config, isUsingBasicConfig, basicConfigData]);

  const handleLogout = () => {
    sessionStorage.removeItem('nullSectorUser');
    window.location.href = '/'; // Redirect to login page
  };

  const scrollToCalculateButton = () => {
    // Find the calculate button by looking for buttons with green background or "Calculate" text
    const buttons = Array.from(document.querySelectorAll('button'));
    const calculateButton = buttons.find(btn =>
      btn.textContent?.toLowerCase().includes('calculate') ||
      btn.className.includes('bg-green-600') ||
      btn.className.includes('bg-green-700')
    );

    if (calculateButton) {
      calculateButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      calculateButton.style.transform = 'scale(1.05)';
      setTimeout(() => {
        calculateButton.style.transform = 'scale(1)';
      }, 200);
    } else {
      // Fallback: scroll to bottom of page
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Enterprise Layout with Left Sidebar */}
      <div className="flex h-screen">
        {/* Left Sidebar Navigation */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">TCO Calculator</h1>
                <p className="text-sm text-gray-500">GPU SuperCluster Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                v1.9.4
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                Enterprise
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {tabGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {groupIndex > 0 && <div className="h-4"></div>}
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
                  {group.title}
                </div>
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${activeTab === tab.id 
                        ? 'bg-green-50 text-green-700 border-l-2 border-green-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {React.cloneElement(tab.icon, { 
                      className: `w-5 h-5 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}` 
                    })}
                    {tab.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dynamic Island Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Key parameters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                  <CurrencySelector compact={true} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-sm text-blue-700">
                  <Cpu className="w-4 h-4" />
                  <span>{numGPUs.toLocaleString()} × {gpuModel.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full text-sm text-purple-700">
                  <Zap className="w-4 h-4" />
                  <span>{regionRates[region]?.name || region}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-sm text-orange-700">
                  <HardDrive className="w-4 h-4" />
                  <span>{totalStorage}PB</span>
                </div>
                {/* TCO Status Indicator */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                    results
                      ? 'bg-green-50 hover:bg-green-100'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={!results ? scrollToCalculateButton : undefined}
                  title={!results ? 'Click to scroll to calculate button' : 'TCO calculation complete'}
                >
                  {results ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700">TCO Ready</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-600">TCO Pending</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Right side - User controls */}
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  !CAUTION: EXPERIMENTAL SYSTEM!
                </span>
                <span className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  {currentUser || 'Unknown'}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg flex items-center gap-2 transition hover:bg-gray-200"
                >
                  <Shield className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="p-2 md:p-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="p-4 md:p-8">
                  {activeTab === 'basic' && (
                    <BasicConfigTab 
                      onSwitchToAdvanced={handleSwitchToAdvanced}
                      onConfigChange={(config) => setBasicConfigData(config)}
                    />
                  )}

                  {activeTab === 'detailed-design' && (
                    <DetailedClusterDesign 
                      clusterConfig={{
                        gpuCount: numGPUs,
                        gpuModel: gpuModel,
                        powerCapacity: 50, // Default MW, could be calculated from config
                        storageCapacity: totalStorage,
                        networkingType: fabricType,
                        coolingType: coolingType,
                        utilizationRate: utilization,
                        powerCost: parseFloat(customEnergyRate as string) || regionRates[region]?.rate * 1000 || 50, // Convert to $/MWh
                        region: region,
                        serviceTiers: tierDistribution,
                        storageTiers: {
                          hot: hotPercent,
                          warm: warmPercent,
                          cold: coldPercent,
                          archive: archivePercent
                        },
                        workloads: {
                          training: workloadTraining,
                          inference: workloadInference,
                          finetuning: workloadFinetuning
                        },
                        depreciation: depreciation
                      }}
                    />
                  )}

                  {activeTab === 'advanced' && (isPowerUser || isAdmin) && (
                    <CalculatorTabRedesigned
                      config={config}
                      setTierDistribution={setTierDistribution}
                      setGpuModel={setGpuModel}
                      setNumGPUs={setNumGPUs}
                      setCoolingType={setCoolingType}
                      setRegion={setRegion}
                      setUtilization={setUtilization}
                      setDepreciation={setDepreciation}
                      setTotalStorage={setTotalStorage}
                      setStorageArchitecture={setStorageArchitecture}
                      setHotPercent={setHotPercent}
                      setWarmPercent={setWarmPercent}
                      setColdPercent={setColdPercent}
                      setArchivePercent={setArchivePercent}
                      setHotVendor={setHotVendor}
                      setWarmVendor={setWarmVendor}
                      setColdVendor={setColdVendor}
                      setArchiveVendor={setArchiveVendor}
                      setFabricType={setFabricType}
                      setTopology={setTopology}
                      setOversubscription={setOversubscription}
                      setRailsPerGPU={setRailsPerGPU}
                      setEnableBluefield={setEnableBluefield}
                      setPueOverride={setPueOverride}
                      setGpuPriceOverride={setGpuPriceOverride}
                      setMaintenancePercent={setMaintenancePercent}
                      setStaffMultiplier={setStaffMultiplier}
                      setCustomEnergyRate={setCustomEnergyRate}
                      setWorkloadTraining={setWorkloadTraining}
                      setWorkloadInference={setWorkloadInference}
                      setWorkloadFinetuning={setWorkloadFinetuning}
                      setTenantWhale={setTenantWhale}
                      setTenantMedium={setTenantMedium}
                      setTenantSmall={setTenantSmall}
                      setSelectedStorageTiers={setSelectedStorageTiers}
                      setStorageTierDistribution={setStorageTierDistribution}
                      setStoragePreset={setStoragePreset}
                      setSoftwareStack={setSoftwareStack}
                      setSupportTier={setSupportTier}
                      setBudget={setBudget}
                      setExpertise={setExpertise}
                      setComplianceRequirements={setComplianceRequirements}
                      coolingRequired={true}
                      calculate={calculate}
                      results={results}
                      formatNumber={formatNumber}
                    />
                  )}

                  {activeTab === 'overview' && (
                    <LandingOverviewTab 
                      currentUser={currentUser || 'Guest'} 
                      userRole={getUserRole()}
                    />
                  )}

                  {activeTab === 'calculator' && (
                    <div className="mb-4 text-gray-600">
                      Configure your GPU cluster parameters and options.
                    </div>
                  )}
            {activeTab === 'calculator' && (
              <CalculatorTabRedesigned
                config={config}
                setTierDistribution={setTierDistribution}
                setGpuModel={setGpuModel}
                setNumGPUs={setNumGPUs}
                setCoolingType={setCoolingType}
                setRegion={setRegion}
                setUtilization={setUtilization}
                setDepreciation={setDepreciation}
                setTotalStorage={setTotalStorage}
                setStorageArchitecture={setStorageArchitecture}
                setHotPercent={setHotPercent}
                setWarmPercent={setWarmPercent}
                setColdPercent={setColdPercent}
                setArchivePercent={setArchivePercent}
                setHotVendor={setHotVendor}
                setWarmVendor={setWarmVendor}
                setColdVendor={setColdVendor}
                setArchiveVendor={setArchiveVendor}
                setFabricType={setFabricType}
                setTopology={setTopology}
                setOversubscription={setOversubscription}
                setRailsPerGPU={setRailsPerGPU}
                setEnableBluefield={setEnableBluefield}
                setPueOverride={setPueOverride}
                setGpuPriceOverride={setGpuPriceOverride}
                setMaintenancePercent={setMaintenancePercent}
                setStaffMultiplier={setStaffMultiplier}
                setCustomEnergyRate={setCustomEnergyRate}
                setWorkloadTraining={setWorkloadTraining}
                setWorkloadInference={setWorkloadInference}
                setWorkloadFinetuning={setWorkloadFinetuning}
                setTenantWhale={setTenantWhale}
                setTenantMedium={setTenantMedium}
                setTenantSmall={setTenantSmall}
                setSelectedStorageTiers={setSelectedStorageTiers}
                setStorageTierDistribution={setStorageTierDistribution}
                setStoragePreset={setStoragePreset}
                setSoftwareStack={setSoftwareStack}
                setSupportTier={setSupportTier}
                setBudget={setBudget}
                setExpertise={setExpertise}
                setComplianceRequirements={setComplianceRequirements}
                coolingRequired={coolingRequired}
                calculate={calculate}
                results={results}
                formatNumber={formatNumber}
              />
            )}

            {activeTab === 'overrides' && (
              <TCOOverrideTab
                config={config}
                onOverrideChange={setTcoOverrides}
                currentOverrides={tcoOverrides}
              />
            )}
            
            {activeTab === 'financial' && (
              configValidation.showFinancialTabs ? (
                <FinancialAnalyticsTab config={config} results={results} />
              ) : (
                <ConfigurationIncompleteMessage 
                  tabName="Revenue & EBITDA"
                  description="Financial modeling requires complete cluster configuration. Please complete either the Basic Cluster Config or Advanced Cluster Config settings to view revenue and EBITDA analysis."
                />
              )
            )}
            
            {activeTab === 'capex' && (
              configValidation.showFinancialTabs ? (
                <CapexBreakdownTab config={config} results={results} />
              ) : (
                <ConfigurationIncompleteMessage 
                  tabName="Complete CAPEX"
                  description="CAPEX analysis requires complete cluster configuration. Please complete either the Basic Cluster Config or Advanced Cluster Config settings to view detailed capital expenditure breakdown."
                />
              )
            )}
            
            {activeTab === 'networking' && (
              <NetworkingTabEnhanced config={config} results={results} />
            )}
            
            {activeTab === 'storage' && (
              <StorageTabProductionEnhanced config={config} results={results} />
            )}
            
            {activeTab === 'pricing' && (
              <ServicePricingTab
                config={config}
                results={results}
                formatNumber={formatNumber}
                tierDistribution={tierDistribution}
                serviceModifiers={serviceModifiers}
                setTierDistribution={setTierDistribution}
                setServiceModifiers={setServiceModifiers}
              />
            )}

            {activeTab === 'software' && (
              <SoftwareStackTab config={config} results={results} formatNumber={formatNumber} />
            )}
            
            {activeTab === 'cooling' && (
              <CoolingPowerTabEnhanced config={config} results={results} />
            )}
            
            {activeTab === 'operations' && (
              <OperationsPlaybookTab config={config} results={results} />
            )}
            
            {activeTab === 'formulas' && (
              <FormulasTabEnhanced />
            )}
            
            {activeTab === 'documentation' && isAdmin && (
              <DocumentationTab />
            )}
            
            {activeTab === 'references' && (
              <ReferencesTab />
            )}
            
            {activeTab === 'users' && isSuperAdmin && (
              <UserManagementTab currentUser={currentUser || ''} />
            )}
            
            {activeTab === 'logs' && isSuperAdmin && (
              <AccessLogsTab config={config} results={results} />
            )}
            
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPUSuperclusterCalculator;
