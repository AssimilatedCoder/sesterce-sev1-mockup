import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calculator, 
  Server, 
  HardDrive, 
  Network, 
  Thermometer, 
  Building2, 
  FileText,
  BookOpen,
  Zap,
  DollarSign,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

// Import tab components
import { StorageConfiguration } from './calculator-tabs/StorageConfiguration';
import { NetworkingConfiguration } from './calculator-tabs/NetworkingConfiguration';
import { AdvancedOptions } from './calculator-tabs/AdvancedOptions';
import { GPUSpecifications } from './calculator-tabs/GPUSpecifications';
import { StorageAnalysis } from './calculator-tabs/StorageAnalysis';

// GPU Specifications Database
const gpuSpecs: any = {
  'gb200': {
    name: 'GB200 NVL72',
    powerPerGPU: 1200,
    memoryPerGPU: 192,
    unitPrice: 65000,
    rackSize: 72,
    coolingOptions: ['liquid'],
    pue: { liquid: 1.1 },
    reference: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/'
  },
  'gb300': {
    name: 'GB300 NVL72',
    powerPerGPU: 1400,
    memoryPerGPU: 288,
    unitPrice: 85000,
    rackSize: 72,
    coolingOptions: ['liquid'],
    pue: { liquid: 1.08 },
    reference: 'https://www.nvidia.com/en-us/data-center/gb300-nvl72/'
  },
  'h100-sxm': {
    name: 'H100 SXM5',
    powerPerGPU: 700,
    memoryPerGPU: 80,
    unitPrice: 30000,
    rackSize: 8,
    coolingOptions: ['air', 'liquid'],
    pue: { air: 1.45, liquid: 1.1 },
    reference: 'https://www.nvidia.com/en-us/data-center/h100/'
  },
  'h100-pcie': {
    name: 'H100 PCIe',
    powerPerGPU: 350,
    memoryPerGPU: 80,
    unitPrice: 25000,
    rackSize: null,
    coolingOptions: ['air'],
    pue: { air: 1.45 },
    reference: 'https://www.nvidia.com/en-us/data-center/h100/'
  }
};

// Storage Vendor Specifications
const storageVendors: any = {
  'vast': { name: 'VAST Data', pricePerGB: 0.03, powerPerTB: 2, throughputPerPB: 100, tier: 'hot' },
  'weka': { name: 'Weka NeuralMesh', pricePerGB: 0.045, powerPerTB: 1.5, throughputPerPB: 100, tier: 'hot' },
  'ddn': { name: 'DDN EXAScaler', pricePerGB: 0.04, powerPerTB: 3, throughputPerPB: 70, tier: 'hot' },
  'pure-s': { name: 'Pure FlashBlade//S', pricePerGB: 0.05, powerPerTB: 1.3, throughputPerPB: 50, tier: 'hot' },
  'pure-e': { name: 'Pure FlashBlade//E', pricePerGB: 0.02, powerPerTB: 0.9, throughputPerPB: 15, tier: 'warm' },
  'vast-capacity': { name: 'VAST Capacity', pricePerGB: 0.025, powerPerTB: 2, throughputPerPB: 30, tier: 'warm' },
  'netapp': { name: 'NetApp ONTAP', pricePerGB: 0.035, powerPerTB: 2.5, throughputPerPB: 30, tier: 'warm' },
  'ceph-ssd': { name: 'Ceph SSD', pricePerGB: 0.015, powerPerTB: 2, throughputPerPB: 30, tier: 'warm' },
  'ceph': { name: 'Ceph HDD', pricePerGB: 0.005, powerPerTB: 8, throughputPerPB: 3, tier: 'cold' },
  'ddn-infinia': { name: 'DDN Infinia', pricePerGB: 0.008, powerPerTB: 6, throughputPerPB: 5, tier: 'cold' },
  'netapp-capacity': { name: 'NetApp Capacity', pricePerGB: 0.012, powerPerTB: 5, throughputPerPB: 8, tier: 'cold' },
  'object': { name: 'S3-Compatible', pricePerGB: 0.004, powerPerTB: 5, throughputPerPB: 1, tier: 'archive' },
  'glacier': { name: 'AWS Glacier', pricePerGB: 0.001, powerPerTB: 0, throughputPerPB: 0.1, tier: 'archive' },
  'azure-archive': { name: 'Azure Archive', pricePerGB: 0.00099, powerPerTB: 0, throughputPerPB: 0.1, tier: 'archive' },
  'tape': { name: 'Tape Library', pricePerGB: 0.002, powerPerTB: 1, throughputPerPB: 0.5, tier: 'archive' },
  'ceph-ec': { name: 'Ceph EC', pricePerGB: 0.003, powerPerTB: 4, throughputPerPB: 0.5, tier: 'archive' }
};

