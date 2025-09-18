import React from 'react';
import { 
  Zap, AlertTriangle, Network, HardDrive, Settings,
  DollarSign, Cpu, CheckCircle2, Info
} from 'lucide-react';
import { gpuSpecs } from '../../data/gpuSpecs';

interface CalculatorTabProps {
  config: any;
  setGpuModel: (value: string) => void;
  setNumGPUs: (value: number) => void;
  setCoolingType: (value: string) => void;
  setRegion: (value: string) => void;
  setUtilization: (value: number) => void;
  setDepreciation: (value: number) => void;
  setTotalStorage: (value: number) => void;
  setFabricType: (value: string) => void;
  setEnableBluefield: (value: boolean) => void;
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

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  config,
  setGpuModel,
  setNumGPUs,
  setCoolingType,
  setRegion,
  setUtilization,
  setDepreciation,
  setTotalStorage,
  setFabricType,
  setEnableBluefield,
  coolingRequired,
  calculate,
  results,
  formatNumber
}) => {
  const spec = gpuSpecs[config.gpuModel];
  
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
              <option value="gb200">GB200 NVL72 (120kW rack)</option>
              <option value="gb300">GB300 NVL72 (140kW rack)</option>
              <option value="h100-sxm">H100 SXM5 (700W)</option>
              <option value="h100-pcie">H100 PCIe (350W)</option>
            </select>
            {coolingRequired && (
              <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Liquid cooling mandatory
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
              {Math.ceil(config.numGPUs / (spec.rackSize || 72))} racks required
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
              PUE: {spec.pue[config.coolingType]?.toFixed(2) || 'N/A'}
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
      
      {/* Networking Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-purple-500" />
          Networking Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Fabric Type</label>
            <select 
              value={config.fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="infiniband">InfiniBand (400G/800G)</option>
              <option value="ethernet">Ethernet RoCEv2 (400G/800G)</option>
            </select>
            <span className="text-xs text-gray-500 mt-1 block">
              {config.fabricType === 'infiniband' ? 'Quantum switches' : 'Spectrum switches'}
            </span>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
              <input 
                type="checkbox"
                checked={config.enableBluefield}
                onChange={(e) => setEnableBluefield(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Enable BlueField-3 DPUs
            </label>
            <div className="text-xs text-gray-500 mt-2">
              {config.enableBluefield && (
                <>
                  <div>• RDMA offload & acceleration</div>
                  <div>• 75W per DPU, $2,500/unit</div>
                  <div>• {config.gpuModel.startsWith('gb') ? '1 per 2 GPUs' : '1 per 8 GPUs'}</div>
                </>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Rails per GPU</label>
            <input 
              type="text"
              value={config.gpuModel.startsWith('gb') ? '9' : '8'}
              disabled
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-100"
            />
            <span className="text-xs text-gray-500 mt-1 block">
              Auto-configured based on GPU model
            </span>
          </div>
        </div>
      </div>
      
      {/* Storage Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-500" />
          Storage Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Recommended: {(config.numGPUs * 0.005).toFixed(0)} PB minimum
            </span>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Storage Tier Distribution</label>
            <div className="text-xs space-y-1 bg-white p-2 rounded border border-gray-200">
              <div className="flex justify-between">
                <span>🔥 Hot (VAST/Weka):</span>
                <span className="font-semibold">20%</span>
              </div>
              <div className="flex justify-between">
                <span>🌡 Warm (Pure/NetApp):</span>
                <span className="font-semibold">35%</span>
              </div>
              <div className="flex justify-between">
                <span>❄️ Cold (Ceph HDD):</span>
                <span className="font-semibold">35%</span>
              </div>
              <div className="flex justify-between">
                <span>🗄 Archive (Glacier):</span>
                <span className="font-semibold">10%</span>
              </div>
            </div>
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
      
      {/* Results Section */}
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
          
          {/* Infrastructure Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Power Required</div>
              <div className="text-2xl font-bold text-gray-900">{results.totalPowerMW.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Megawatts (MW)</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">PUE Factor</div>
              <div className="text-2xl font-bold text-gray-900">{results.pueValue.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Power efficiency</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Network Bandwidth</div>
              <div className="text-2xl font-bold text-gray-900">{(results.networkBandwidth / 1000).toFixed(1)}</div>
              <div className="text-xs text-gray-500">Tbps aggregate</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Storage $/GB/Mo</div>
              <div className="text-2xl font-bold text-gray-900">${results.storageGbMonth.toFixed(4)}</div>
              <div className="text-xs text-gray-500">Blended rate</div>
            </div>
          </div>
          
          {/* CAPEX Breakdown */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 p-4 border-b border-gray-200">
              CAPEX Breakdown
            </h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Component</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">% of CAPEX</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results.breakdown.capex).map(([key, value]: [string, any]) => (
                  <tr key={key} className="border-b border-gray-200">
                    <td className="px-4 py-3 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                    <td className="px-4 py-3">${(value / 1000000).toFixed(2)}M</td>
                    <td className="px-4 py-3">{((value / results.totalCapex) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="bg-yellow-50 font-bold">
                  <td className="px-4 py-3">TOTAL CAPEX</td>
                  <td className="px-4 py-3">{formatNumber(results.totalCapex)}</td>
                  <td className="px-4 py-3">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* OPEX Breakdown */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 p-4 border-b border-gray-200">
              Annual OPEX Breakdown
            </h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expense</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Annual Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">% of OPEX</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results.breakdown.opex).map(([key, value]: [string, any]) => (
                  <tr key={key} className="border-b border-gray-200">
                    <td className="px-4 py-3 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                    <td className="px-4 py-3">${(value / 1000000).toFixed(2)}M</td>
                    <td className="px-4 py-3">{((value / results.annualOpex) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="bg-yellow-50 font-bold">
                  <td className="px-4 py-3">TOTAL ANNUAL OPEX</td>
                  <td className="px-4 py-3">{formatNumber(results.annualOpex)}</td>
                  <td className="px-4 py-3">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Key Insights */}
          {results.details && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                <Info className="w-4 h-4" />
                Infrastructure Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
                <div>
                  <strong>Networking:</strong>
                  <ul className="ml-4 mt-1">
                    <li>• {results.details.networking?.pods || 0} pods × 1024 GPUs</li>
                    <li>• {results.details.networking?.leafSwitches || 0} leaf switches</li>
                    <li>• {results.details.networking?.spineSwitches || 0} spine switches</li>
                    <li>• {results.details.networking?.coreSwitches || 0} core switches</li>
                  </ul>
                </div>
                <div>
                  <strong>Cooling:</strong>
                  <ul className="ml-4 mt-1">
                    <li>• {config.coolingType === 'liquid' ? 'Direct liquid cooling' : 'Air cooling'}</li>
                    <li>• PUE: {results.pueValue.toFixed(2)}</li>
                    <li>• {results.details.cooling?.cdus || results.details.cooling?.cracUnits || 0} cooling units</li>
                  </ul>
                </div>
                <div>
                  <strong>DPU Integration:</strong>
                  <ul className="ml-4 mt-1">
                    <li>• {results.details.dpus?.count || 0} BlueField-3 DPUs</li>
                    <li>• ${((results.details.dpus?.cost || 0) / 1000000).toFixed(2)}M cost</li>
                    <li>• {((results.details.dpus?.power || 0) / 1000).toFixed(1)}kW power</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
