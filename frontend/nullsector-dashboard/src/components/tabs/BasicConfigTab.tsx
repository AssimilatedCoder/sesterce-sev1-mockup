import React, { useState, useEffect, useMemo } from 'react';
import { Zap, HardDrive, Cpu, Network, ArrowRight, Info, Settings } from 'lucide-react';
import { 
  ClusterOptimizer, 
  OptimizedConfiguration,
  getMinPowerRequired,
  getMinStorageRequired,
  getPowerUtilization,
  getPowerStatus,
  getStorageRatioStatus
} from '../../utils/clusterOptimizer';
import { gpuSpecs } from '../../data/gpuSpecs';

interface BasicConfigTabProps {
  onSwitchToAdvanced?: (config: any) => void;
  onConfigChange?: (config: any) => void;
}

export const BasicConfigTab: React.FC<BasicConfigTabProps> = ({ onSwitchToAdvanced, onConfigChange }) => {
  const [gpuCount, setGpuCount] = useState(5000);
  const [gpuModel, setGpuModel] = useState('h100-sxm');
  const [powerCapacity, setPowerCapacity] = useState(15); // MW
  const [storageCapacity, setStorageCapacity] = useState(125); // PB
  const [networkingType, setNetworkingType] = useState('roce-400'); // RoCEv2 400Gbps default

  // GPU model options (built from authoritative gpuSpecs data)
  const gpuOptions = Object.entries(gpuSpecs).map(([key, spec]) => ({
    value: key,
    label: spec.name,
    description: `${spec.vendor.toUpperCase()} ${spec.architecture} • ${spec.memoryPerGPU}GB • ~${spec.powerPerGPU}W` as string
  }));

  // Networking options (must be defined before use in useMemo below)
  const networkingOptions = [
    { value: 'roce-200', label: 'RoCEv2 200Gbps', description: 'Cost-effective for most workloads' },
    { value: 'roce-400', label: 'RoCEv2 400Gbps', description: 'Balanced performance and cost' },
    { value: 'roce-800', label: 'RoCEv2 800Gbps', description: 'Maximum performance for large models' }
  ];

  // Notify parent of configuration changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        gpuCount,
        gpuModel,
        powerCapacity,
        storageCapacity,
        networkingType
      });
    }
  }, [gpuCount, gpuModel, powerCapacity, storageCapacity, networkingType, onConfigChange]);

  // Computed values
  const minPowerRequired = useMemo(() => getMinPowerRequired(gpuCount), [gpuCount]);
  const minStorageRequired = useMemo(() => getMinStorageRequired(gpuCount), [gpuCount]);
  const powerUtilization = useMemo(() => getPowerUtilization(gpuCount, powerCapacity), [gpuCount, powerCapacity]);
  const powerStatusInfo = useMemo(() => getPowerStatus(powerUtilization), [powerUtilization]);
  const storagePerGPU = useMemo(() => ((storageCapacity * 1000) / gpuCount), [storageCapacity, gpuCount]);
  const storageStatusInfo = useMemo(() => getStorageRatioStatus(storagePerGPU), [storagePerGPU]);

  // Optimization results - now includes GPU model and networking selections
  const optimizedConfig = useMemo(() => {
    const optimizer = new ClusterOptimizer(gpuCount, powerCapacity, storageCapacity, gpuModel, networkingType);
    const config = optimizer.calculateOptimalConfiguration();
    
    // Override with user selections
    config.constraints.gpuModel = gpuOptions.find(opt => opt.value === gpuModel)?.label || config.constraints.gpuModel;
    config.infrastructure.network = networkingOptions.find(opt => opt.value === networkingType)?.label || config.infrastructure.network;
    
    return config;
  }, [gpuCount, powerCapacity, storageCapacity, gpuModel, networkingType]);

  // (gpuOptions and networkingOptions are defined above)

  // Formatted tier data for display
  const optimizedTiers = useMemo(() => {
    const tiers = optimizedConfig.serviceTiers;
    return [
      {
        name: 'Tier 1: Bare Metal (Whales)',
        percent: tiers.bareMetalWhale,
        gpus: Math.round(gpuCount * tiers.bareMetalWhale / 100),
        monthlyRevenue: (gpuCount * tiers.bareMetalWhale / 100 * 2.50 * 720 * 0.7 / 1000000).toFixed(1)
      },
      {
        name: 'Tier 2: Orchestrated K8s',
        percent: tiers.orchestratedK8s,
        gpus: Math.round(gpuCount * tiers.orchestratedK8s / 100),
        monthlyRevenue: (gpuCount * tiers.orchestratedK8s / 100 * 3.20 * 720 * 0.7 / 1000000).toFixed(1)
      },
      {
        name: 'Tier 3: Managed MLOps',
        percent: tiers.managedMLOps,
        gpus: Math.round(gpuCount * tiers.managedMLOps / 100),
        monthlyRevenue: (gpuCount * tiers.managedMLOps / 100 * 4.50 * 720 * 0.7 / 1000000).toFixed(1)
      },
      {
        name: 'Tier 4: Inference-as-a-Service',
        percent: tiers.inferenceService,
        gpus: Math.round(gpuCount * tiers.inferenceService / 100),
        monthlyRevenue: (gpuCount * tiers.inferenceService / 100 * 5.00 * 720 * 0.7 / 1000000).toFixed(1)
      }
    ].filter(tier => tier.percent > 0);
  }, [optimizedConfig, gpuCount]);

  const optimizedStorage = useMemo(() => {
    const storage = optimizedConfig.storageTiers;
    return [
      {
        name: 'Ultra-High Performance',
        icon: '⚡',
        percent: storage.ultraHighPerf,
        capacity: (storageCapacity * storage.ultraHighPerf / 100).toFixed(1),
        unit: 'PB'
      },
      {
        name: 'High Performance (VAST)',
        icon: '🚀',
        percent: storage.highPerf,
        capacity: (storageCapacity * storage.highPerf / 100).toFixed(1),
        unit: 'PB'
      },
      {
        name: 'Medium Performance (SSD)',
        icon: '💾',
        percent: storage.mediumPerf,
        capacity: (storageCapacity * storage.mediumPerf / 100).toFixed(1),
        unit: 'PB'
      },
      {
        name: 'Capacity Tier (HDD)',
        icon: '📦',
        percent: storage.capacityTier,
        capacity: (storageCapacity * storage.capacityTier / 100).toFixed(1),
        unit: 'PB'
      },
      {
        name: 'Object Storage (S3)',
        icon: '☁️',
        percent: storage.objectStore,
        capacity: (storageCapacity * storage.objectStore / 100).toFixed(1),
        unit: 'PB'
      }
    ].filter(tier => tier.percent > 0);
  }, [optimizedConfig, storageCapacity]);

  const handleSwitchToAdvanced = () => {
    if (onSwitchToAdvanced) {
      // Convert basic config to advanced format
      const advancedConfig = {
        serviceTiers: {
          tier1: {
            allocation: optimizedConfig.serviceTiers.bareMetalWhale,
            trainingPercent: 80,
            inferencePercent: 20
          },
          tier2: {
            allocation: optimizedConfig.serviceTiers.orchestratedK8s,
            trainingPercent: 65,
            inferencePercent: 35
          },
          tier3: {
            allocation: optimizedConfig.serviceTiers.managedMLOps,
            trainingPercent: 55,
            inferencePercent: 45
          },
          tier4: {
            allocation: optimizedConfig.serviceTiers.inferenceService,
            trainingPercent: 10,
            inferencePercent: 90
          }
        },
        infrastructure: {
          gpuModel: gpuModel, // Use selected GPU model
          totalGPUs: gpuCount,
          networking: networkingType, // Use selected networking
          cooling: optimizedConfig.infrastructure.cooling,
          powerCapacity: powerCapacity,
          storageCapacity: storageCapacity
        },
        storageTiers: optimizedConfig.storageTiers
      };
      
      onSwitchToAdvanced(advancedConfig);
    }
  };

  return (
    <div className="basic-config-container max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Cluster Configuration</h2>
        <p className="text-lg text-gray-600">Enter your infrastructure basics and we'll optimize the rest</p>
      </div>

      {/* Core Inputs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* GPU Input Card */}
        <div className="input-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <Cpu className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">GPU Selection</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">GPU Model</label>
            <select
              value={gpuModel}
              onChange={(e) => setGpuModel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {gpuOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {gpuOptions.find(opt => opt.value === gpuModel)?.description}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Total GPUs</label>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={gpuCount}
              onChange={(e) => setGpuCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="value-display bg-gray-50 rounded-lg p-4 text-center mb-4">
            <span className="text-2xl font-bold text-gray-800">{gpuCount.toLocaleString()}</span>
            <span className="text-sm text-gray-600 ml-2">GPUs</span>
          </div>

          <div className="quick-select-buttons flex gap-2 justify-center">
            {[500, 1000, 5000, 10000, 25000].map(value => (
              <button
                key={value}
                onClick={() => setGpuCount(value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                {value >= 1000 ? `${value/1000}K` : value}
              </button>
            ))}
          </div>
        </div>

        {/* Power Input Card */}
        <div className="input-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Power Capacity</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Power Available</label>
            <input
              type="range"
              min={minPowerRequired}
              max="100"
              step="1"
              value={powerCapacity}
              onChange={(e) => setPowerCapacity(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="value-display bg-gray-50 rounded-lg p-4 text-center mb-4">
            <span className="text-2xl font-bold text-gray-800">{powerCapacity}</span>
            <span className="text-sm text-gray-600 ml-2">MW</span>
          </div>

          <div className="quick-select-buttons flex gap-2 justify-center mb-4">
            {[5, 15, 30, 50].map(value => (
              <button
                key={value}
                onClick={() => setPowerCapacity(value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                {value} MW
              </button>
            ))}
          </div>

          <div className="power-validation">
            <div className="power-bar bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  powerUtilization > 95 ? 'bg-gray-800' :
                  powerUtilization > 80 ? 'bg-gray-600' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.min(100, powerUtilization)}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${powerStatusInfo.className}`}>
              {powerStatusInfo.status}
            </span>
          </div>
        </div>

        {/* Storage Input Card */}
        <div className="input-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <HardDrive className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Storage Capacity</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Storage Budget</label>
            <input
              type="range"
              min={minStorageRequired}
              max="500"
              step="1"
              value={storageCapacity}
              onChange={(e) => setStorageCapacity(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="value-display bg-gray-50 rounded-lg p-4 text-center mb-4">
            <span className="text-2xl font-bold text-gray-800">{storageCapacity}</span>
            <span className="text-sm text-gray-600 ml-2">PB</span>
          </div>

          <div className="quick-select-buttons flex gap-2 justify-center mb-4">
            {[10, 25, 50, 100].map(value => (
              <button
                key={value}
                onClick={() => setStorageCapacity(value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                {value} PB
              </button>
            ))}
          </div>

          <div className="storage-ratio">
            <div className="text-center text-xs text-gray-600 mb-1">
              {storagePerGPU.toFixed(1)} TB per GPU
            </div>
            <div className={`text-xs font-medium text-center ${storageStatusInfo.className}`}>
              {storageStatusInfo.status}
            </div>
          </div>
        </div>

        {/* Networking Input Card */}
        <div className="input-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <Network className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Networking</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Network Fabric</label>
            <select
              value={networkingType}
              onChange={(e) => setNetworkingType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {networkingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {networkingOptions.find(opt => opt.value === networkingType)?.description}
            </p>
          </div>

          <div className="networking-info bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-2">Recommended for:</div>
            <div className="text-sm font-medium text-gray-800">
              {networkingType === 'roce-200' && 'Small to medium clusters, cost-sensitive deployments'}
              {networkingType === 'roce-400' && 'Most production workloads, balanced performance'}
              {networkingType === 'roce-800' && 'Large-scale training, maximum throughput required'}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Configuration Results Section */}
      <div className="optimization-results bg-gray-100 border border-gray-200 rounded-xl p-8 mb-8">
        <h3 className="flex items-center text-2xl font-bold text-gray-900 mb-6">
          <Settings className="w-6 h-6 mr-3 text-gray-600" />
          Dynamic Configuration
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Service Mix */}
          <div className="optimization-card bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommended Service Mix</h4>
            <div className="space-y-3">
              {optimizedTiers.map((tier, index) => (
                <div key={index} className="tier-allocation">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{tier.name}</span>
                    <span className="text-sm font-bold text-gray-900">{tier.percent}%</span>
                  </div>
                  <div className="tier-bar bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className="bg-gray-600 h-full transition-all duration-500"
                      style={{ width: `${tier.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{tier.gpus.toLocaleString()} GPUs</span>
                    <span>~${tier.monthlyRevenue}M/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Performance Mix */}
          <div className="optimization-card bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Storage Performance Mix</h4>
            <div className="space-y-3">
              {optimizedStorage.map((tier, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{tier.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-700">{tier.name}</div>
                      <div className="text-xs text-gray-500">{tier.capacity} {tier.unit}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{tier.percent}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Calculations */}
          <div className="optimization-card bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure Calculations</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Selected GPU Model</span>
                <span className="text-sm font-medium text-gray-900">{optimizedConfig.constraints.gpuModel}</span>
              </div>
              {(() => {
                const spec = gpuSpecs[gpuModel];
                return spec ? (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reference</span>
                    <a href={spec.reference} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-900 underline">
                      View Datasheet
                    </a>
                  </div>
                ) : null;
              })()}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Network Fabric</span>
                <span className="text-sm font-medium text-gray-900">{optimizedConfig.infrastructure.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cooling Solution</span>
                <span className="text-sm font-medium text-gray-900">{optimizedConfig.infrastructure.cooling}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Racks</span>
                <span className="text-sm font-medium text-gray-900">{optimizedConfig.infrastructure.racks} racks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Compute Nodes</span>
                <span className="text-sm font-medium text-gray-900">{Math.ceil(gpuCount / 8)} nodes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Power Utilization</span>
                <span className="text-sm font-medium text-gray-900">{powerUtilization.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Storage per GPU</span>
                <span className="text-sm font-medium text-gray-900">{storagePerGPU.toFixed(1)} TB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card bg-white border border-gray-300 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Projected Annual Revenue</div>
            <div className="text-2xl font-bold text-gray-900">${optimizedConfig.financial.annualRevenue}M</div>
          </div>
          <div className="metric-card bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">5-Year TCO</div>
            <div className="text-2xl font-bold text-gray-900">${optimizedConfig.financial.totalTCO}M</div>
          </div>
          <div className="metric-card bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">ROI</div>
            <div className="text-2xl font-bold text-gray-900">{optimizedConfig.financial.roi}%</div>
          </div>
          <div className="metric-card bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Payback Period</div>
            <div className="text-2xl font-bold text-gray-900">{optimizedConfig.financial.paybackMonths} months</div>
          </div>
        </div>
      </div>

      {/* Why This Configuration Section */}
      <div className="optimization-explanation bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Why This Configuration?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optimizedConfig.reasoning.map((reason, index) => (
            <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-3">{reason.icon}</span>
              <p className="text-sm text-gray-700">{reason.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Options Link */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">Need more control over the configuration?</p>
        <button
          onClick={handleSwitchToAdvanced}
          className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
        >
          Switch to Advanced Configuration
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default BasicConfigTab;