// Regional electricity rates
const regionRates: any = {
  'us-texas': { rate: 0.047, name: 'US Texas' },
  'us-virginia': { rate: 0.085, name: 'US Virginia' },
  'us-california': { rate: 0.150, name: 'US California' },
  'europe': { rate: 0.120, name: 'Europe' },
  'asia': { rate: 0.100, name: 'Asia Pacific' }
};

// Network costs
const networkCosts: any = {
  'infiniband': { leafSwitch: 250000, spineSwitch: 400000, cable: 1500, transceiver: 6000 },
  'ethernet': { leafSwitch: 150000, spineSwitch: 250000, cable: 800, transceiver: 4000 },
  'mixed': { leafSwitch: 200000, spineSwitch: 325000, cable: 1150, transceiver: 5000 }
};

interface CalculationResults {
  totalCapex: number;
  annualOpex: number;
  costPerHour: number;
  totalPowerMW: number;
  pueValue: number;
  storageGbMonth: number;
  networkBandwidth: number;
  tco10year: number;
  capexBreakdown: any[];
  opexBreakdown: any[];
}

export const GPUSuperclusterCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Form state
  const [gpuModel, setGpuModel] = useState('gb200');
  const [numGPUs, setNumGPUs] = useState(10000);
  const [coolingType, setCoolingType] = useState('liquid');
  const [region, setRegion] = useState('us-texas');
  const [utilization, setUtilization] = useState(90);
  const [depreciation, setDepreciation] = useState(3);
  
  // Storage state
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
  
  // Networking state
  const [fabricType, setFabricType] = useState('infiniband');
  const [topology, setTopology] = useState('fat-tree');
  const [oversubscription, setOversubscription] = useState('1:1');
  const [railsPerGPU, setRailsPerGPU] = useState(8);
  
  // Advanced options
  const [pueOverride, setPueOverride] = useState<number | undefined>();
  const [gpuPriceOverride, setGpuPriceOverride] = useState<number | undefined>();
  const [maintenancePercent, setMaintenancePercent] = useState(3);
  const [staffMultiplier, setStaffMultiplier] = useState(1.0);
  
  // Results state
  const [results, setResults] = useState<CalculationResults | null>(null);

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const updateCoolingOptions = () => {
    const spec = gpuSpecs[gpuModel];
    if (spec.coolingOptions.length === 1) {
      setCoolingType(spec.coolingOptions[0]);
    }
  };

  useEffect(() => {
    updateCoolingOptions();
  }, [gpuModel]);

  const calculateStorageCosts = () => {
    const hotCost = totalStorage * (hotPercent / 100) * 1000 * storageVendors[hotVendor].pricePerGB * 1000;
    const warmCost = totalStorage * (warmPercent / 100) * 1000 * storageVendors[warmVendor].pricePerGB * 1000;
    const coldCost = totalStorage * (coldPercent / 100) * 1000 * storageVendors[coldVendor].pricePerGB * 1000;
    const archiveCost = totalStorage * (archivePercent / 100) * 1000 * storageVendors[archiveVendor].pricePerGB * 1000;
    
    const hotPower = totalStorage * (hotPercent / 100) * 1000 * storageVendors[hotVendor].powerPerTB / 1000;
    const warmPower = totalStorage * (warmPercent / 100) * 1000 * storageVendors[warmVendor].powerPerTB / 1000;
    const coldPower = totalStorage * (coldPercent / 100) * 1000 * storageVendors[coldVendor].powerPerTB / 1000;
    const archivePower = totalStorage * (archivePercent / 100) * 1000 * storageVendors[archiveVendor].powerPerTB / 1000;
    
    return {
      total: hotCost + warmCost + coldCost + archiveCost,
      hot: hotCost,
      warm: warmCost,
      cold: coldCost,
      archive: archiveCost,
      power: (hotPower + warmPower + coldPower + archivePower) / 1000,
      breakdown: {
        hot: { capacity: totalStorage * (hotPercent / 100), vendor: storageVendors[hotVendor].name },
        warm: { capacity: totalStorage * (warmPercent / 100), vendor: storageVendors[warmVendor].name },
        cold: { capacity: totalStorage * (coldPercent / 100), vendor: storageVendors[coldVendor].name },
        archive: { capacity: totalStorage * (archivePercent / 100), vendor: storageVendors[archiveVendor].name }
      }
    };
  };

  const calculateNetworkCosts = () => {
    const costs = networkCosts[fabricType];
    
    const leafSwitches = Math.ceil(numGPUs / 128);
    const spineSwitches = Math.ceil(leafSwitches / 8);
    const coreSwitches = numGPUs > 50000 ? 50 : (numGPUs > 25000 ? 10 : 2);
    
    const totalPorts = numGPUs * railsPerGPU;
    const cables = totalPorts;
    const transceivers = totalPorts / 2;
    
    const switchCost = (leafSwitches * costs.leafSwitch) + (spineSwitches * costs.spineSwitch) + (coreSwitches * costs.spineSwitch * 1.5);
    const cableCost = cables * costs.cable;
    const transceiverCost = transceivers * costs.transceiver;
    
    return {
      total: switchCost + cableCost + transceiverCost,
      switches: switchCost,
      cables: cableCost,
      transceivers: transceiverCost,
      counts: {
        leafSwitches,
        spineSwitches,
        coreSwitches,
        totalSwitches: leafSwitches + spineSwitches + coreSwitches,
        cables,
        transceivers
      }
    };
  };

  const calculateFull = () => {
    const spec = gpuSpecs[gpuModel];
    const electricityRate = regionRates[region].rate;
    const pue = pueOverride || spec.pue[coolingType] || 1.1;
    const gpuUnitPrice = gpuPriceOverride || spec.unitPrice;
    
    // Calculate GPU costs and power
    const gpuCost = numGPUs * gpuUnitPrice;
    const gpuPowerMW = (numGPUs * spec.powerPerGPU) / 1000000;
    
    // Calculate storage
    const storage = calculateStorageCosts();
    
    // Calculate networking
    const network = calculateNetworkCosts();
    
    // Calculate infrastructure
    const totalItPowerMW = gpuPowerMW + storage.power;
    const totalPowerMW = totalItPowerMW * pue;
    const datacenterCost = totalPowerMW * 10000000;
    const coolingInfraCost = gpuPowerMW * 1000 * (coolingType === 'liquid' ? 400 : 300);
    
    // Software and licensing
    const softwareCost = numGPUs * 6500;
    
    // Total CAPEX
    const totalCapex = gpuCost + storage.total + network.total + datacenterCost + coolingInfraCost + softwareCost;
    
    // Annual OPEX
    const annualPowerCost = totalPowerMW * 1000 * 8760 * electricityRate;
    const annualCoolingOpex = annualPowerCost * (coolingType === 'liquid' ? 0.15 : 0.45);
    const annualStaff = (Math.ceil(gpuPowerMW / 2) * 166000 + Math.ceil(numGPUs / 5000) * 200000) * staffMultiplier;
    const annualMaintenance = (gpuCost + network.total + storage.total) * (maintenancePercent / 100);
    const annualBandwidth = numGPUs * 600;
    const annualLicenses = numGPUs * 500;
    
    const annualOpex = annualPowerCost + annualCoolingOpex + annualStaff + annualMaintenance + annualBandwidth + annualLicenses;
    
    // Cost per GPU-hour
    const annualDepreciation = totalCapex / depreciation;
    const costPerHour = (annualDepreciation + annualOpex) / (numGPUs * 8760 * (utilization / 100));
    
    // 10-year TCO
    const tco10year = totalCapex + (annualOpex * 10);
    
    // Storage cost per GB/month
    const totalStorageGB = totalStorage * 1000 * 1000;
    const storageGbMonth = (storage.total / totalStorageGB) / 60;
    
    // Network bandwidth
    const bandwidthPerGPU = fabricType === 'infiniband' ? 3.6 : 3.2;
    const totalBandwidth = (numGPUs * bandwidthPerGPU);
    
    // Prepare CAPEX breakdown
    const capexBreakdown = [
      { name: 'GPU Hardware', unit: `$${gpuUnitPrice.toLocaleString()}/GPU`, qty: numGPUs.toLocaleString(), total: gpuCost, pct: (gpuCost/totalCapex*100).toFixed(1) },
      { name: 'Storage Systems (Total)', unit: 'Multi-vendor', qty: `${totalStorage} PB`, total: storage.total, pct: (storage.total/totalCapex*100).toFixed(1) },
      { name: '├─ Hot Tier', unit: storage.breakdown.hot.vendor, qty: `${storage.breakdown.hot.capacity.toFixed(1)} PB`, total: storage.hot, pct: (storage.hot/totalCapex*100).toFixed(1) },
      { name: '├─ Warm Tier', unit: storage.breakdown.warm.vendor, qty: `${storage.breakdown.warm.capacity.toFixed(1)} PB`, total: storage.warm, pct: (storage.warm/totalCapex*100).toFixed(1) },
      { name: '├─ Cold Tier', unit: storage.breakdown.cold.vendor, qty: `${storage.breakdown.cold.capacity.toFixed(1)} PB`, total: storage.cold, pct: (storage.cold/totalCapex*100).toFixed(1) },
      { name: '└─ Archive', unit: storage.breakdown.archive.vendor, qty: `${storage.breakdown.archive.capacity.toFixed(1)} PB`, total: storage.archive, pct: (storage.archive/totalCapex*100).toFixed(1) },
      { name: 'Networking Infrastructure', unit: 'Switches + Cables', qty: `${network.counts.totalSwitches} switches`, total: network.total, pct: (network.total/totalCapex*100).toFixed(1) },
      { name: '├─ Switches', unit: 'Leaf/Spine/Core', qty: `${network.counts.totalSwitches}`, total: network.switches, pct: (network.switches/totalCapex*100).toFixed(1) },
      { name: '├─ Cables', unit: `$${networkCosts[fabricType].cable}/cable`, qty: network.counts.cables.toLocaleString(), total: network.cables, pct: (network.cables/totalCapex*100).toFixed(1) },
      { name: '└─ Transceivers', unit: `$${networkCosts[fabricType].transceiver}/unit`, qty: network.counts.transceivers.toLocaleString(), total: network.transceivers, pct: (network.transceivers/totalCapex*100).toFixed(1) },
      { name: 'Data Center Infrastructure', unit: '$10M/MW', qty: `${totalPowerMW.toFixed(1)} MW`, total: datacenterCost, pct: (datacenterCost/totalCapex*100).toFixed(1) },
      { name: 'Cooling Infrastructure', unit: `$${coolingType === 'liquid' ? '400' : '300'}/kW`, qty: `${(gpuPowerMW*1000).toFixed(0)} kW`, total: coolingInfraCost, pct: (coolingInfraCost/totalCapex*100).toFixed(1) },
      { name: 'Software & Licensing', unit: '$6,500/GPU', qty: numGPUs.toLocaleString(), total: softwareCost, pct: (softwareCost/totalCapex*100).toFixed(1) }
    ];
    
    // Prepare OPEX breakdown
    const opexBreakdown = [
      { name: 'Power Consumption', amount: annualPowerCost, pct: (annualPowerCost/annualOpex*100).toFixed(1), notes: `${totalPowerMW.toFixed(1)} MW @ $${electricityRate}/kWh` },
      { name: 'Cooling Operations', amount: annualCoolingOpex, pct: (annualCoolingOpex/annualOpex*100).toFixed(1), notes: `${coolingType.charAt(0).toUpperCase() + coolingType.slice(1)} cooling` },
      { name: 'Staff & Personnel', amount: annualStaff, pct: (annualStaff/annualOpex*100).toFixed(1), notes: `${Math.ceil(gpuPowerMW / 2)} DC + ${Math.ceil(numGPUs / 5000)} GPU engineers` },
      { name: 'Hardware Maintenance', amount: annualMaintenance, pct: (annualMaintenance/annualOpex*100).toFixed(1), notes: `${maintenancePercent}% of hardware CAPEX` },
      { name: 'Network Bandwidth', amount: annualBandwidth, pct: (annualBandwidth/annualOpex*100).toFixed(1), notes: '$600/GPU/year' },
      { name: 'Software Licenses', amount: annualLicenses, pct: (annualLicenses/annualOpex*100).toFixed(1), notes: '$500/GPU/year' }
    ];
    
    setResults({
      totalCapex,
      annualOpex,
      costPerHour,
      totalPowerMW,
      pueValue: pue,
      storageGbMonth,
      networkBandwidth: totalBandwidth / 1000,
      tco10year,
      capexBreakdown,
      opexBreakdown
    });
  };

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'specifications', label: 'GPU Specs', icon: <Server className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage Analysis', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'networking', label: 'Networking', icon: <Network className="w-4 h-4" /> },
    { id: 'cooling', label: 'Cooling & Power', icon: <Thermometer className="w-4 h-4" /> },
    { id: 'vendors', label: 'Vendor Comparison', icon: <Building2 className="w-4 h-4" /> },
    { id: 'formulas', label: 'Formulas', icon: <FileText className="w-4 h-4" /> },
    { id: 'references', label: 'References', icon: <BookOpen className="w-4 h-4" /> }
  ];

  const spec = gpuSpecs[gpuModel];
  const coolingRequired = spec.coolingOptions.length === 1 && spec.coolingOptions[0] === 'liquid';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-[1900px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-md">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GPU SuperCluster Cost Calculator
          </h1>
          <p className="text-base text-gray-600 mb-3">Complete Infrastructure & TCO Analysis Platform</p>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block bg-green-500 text-white px-4 py-1.5 rounded-full font-medium text-xs">
              v4.0 - Full Stack Edition
            </span>
            <span className="inline-block bg-gray-800 text-white px-4 py-1.5 rounded-full font-medium text-xs">
              with Verified References
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-md p-6">

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 p-0.5 bg-gray-100 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="w-4 h-4">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-5">
            {/* GPU Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                GPU Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">GPU Model</label>
                  <select 
                    value={gpuModel} 
                    onChange={(e) => setGpuModel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="gb200">GB200 NVL72 (1,200W)</option>
                    <option value="gb300">GB300 NVL72 (1,400W - 2025)</option>
                    <option value="h100-sxm">H100 SXM5 (700W)</option>
                    <option value="h100-pcie">H100 PCIe (350W)</option>
                  </select>
                  {coolingRequired && (
                    <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Liquid cooling required
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Number of GPUs</label>
                  <input 
                    type="number" 
                    value={numGPUs}
                    onChange={(e) => setNumGPUs(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    min="1000"
                    max="200000"
                    step="1000"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">1,000 - 200,000 GPUs</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Cooling Type</label>
                  <select 
                    value={coolingType}
                    onChange={(e) => setCoolingType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    disabled={spec.coolingOptions.length === 1}
                  >
                    {spec.coolingOptions.map((option: string) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)} Cooling
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 mt-1 block">Auto-selected based on GPU</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Region</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    {Object.entries(regionRates).map(([key, value]: [string, any]) => (
                      <option key={key} value={key}>
                        {value.name} (${value.rate}/kWh)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Utilization Rate</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={utilization}
                      onChange={(e) => setUtilization(parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      min="50"
                      max="100"
                      step="5"
                    />
                    <span className="text-gray-700 text-sm">%</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">Typical: 85-95%</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Depreciation (Years)</label>
                  <select 
                    value={depreciation}
                    onChange={(e) => setDepreciation(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value={3}>3 Years (Aggressive)</option>
                    <option value={4}>4 Years (Standard)</option>
                    <option value={5}>5 Years (Conservative)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Storage Configuration */}
            <StorageConfiguration
              totalStorage={totalStorage}
              setTotalStorage={setTotalStorage}
              storageArchitecture={storageArchitecture}
              setStorageArchitecture={setStorageArchitecture}
              hotPercent={hotPercent}
              setHotPercent={setHotPercent}
              warmPercent={warmPercent}
              setWarmPercent={setWarmPercent}
              coldPercent={coldPercent}
              setColdPercent={setColdPercent}
              archivePercent={archivePercent}
              setArchivePercent={setArchivePercent}
              hotVendor={hotVendor}
              setHotVendor={setHotVendor}
              warmVendor={warmVendor}
              setWarmVendor={setWarmVendor}
              coldVendor={coldVendor}
              setColdVendor={setColdVendor}
              archiveVendor={archiveVendor}
              setArchiveVendor={setArchiveVendor}
            />

            {/* Networking Configuration */}
            <NetworkingConfiguration
              fabricType={fabricType}
              setFabricType={setFabricType}
              topology={topology}
              setTopology={setTopology}
              oversubscription={oversubscription}
              setOversubscription={setOversubscription}
              railsPerGPU={railsPerGPU}
              setRailsPerGPU={setRailsPerGPU}
            />

            {/* Advanced Options */}
            <AdvancedOptions
              pueOverride={pueOverride}
              setPueOverride={setPueOverride}
              gpuPriceOverride={gpuPriceOverride}
              setGpuPriceOverride={setGpuPriceOverride}
              maintenancePercent={maintenancePercent}
              setMaintenancePercent={setMaintenancePercent}
              staffMultiplier={staffMultiplier}
              setStaffMultiplier={setStaffMultiplier}
            />

            {/* Calculate Button */}
            <button
              onClick={calculateFull}
              className="w-full md:w-auto mx-auto block bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-md text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            >
              Calculate Complete Analysis
            </button>

            {/* Results Section */}
            {results && (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-xs text-gray-500 mb-1">Total CAPEX</div>
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(results.totalCapex)}</div>
                    <div className="text-xs text-gray-500">USD</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-xs text-gray-500 mb-1">Annual OPEX</div>
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(results.annualOpex)}</div>
                    <div className="text-xs text-gray-500">USD/Year</div>
                  </div>

                  <div className="bg-green-500 text-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs mb-1">$/GPU-Hour</div>
                    <div className="text-2xl font-bold">${results.costPerHour.toFixed(2)}</div>
                    <div className="text-xs opacity-90">At Selected Utilization</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-xs text-gray-500 mb-1">Power Required</div>
                    <div className="text-2xl font-bold text-gray-900">{results.totalPowerMW.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Megawatts</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-xs text-gray-500 mb-1">PUE Factor</div>
                    <div className="text-2xl font-bold text-gray-900">{results.pueValue.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Efficiency Ratio</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-xs text-gray-500 mb-1">Storage $/GB/Mo</div>
                    <div className="text-2xl font-bold text-gray-900">${results.storageGbMonth.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">Blended Rate</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-xs text-gray-500 mb-1">Network Bandwidth</div>
                    <div className="text-2xl font-bold text-gray-900">{results.networkBandwidth.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Tbps Total</div>
                  </div>

                  <div className="bg-green-500 text-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs mb-1">10-Year TCO</div>
                    <div className="text-2xl font-bold">{formatNumber(results.tco10year)}</div>
                    <div className="text-xs opacity-90">Total Cost</div>
                  </div>
                </div>

                {/* CAPEX Breakdown Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">Detailed Cost Breakdown</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Component</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Unit Cost</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Quantity</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Total Cost</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">% of CAPEX</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.capexBreakdown.map((item, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4">{item.unit}</td>
                            <td className="px-6 py-4">{item.qty}</td>
                            <td className="px-6 py-4">${item.total.toLocaleString()}</td>
                            <td className="px-6 py-4">{item.pct}%</td>
                          </tr>
                        ))}
                        <tr className="bg-yellow-50 font-bold">
                          <td className="px-6 py-4">TOTAL CAPEX</td>
                          <td className="px-6 py-4"></td>
                          <td className="px-6 py-4"></td>
                          <td className="px-6 py-4">${results.totalCapex.toLocaleString()}</td>
                          <td className="px-6 py-4">100.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* OPEX Breakdown Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">Annual OPEX Breakdown</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Operating Expense</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Annual Cost</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">% of OPEX</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.opexBreakdown.map((item, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4">${item.amount.toLocaleString()}</td>
                            <td className="px-6 py-4">{item.pct}%</td>
                            <td className="px-6 py-4 text-gray-600">{item.notes}</td>
                          </tr>
                        ))}
                        <tr className="bg-yellow-50 font-bold">
                          <td className="px-6 py-4">TOTAL ANNUAL OPEX</td>
                          <td className="px-6 py-4">${results.annualOpex.toLocaleString()}</td>
                          <td className="px-6 py-4">100.0%</td>
                          <td className="px-6 py-4"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* GPU Specifications Tab */}
        {activeTab === 'specifications' && <GPUSpecifications />}

        {/* Storage Analysis Tab */}
        {activeTab === 'storage' && <StorageAnalysis />}

        {/* Networking Tab */}
        {activeTab === 'networking' && (
          <div className="text-center text-gray-600 py-12">
            <Network className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl">Networking architecture analysis coming soon...</p>
          </div>
        )}

        {/* Cooling & Power Tab */}
        {activeTab === 'cooling' && (
          <div className="text-center text-gray-600 py-12">
            <Thermometer className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl">Cooling & power infrastructure analysis coming soon...</p>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="text-center text-gray-600 py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl">Vendor comparison analysis coming soon...</p>
          </div>
        )}

        {/* Formulas Tab */}
        {activeTab === 'formulas' && (
          <div className="text-center text-gray-600 py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl">Calculation methodology documentation coming soon...</p>
          </div>
        )}

        {/* References Tab */}
        {activeTab === 'references' && (
          <div className="text-center text-gray-600 py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl">References and documentation coming soon...</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};