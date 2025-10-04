import React, { useState, useEffect, useMemo } from 'react';
import { Zap, HardDrive, Cpu, TrendingUp, Settings, ArrowRight, Info, Sparkles } from 'lucide-react';
import { 
  ClusterOptimizer, 
  OptimizedConfiguration,
  getMinPowerRequired,
  getMinStorageRequired,
  getPowerUtilization,
  getPowerStatus,
  getStorageRatioStatus
} from '../../utils/clusterOptimizer';

interface BasicConfigTabProps {
  onSwitchToAdvanced?: (config: any) => void;
}

export const BasicConfigTab: React.FC<BasicConfigTabProps> = ({ onSwitchToAdvanced }) => {
  const [gpuCount, setGpuCount] = useState(5000);
  const [powerCapacity, setPowerCapacity] = useState(15); // MW
  const [storageCapacity, setStorageCapacity] = useState(125); // PB

  // Computed values
  const minPowerRequired = useMemo(() => getMinPowerRequired(gpuCount), [gpuCount]);
  const minStorageRequired = useMemo(() => getMinStorageRequired(gpuCount), [gpuCount]);
  const powerUtilization = useMemo(() => getPowerUtilization(gpuCount, powerCapacity), [gpuCount, powerCapacity]);
  const powerStatusInfo = useMemo(() => getPowerStatus(powerUtilization), [powerUtilization]);
  const storagePerGPU = useMemo(() => ((storageCapacity * 1000) / gpuCount), [storageCapacity, gpuCount]);
  const storageStatusInfo = useMemo(() => getStorageRatioStatus(storagePerGPU), [storagePerGPU]);

  // Optimization results
  const optimizedConfig = useMemo(() => {
    const optimizer = new ClusterOptimizer(gpuCount, powerCapacity, storageCapacity);
    return optimizer.calculateOptimalConfiguration();
  }, [gpuCount, powerCapacity, storageCapacity]);

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
          gpuModel: optimizedConfig.constraints.gpuModel,
          totalGPUs: gpuCount,
          networking: optimizedConfig.infrastructure.network,
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* GPU Input Card */}
        <div className="input-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <Cpu className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">GPU Compute</h3>
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
            <span className="text-3xl font-bold text-blue-600">{gpuCount.toLocaleString()}</span>
            <span className="text-lg text-gray-600 ml-2">GPUs</span>
          </div>

          <div className="quick-select-buttons flex gap-2 justify-center mb-4">
            {[500, 1000, 5000, 10000, 25000].map(value => (
              <button
                key={value}
                onClick={() => setGpuCount(value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
              >
                {value >= 1000 ? `${value/1000}K` : value}
              </button>
            ))}
          </div>

          <div className="auto-recommendation flex items-center text-sm text-gray-600">
            <Info className="w-4 h-4 mr-2" />
            <span>Recommended: {optimizedConfig.constraints.gpuModel}</span>
          </div>
        </div>

        {/* Power Input Card */}
        <div className="input-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-yellow-600 mr-3" />
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
            <span className="text-3xl font-bold text-yellow-600">{powerCapacity}</span>
            <span className="text-lg text-gray-600 ml-2">MW</span>
          </div>

          <div className="quick-select-buttons flex gap-2 justify-center mb-4">
            {[5, 15, 30, 50].map(value => (
              <button
                key={value}
                onClick={() => setPowerCapacity(value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-yellow-600 hover:text-white hover:border-yellow-600 transition-colors"
              >
                {value} MW
              </button>
            ))}
          </div>

          <div className="power-validation">
            <div className="power-bar bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  powerUtilization > 95 ? 'bg-red-500' :
                  powerUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, powerUtilization)}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${powerStatusInfo.className}`}>
              {powerStatusInfo.status}
            </span>
          </div>
        </div>

        {/* Storage Input Card */}
        <div className="input-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <HardDrive className="w-6 h-6 text-purple-600 mr-3" />
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
            <span className="text-3xl font-bold text-purple-600">{storageCapacity}</span>
            <span className="text-lg text-gray-600 ml-2">PB</span>
          </div>

          <div className="quick-select-buttons flex gap-2 justify-center mb-4">
            {[10, 25, 50, 100].map(value => (
              <button
                key={value}
                onClick={() => setStorageCapacity(value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
              >
                {value} PB
              </button>
            ))}
          </div>

          <div className="storage-ratio">
            <div className="text-center text-sm text-gray-600 mb-1">
              {storagePerGPU.toFixed(1)} TB per GPU
            </div>
            <div className={`text-sm font-medium text-center ${storageStatusInfo.className}`}>
              {storageStatusInfo.status}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Optimized Results Section */}
      <div className="optimization-results bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-xl p-8 mb-8">
        <h3 className="flex items-center text-2xl font-bold mb-6">
          <Sparkles className="w-6 h-6 mr-3" />
          AI-Optimized Configuration
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Service Mix */}
          <div className="optimization-card bg-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Recommended Service Mix</h4>
            <div className="space-y-3">
              {optimizedTiers.map((tier, index) => (
                <div key={index} className="tier-allocation">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{tier.name}</span>
                    <span className="text-sm font-bold">{tier.percent}%</span>
                  </div>
                  <div className="tier-bar bg-white/20 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className="bg-white h-full transition-all duration-500"
                      style={{ width: `${tier.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs opacity-90">
                    <span>{tier.gpus.toLocaleString()} GPUs</span>
                    <span>~${tier.monthlyRevenue}M/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Performance Mix */}
          <div className="optimization-card bg-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Storage Performance Mix</h4>
            <div className="space-y-3">
              {optimizedStorage.map((tier, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{tier.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{tier.name}</div>
                      <div className="text-xs opacity-75">{tier.capacity} {tier.unit}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold">{tier.percent}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Allocation */}
          <div className="optimization-card bg-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Infrastructure Allocation</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Network Fabric</span>
                <span className="text-sm font-medium">{optimizedConfig.infrastructure.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cooling Solution</span>
                <span className="text-sm font-medium">{optimizedConfig.infrastructure.cooling}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Rack Configuration</span>
                <span className="text-sm font-medium">{optimizedConfig.infrastructure.racks} racks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card bg-white/20 rounded-lg p-4 text-center">
            <div className="text-sm opacity-90 mb-1">Projected Annual Revenue</div>
            <div className="text-2xl font-bold">${optimizedConfig.financial.annualRevenue}M</div>
          </div>
          <div className="metric-card bg-white/10 rounded-lg p-4 text-center">
            <div className="text-sm opacity-90 mb-1">5-Year TCO</div>
            <div className="text-2xl font-bold">${optimizedConfig.financial.totalTCO}M</div>
          </div>
          <div className="metric-card bg-white/10 rounded-lg p-4 text-center">
            <div className="text-sm opacity-90 mb-1">ROI</div>
            <div className="text-2xl font-bold">{optimizedConfig.financial.roi}%</div>
          </div>
          <div className="metric-card bg-white/10 rounded-lg p-4 text-center">
            <div className="text-sm opacity-90 mb-1">Payback Period</div>
            <div className="text-2xl font-bold">{optimizedConfig.financial.paybackMonths} months</div>
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
