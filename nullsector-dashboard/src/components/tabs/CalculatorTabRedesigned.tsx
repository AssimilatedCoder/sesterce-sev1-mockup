import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Zap, AlertTriangle, Network, HardDrive,
  ChevronDown, ChevronUp, Package, DollarSign
} from 'lucide-react';
import { gpuSpecs } from '../../data/gpuSpecs';
import { storageArchitectures, recommendedCombinations } from '../../data/storageArchitectures';
import { softwareStacks, recommendStack, calculateStackCost } from '../../data/softwareStacks';
import { useCurrency } from '../../hooks/useCurrency';
import WarningBanner from '../common/WarningBanner';
import { LocationSelector } from '../common/LocationSelector';
import { getRecommendedRate, convertElectricityRate } from '../../data/electricityPrices';
import { ServiceTierConfiguration } from '../common/ServiceTierConfiguration';
import { CalculatedStorageArchitecture } from '../common/CalculatedStorageArchitecture';
import { InfrastructureRequirements } from '../common/InfrastructureRequirements';
import { 
  ServiceTierConfig, 
  StorageRequirements, 
  InfrastructureRequirements as InfraReqs 
} from '../../utils/workloadPerformanceCalculations';
import { 
  calculateEnhancedTCO, 
  EnhancedTCOResults 
} from '../../utils/enhancedTCOCalculations';
import { EnhancedTCOResultsComponent } from '../common/EnhancedTCOResults';
import { 
  validateConfiguration, 
  ValidationSummary as ValidationSummaryType 
} from '../../utils/validationRules';
import { ValidationSummary } from '../common/ValidationSummary';
import { ArchitectureFlowDiagram } from '../common/ArchitectureFlowDiagram';
import { DesignModeSelector, DesignMode } from '../common/DesignModeSelector';
import ErrorBoundary from '../common/ErrorBoundary';
import { InfrastructureConfiguration, InfrastructureConfig } from '../common/InfrastructureConfiguration';
import { InfrastructurePresetSelector } from '../common/InfrastructurePresetSelector';
import { DerivedServiceMix } from '../common/DerivedServiceMix';
import { 
  analyzeInfrastructureCapabilities, 
  deriveOptimalServiceMix, 
  identifyServiceConstraints,
  inferWorkloadDistribution,
  ServiceMixRecommendation,
  ServiceConstraint,
  WorkloadDistribution
} from '../../utils/serviceMixDerivation';

interface CalculatorTabRedesignedProps {
  config: any;
  setTierDistribution: (value: { tier1: number; tier2: number; tier3: number; tier4: number }) => void;
  setGpuModel: (value: string) => void;
  setNumGPUs: (value: number) => void;
  setCoolingType: (value: string) => void;
  setRegion: (value: string) => void;
  setUtilization: (value: number) => void;
  setDepreciation: (value: number) => void;
  setTotalStorage: (value: number) => void;
  setStorageArchitecture: (value: string) => void;
  setHotPercent: (value: number) => void;
  setWarmPercent: (value: number) => void;
  setColdPercent: (value: number) => void;
  setArchivePercent: (value: number) => void;
  setHotVendor: (value: string) => void;
  setWarmVendor: (value: string) => void;
  setColdVendor: (value: string) => void;
  setArchiveVendor: (value: string) => void;
  setFabricType: (value: string) => void;
  setTopology: (value: string) => void;
  setOversubscription: (value: string) => void;
  setRailsPerGPU: (value: number) => void;
  setEnableBluefield: (value: boolean) => void;
  setPueOverride: (value: string) => void;
  setGpuPriceOverride: (value: string) => void;
  setMaintenancePercent: (value: number) => void;
  setStaffMultiplier: (value: number) => void;
  setCustomEnergyRate: (value: string) => void;
  setWorkloadTraining: (value: number) => void;
  setWorkloadInference: (value: number) => void;
  setWorkloadFinetuning: (value: number) => void;
  setTenantWhale: (value: number) => void;
  setTenantMedium: (value: number) => void;
  setTenantSmall: (value: number) => void;
  // New props for enhanced storage
  setSelectedStorageTiers: (value: string[]) => void;
  setStorageTierDistribution: (value: Record<string, number>) => void;
  setStoragePreset: (value: string) => void;
  // Software stack props
  setSoftwareStack: (value: string) => void;
  setSupportTier: (value: 'community' | 'business' | 'enterprise') => void;
  setBudget: (value: 'low' | 'medium' | 'high' | 'unlimited') => void;
  setExpertise: (value: 'basic' | 'intermediate' | 'advanced') => void;
  setComplianceRequirements: (value: string[]) => void;
  coolingRequired: boolean;
  calculate: () => void;
  results: any;
  formatNumber: (num: number) => string;
}

// Legacy region rates - now replaced by LocationSelector
// Kept for backward compatibility during transition
const regionRates: Record<string, { rate: number; name: string }> = {
  'us-texas': { rate: 0.047, name: 'US Texas' },
  'us-virginia': { rate: 0.085, name: 'US Virginia' },
  'us-california': { rate: 0.150, name: 'US California' },
  'europe': { rate: 0.120, name: 'Europe' },
  'asia': { rate: 0.100, name: 'Asia Pacific' }
};

