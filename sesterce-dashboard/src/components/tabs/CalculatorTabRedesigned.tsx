import React, { useState, useEffect } from 'react';
import { 
  Zap, AlertTriangle, Network, HardDrive, Settings,
  ChevronDown, ChevronUp, Package, DollarSign
} from 'lucide-react';
import { gpuSpecs } from '../../data/gpuSpecs';
import { storageArchitectures, recommendedCombinations, tierCombinationRules } from '../../data/storageArchitectures';
import { softwareStacks, recommendStack, calculateStackCost } from '../../data/softwareStacks';

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
  const spec = gpuSpecs[config.gpuModel];
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    storage: true,
    software: true,
    networking: true,
    advanced: false
  });
  const [touchedTiers, setTouchedTiers] = useState<string[]>([]);

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

  const toggleStorageTier = (tierId: string, checked: boolean) => {
    const currentTiers = config.selectedStorageTiers || [];
    let newTiers: string[];
    
    if (checked) {
      newTiers = [...currentTiers, tierId];
    } else {
      newTiers = currentTiers.filter((t: string) => t !== tierId);
      // Remove distribution for unchecked tier
      const newDist = { ...config.storageTierDistribution };
      delete newDist[tierId];
      setStorageTierDistribution(newDist);
    }
    
    setSelectedStorageTiers(newTiers);
    
    // Check for warnings
    const warnings: string[] = [];
    tierCombinationRules.warnings.forEach(rule => {
      if (rule.condition(newTiers)) {
        warnings.push(rule.message);
      }
    });
    
    // Show warnings if any
    if (warnings.length > 0) {
      // You could set these warnings to state and display them in the UI
      console.warn('Storage configuration warnings:', warnings);
    }
  };

  const updateTierDistribution = (tierId: string, percentage: number) => {
    const newDist = {
      ...config.storageTierDistribution,
      [tierId]: percentage
    };
    setStorageTierDistribution(newDist);
  };

  return (
    <div className="space-y-4">
      {/* Software Licensing Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-green-800 mb-1">Software Stack Pricing</h4>
            <p className="text-sm text-green-700">
              This TCO calculator now includes dynamic software stack pricing with multiple pre-configured options. 
              Select your preferred stack in the Software Stack Configuration section above. Prices reflect real-world licensing costs and FTE requirements.
            </p>
          </div>
        </div>
      </div>

      

      {/* GPU Configuration + Service Tier Distribution */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-500" />
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
              <option value="gb200">GB200 NVL72</option>
              <option value="gb300">GB300 NVL72</option>
              <option value="h100-sxm">H100 SXM</option>
              <option value="h100-pcie">H100 PCIe</option>
            </select>
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
              <span className="text-xs text-orange-600 mt-1 block">Liquid cooling required</span>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Region</label>
            <select 
              value={config.region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {Object.entries(regionRates).map(([key, data]) => (
                <option key={key} value={key}>{data.name}</option>
              ))}
            </select>
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

        {/* Service Tier Distribution (moved here) */}
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

            const normalizeKeep = (updated: any, keepKey: string) => {
              const keys = ['tier1','tier2','tier3','tier4'];
              let total = keys.reduce((s, k) => s + (updated[k] || 0), 0);
              if (total === 100) return updated;
              const delta = 100 - total;
              const otherKeys = keys.filter(k => k !== keepKey);
              const sumOthers = otherKeys.reduce((s, k) => s + (updated[k] || 0), 0);
              if (sumOthers <= 0) {
                const share = delta / otherKeys.length;
                otherKeys.forEach(k => { updated[k] = Math.max(0, Math.min(100, (updated[k] || 0) + share)); });
              } else {
                otherKeys.forEach(k => {
                  const proportion = (updated[k] || 0) / sumOthers;
                  updated[k] = Math.max(0, Math.min(100, (updated[k] || 0) + delta * proportion));
                });
              }
              ['tier1','tier2','tier3','tier4'].forEach(k => { updated[k] = Number(Math.max(0, Math.min(100, updated[k] || 0)).toFixed(1)); });
              return updated;
            };

            const handleChange = (tierId: string, value: number) => {
              if (!touchedTiers.includes(tierId)) {
                setTouchedTiers(prev => [...prev, tierId]);
              }
              const keys = ['tier1','tier2','tier3','tier4'];
              const current = td;
              const oldValue = (current as any)[tierId] || 0;
              const diff = value - oldValue;
              const untouched = keys.filter(k => k !== tierId && !touchedTiers.includes(k));
              const adjustable = untouched.length > 0 ? untouched : keys.filter(k => k !== tierId);
              const updated: any = { ...current, [tierId]: value };
              const share = adjustable.length > 0 ? (-diff / adjustable.length) : 0;
              adjustable.forEach(k => {
                updated[k] = Math.max(0, Math.min(100, ((current as any)[k] || 0) + share));
              });
              const normalized = normalizeKeep(updated, tierId);
              setTierDistribution(normalized);
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
                      <span className="text-sm font-semibold text-blue-600">%</span>
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
              return Math.abs(total - 100) > 0.1 ? <span className="text-red-600 ml-1">(Total must equal 100%)</span> : null;
            })()}
          </div>
        </div>
        {/* End Service Tier Distribution */}
      </div>

      {/* Comprehensive Storage Configuration */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
        <h3 
          className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2 cursor-pointer"
          onClick={() => toggleSection('storage')}
        >
          <HardDrive className="w-4 h-4 text-blue-600" />
          Comprehensive Storage Architecture Configuration
          {expandedSections.storage ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </h3>
        
        {expandedSections.storage && (
          <>
            {/* Total Capacity and Quick Presets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Storage Capacity</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={config.totalStorage}
                    onChange={(e) => setTotalStorage(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 font-medium">PB</span>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">Total across all tiers</span>
              </div>
              
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Quick Architecture Presets</label>
                <select 
                  value={config.storagePreset || 'vast-ceph-optimal'}
                  onChange={(e) => {
                    setStoragePreset(e.target.value);
                    if (e.target.value !== 'custom') {
                      applyStoragePreset(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="vast-ceph-optimal">VAST + Ceph Multi-Tier (Recommended) - $615K/PB TCO</option>
                  <option value="all-flash-performance">All-Flash Maximum Performance - $1.28M/PB TCO</option>
                  <option value="cost-optimized-scale">Cost-Optimized at Scale - $435K/PB TCO</option>
                  <option value="enterprise-balanced">Enterprise Balanced - $1.4M/PB TCO</option>
                  <option value="custom">Custom Configuration</option>
                </select>
              </div>
            </div>

            {/* Storage Tier Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Select Storage Tiers & Distribution</h4>
              <div className="space-y-3">
                {/* Extreme Performance Tiers */}
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <h5 className="text-xs font-semibold text-red-800 mb-2">🚀 Extreme Performance (All-NVMe, &lt;100μs latency)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('vast-universal') || false}
                        onChange={(e) => toggleStorageTier('vast-universal', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">VAST Universal</div>
                        <div className="text-gray-600">1+ TB/s/PB, $650K/PB</div>
                        <div className="text-gray-500">QLC economics, 100k+ GPU scale</div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('weka-parallel') || false}
                        onChange={(e) => toggleStorageTier('weka-parallel', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">WEKA Parallel</div>
                        <div className="text-gray-600">720 GB/s/PB, $475K/PB</div>
                        <div className="text-gray-500">GPUDirect, software-defined</div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('ddn-exascaler') || false}
                        onChange={(e) => toggleStorageTier('ddn-exascaler', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">DDN EXAScaler</div>
                        <div className="text-gray-600">1.1+ TB/s/PB, $1M/PB</div>
                        <div className="text-gray-500">HW accelerated, 100k+ GPUs</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* High Performance Tiers */}
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <h5 className="text-xs font-semibold text-orange-800 mb-2">⚡ High Performance (All-Flash, &lt;1ms latency)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('pure-flashblade') || false}
                        onChange={(e) => toggleStorageTier('pure-flashblade', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">Pure FlashBlade//E</div>
                        <div className="text-gray-600">3.4 TB/s/PB, $800K/PB</div>
                        <div className="text-gray-500">Enterprise, Evergreen sub</div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('netapp-aff') || false}
                        onChange={(e) => toggleStorageTier('netapp-aff', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">NetApp AFF</div>
                        <div className="text-gray-600">350 GB/s/PB, $700K/PB</div>
                        <div className="text-gray-500">Enterprise NAS/SAN</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Balanced/Ceph Tiers */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h5 className="text-xs font-semibold text-green-800 mb-2">⚖️ Balanced Performance/Cost (Ceph-based, &lt;5ms latency)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('ceph-nvme') || false}
                        onChange={(e) => toggleStorageTier('ceph-nvme', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">Ceph All-NVMe</div>
                        <div className="text-gray-600">100 GB/s/PB, $350K/PB</div>
                        <div className="text-gray-500">Open-source, all-flash</div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('ceph-hybrid') || false}
                        onChange={(e) => toggleStorageTier('ceph-hybrid', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">Ceph Hybrid</div>
                        <div className="text-gray-600">50 GB/s/PB, $200K/PB</div>
                        <div className="text-gray-500">NVMe cache + SSD</div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('dell-powerscale') || false}
                        onChange={(e) => toggleStorageTier('dell-powerscale', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">Dell PowerScale</div>
                        <div className="text-gray-600">100 GB/s/PB, $600K/PB</div>
                        <div className="text-gray-500">Enterprise scale-out</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Cost-Optimized Tiers */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h5 className="text-xs font-semibold text-blue-800 mb-2">💰 Cost-Optimized (HDD/Object, &lt;100ms latency)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('ceph-hdd') || false}
                        onChange={(e) => toggleStorageTier('ceph-hdd', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">Ceph HDD</div>
                        <div className="text-gray-600">10 GB/s/PB, $100K/PB</div>
                        <div className="text-gray-500">SSD cache + HDD capacity</div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.selectedStorageTiers?.includes('s3-compatible') || false}
                        onChange={(e) => toggleStorageTier('s3-compatible', e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-xs">
                        <div className="font-medium">S3 Object (MinIO/Wasabi)</div>
                        <div className="text-gray-600">5 GB/s/PB, $50K/PB CAPEX</div>
                        <div className="text-gray-500">Archive, 11 9s durability</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Configuration */}
            {config.selectedStorageTiers?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-blue-800 mb-3">Configure Tier Distribution (Must total 100%)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {config.selectedStorageTiers.map((tierId: string) => {
                    const tier = storageArchitectures[tierId];
                    return (
                      <div key={tierId} className="bg-white p-2 rounded border border-gray-200">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {tier?.name || tierId}
                        </label>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={config.storageTierDistribution?.[tierId] || 0}
                            onChange={(e) => updateTierDistribution(tierId, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="text-sm text-gray-600">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Total: {Object.values(config.storageTierDistribution || {}).reduce((sum: number, val: any) => sum + (val || 0), 0)}%
                  {Object.values(config.storageTierDistribution || {}).reduce((sum: number, val: any) => sum + (val || 0), 0) !== 100 && 
                    <span className="text-red-600 ml-1">(Must equal 100%)</span>
                  }
                </div>
              </div>
            )}

            {/* Workload Mix */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Workload Distribution (%) - Affects Bandwidth Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Training Workloads</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={config.workloadTraining}
                    onChange={(e) => setWorkloadTraining(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">High bandwidth, 2.7 GiB/s per GPU</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Inference Workloads</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={config.workloadInference}
                    onChange={(e) => setWorkloadInference(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Lower bandwidth, 100-500 MB/s per GPU</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Fine-tuning Workloads</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={config.workloadFinetuning}
                    onChange={(e) => setWorkloadFinetuning(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Medium bandwidth, 2.0 GiB/s per GPU</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Total: {config.workloadTraining + config.workloadInference + config.workloadFinetuning}% 
                {config.workloadTraining + config.workloadInference + config.workloadFinetuning !== 100 && 
                  <span className="text-red-600 ml-1">(Must equal 100%)</span>
                }
              </div>
            </div>

            {/* Tenant Mix */}
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-3">Multi-Tenant Distribution (%) - Affects Capacity Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Whale Tenants (&gt;1000 GPUs)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={config.tenantWhale}
                    onChange={(e) => setTenantWhale(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Dedicated partitions, 99.9% SLA</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Medium Tenants (100-1000 GPUs)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={config.tenantMedium}
                    onChange={(e) => setTenantMedium(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Shared with QoS guarantees</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Small Tenants (&lt;100 GPUs)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={config.tenantSmall}
                    onChange={(e) => setTenantSmall(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Best effort pools, container CSI</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Total: {config.tenantWhale + config.tenantMedium + config.tenantSmall}% 
                {config.tenantWhale + config.tenantMedium + config.tenantSmall !== 100 && 
                  <span className="text-red-600 ml-1">(Must equal 100%)</span>
                }
              </div>
            </div>

            {/* Validation Warnings */}
            {config.storageWarnings?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <h4 className="text-xs font-semibold text-yellow-800 mb-2">⚠️ Configuration Warnings</h4>
                <ul className="space-y-1">
                  {config.storageWarnings.map((warning: string, index: number) => (
                    <li key={index} className="text-xs text-yellow-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Software Stack Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 
          className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 cursor-pointer"
          onClick={() => toggleSection('software')}
        >
          <Package className="w-4 h-4 text-indigo-500" />
          Software Stack Configuration
          {expandedSections.software ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </h3>
        
        {expandedSections.software && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Software Stack</label>
                <select 
                  value={config.softwareStack || 'canonical-enterprise'}
                  onChange={(e) => setSoftwareStack(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.entries(softwareStacks).map(([id, stack]) => (
                    <option key={id} value={id}>
                      {stack.name} (~${stack.totalCostPerGPU}/GPU equiv/yr)
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-500 mt-1 block">
                  {softwareStacks[config.softwareStack || 'canonical-enterprise']?.description}
                </span>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Support Tier</label>
                <select 
                  value={config.supportTier || 'business'}
                  onChange={(e) => setSupportTier(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="community">Community Support (Lowest Cost)</option>
                  <option value="business">Business Support (Recommended)</option>
                  <option value="enterprise">Enterprise Support (24/7 SLA)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Budget Priority</label>
                <select 
                  value={config.budget || 'medium'}
                  onChange={(e) => setBudget(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="low">Cost Optimized</option>
                  <option value="medium">Balanced</option>
                  <option value="high">Performance</option>
                  <option value="unlimited">Maximum Performance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Team Expertise</label>
                <select 
                  value={config.expertise || 'intermediate'}
                  onChange={(e) => setExpertise(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="basic">Basic (Prefer Managed)</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced (Can Handle OSS)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Primary Use Case</label>
                <select 
                  value={config.primaryUseCase || 'mixed'}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="training">AI Training</option>
                  <option value="inference">Inference</option>
                  <option value="mixed">Mixed Workloads</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Compliance Requirements</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['SOC2', 'HIPAA', 'ISO27001', 'SecNumCloud', 'GDPR', 'FedRAMP', 'PCI-DSS', 'None'].map(compliance => (
                  <label key={compliance} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={(config.complianceRequirements || []).includes(compliance)}
                      onChange={(e) => {
                        const current = config.complianceRequirements || [];
                        if (e.target.checked) {
                          setComplianceRequirements([...current, compliance]);
                        } else {
                          setComplianceRequirements(current.filter((c: string) => c !== compliance));
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                    />
                    {compliance}
                  </label>
                ))}
              </div>
            </div>

            {/* Stack Cost Breakdown */}
            {config.softwareStack && config.numGPUs > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Software Stack Cost Analysis
                </h4>
                {(() => {
                  const stackCost = calculateStackCost(
                    config.softwareStack || 'canonical-enterprise',
                    config.numGPUs,
                    3,
                    config.supportTier || 'business'
                  );
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Setup Cost:</span>
                        <span className="block font-semibold">{formatNumber(stackCost.upfrontCost)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Annual Cost:</span>
                        <span className="block font-semibold">{formatNumber(stackCost.annualCost)}/yr</span>
                      </div>
                      <div>
                        <span className="text-gray-600">3-Year TCO:</span>
                        <span className="block font-semibold">{formatNumber(stackCost.totalTCO)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Per GPU Equiv/Year:</span>
                        <span className="block font-semibold">{formatNumber(stackCost.perGPUCost)}</span>
                        <span className="text-xs text-gray-500">*Canonical priced per-node</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Recommended Stack Based on Requirements */}
            {config.numGPUs > 0 && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  AI-Recommended Stack
                </h4>
                {(() => {
                  const recommended = recommendStack({
                    gpuCount: config.numGPUs,
                    budget: config.budget || 'medium',
                    expertise: config.expertise || 'intermediate',
                    supportNeeds: config.supportTier || 'business',
                    complianceRequirements: config.complianceRequirements || [],
                    primaryUseCase: config.primaryUseCase || 'mixed',
                    multiTenancy: (config.tenantWhale || 0) + (config.tenantMedium || 0) + (config.tenantSmall || 0) > 0
                  });
                  const recommendedStack = softwareStacks[recommended];
                  return (
                    <p className="text-xs text-green-700">
                      Based on your requirements, we recommend: <strong>{recommendedStack.name}</strong>
                      {config.softwareStack !== recommended && (
                        <button
                          onClick={() => setSoftwareStack(recommended)}
                          className="ml-2 text-green-600 underline hover:text-green-800"
                        >
                          Apply Recommendation
                        </button>
                      )}
                    </p>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Networking Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 
          className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 cursor-pointer"
          onClick={() => toggleSection('networking')}
        >
          <Network className="w-4 h-4 text-purple-500" />
          Networking Configuration
          {expandedSections.networking ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </h3>
        
        {expandedSections.networking && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Fabric Type</label>
                <select 
                  value={config.fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="ethernet">Ethernet RoCEv2 (400GbE)</option>
                  <option value="ethernet-800g">Ethernet RoCEv2 (800GbE)</option>
                  <option value="infiniband">InfiniBand NDR (400Gbps)</option>
                  <option value="infiniband-xdr">InfiniBand XDR (800Gbps)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Topology</label>
                <select 
                  value={config.topology}
                  onChange={(e) => setTopology(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="fat-tree">Fat-Tree (Non-blocking)</option>
                  <option value="dragonfly">Dragonfly+</option>
                  <option value="bcube">BCube</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Oversubscription Ratio</label>
                <select 
                  value={config.oversubscription}
                  onChange={(e) => setOversubscription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="1:1">1:1 (Non-blocking)</option>
                  <option value="2:1">2:1</option>
                  <option value="3:1">3:1</option>
                  <option value="4:1">4:1</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Rails per GPU</label>
                <input 
                  type="number"
                  value={config.railsPerGPU}
                  onChange={(e) => setRailsPerGPU(parseInt(e.target.value) || 8)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  min="1"
                  max="16"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  GB200/300: 9, H100: 8
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <input 
                  type="checkbox"
                  checked={config.enableBluefield}
                  onChange={(e) => setEnableBluefield(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                Enable BlueField-3 DPUs
              </label>
              {config.enableBluefield && (
                <div className="text-xs text-gray-500 mt-2 ml-6">
                  • RDMA offload & acceleration<br/>
                  • 150W per DPU, $2,500/unit<br/>
                  • {config.gpuModel.startsWith('gb') ? '4 per NVL72 system (72 GPUs)' : '1 per 8 GPUs'}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Advanced Options */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 
          className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 cursor-pointer"
          onClick={() => toggleSection('advanced')}
        >
          <Settings className="w-4 h-4 text-gray-600" />
          Advanced Options
          {expandedSections.advanced ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </h3>
        
        {expandedSections.advanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">PUE Override</label>
              <input 
                type="text"
                value={config.pueOverride}
                onChange={(e) => setPueOverride(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Leave blank for auto
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">GPU Unit Price Override</label>
              <input 
                type="text"
                value={config.gpuPriceOverride}
                onChange={(e) => setGpuPriceOverride(e.target.value)}
                placeholder={`$${spec?.unitPrice.toLocaleString()}`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Override GPU price
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Maintenance %/year</label>
              <input 
                type="number"
                value={config.maintenancePercent}
                onChange={(e) => setMaintenancePercent(parseInt(e.target.value) || 3)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                min="0"
                max="10"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Of hardware CAPEX
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Staff Multiplier</label>
              <input 
                type="number"
                value={config.staffMultiplier}
                onChange={(e) => setStaffMultiplier(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                min="0.5"
                max="2"
                step="0.1"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Adjust staff costs
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Custom Energy Rate ($/kWh)</label>
              <input 
                type="text"
                value={config.customEnergyRate}
                onChange={(e) => setCustomEnergyRate(e.target.value)}
                placeholder={`$${regionRates[config.region]?.rate || '0.05'}`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Override regional rate
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <button
          onClick={calculate}
          className="px-8 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Calculate TCO
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-8 space-y-6">
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
              <div className="text-2xl font-bold text-gray-900">${results.costPerHour.toFixed(2)}</div>
              <div className="text-xs text-gray-500">At {config.utilization}% utilization</div>
            </div>
            
            <div className="bg-green-500 text-white p-4 rounded-lg shadow-sm">
              <div className="text-xs mb-1">10-Year TCO</div>
              <div className="text-2xl font-bold">{formatNumber(results.tco10year)}</div>
              <div className="text-xs opacity-90">Total ownership cost</div>
            </div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Infrastructure Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500">GPU Systems</div>
                <div className="text-xl font-semibold">{results.details?.systemsNeeded || 0}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Power</div>
                <div className="text-xl font-semibold">{results.totalPowerMW.toFixed(1)} MW</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Network BW</div>
                <div className="text-xl font-semibold">{results.networkBandwidth.toFixed(1)} Tbps</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Storage $/GB/mo</div>
                <div className="text-xl font-semibold">${results.storageGbMonth.toFixed(4)}</div>
              </div>
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
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
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

          {/* Storage Architecture Summary */}
          {config.selectedStorageTiers?.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Selected Storage Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.selectedStorageTiers.map((tierId: string) => {
                  const tier = storageArchitectures[tierId];
                  const percentage = config.storageTierDistribution?.[tierId] || 0;
                  const capacityPB = (config.totalStorage * percentage / 100).toFixed(1);
                  
                  return (
                    <div key={tierId} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <h4 className="font-semibold text-sm mb-2">{tier?.name}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{capacityPB} PB ({percentage}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Performance:</span>
                          <span className="font-medium">{tier?.performance.throughputPerPB}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Latency:</span>
                          <span className="font-medium">{tier?.performance.latency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">5yr TCO/PB:</span>
                          <span className="font-medium">${(tier?.costPerPB.total5Year / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
