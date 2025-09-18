import React from 'react';
import { 
  Zap, AlertTriangle, Network, HardDrive, Settings,
  DollarSign, Cpu, CheckCircle2, Info, Building2
} from 'lucide-react';
import { gpuSpecs } from '../../data/gpuSpecs';

interface CalculatorTabEnhancedProps {
  config: any;
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
  coolingRequired: boolean;
  calculate: () => void;
  results: any;
  formatNumber: (num: number) => string;
}

const regionRates = {
  'us-texas': { rate: 0.047, name: 'US Texas' },
  'us-virginia': { rate: 0.085, name: 'US Virginia' },
  'us-california': { rate: 0.150, name: 'US California' },
  'europe': { rate: 0.120, name: 'Europe' },
  'asia': { rate: 0.100, name: 'Asia Pacific' }
};

export const CalculatorTabEnhanced: React.FC<CalculatorTabEnhancedProps> = ({
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
  coolingRequired,
  calculate,
  results,
  formatNumber
}) => {
  const spec = gpuSpecs[config.gpuModel];
  
  // Calculate remaining percentage for archive
  const updateStoragePercentages = (hot?: number, warm?: number, cold?: number) => {
    const h = hot ?? config.hotPercent;
    const w = warm ?? config.warmPercent;
    const c = cold ?? config.coldPercent;
    const archive = 100 - h - w - c;
    if (archive >= 0) {
      if (hot !== undefined) setHotPercent(hot);
      if (warm !== undefined) setWarmPercent(warm);
      if (cold !== undefined) setColdPercent(cold);
      setArchivePercent(archive);
    }
  };
  
  return (
    <div className="space-y-5">
      {/* GPU Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          GPU Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">GPU Model</label>
            <select 
              value={config.gpuModel} 
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
              value={config.numGPUs}
              onChange={(e) => setNumGPUs(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              min="1000"
              max="200000"
              step="1000"
            />
            <span className="text-xs text-gray-500 mt-1 block">
              1,000 - 200,000 GPUs • {Math.ceil(config.numGPUs / (spec.rackSize || 72))} racks
            </span>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Cooling Type</label>
            <select 
              value={config.coolingType}
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
            <span className="text-xs text-gray-500 mt-1 block">
              Auto-selected based on GPU
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Region</label>
            <select 
              value={config.region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {Object.entries(regionRates).map(([key, value]) => (
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
                value={config.utilization}
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
              value={config.depreciation}
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
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-500" />
          Storage Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Storage Capacity</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={config.totalStorage}
                onChange={(e) => setTotalStorage(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                min="1"
                max="1000"
                step="10"
              />
              <span className="text-gray-700 text-sm font-semibold">PB</span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              Total across all tiers
            </span>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Storage Architecture</label>
            <select 
              value={config.storageArchitecture}
              onChange={(e) => setStorageArchitecture(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="mixed">Mixed (VAST/Weka + Ceph)</option>
              <option value="all-flash">All-Flash (Premium)</option>
              <option value="hybrid">Hybrid Flash/HDD</option>
              <option value="object">Object Storage Heavy</option>
            </select>
          </div>
        </div>

        {/* Storage Tier Distribution */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-700">Storage Tier Distribution</h4>
          
          {/* Hot Tier */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2">
              <span className="text-xs font-medium">🔥 Hot Tier</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={config.hotPercent}
                  onChange={(e) => updateStoragePercentages(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  min="0"
                  max="100"
                />
                <span className="text-xs">%</span>
              </div>
            </div>
            <div className="col-span-8">
              <select 
                value={config.hotVendor}
                onChange={(e) => setHotVendor(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="vast">VAST Data</option>
                <option value="weka">WekaFS</option>
                <option value="ddn">DDN AI400X2</option>
                <option value="pure">Pure FlashBlade//E</option>
              </select>
            </div>
          </div>

          {/* Warm Tier */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2">
              <span className="text-xs font-medium">🌡 Warm Tier</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={config.warmPercent}
                  onChange={(e) => updateStoragePercentages(undefined, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  min="0"
                  max="100"
                />
                <span className="text-xs">%</span>
              </div>
            </div>
            <div className="col-span-8">
              <select 
                value={config.warmVendor}
                onChange={(e) => setWarmVendor(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="pure-e">Pure FlashBlade//E</option>
                <option value="netapp">NetApp AFF A-Series</option>
                <option value="qumulo">Qumulo</option>
                <option value="isilon">Dell PowerScale</option>
              </select>
            </div>
          </div>

          {/* Cold Tier */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2">
              <span className="text-xs font-medium">❄️ Cold Tier</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={config.coldPercent}
                  onChange={(e) => updateStoragePercentages(undefined, undefined, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  min="0"
                  max="100"
                />
                <span className="text-xs">%</span>
              </div>
            </div>
            <div className="col-span-8">
              <select 
                value={config.coldVendor}
                onChange={(e) => setColdVendor(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="ceph">Ceph HDD</option>
                <option value="minio">MinIO</option>
                <option value="cloudian">Cloudian HyperStore</option>
                <option value="scality">Scality RING</option>
              </select>
            </div>
          </div>

          {/* Archive Tier */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2">
              <span className="text-xs font-medium">🗄 Archive</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={config.archivePercent}
                  disabled
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-100"
                />
                <span className="text-xs">%</span>
              </div>
            </div>
            <div className="col-span-8">
              <select 
                value={config.archiveVendor}
                onChange={(e) => setArchiveVendor(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="glacier">AWS Glacier</option>
                <option value="azure-archive">Azure Archive</option>
                <option value="gcp-archive">GCP Archive</option>
                <option value="tape">LTO Tape Library</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Networking Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-purple-500" />
          Networking Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Fabric Type</label>
            <select 
              value={config.fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="infiniband">InfiniBand NDR (400Gbps)</option>
              <option value="ethernet">Ethernet (400GbE)</option>
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
              • 75W per DPU, $2,500/unit<br/>
              • {config.gpuModel.startsWith('gb') ? '1 per 2 GPUs' : '1 per 8 GPUs'}
            </div>
          )}
        </div>
      </div>
      
      {/* Advanced Options */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-600" />
          Advanced Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              placeholder="Auto"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <span className="text-xs text-gray-500 mt-1 block">
              Override default pricing
            </span>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Annual Maintenance %</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={config.maintenancePercent}
                onChange={(e) => setMaintenancePercent(parseInt(e.target.value) || 3)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                min="0"
                max="10"
                step="0.5"
              />
              <span className="text-gray-700 text-sm">%</span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              Of hardware CAPEX
            </span>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Staff Cost Multiplier</label>
            <input 
              type="number"
              value={config.staffMultiplier}
              onChange={(e) => setStaffMultiplier(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              min="0.5"
              max="3"
              step="0.1"
            />
            <span className="text-xs text-gray-500 mt-1 block">
              Adjust for region
            </span>
          </div>
        </div>
      </div>
      
      {/* Hot Spares Recommendation */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <h3 className="flex items-center gap-2 text-sm font-bold text-yellow-800 mb-2">
          <AlertTriangle className="w-4 h-4" />
          Hot Spares Recommendation
        </h3>
        <p className="text-xs text-gray-700">
          NVIDIA recommends 1-2 compute trays per rack as hot spares (12.5% overhead). 
          For {config.numGPUs.toLocaleString()} GPUs, add {Math.ceil(config.numGPUs * 0.125).toLocaleString()} spare GPUs 
          for production reliability.
        </p>
      </div>
      
      {/* Calculate Button */}
      <button
        onClick={calculate}
        className="w-full md:w-auto mx-auto block bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-md text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        Calculate Complete Infrastructure TCO
      </button>
      
      {/* Results Section - keeping existing results display */}
      {results && (
        <>
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
            
            <div className="bg-green-500 text-white p-4 rounded-lg shadow-sm">
              <div className="text-xs mb-1">$/GPU-Hour</div>
              <div className="text-2xl font-bold">${results.costPerHour.toFixed(2)}</div>
              <div className="text-xs opacity-90">At {config.utilization}% utilization</div>
            </div>
            
            <div className="bg-green-500 text-white p-4 rounded-lg shadow-sm">
              <div className="text-xs mb-1">10-Year TCO</div>
              <div className="text-2xl font-bold">{formatNumber(results.tco10year)}</div>
              <div className="text-xs opacity-90">Total ownership cost</div>
            </div>
          </div>
          
          {/* Additional metrics and breakdown tables would follow here... */}
        </>
      )}
    </div>
  );
};
