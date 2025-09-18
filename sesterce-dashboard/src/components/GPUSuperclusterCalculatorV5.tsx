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
    name: 'InfiniBand NDR',
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
  },
  'infiniband-xdr': {
    name: 'InfiniBand XDR',
    switchPrice: 180000,
    cablePrice: 800,
    transceiverPrice: 2500,
    bandwidthPerGpu: 800
  }
};

const GPUSuperclusterCalculatorV5: React.FC = () => {
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

  // Calculate comprehensive TCO
  const calculate = () => {
    const regionData = regionRates[region];
    const fabric = networkFabrics[fabricType];
    
    // GPU costs - use override if provided
    const gpuUnitPrice = gpuPriceOverride ? parseFloat(gpuPriceOverride) : spec.unitPrice;
    const gpuCapex = gpuUnitPrice * numGPUs;
    
    // Power calculations
    const basePowerMW = (spec.powerPerGPU * numGPUs) / 1000000;
    const pueValue = pueOverride ? parseFloat(pueOverride) : (spec.pue[coolingType] || regionData.pue);
    const totalPowerMW = basePowerMW * pueValue;
    const annualPowerCost = totalPowerMW * 1000 * regionData.rate * 8760;
    
    // Cooling infrastructure
    const numRacks = Math.ceil(numGPUs / spec.rackSize);
    const coolingCapex = coolingType === 'liquid' 
      ? numRacks * 75000  // CDU per rack
      : numRacks * 25000; // CRAC units
    
    // Storage calculations
    const storagePB = totalStorage;
    const storageCapex = storagePB * 1000000 * 0.10; // $0.10/GB capex
    const storageOpex = storagePB * 1000000 * 0.015 * 12; // $0.015/GB/month
    
    // Networking calculations
    const numPods = Math.ceil(numGPUs / 1024);
    const leafSwitches = numPods * 32;
    const spineSwitches = numPods * 16;
    const coreSwitches = Math.ceil(numPods / 4) * 8;
    const totalSwitches = leafSwitches + spineSwitches + coreSwitches;
    
    const networkCapex = totalSwitches * fabric.switchPrice +
                        numGPUs * fabric.cablePrice * 2 +
                        numGPUs * fabric.transceiverPrice * 4;
    
    // DPU costs if enabled
    const dpuCount = enableBluefield ? 
      (gpuModel.startsWith('gb') ? numGPUs / 2 : numGPUs / 8) : 0;
    const dpuCapex = dpuCount * 2500;
    const dpuPower = dpuCount * 75 / 1000000; // MW
    
    // Infrastructure costs
    const infrastructureCapex = gpuCapex * 0.15; // 15% of GPU cost
    
    // Total calculations
    const totalCapex = gpuCapex + coolingCapex + storageCapex + networkCapex + 
                      dpuCapex + infrastructureCapex;
    
    const annualOpex = annualPowerCost +
                      storageOpex +
                      networkCapex * 0.05 + // 5% network maintenance
                      totalCapex * (maintenancePercent / 100); // configurable maintenance
    
    // Cost per GPU hour
    const annualGpuHours = numGPUs * 8760 * (utilization / 100);
    const annualDepreciation = totalCapex / depreciation;
    const costPerHour = (annualDepreciation + annualOpex) / annualGpuHours;
    
    // Network bandwidth
    const networkBandwidth = numGPUs * fabric.bandwidthPerGpu;
    
    // Storage GB/month
    const storageGbMonth = storageOpex / (storagePB * 1000000 * 12);
    
    // 10-year TCO
    const tco10year = totalCapex + (annualOpex * 10);
    
    setResults({
      totalCapex,
      annualOpex,
      costPerHour,
      totalPowerMW: totalPowerMW + dpuPower,
      pueValue,
      networkBandwidth,
      storageGbMonth,
      tco10year,
      breakdown: {
        capex: {
          gpu: gpuCapex,
          cooling: coolingCapex,
          storage: storageCapex,
          network: networkCapex,
          dpu: dpuCapex,
          infrastructure: infrastructureCapex
        },
        opex: {
          power: annualPowerCost,
          storage: storageOpex,
          networkMaintenance: networkCapex * 0.05,
          generalMaintenance: totalCapex * 0.03
        }
      },
      details: {
        networking: {
          pods: numPods,
          leafSwitches,
          spineSwitches,
          coreSwitches,
          totalSwitches
        },
        cooling: {
          numRacks,
          cdus: coolingType === 'liquid' ? numRacks : 0,
          cracUnits: coolingType === 'air' ? Math.ceil(numRacks / 4) : 0
        },
        dpus: {
          count: dpuCount,
          cost: dpuCapex,
          power: dpuPower * 1000000 // watts
        }
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-md">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GPU SuperCluster Calculator v5.0
          </h1>
          <p className="text-base text-gray-600 mb-3">
            Enterprise Infrastructure TCO Analysis with GB200/GB300 Support
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block bg-green-500 text-white px-4 py-1.5 rounded-full font-medium text-xs">
              Production Ready
            </span>
            <span className="inline-block bg-gray-800 text-white px-4 py-1.5 rounded-full font-medium text-xs">
              Liquid Cooling Optimized
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

export default GPUSuperclusterCalculatorV5;
