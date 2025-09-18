import React, { useState, useEffect } from 'react';
import { 
  Calculator, Cpu, HardDrive, Network, Thermometer,
  Building2, FileText, BookOpen, DollarSign
} from 'lucide-react';
import { gpuSpecs } from '../data/gpuSpecs';
import { storageVendors } from '../data/storageVendors';
import { CalculatorTabEnhanced } from './tabs/CalculatorTabEnhanced';
import { NetworkingTab } from './tabs/NetworkingTab';
import { StorageTab } from './tabs/StorageTab';
import { CoolingPowerTab } from './tabs/CoolingPowerTab';
import { FormulasTab } from './tabs/FormulasTab';
import { ReferencesTab } from './tabs/ReferencesTab';
import { formatNumber } from '../utils/formatters';

// Region rates with more comprehensive data
const regionRates: Record<string, { rate: number; name: string; pue: number }> = {
  'us-texas': { rate: 0.047, name: 'US Texas', pue: 1.15 },
  'us-virginia': { rate: 0.085, name: 'US Virginia', pue: 1.2 },
  'us-california': { rate: 0.150, name: 'US California', pue: 1.25 },
  'europe': { rate: 0.120, name: 'Europe', pue: 1.15 },
  'asia': { rate: 0.100, name: 'Asia Pacific', pue: 1.3 }
};

// Network fabric specifications
const networkFabrics: Record<string, {
  name: string;
  switchPrice: number;
  cablePrice: number;
  transceiverPrice: number;
  bandwidthPerGpu: number;
}> = {
  'infiniband': {
    name: 'InfiniBand',
    switchPrice: 120000,
    cablePrice: 500,
    transceiverPrice: 1500,
    bandwidthPerGpu: 400
  },
  'ethernet': {
    name: 'Ethernet RoCEv2',
    switchPrice: 80000,
    cablePrice: 200,
    transceiverPrice: 800,
    bandwidthPerGpu: 400
  }
};