export const CalculatorTabRedesigned: React.FC<CalculatorTabRedesignedProps> = ({
  config,
  setGpuModel,
  setNumGPUs,
  setCoolingType,
  setRegion,
  setUtilization,
  setDepreciation,
  setTotalStorage,
  setStorageArchitecture,
  setHotPercent,
  setWarmPercent,
  setColdPercent,
  setArchivePercent,
  setHotVendor,
  setWarmVendor,
  setColdVendor,
  setArchiveVendor,
  setFabricType,
  setTopology,
  setOversubscription,
  setRailsPerGPU,
  setEnableBluefield,
  setPueOverride,
  setGpuPriceOverride,
  setMaintenancePercent,
  setStaffMultiplier,
  setCustomEnergyRate,
  setWorkloadTraining,
  setWorkloadInference,
  setWorkloadFinetuning,
  setTenantWhale,
  setTenantMedium,
  setTenantSmall,
  setSelectedStorageTiers,
  setStorageTierDistribution,
  setStoragePreset,
  setTierDistribution,
  setSoftwareStack,
  setSupportTier,
  setBudget,
  setExpertise,
  setComplianceRequirements,
  coolingRequired,
  calculate,
  results,
  formatNumber
}) => {
  const { formatCurrency } = useCurrency();
  const spec = gpuSpecs[config.gpuModel];
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    storage: true,
    storageTiers: false,
    software: true,
    networking: true,
    advanced: false
  });
  const [touchedTiers, setTouchedTiers] = useState<string[]>([]);
  const [touchedStorageTiers, setTouchedStorageTiers] = useState<string[]>([]);
  const [touchedWorkloadTypes, setTouchedWorkloadTypes] = useState<string[]>([]);
  const [touchedTenantTypes, setTouchedTenantTypes] = useState<string[]>([]);
  
  // New service-tier-driven architecture state
  const [serviceTiers, setServiceTiers] = useState<ServiceTierConfig[]>([]);
  const [storageRequirements, setStorageRequirements] = useState<StorageRequirements | null>(null);
  const [infrastructureRequirements, setInfrastructureRequirements] = useState<InfraReqs | null>(null);
  const [enhancedTCOResults, setEnhancedTCOResults] = useState<EnhancedTCOResults | null>(null);
  const [validationSummary, setValidationSummary] = useState<ValidationSummaryType | null>(null);
  const [missingInputs, setMissingInputs] = useState<string[]>([]);

  // State for dual-mode design
  const [designMode, setDesignMode] = useState<DesignMode>('service');
  const [infrastructureConfig, setInfrastructureConfig] = useState<InfrastructureConfig>({
    compute: {
      gpuModel: 'H100 SXM',
      totalGPUs: 1000,
      nodeConfiguration: 'DGX H100 (8x H100 SXM)',
      cpuToGpuRatio: '1:2 (Balanced)'
    },
    networking: {
      fabricType: 'InfiniBand NDR 400Gb (Training optimized)',
      topologyType: 'Fat Tree (Non-blocking)',
      railConfiguration: 'Dual Rail (Redundant)',
      storageNetworkSeparation: true
    },
    storage: {
      ultraHighPerf: { capacity: 0, unit: 'TB' },
      highPerf: { capacity: 2, unit: 'PB' },
      mediumPerf: { capacity: 500, unit: 'TB' },
      capacityTier: { capacity: 20, unit: 'PB' },
      objectStore: { capacity: 5, unit: 'PB' }
    },
    power: {
      totalPowerCapacity: 15,
      coolingType: 'Liquid Cooled (Direct chip)',
      powerRedundancy: 'N+2',
      pue: 1.2
    }
  });
  
  // State for infrastructure-first derived results
  const [derivedServiceMix, setDerivedServiceMix] = useState<ServiceMixRecommendation | null>(null);
  const [derivedWorkloadDist, setDerivedWorkloadDist] = useState<WorkloadDistribution | null>(null);
  const [infrastructureConstraints, setInfrastructureConstraints] = useState<ServiceConstraint[]>([]);
  
  // Ref to prevent infinite loops in infrastructure-first mode
  const isUpdatingFromInfrastructure = useRef(false);

  // Check for missing required inputs
  const checkMissingInputs = useCallback(() => {
    const missing: string[] = [];

    if (!config.gpuModel) missing.push('GPU Model');
    if (!config.numGPUs || config.numGPUs === 0) missing.push('Number of GPUs');
    if (!config.region) missing.push('Cluster Location');
    if (!config.utilization || config.utilization === 0) missing.push('Utilization Rate');
    if (!config.depreciation || config.depreciation === 0) missing.push('Depreciation Period');

    // Check if service tiers are configured
    if (serviceTiers.length === 0) {
      missing.push('Service Tier Configuration');
    } else {
      const totalPercent = serviceTiers.reduce((sum, tier) => sum + tier.clusterPercent, 0);
      if (Math.abs(totalPercent - 100) > 0.1) {
        missing.push('Service Tier Allocation (must sum to 100%)');
      }
    }

    setMissingInputs(missing);
    return missing;
  }, [config, serviceTiers]);

  // Calculate enhanced TCO when service tiers or infrastructure requirements change
  useEffect(() => {
    if (serviceTiers.length > 0 && storageRequirements && infrastructureRequirements) {
      try {
        // Get electricity rate
        const locationRate = getRecommendedRate(config.region);
        const electricityRate = locationRate ? convertElectricityRate(locationRate, 'USD') : 0.10; // Default to $0.10/kWh

        const enhancedConfig = {
          gpuModel: config.gpuModel,
          numGPUs: config.numGPUs,
          coolingType: config.coolingType,
          electricityRate,
          currency: 'USD' as const,
          utilization: config.utilization || 90,
          depreciation: config.depreciation || 4,
          serviceTiers,
          storageRequirements,
          infrastructureRequirements,
          tcoOverrides: {}
        };

        const tcoResults = calculateEnhancedTCO(enhancedConfig);
        setEnhancedTCOResults(tcoResults);

        // Run comprehensive validation
        const validation = validateConfiguration(
          serviceTiers,
          storageRequirements,
          infrastructureRequirements,
          tcoResults,
          config.numGPUs
        );
        setValidationSummary(validation);

        // Also trigger legacy calculation for backward compatibility
        calculate();
      } catch (error) {
        console.error('Error calculating enhanced TCO:', error);
        setEnhancedTCOResults(null);
        setValidationSummary(null);
      }
    }
  }, [serviceTiers, storageRequirements, infrastructureRequirements, config.gpuModel, config.numGPUs, config.coolingType, config.region, config.utilization, config.depreciation]);

  // Trigger calculation when basic configuration changes (for immediate feedback)
  useEffect(() => {
    // Add a small delay to avoid excessive calculations during rapid input changes
    const timeoutId = setTimeout(() => {
      calculate();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [config.gpuModel, config.numGPUs, config.coolingType, config.region, config.utilization, config.depreciation, config.storagePreset, config.tierDistribution]);

  // Infrastructure-first mode calculations
  useEffect(() => {
    if (designMode === 'infrastructure' && !isUpdatingFromInfrastructure.current) {
      try {
        isUpdatingFromInfrastructure.current = true;
        
        const capabilities = analyzeInfrastructureCapabilities(infrastructureConfig);
        const serviceMix = deriveOptimalServiceMix(capabilities);
        const workloadDist = inferWorkloadDistribution(infrastructureConfig, serviceMix);
        const constraints = identifyServiceConstraints(capabilities);
        
        setDerivedServiceMix(serviceMix);
        setDerivedWorkloadDist(workloadDist);
        setInfrastructureConstraints(constraints);
        
        // Update config to match infrastructure (only if values are different)
        if (config.numGPUs !== infrastructureConfig.compute.totalGPUs) {
          setNumGPUs(infrastructureConfig.compute.totalGPUs);
        }
        if (config.gpuModel !== infrastructureConfig.compute.gpuModel) {
          setGpuModel(infrastructureConfig.compute.gpuModel);
        }
      } catch (error) {
        console.error('Error in infrastructure-first calculations:', error);
        setInfrastructureConstraints([{
          type: 'compute',
          severity: 'critical',
          message: 'Error analyzing infrastructure configuration',
          impact: 'Please check your infrastructure settings and try again'
        }]);
      } finally {
        // Reset the flag after a short delay to allow other effects to complete
        setTimeout(() => {
          isUpdatingFromInfrastructure.current = false;
        }, 100);
      }
    }
  }, [designMode, infrastructureConfig, config.numGPUs, config.gpuModel, setNumGPUs, setGpuModel]);

  // Check for missing inputs when configuration changes
  useEffect(() => {
    checkMissingInputs();
  }, [checkMissingInputs]);

  // Initialize storage configuration
  useEffect(() => {
    // Set default to VAST + Ceph optimal preset
    if (!config.storagePreset) {
      setStoragePreset('vast-ceph-optimal');
      applyStoragePreset('vast-ceph-optimal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const applyStoragePreset = (presetId: string) => {
    const preset = recommendedCombinations[presetId];
    if (preset) {
      setSelectedStorageTiers(preset.tiers);
      setStorageTierDistribution(preset.distribution);
      // Legacy compatibility - map to old vendor system
      const tierMapping: Record<string, string> = {
        'vast-universal': 'vast',
        'weka-parallel': 'weka',
        'ceph-nvme': 'ceph',
        'ceph-replicated': 'ceph',
        'ceph-hybrid': 'ceph-ssd',
        'ceph-hdd': 'ceph',
        's3-compatible': 'glacier'
      };
      
      // Map tiers to legacy hot/warm/cold/archive
      const sortedTiers = preset.tiers.sort((a, b) => {
        const catA = storageArchitectures[a]?.category;
        const catB = storageArchitectures[b]?.category;
        const order = ['extreme', 'high-performance', 'balanced', 'cost-optimized'];
        return order.indexOf(catA) - order.indexOf(catB);
      });
      
      if (sortedTiers[0]) setHotVendor(tierMapping[sortedTiers[0]] || 'vast');
      if (sortedTiers[1]) setWarmVendor(tierMapping[sortedTiers[1]] || 'ceph');
      if (sortedTiers[2]) setColdVendor(tierMapping[sortedTiers[2]] || 'ceph');
      if (sortedTiers[3]) setArchiveVendor(tierMapping[sortedTiers[3]] || 'glacier');
      
      // Set percentages
      const dist = preset.distribution;
      const values = Object.values(dist);
      setHotPercent(values[0] || 25);
      setWarmPercent(values[1] || 25);
      setColdPercent(values[2] || 30);
      setArchivePercent(values[3] || 20);
    }
  };


  const updateTierDistribution = (tierId: string, percentage: number) => {
    const newDist = {
      ...config.storageTierDistribution,
      [tierId]: percentage
    };
    setStorageTierDistribution(newDist);
  };

  const handleStorageTierChange = (tierId: string, value: number) => {
    // Track first-touch order
    if (!touchedStorageTiers.includes(tierId)) {
      setTouchedStorageTiers(prev => [...prev, tierId]);
    }

    const keys = config.selectedStorageTiers || [];
    const current: any = { ...config.storageTierDistribution };
    const oldValue = current[tierId] || 0;
    let target = Math.max(0, Math.min(100, value));
    let diff = target - oldValue;

    // Determine adjustable keys: only untouched ones (excluding current).
    const untouched = keys.filter((k: string) => k !== tierId && !touchedStorageTiers.includes(k));
    const adjustable = untouched.length > 0 ? untouched : keys.filter((k: string) => k !== tierId);
    if (adjustable.length === 0) {
      // No degrees of freedom; keep original
      return;
    }

    const epsilon = 1e-6;

    if (diff > 0) {
      // Need to take from adjustable equally without going below 0
      let remaining = diff;
      let pool = adjustable.slice();
      while (remaining > epsilon && pool.length > 0) {
        const share = remaining / pool.length;
        let takenThisRound = 0;
        const nextPool: string[] = [];
        for (const k of pool) {
          const take = Math.min(share, current[k] || 0);
          current[k] = Number(Math.max(0, (current[k] || 0) - take).toFixed(1));
          takenThisRound += take;
          if ((current[k] || 0) > 0) nextPool.push(k);
        }
        if (takenThisRound <= epsilon) break;
        remaining -= takenThisRound;
        pool = nextPool;
      }
      const actuallyTaken = diff - Math.max(0, remaining);
      target = oldValue + actuallyTaken;
      current[tierId] = Number(Math.max(0, Math.min(100, target)).toFixed(1));
    } else if (diff < 0) {
      // Need to give to adjustable equally without exceeding 100
      let remaining = -diff;
      let pool = adjustable.slice();
      while (remaining > epsilon && pool.length > 0) {
        const share = remaining / pool.length;
        let givenThisRound = 0;
        const nextPool: string[] = [];
        for (const k of pool) {
          const headroom = 100 - (current[k] || 0);
          const give = Math.min(share, headroom);
          current[k] = Number(Math.min(100, (current[k] || 0) + give).toFixed(1));
          givenThisRound += give;
          if ((current[k] || 0) < 100) nextPool.push(k);
        }
        if (givenThisRound <= epsilon) break;
        remaining -= givenThisRound;
        pool = nextPool;
      }
      const actuallyGiven = -diff - Math.max(0, remaining);
      target = oldValue - actuallyGiven;
      current[tierId] = Number(Math.max(0, Math.min(100, target)).toFixed(1));
    } else {
      // No change
      return;
    }

    // Fix rounding error to ensure sum = 100 by adjusting the last adjustable (or any other if none)
    const sum = keys.reduce((s: number, k: string) => s + (current[k] || 0), 0);
    const delta = Number((100 - sum).toFixed(1));
    const adjustKey = adjustable.find((k: string) => k !== tierId) || adjustable[0] || keys.find((k: string) => k !== tierId) || tierId;
    current[adjustKey] = Number(Math.max(0, Math.min(100, (current[adjustKey] || 0) + delta)).toFixed(1));

    setStorageTierDistribution(current);
  };

  const handleWorkloadChange = (workloadId: string, value: number) => {
    // Track first-touch order
    if (!touchedWorkloadTypes.includes(workloadId)) {
      setTouchedWorkloadTypes(prev => [...prev, workloadId]);
    }

    const keys = ['training', 'inference', 'finetuning'];
    const current: any = {
      training: config.workloadTraining,
      inference: config.workloadInference,
      finetuning: config.workloadFinetuning
    };
    const oldValue = current[workloadId] || 0;
    let target = Math.max(0, Math.min(100, value));
    let diff = target - oldValue;

    // Determine adjustable keys: only untouched ones (excluding current).
    const untouched = keys.filter((k: string) => k !== workloadId && !touchedWorkloadTypes.includes(k));
    const adjustable = untouched.length > 0 ? untouched : keys.filter((k: string) => k !== workloadId);
    if (adjustable.length === 0) {
      return;
    }

    const epsilon = 1e-6;

    if (diff > 0) {
      // Need to take from adjustable equally without going below 0
      let remaining = diff;
      let pool = adjustable.slice();
      while (remaining > epsilon && pool.length > 0) {
        const share = remaining / pool.length;
        let takenThisRound = 0;
        const nextPool: string[] = [];
        for (const k of pool) {
          const take = Math.min(share, current[k] || 0);
          current[k] = Number(Math.max(0, (current[k] || 0) - take).toFixed(1));
          takenThisRound += take;
          if ((current[k] || 0) > 0) nextPool.push(k);
        }
        if (takenThisRound <= epsilon) break;
        remaining -= takenThisRound;
        pool = nextPool;
      }
      const actuallyTaken = diff - Math.max(0, remaining);
      target = oldValue + actuallyTaken;
      current[workloadId] = Number(Math.max(0, Math.min(100, target)).toFixed(1));
    } else if (diff < 0) {
      // Need to give to adjustable equally without exceeding 100
      let remaining = -diff;
      let pool = adjustable.slice();
      while (remaining > epsilon && pool.length > 0) {
        const share = remaining / pool.length;
        let givenThisRound = 0;
        const nextPool: string[] = [];
        for (const k of pool) {
          const headroom = 100 - (current[k] || 0);
          const give = Math.min(share, headroom);
          current[k] = Number(Math.min(100, (current[k] || 0) + give).toFixed(1));
          givenThisRound += give;
          if ((current[k] || 0) < 100) nextPool.push(k);
        }
        if (givenThisRound <= epsilon) break;
        remaining -= givenThisRound;
        pool = nextPool;
      }
      const actuallyGiven = -diff - Math.max(0, remaining);
      target = oldValue - actuallyGiven;
      current[workloadId] = Number(Math.max(0, Math.min(100, target)).toFixed(1));
    } else {
      return;
    }

    // Fix rounding error to ensure sum = 100
    const sum = keys.reduce((s: number, k: string) => s + (current[k] || 0), 0);
    const delta = Number((100 - sum).toFixed(1));
    const adjustKey = adjustable.find((k: string) => k !== workloadId) || adjustable[0] || keys.find((k: string) => k !== workloadId) || workloadId;
    current[adjustKey] = Number(Math.max(0, Math.min(100, (current[adjustKey] || 0) + delta)).toFixed(1));

    // Update the individual state setters
    setWorkloadTraining(current.training);
    setWorkloadInference(current.inference);
    setWorkloadFinetuning(current.finetuning);
  };

  const handleTenantChange = (tenantId: string, value: number) => {
    // Track first-touch order
    if (!touchedTenantTypes.includes(tenantId)) {
      setTouchedTenantTypes(prev => [...prev, tenantId]);
    }

    const keys = ['whale', 'medium', 'small'];
    const current: any = {
      whale: config.tenantWhale,
      medium: config.tenantMedium,
      small: config.tenantSmall
    };
    const oldValue = current[tenantId] || 0;
    let target = Math.max(0, Math.min(100, value));
    let diff = target - oldValue;

    // Determine adjustable keys: only untouched ones (excluding current).
    const untouched = keys.filter((k: string) => k !== tenantId && !touchedTenantTypes.includes(k));
    const adjustable = untouched.length > 0 ? untouched : keys.filter((k: string) => k !== tenantId);
    if (adjustable.length === 0) {
      return;
    }

    const epsilon = 1e-6;

    if (diff > 0) {
      // Need to take from adjustable equally without going below 0
      let remaining = diff;
      let pool = adjustable.slice();
      while (remaining > epsilon && pool.length > 0) {
        const share = remaining / pool.length;
        let takenThisRound = 0;
        const nextPool: string[] = [];
        for (const k of pool) {
          const take = Math.min(share, current[k] || 0);
          current[k] = Number(Math.max(0, (current[k] || 0) - take).toFixed(1));
          takenThisRound += take;
          if ((current[k] || 0) > 0) nextPool.push(k);
        }
        if (takenThisRound <= epsilon) break;
        remaining -= takenThisRound;
        pool = nextPool;
      }
      const actuallyTaken = diff - Math.max(0, remaining);
      target = oldValue + actuallyTaken;
      current[tenantId] = Number(Math.max(0, Math.min(100, target)).toFixed(1));
    } else if (diff < 0) {
      // Need to give to adjustable equally without exceeding 100
      let remaining = -diff;
      let pool = adjustable.slice();
      while (remaining > epsilon && pool.length > 0) {
        const share = remaining / pool.length;
        let givenThisRound = 0;
        const nextPool: string[] = [];
        for (const k of pool) {
          const headroom = 100 - (current[k] || 0);
          const give = Math.min(share, headroom);
          current[k] = Number(Math.min(100, (current[k] || 0) + give).toFixed(1));
          givenThisRound += give;
          if ((current[k] || 0) < 100) nextPool.push(k);
        }
        if (givenThisRound <= epsilon) break;
        remaining -= givenThisRound;
        pool = nextPool;
      }
      const actuallyGiven = -diff - Math.max(0, remaining);
      target = oldValue - actuallyGiven;
      current[tenantId] = Number(Math.max(0, Math.min(100, target)).toFixed(1));
    } else {
      return;
    }

    // Fix rounding error to ensure sum = 100
    const sum = keys.reduce((s: number, k: string) => s + (current[k] || 0), 0);
    const delta = Number((100 - sum).toFixed(1));
    const adjustKey = adjustable.find((k: string) => k !== tenantId) || adjustable[0] || keys.find((k: string) => k !== tenantId) || tenantId;
    current[adjustKey] = Number(Math.max(0, Math.min(100, (current[adjustKey] || 0) + delta)).toFixed(1));

    // Update the individual state setters
    setTenantWhale(current.whale);
    setTenantMedium(current.medium);
    setTenantSmall(current.small);
  };

  return (
    <div className="space-y-4">
      {/* Design Mode Selector */}
      <DesignModeSelector mode={designMode} onModeChange={setDesignMode} />

      {/* Architecture Flow Overview */}
      <ArchitectureFlowDiagram isConfigured={serviceTiers.length > 0 && enhancedTCOResults !== null} />

      {/* Missing Inputs Warning */}
      {missingInputs.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Configuration Required
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Complete the following inputs to enable full TCO calculations:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {missingInputs.map((input, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-yellow-700">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                    <span>{input}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-yellow-600 mt-3">
                💡 Calculations update automatically as you provide inputs. No manual calculation required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Software Licensing Warning Banner */}
      <WarningBanner
        title="Software Stack Pricing"
        message="This TCO calculator now includes dynamic software stack pricing with multiple pre-configured options. Select your preferred stack in the Software Stack Configuration section above. Prices reflect real-world licensing costs and FTE requirements."
        className="mb-4 mx-0"
      />

      

      {/* GPU Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-3 h-3 text-gray-500" />
          GPU Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">GPU Model</label>
            <select 
              value={config.gpuModel}
              onChange={(e) => setGpuModel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <optgroup label="NVIDIA Data Center (NVLink)">
                <option value="gb200">GB200 NVL72 (1,542W)</option>
                <option value="gb300">GB300 NVL72 (1,715W - 2025)</option>
                <option value="h100-sxm">H100 SXM5 (700W)</option>
                <option value="h200-sxm">H200 SXM (700W)</option>
              </optgroup>
              <optgroup label="NVIDIA Professional (PCIe)">
                <option value="h100-pcie">H100 PCIe (350W)</option>
                <option value="h200-pcie">H200 PCIe (600W)</option>
                <option value="rtx6000-blackwell">RTX 6000 Blackwell (300W)</option>
              </optgroup>
              <optgroup label="AMD Instinct (Infinity Fabric)">
                <option value="mi355x">AMD MI355X (750W)</option>
                <option value="mi300x">AMD MI300X (750W)</option>
              </optgroup>
            </select>
            {/* GPU Architecture Warnings */}
            {(() => {
              const spec = gpuSpecs[config.gpuModel];
              if (!spec) return null;
              
              return (
                <div className="mt-2 space-y-1">
                  {spec.warnings && spec.warnings.map((warning, index) => (
                    <div key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-gray-500" />
                      {warning}
                    </div>
                  ))}
                  {spec.vendor === 'amd' && (
                    <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-gray-500" />
                      AMD ROCm software stack required
                    </div>
                  )}
                  {spec.interconnect !== 'nvlink' && config.numGPUs > 10000 && (
                    <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-gray-500" />
                      Non-NVLink architecture - consider networking implications for large scale
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Number of GPUs</label>
            <input 
              type="number"
              value={config.numGPUs}
              onChange={(e) => setNumGPUs(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              step="1000"
              min="72"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Cooling Type</label>
            <select 
              value={config.coolingType}
              onChange={(e) => setCoolingType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={coolingRequired}
            >
              <option value="air">Air Cooling</option>
              <option value="liquid">Liquid Cooling</option>
            </select>
            {coolingRequired && (
              <span className="text-xs text-gray-600 mt-1 block">Liquid cooling required</span>
            )}
          </div>
          
          <div>
            <LocationSelector
              selectedLocation={config.region}
              onLocationChange={setRegion}
              showRateInfo={true}
              compact={false}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Utilization Rate (%)</label>
            <input 
              type="number"
              value={config.utilization}
              onChange={(e) => setUtilization(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              min="0"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Depreciation Period (Useful Life, years)</label>
            <select 
              value={config.depreciation}
              onChange={(e) => setDepreciation(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="3">3 years</option>
              <option value="4">4 years</option>
              <option value="5">5 years</option>
            </select>
          </div>
        </div>

      </div>

      {/* Conditional Configuration Based on Design Mode */}
      {designMode === 'service' ? (
        <ServiceTierConfiguration
          totalGPUs={config.numGPUs}
          onServiceTiersChange={setServiceTiers}
          onStorageRequirementsChange={setStorageRequirements}
          onInfrastructureRequirementsChange={setInfrastructureRequirements}
        />
      ) : (
        <ErrorBoundary>
          {/* Infrastructure Preset Selector */}
          <InfrastructurePresetSelector onPresetSelect={setInfrastructureConfig} />
          
          {/* Infrastructure Configuration */}
          <ErrorBoundary>
            <InfrastructureConfiguration
              config={infrastructureConfig}
              onChange={setInfrastructureConfig}
            />
          </ErrorBoundary>
          
          {/* Derived Service Mix Display */}
          {derivedServiceMix && derivedWorkloadDist && (
            <ErrorBoundary>
              <DerivedServiceMix
                serviceMix={derivedServiceMix}
                workloadDistribution={derivedWorkloadDist}
                constraints={infrastructureConstraints}
                totalGPUs={infrastructureConfig.compute.totalGPUs}
              />
            </ErrorBoundary>
          )}
        </ErrorBoundary>
      )}

      {/* Validation Summary */}
      {validationSummary && (
        <ValidationSummary validationSummary={validationSummary} />
      )}

      {/* Calculated Storage Architecture */}
      {storageRequirements && (
        <CalculatedStorageArchitecture
          storageRequirements={storageRequirements}
          totalGPUs={config.numGPUs}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Storage Override */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <HardDrive className="w-3 h-3 text-gray-500" />
          Storage Override
        </h3>
        <p className="text-xs text-gray-600 mb-4">Override calculated storage requirements with custom configuration</p>
        
        {/* Total PB Override */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Storage Capacity Override</label>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={config.totalStorage}
              onChange={(e) => setTotalStorage(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="Enter total PB required"
            />
            <span className="text-sm text-gray-600 font-medium">PB</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Override calculated storage requirements</span>
        </div>

        {/* Storage Tier Selection and Distribution */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Storage Tier Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Extreme Performance */}
            <div>
              <h5 className="text-xs font-semibold text-gray-800 mb-1">Extreme Performance</h5>
              <p className="text-xs text-gray-600 mb-3">All-NVMe, &lt;100μs latency</p>
              <div className="relative">
                <select 
                  value={config.selectedStorageTiers?.find((t: string) => ['vast-universal', 'weka-parallel', 'ddn-exascaler'].includes(t)) || ''}
                  onChange={(e) => {
                    const newTiers = config.selectedStorageTiers?.filter((t: string) => !['vast-universal', 'weka-parallel', 'ddn-exascaler'].includes(t)) || [];
                    if (e.target.value) {
                      newTiers.push(e.target.value);
                    }
                    setSelectedStorageTiers(newTiers);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Option</option>
                  <option value="vast-universal">VAST Universal - 1+ TB/GPU, €598K/PB</option>
                  <option value="weka-parallel">WEKA Parallel - 720 GB/GPU, €437K/PB</option>
                  <option value="ddn-exascaler">DDN EXAScaler - 1+ TB/GPU, €920K/PB</option>
                </select>
                {config.selectedStorageTiers?.find((t: string) => ['vast-universal', 'weka-parallel', 'ddn-exascaler'].includes(t)) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {config.selectedStorageTiers.includes('vast-universal') && "QLC economics, 100k+ GPU scale"}
                    {config.selectedStorageTiers.includes('weka-parallel') && "GPUDirect, software-defined"}
                    {config.selectedStorageTiers.includes('ddn-exascaler') && "HW accelerated, 100k+ GPUs"}
                  </div>
                )}
              </div>
            </div>

            {/* High Performance */}
            <div>
              <h5 className="text-xs font-semibold text-gray-800 mb-1">High Performance</h5>
              <p className="text-xs text-gray-600 mb-3">All-Flash, &lt;1ms latency</p>
              <div className="relative">
                <select 
                  value={config.selectedStorageTiers?.find((t: string) => ['pure-flashblade', 'netapp-aff'].includes(t)) || ''}
                  onChange={(e) => {
                    const newTiers = config.selectedStorageTiers?.filter((t: string) => !['pure-flashblade', 'netapp-aff'].includes(t)) || [];
                    if (e.target.value) {
                      newTiers.push(e.target.value);
                    }
                    setSelectedStorageTiers(newTiers);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Option</option>
                  <option value="pure-flashblade">Pure FlashBlade/E - 3.4 TB/GPU, €736K/PB</option>
                  <option value="netapp-aff">NetApp AFF - 350 GB/GPU, €644K/PB</option>
                </select>
                {config.selectedStorageTiers?.find((t: string) => ['pure-flashblade', 'netapp-aff'].includes(t)) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {config.selectedStorageTiers.includes('pure-flashblade') && "Enterprise, Evergreen sub"}
                    {config.selectedStorageTiers.includes('netapp-aff') && "Enterprise NAS/SAN"}
                  </div>
                )}
              </div>
            </div>

            {/* Balanced Performance */}
            <div>
              <h5 className="text-xs font-semibold text-gray-800 mb-1">Balanced Performance</h5>
              <p className="text-xs text-gray-600 mb-3">Ceph-based, &lt;5ms latency</p>
              <div className="relative">
                <select 
                  value={config.selectedStorageTiers?.find((t: string) => ['ceph-nvme', 'ceph-replicated', 'ceph-hybrid', 'dell-powerscale'].includes(t)) || ''}
                  onChange={(e) => {
                    const newTiers = config.selectedStorageTiers?.filter((t: string) => !['ceph-nvme', 'ceph-replicated', 'ceph-hybrid', 'dell-powerscale'].includes(t)) || [];
                    if (e.target.value) {
                      newTiers.push(e.target.value);
                    }
                    setSelectedStorageTiers(newTiers);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Option</option>
                  <option value="ceph-nvme">Ceph All-NVMe (EC 8+3) - 100 GB/GPU, €312K/PB</option>
                  <option value="ceph-replicated">Ceph 3-Way Replication - 120 GB/GPU, €450K/PB</option>
                  <option value="ceph-hybrid">Ceph Hybrid (EC 8+3) - 50 GB/GPU, €184K/PB</option>
                  <option value="dell-powerscale">Dell PowerScale - 100 GB/GPU, €352K/PB</option>
                </select>
                {config.selectedStorageTiers?.find((t: string) => ['ceph-nvme', 'ceph-replicated', 'ceph-hybrid', 'dell-powerscale'].includes(t)) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {config.selectedStorageTiers.includes('ceph-nvme') && "Erasure coding 8+3, 73% efficiency"}
                    {config.selectedStorageTiers.includes('ceph-replicated') && "3-way replication, 33% efficiency, high performance"}
                    {config.selectedStorageTiers.includes('ceph-hybrid') && "NVMe cache + SSD capacity, erasure coding"}
                    {config.selectedStorageTiers.includes('dell-powerscale') && "Enterprise scale-out"}
                  </div>
                )}
              </div>
            </div>

            {/* Cost-Optimized */}
            <div>
              <h5 className="text-xs font-semibold text-gray-800 mb-1">Cost-Optimized</h5>
              <p className="text-xs text-gray-600 mb-3">HDD/Object, &lt;100ms latency</p>
              <div className="relative">
                <select 
                  value={config.selectedStorageTiers?.find((t: string) => ['ceph-hdd', 's3-compatible'].includes(t)) || ''}
                  onChange={(e) => {
                    const newTiers = config.selectedStorageTiers?.filter((t: string) => !['ceph-hdd', 's3-compatible'].includes(t)) || [];
                    if (e.target.value) {
                      newTiers.push(e.target.value);
                    }
                    setSelectedStorageTiers(newTiers);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Option</option>
                  <option value="ceph-hdd">Ceph HDD - 10 GB/GPU, €92K/PB</option>
                  <option value="s3-compatible">S3 Object - 5 GB/GPU, €49K/PB CAPEX</option>
                </select>
                {config.selectedStorageTiers?.find((t: string) => ['ceph-hdd', 's3-compatible'].includes(t)) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {config.selectedStorageTiers.includes('ceph-hdd') && "SSD cache + HDD capacity"}
                    {config.selectedStorageTiers.includes('s3-compatible') && "Archive, 11 9s durability"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Storage Distribution Sliders */}
          {config.selectedStorageTiers?.length > 0 && (
            <div className="p-3 bg-gray-100 rounded border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-gray-800">Storage Tier Distribution (%)</h4>
                <button
                  type="button"
                  onClick={() => {
                    const equalShare = Math.floor(100 / config.selectedStorageTiers.length);
                    const newDist: any = {};
                    config.selectedStorageTiers.forEach((tierId: string, index: number) => {
                      newDist[tierId] = index === 0 ? 100 - (equalShare * (config.selectedStorageTiers.length - 1)) : equalShare;
                    });
                    setStorageTierDistribution(newDist);
                    setTouchedStorageTiers([]);
                  }}
                  className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">Adjust the percentage distribution across selected storage tiers. Total must equal 100%.</p>
              
              <div className="space-y-3">
                {config.selectedStorageTiers.map((tierId: string) => {
                  const tierName = {
                    'vast-universal': 'VAST Universal',
                    'weka-parallel': 'WEKA Parallel',
                    'ddn-exascaler': 'DDN EXAScaler',
                    'pure-flashblade': 'Pure FlashBlade/E',
                    'netapp-aff': 'NetApp AFF',
                    'ceph-nvme': 'Ceph All-NVMe',
                    'ceph-replicated': 'Ceph 3-Way Replication',
                    'ceph-hybrid': 'Ceph Hybrid',
                    'dell-powerscale': 'Dell PowerScale',
                    'ceph-hdd': 'Ceph HDD',
                    's3-compatible': 'S3 Object'
                  }[tierId] || tierId;

                  const percentage = config.storageTierDistribution?.[tierId] || 0;
                  const capacityPB = (config.totalStorage * percentage / 100).toFixed(1);

                  return (
                    <div key={tierId} className="flex items-center gap-3">
                      <div className="w-32 text-xs font-medium text-gray-700">{tierName}</div>
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={percentage}
                          onChange={(e) => handleStorageTierChange(tierId, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gray"
                        />
                      </div>
                      <div className="w-12 text-xs font-medium text-gray-700 text-right">{percentage}%</div>
                      <div className="w-16 text-xs text-gray-500 text-right">{capacityPB} PB</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Infrastructure Requirements */}
      {infrastructureRequirements && (
        <InfrastructureRequirements
          infrastructureRequirements={infrastructureRequirements}
          totalGPUs={config.numGPUs}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Enhanced TCO Results */}
      {enhancedTCOResults && (
        <EnhancedTCOResultsComponent
          tcoResults={enhancedTCOResults}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Legacy Storage Configuration - Hidden in new architecture */}
      <div className="hidden bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="service-tier-distribution mt-4 p-3 bg-gray-100 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-gray-800">Service Tier Distribution</h4>
            <button
              type="button"
              onClick={() => { setTierDistribution({ tier1: 30, tier2: 35, tier3: 25, tier4: 10 }); setTouchedTiers([]); }}
              className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >Reset</button>
          </div>
          <p className="text-xs text-gray-600 mb-2">Adjust the percentage mix of customer types. Total must equal 100%.</p>
          {(() => {
            const items = [
              { id: 'tier1', label: 'Tier 1: Bare Metal GPU Access', desc: 'Direct hardware access' },
              { id: 'tier2', label: 'Tier 2: Orchestrated Kubernetes', desc: 'Managed K8s environments' },
              { id: 'tier3', label: 'Tier 3: Managed MLOps Platform', desc: 'Turnkey ML platform' },
              { id: 'tier4', label: 'Tier 4: Inference-as-a-Service', desc: 'Serverless inference' }
            ];

            const defaults: any = { tier1: 30, tier2: 35, tier3: 25, tier4: 10 };
            const td = config.tierDistribution || defaults;

            const handleChange = (tierId: string, value: number) => {
              // Track first-touch order
              if (!touchedTiers.includes(tierId)) {
                setTouchedTiers(prev => [...prev, tierId]);
              }

              const keys = ['tier1','tier2','tier3','tier4'];
              const current: any = { ...td };
              const oldValue = current[tierId] || 0;
              let target = Math.max(0, Math.min(100, value));
              let diff = target - oldValue;

              // Determine adjustable keys: only untouched ones (excluding current).
              const untouched = keys.filter(k => k !== tierId && !touchedTiers.includes(k));
              const adjustable = untouched.length > 0 ? untouched : keys.filter(k => k !== tierId);
              if (adjustable.length === 0) {
                // No degrees of freedom; keep original
                return;
              }

              const epsilon = 1e-6;

              if (diff > 0) {
                // Need to take from adjustable equally without going below 0
                let remaining = diff;
                let pool = adjustable.slice();
                while (remaining > epsilon && pool.length > 0) {
                  const share = remaining / pool.length;
                  let takenThisRound = 0;
                  const nextPool: string[] = [];
                  for (const k of pool) {
                    const take = Math.min(share, current[k]);
                    current[k] = Number(Math.max(0, current[k] - take).toFixed(1));
                    takenThisRound += take;
                    if (current[k] > 0) nextPool.push(k);
                  }
                  if (takenThisRound <= epsilon) break;
                  remaining -= takenThisRound;
                  pool = nextPool;
                }
                const actuallyTaken = diff - Math.max(0, remaining);
                target = oldValue + actuallyTaken;
                current[tierId] = Number(Math.max(0, Math.min(100, target)).toFixed(1));
              } else if (diff < 0) {
                // Need to give to adjustable equally without exceeding 100
                let remaining = -diff;
                let pool = adjustable.slice();
                while (remaining > epsilon && pool.length > 0) {
                  const share = remaining / pool.length;
                  let givenThisRound = 0;
                  const nextPool: string[] = [];
                  for (const k of pool) {
                    const headroom = 100 - current[k];
                    const give = Math.min(share, headroom);
                    current[k] = Number(Math.min(100, current[k] + give).toFixed(1));
                    givenThisRound += give;
                    if (current[k] < 100) nextPool.push(k);
                  }
                  if (givenThisRound <= epsilon) break;
                  remaining -= givenThisRound;
                  pool = nextPool;
                }
                const actuallyGiven = -diff - Math.max(0, remaining);
                target = oldValue - actuallyGiven;
                current[tierId] = Number(Math.max(0, Math.min(100, target)).toFixed(1));
              } else {
                // No change
                return;
              }

              // Fix rounding error to ensure sum = 100 by adjusting the last adjustable (or any other if none)
              const sum = keys.reduce((s, k) => s + (current[k] || 0), 0);
              const delta = Number((100 - sum).toFixed(1));
              const adjustKey = adjustable.find(k => k !== tierId) || adjustable[0] || keys.find(k => k !== tierId) || tierId;
              current[adjustKey] = Number(Math.max(0, Math.min(100, (current[adjustKey] || 0) + delta)).toFixed(1));

              setTierDistribution(current);
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((t) => (
                  <div key={t.id} className="p-3 bg-white rounded border border-gray-200">
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t.label}</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={td?.[t.id] ?? defaults[t.id]}
                        onChange={(e) => handleChange(t.id, parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={td?.[t.id] ?? defaults[t.id]}
                        onChange={(e) => handleChange(t.id, Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <span className="text-sm font-semibold text-gray-600">%</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">{t.desc}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="text-[11px] text-gray-700 mt-2">
            Total: {(() => {
              const td2 = config.tierDistribution || { tier1: 30, tier2: 35, tier3: 25, tier4: 10 };
              const total = (td2.tier1 + td2.tier2 + td2.tier3 + td2.tier4);
              return `${(total as any).toFixed ? (total as any).toFixed(1) : total}%`;
            })()}
            {(() => {
              const td2 = config.tierDistribution || { tier1: 30, tier2: 35, tier3: 25, tier4: 10 };
              const total = td2.tier1 + td2.tier2 + td2.tier3 + td2.tier4;
              return Math.abs(total - 100) > 0.1 ? <span className="text-gray-600 ml-1">(Total must equal 100%)</span> : null;
            })()}
          </div>
        </div>
        {/* End Service Tier Distribution */}

        {/* Workload Distribution Sliders */}
        <div className="p-3 bg-gray-100 rounded border border-gray-200 mt-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-gray-800">Workload Distribution (%)</h4>
            <button
              type="button"
              onClick={() => { 
                setWorkloadTraining(70); 
                setWorkloadInference(20); 
                setWorkloadFinetuning(10); 
                setTouchedWorkloadTypes([]);
              }}
              className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >Reset</button>
          </div>
          <p className="text-xs text-gray-600 mb-2">Adjust the percentage mix of workload types. Total must equal 100%.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'training', name: 'Training Workloads', desc: 'High bandwidth, 2.7 GiB/s per GPU', value: config.workloadTraining, setter: setWorkloadTraining },
              { id: 'inference', name: 'Inference Workloads', desc: 'Lower bandwidth, 100-500 MB/s per GPU', value: config.workloadInference, setter: setWorkloadInference },
              { id: 'finetuning', name: 'Fine-tuning Workloads', desc: 'Medium bandwidth, 2.0 GiB/s per GPU', value: config.workloadFinetuning, setter: setWorkloadFinetuning }
            ].map((workload) => (
              <div key={workload.id} className="p-3 bg-white rounded border border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">{workload.name}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={workload.value}
                    onChange={(e) => handleWorkloadChange(workload.id, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={workload.value}
                    onChange={(e) => handleWorkloadChange(workload.id, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-600">%</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{workload.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Total: {config.workloadTraining + config.workloadInference + config.workloadFinetuning}%
            {config.workloadTraining + config.workloadInference + config.workloadFinetuning !== 100 && 
              <span className="text-gray-600 ml-1">(Must equal 100%)</span>
            }
          </div>
        </div>

        {/* Multi-Tenant Distribution Sliders */}
        <div className="p-3 bg-gray-100 rounded border border-gray-200 mt-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-gray-800">Multi-Tenant Distribution (%)</h4>
            <button
              type="button"
              onClick={() => { 
                setTenantWhale(60); 
                setTenantMedium(30); 
                setTenantSmall(10); 
                setTouchedTenantTypes([]);
              }}
              className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >Reset</button>
          </div>
          <p className="text-xs text-gray-600 mb-2">Adjust the percentage mix of tenant types. Total must equal 100%.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'whale', name: 'Whale Tenants (>1000 GPUs)', desc: 'Dedicated partitions, 99.9% SLA', value: config.tenantWhale, setter: setTenantWhale },
              { id: 'medium', name: 'Medium Tenants (100-1000 GPUs)', desc: 'Shared with QoS guarantees', value: config.tenantMedium, setter: setTenantMedium },
              { id: 'small', name: 'Small Tenants (<100 GPUs)', desc: 'Best effort pools, container CSI', value: config.tenantSmall, setter: setTenantSmall }
            ].map((tenant) => (
              <div key={tenant.id} className="p-3 bg-white rounded border border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">{tenant.name}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tenant.value}
                    onChange={(e) => handleTenantChange(tenant.id, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={tenant.value}
                    onChange={(e) => handleTenantChange(tenant.id, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-600">%</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{tenant.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Total: {config.tenantWhale + config.tenantMedium + config.tenantSmall}%
            {config.tenantWhale + config.tenantMedium + config.tenantSmall !== 100 && 
              <span className="text-gray-600 ml-1">(Must equal 100%)</span>
            }
          </div>
        </div>
      </div>


      {/* Results Section */}
      {results && (
        <div className="mt-8 space-y-6">
          {/* Warning Banner Above Results */}
          <WarningBanner
            className="rounded-lg"
            title="Preliminary Results"
            message="These calculations use current overrides and assumptions. Adjust parameters above to refine the model before sharing externally."
          />
          
          <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Total CAPEX</div>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(results.totalCapex)}</div>
              <div className="text-xs text-gray-500">One-time investment</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Annual OPEX</div>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(results.annualOpex)}</div>
              <div className="text-xs text-gray-500">Operating costs/year</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Cost per GPU Hour</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(results.costPerHour)}</div>
              <div className="text-xs text-gray-500">At {config.utilization}% utilization</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">5-Year TCO</div>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(results.totalCapex + (results.annualOpex * 5))}</div>
              <div className="text-xs text-gray-500">Total cost of ownership</div>
            </div>
          </div>


          {/* Cost Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CAPEX Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">CAPEX Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.capexBreakdown.map((item: any, index: number) => (
                      <tr key={index} className={item.name.startsWith('├') || item.name.startsWith('└') ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-2 text-sm">{item.name}</td>
                        <td className="px-4 py-2 text-sm">{item.unit}</td>
                        <td className="px-4 py-2 text-sm">{item.qty}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">{formatNumber(item.total)}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-600">{item.pct}%</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td colSpan={3} className="px-4 py-2">Total CAPEX</td>
                      <td className="px-4 py-2 text-right">{formatNumber(results.totalCapex)}</td>
                      <td className="px-4 py-2 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* OPEX Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Annual OPEX Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Annual Cost</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.opexBreakdown.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">{formatNumber(item.amount)}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-600">{item.pct}%</td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-xs">{item.notes}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td className="px-4 py-2">Total Annual OPEX</td>
                      <td className="px-4 py-2 text-right">{formatNumber(results.annualOpex)}</td>
                      <td className="px-4 py-2 text-right">100%</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};