const GPUSuperclusterCalculatorV5Enhanced: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Configuration state
  const [gpuModel, setGpuModel] = useState('gb200');
  const [numGPUs, setNumGPUs] = useState(10000);
  const [coolingType, setCoolingType] = useState('liquid');
  const [region, setRegion] = useState('us-texas');
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
  const [fabricType, setFabricType] = useState('infiniband');
  const [topology, setTopology] = useState('fat-tree');
  const [oversubscription, setOversubscription] = useState('1:1');
  const [railsPerGPU, setRailsPerGPU] = useState(8);
  const [enableBluefield, setEnableBluefield] = useState(true);
  
  // Advanced options
  const [pueOverride, setPueOverride] = useState('');
  const [gpuPriceOverride, setGpuPriceOverride] = useState('');
  const [maintenancePercent, setMaintenancePercent] = useState(3);
  const [staffMultiplier, setStaffMultiplier] = useState(1);
  
  // Results state
  const [results, setResults] = useState<any>(null);

  // Get GPU specifications
  const spec = gpuSpecs[gpuModel];
  const coolingRequired = spec.coolingOptions.length === 1 && spec.coolingOptions[0] === 'liquid';

  // Update cooling type and rails when GPU model changes
  useEffect(() => {
    if (spec.coolingOptions.length === 1) {
      setCoolingType(spec.coolingOptions[0]);
    }
    // Set default rails per GPU based on model
    if (gpuModel.startsWith('gb')) {
      setRailsPerGPU(9);
    } else {
      setRailsPerGPU(8);
    }
  }, [gpuModel, spec.coolingOptions]);

  // Calculate storage costs using vendor-specific pricing
  const calculateStorageCosts = () => {
    const hotCapacityPB = totalStorage * (hotPercent / 100);
    const warmCapacityPB = totalStorage * (warmPercent / 100);
    const coldCapacityPB = totalStorage * (coldPercent / 100);
    const archiveCapacityPB = totalStorage * (archivePercent / 100);
    
    const hotCost = hotCapacityPB * 1000 * storageVendors[hotVendor].pricePerGB * 1000;
    const warmCost = warmCapacityPB * 1000 * storageVendors[warmVendor].pricePerGB * 1000;
    const coldCost = coldCapacityPB * 1000 * storageVendors[coldVendor].pricePerGB * 1000;
    const archiveCost = archiveCapacityPB * 1000 * storageVendors[archiveVendor].pricePerGB * 1000;
    
    const hotPower = hotCapacityPB * 1000 * storageVendors[hotVendor].powerPerTB / 1000;
    const warmPower = warmCapacityPB * 1000 * storageVendors[warmVendor].powerPerTB / 1000;
    const coldPower = coldCapacityPB * 1000 * storageVendors[coldVendor].powerPerTB / 1000;
    const archivePower = archiveCapacityPB * 1000 * storageVendors[archiveVendor].powerPerTB / 1000;
    
    return {
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
      }
    };
  };

  // Calculate network costs based on topology and oversubscription
  const calculateNetworkCosts = () => {
    const fabric = networkFabrics[fabricType];
    
    // Adjust switch counts based on topology and oversubscription
    const oversubRatio = parseFloat(oversubscription.split(':')[0]);
    const effectiveRails = railsPerGPU / oversubRatio;
    
    let leafSwitches, spineSwitches, coreSwitches;
    
    if (topology === 'fat-tree') {
      leafSwitches = Math.ceil(numGPUs / 128);
      spineSwitches = Math.ceil(leafSwitches / 8);
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
    
    const switchCost = totalSwitches * fabric.switchPrice;
    const cableCost = cables * fabric.cablePrice;
    const transceiverCost = transceivers * fabric.transceiverPrice;
    
    return {
      total: switchCost + cableCost + transceiverCost,
      switches: switchCost,
      cables: cableCost,
      transceivers: transceiverCost,
      counts: {
        totalSwitches,
        leafSwitches,
        spineSwitches,
        coreSwitches,
        cables,
        transceivers
      }
    };
  };

  // Calculate comprehensive TCO
  const calculate = () => {
    const regionData = regionRates[region];
    
    // GPU costs - use override if provided
    const gpuUnitPrice = gpuPriceOverride ? parseFloat(gpuPriceOverride) : spec.unitPrice;
    const gpuCapex = gpuUnitPrice * numGPUs;
    
    // Calculate detailed storage
    const storage = calculateStorageCosts();
    
    // Calculate detailed networking
    const network = calculateNetworkCosts();
    
    // Power calculations
    const gpuPowerMW = (spec.powerPerGPU * numGPUs) / 1000000;
    const pueValue = pueOverride ? parseFloat(pueOverride) : (spec.pue[coolingType] || regionData.pue);
    
    // DPU power if enabled
    const dpuCount = enableBluefield ? 
      (gpuModel.startsWith('gb') ? numGPUs / 2 : numGPUs / 8) : 0;
    const dpuPowerMW = dpuCount * 75 / 1000000;
    const dpuCapex = dpuCount * 2500;
    
    // Total IT power including storage and DPUs
    const totalItPowerMW = gpuPowerMW + storage.power + dpuPowerMW;
    const totalPowerMW = totalItPowerMW * pueValue;
    const annualPowerCost = totalPowerMW * 1000 * regionData.rate * 8760;
    
    // Cooling infrastructure
    const numRacks = Math.ceil(numGPUs / spec.rackSize);
    const coolingCapex = coolingType === 'liquid' 
      ? gpuPowerMW * 1000 * 400  // $400/kW for liquid
      : gpuPowerMW * 1000 * 300; // $300/kW for air
    
    // Data center infrastructure
    const datacenterCapex = totalPowerMW * 10000000; // $10M/MW
    
    // Software and licensing
    const softwareCapex = numGPUs * 6500; // $6,500/GPU
    
    // Total CAPEX
    const totalCapex = gpuCapex + storage.total + network.total + coolingCapex + 
                      datacenterCapex + dpuCapex + softwareCapex;
    
    // Annual OPEX calculations
    const annualCoolingOpex = annualPowerCost * (coolingType === 'liquid' ? 0.15 : 0.45);
    const annualStaff = (Math.ceil(gpuPowerMW / 2) * 166000 + Math.ceil(numGPUs / 5000) * 200000) * staffMultiplier;
    const annualMaintenance = (gpuCapex + network.total + storage.total) * (maintenancePercent / 100);
    const annualBandwidth = numGPUs * 600; // $600/GPU/year
    const annualLicenses = numGPUs * 500; // $500/GPU/year
    const storageOpex = totalStorage * 1000000 * 0.015 * 12; // $0.015/GB/month
    
    const annualOpex = annualPowerCost + annualCoolingOpex + annualStaff + 
                      annualMaintenance + annualBandwidth + annualLicenses + storageOpex;
    
    // Cost per GPU hour
    const annualGpuHours = numGPUs * 8760 * (utilization / 100);
    const annualDepreciation = totalCapex / depreciation;
    const costPerHour = (annualDepreciation + annualOpex) / annualGpuHours;
    
    // Network bandwidth (Tbps)
    const bandwidthPerGPU = fabricType === 'infiniband' ? 3.6 : 3.2;
    const totalBandwidth = (numGPUs * bandwidthPerGPU) / 1000;
    
    // Storage cost per GB/month
    const totalStorageGB = totalStorage * 1000 * 1000;
    const storageGbMonth = (storage.total / totalStorageGB) / 60;
    
    // 10-year TCO
    const tco10year = totalCapex + (annualOpex * 10);
    
    // Prepare detailed breakdowns
    const capexBreakdown = [
      { name: 'GPU Hardware', unit: `$${gpuUnitPrice.toLocaleString()}/GPU`, qty: numGPUs.toLocaleString(), total: gpuCapex, pct: (gpuCapex/totalCapex*100).toFixed(1) },
      { name: 'Storage Systems (Total)', unit: 'Multi-vendor', qty: `${totalStorage} PB`, total: storage.total, pct: (storage.total/totalCapex*100).toFixed(1) },
      { name: '├─ Hot Tier', unit: storage.breakdown.hot.vendor, qty: `${storage.breakdown.hot.capacity.toFixed(1)} PB`, total: storage.hot, pct: (storage.hot/totalCapex*100).toFixed(1) },
      { name: '├─ Warm Tier', unit: storage.breakdown.warm.vendor, qty: `${storage.breakdown.warm.capacity.toFixed(1)} PB`, total: storage.warm, pct: (storage.warm/totalCapex*100).toFixed(1) },
      { name: '├─ Cold Tier', unit: storage.breakdown.cold.vendor, qty: `${storage.breakdown.cold.capacity.toFixed(1)} PB`, total: storage.cold, pct: (storage.cold/totalCapex*100).toFixed(1) },
      { name: '└─ Archive', unit: storage.breakdown.archive.vendor, qty: `${storage.breakdown.archive.capacity.toFixed(1)} PB`, total: storage.archive, pct: (storage.archive/totalCapex*100).toFixed(1) },
      { name: 'Networking Infrastructure', unit: 'Switches + Cables', qty: `${network.counts.totalSwitches} switches`, total: network.total, pct: (network.total/totalCapex*100).toFixed(1) },
      { name: '├─ Switches', unit: 'Leaf/Spine/Core', qty: `${network.counts.totalSwitches}`, total: network.switches, pct: (network.switches/totalCapex*100).toFixed(1) },
      { name: '├─ Cables', unit: `$${networkFabrics[fabricType].cablePrice}/cable`, qty: network.counts.cables.toLocaleString(), total: network.cables, pct: (network.cables/totalCapex*100).toFixed(1) },
      { name: '└─ Transceivers', unit: `$${networkFabrics[fabricType].transceiverPrice}/unit`, qty: network.counts.transceivers.toLocaleString(), total: network.transceivers, pct: (network.transceivers/totalCapex*100).toFixed(1) },
      { name: 'Data Center Infrastructure', unit: '$10M/MW', qty: `${totalPowerMW.toFixed(1)} MW`, total: datacenterCapex, pct: (datacenterCapex/totalCapex*100).toFixed(1) },
      { name: 'Cooling Infrastructure', unit: `$${coolingType === 'liquid' ? '400' : '300'}/kW`, qty: `${(gpuPowerMW*1000).toFixed(0)} kW`, total: coolingCapex, pct: (coolingCapex/totalCapex*100).toFixed(1) },
      { name: 'Software & Licensing', unit: '$6,500/GPU', qty: numGPUs.toLocaleString(), total: softwareCapex, pct: (softwareCapex/totalCapex*100).toFixed(1) }
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
      { name: 'Power Consumption', amount: annualPowerCost, pct: (annualPowerCost/annualOpex*100).toFixed(1), notes: `${totalPowerMW.toFixed(1)} MW @ $${regionData.rate}/kWh` },
      { name: 'Cooling Operations', amount: annualCoolingOpex, pct: (annualCoolingOpex/annualOpex*100).toFixed(1), notes: `${coolingType.charAt(0).toUpperCase() + coolingType.slice(1)} cooling` },
      { name: 'Staff & Personnel', amount: annualStaff, pct: (annualStaff/annualOpex*100).toFixed(1), notes: `${Math.ceil(gpuPowerMW / 2)} DC + ${Math.ceil(numGPUs / 5000)} GPU engineers` },
      { name: 'Hardware Maintenance', amount: annualMaintenance, pct: (annualMaintenance/annualOpex*100).toFixed(1), notes: `${maintenancePercent}% of hardware CAPEX` },
      { name: 'Storage Operations', amount: storageOpex, pct: (storageOpex/annualOpex*100).toFixed(1), notes: `$0.015/GB/month` },
      { name: 'Network Bandwidth', amount: annualBandwidth, pct: (annualBandwidth/annualOpex*100).toFixed(1), notes: '$600/GPU/year' },
      { name: 'Software Licenses', amount: annualLicenses, pct: (annualLicenses/annualOpex*100).toFixed(1), notes: '$500/GPU/year' }
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
      details: {
        numRacks,
        numSwitches: network.counts.totalSwitches,
        dpuCount,
        utilization,
        topology,
        oversubscription,
        fabricType,
        storageArchitecture
      }
    });
  };

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'networking', label: 'Networking', icon: <Network className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage Analysis', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'cooling', label: 'Cooling & Power', icon: <Thermometer className="w-4 h-4" /> },
    { id: 'formulas', label: 'Formulas', icon: <FileText className="w-4 h-4" /> },
    { id: 'references', label: 'References', icon: <BookOpen className="w-4 h-4" /> }
  ];

  const config = {
    gpuModel,
    numGPUs,
    coolingType,
    region,
    utilization,
    depreciation,
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
    staffMultiplier
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-[1900px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg p-4">
              <Cpu className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GPU SuperCluster Cost Calculator
          </h1>
          <p className="text-base text-gray-600 mb-3">
            Complete Infrastructure & TCO Analysis Platform
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="px-4 py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold">
              v5.0 Enhanced - Full Stack Edition
            </span>
            <span className="px-4 py-1.5 bg-gray-800 text-white rounded-full text-xs font-semibold">
              with Verified References
            </span>
          </div>
        </div>

        {/* Main content area */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-6 border border-gray-200">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 mb-6 p-0.5 bg-gray-100 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs transition-all
                  ${activeTab === tab.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {React.cloneElement(tab.icon, { className: 'w-4 h-4' })}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {activeTab === 'calculator' && (
              <CalculatorTabEnhanced
                config={config}
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
                coolingRequired={coolingRequired}
                calculate={calculate}
                results={results}
                formatNumber={formatNumber}
              />
            )}
            
            {activeTab === 'networking' && (
              <NetworkingTab config={config} results={results} />
            )}
            
            {activeTab === 'storage' && (
              <StorageTab config={config} results={results} />
            )}
            
            {activeTab === 'cooling' && (
              <CoolingPowerTab config={config} results={results} />
            )}
            
            {activeTab === 'formulas' && (
              <FormulasTab />
            )}
            
            {activeTab === 'references' && (
              <ReferencesTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPUSuperclusterCalculatorV5Enhanced;
