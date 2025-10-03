import React, { useState } from 'react';
import { Cpu, Network, HardDrive, Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface InfrastructureConfig {
  compute: {
    gpuModel: string;
    totalGPUs: number;
    nodeConfiguration: string;
    cpuToGpuRatio: string;
  };
  networking: {
    fabricType: string;
    topologyType: string;
    railConfiguration: string;
    storageNetworkSeparation: boolean;
  };
  storage: {
    ultraHighPerf: { capacity: number; unit: string };
    highPerf: { capacity: number; unit: string };
    mediumPerf: { capacity: number; unit: string };
    capacityTier: { capacity: number; unit: string };
    objectStore: { capacity: number; unit: string };
  };
  power: {
    totalPowerCapacity: number;
    coolingType: string;
    powerRedundancy: string;
    pue: number;
  };
}

interface InfrastructureConfigurationProps {
  config: InfrastructureConfig;
  onChange: (config: InfrastructureConfig) => void;
}

export const InfrastructureConfiguration: React.FC<InfrastructureConfigurationProps> = ({
  config,
  onChange
}) => {
  const [expandedSections, setExpandedSections] = useState({
    compute: true,
    networking: false,
    storage: false,
    power: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateConfig = (section: keyof InfrastructureConfig, field: string, value: any) => {
    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    };
    onChange(newConfig);
  };

  const updateStorageConfig = (tier: string, field: string, value: any) => {
    const newConfig = {
      ...config,
      storage: {
        ...config.storage,
        [tier]: {
          ...config.storage[tier as keyof typeof config.storage],
          [field]: value
        }
      }
    };
    onChange(newConfig);
  };

  const ConfigSection = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    children, 
    description 
  }: {
    title: string;
    icon: React.ComponentType<any>;
    sectionKey: keyof typeof expandedSections;
    children: React.ReactNode;
    description: string;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Infrastructure-First Design</p>
            <p className="text-sm text-blue-700 mt-1">
              Define your infrastructure components below. The system will analyze capabilities and recommend optimal service tier allocation.
            </p>
          </div>
        </div>
      </div>

      <ConfigSection
        title="GPU Compute Resources"
        icon={Cpu}
        sectionKey="compute"
        description="Define GPU hardware and node configuration"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPU Model
            </label>
            <select
              value={config.compute.gpuModel}
              onChange={(e) => updateConfig('compute', 'gpuModel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="H100 SXM">H100 SXM (Training optimized)</option>
              <option value="H100 PCIe">H100 PCIe (Balanced)</option>
              <option value="H200">H200 (Next-gen training)</option>
              <option value="A100 80GB">A100 80GB (Training)</option>
              <option value="A100 40GB">A100 40GB (Balanced)</option>
              <option value="L40S">L40S (Inference optimized)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Determines training vs inference optimization
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total GPUs
            </label>
            <input
              type="number"
              min="100"
              max="50000"
              step="100"
              value={config.compute.totalGPUs}
              onChange={(e) => updateConfig('compute', 'totalGPUs', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be divisible by 8 for DGX configurations
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Configuration
            </label>
            <select
              value={config.compute.nodeConfiguration}
              onChange={(e) => updateConfig('compute', 'nodeConfiguration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DGX H100 (8x H100 SXM)">DGX H100 (8x H100 SXM)</option>
              <option value="Dell PowerEdge XE9680 (8x H100)">Dell PowerEdge XE9680 (8x H100)</option>
              <option value="Custom 4-GPU nodes">Custom 4-GPU nodes</option>
              <option value="Custom 8-GPU nodes">Custom 8-GPU nodes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPU to GPU Ratio
            </label>
            <select
              value={config.compute.cpuToGpuRatio}
              onChange={(e) => updateConfig('compute', 'cpuToGpuRatio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1:4 (Inference optimized)">1:4 (Inference optimized)</option>
              <option value="1:2 (Balanced)">1:2 (Balanced)</option>
              <option value="1:1 (CPU heavy)">1:1 (CPU heavy)</option>
            </select>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Network Architecture"
        icon={Network}
        sectionKey="networking"
        description="Configure high-speed interconnect and topology"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fabric Type
            </label>
            <select
              value={config.networking.fabricType}
              onChange={(e) => updateConfig('networking', 'fabricType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="InfiniBand NDR 400Gb (Training optimized)">InfiniBand NDR 400Gb (Training optimized)</option>
              <option value="InfiniBand HDR 200Gb (Balanced)">InfiniBand HDR 200Gb (Balanced)</option>
              <option value="Ethernet 400GbE RoCEv2 (Cost optimized)">Ethernet 400GbE RoCEv2 (Cost optimized)</option>
              <option value="Ethernet 200GbE (Legacy)">Ethernet 200GbE (Legacy)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Determines maximum training scale
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topology Type
            </label>
            <select
              value={config.networking.topologyType}
              onChange={(e) => updateConfig('networking', 'topologyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Fat Tree (Non-blocking)">Fat Tree (Non-blocking)</option>
              <option value="Fat Tree (2:1 oversubscribed)">Fat Tree (2:1 oversubscribed)</option>
              <option value="Dragonfly+ (Large scale)">Dragonfly+ (Large scale)</option>
              <option value="BCube (Cost optimized)">BCube (Cost optimized)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rail Configuration
            </label>
            <select
              value={config.networking.railConfiguration}
              onChange={(e) => updateConfig('networking', 'railConfiguration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Single Rail">Single Rail</option>
              <option value="Dual Rail (Redundant)">Dual Rail (Redundant)</option>
              <option value="Quad Rail (Maximum bandwidth)">Quad Rail (Maximum bandwidth)</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="storageNetworkSeparation"
              checked={config.networking.storageNetworkSeparation}
              onChange={(e) => updateConfig('networking', 'storageNetworkSeparation', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="storageNetworkSeparation" className="ml-2 block text-sm text-gray-700">
              Dedicated storage network
            </label>
          </div>
          <p className="text-xs text-gray-500 col-span-2">
            Prevents storage I/O from impacting training performance
          </p>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Storage Architecture"
        icon={HardDrive}
        sectionKey="storage"
        description="Define storage tiers and capacity allocation"
      >
        <div className="space-y-4 mt-4">
          {[
            {
              key: 'ultraHighPerf',
              label: 'Ultra-High Performance (NVMe Direct)',
              unit: 'TB',
              bandwidth: '250 GB/s per 100TB',
              useCase: 'Whale customer checkpoints'
            },
            {
              key: 'highPerf',
              label: 'High Performance (VAST Universal)',
              unit: 'PB',
              bandwidth: '100 GB/s per PB',
              useCase: 'Training datasets, hot data'
            },
            {
              key: 'mediumPerf',
              label: 'Medium Performance (SSD Cache)',
              unit: 'TB',
              bandwidth: '1M IOPS per 100TB',
              useCase: 'Model serving, warm data'
            },
            {
              key: 'capacityTier',
              label: 'Capacity Tier (HDD + Cache)',
              unit: 'PB',
              bandwidth: '10 GB/s per PB',
              useCase: 'Archived models, cold data'
            },
            {
              key: 'objectStore',
              label: 'Object Storage (S3 Compatible)',
              unit: 'PB',
              bandwidth: 'API-based access',
              useCase: 'MLOps artifacts, backups'
            }
          ].map((tier) => (
            <div key={tier.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{tier.label}</h4>
                  <p className="text-sm text-gray-600">{tier.useCase}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step={tier.unit === 'TB' ? '10' : '0.1'}
                    value={config.storage[tier.key as keyof typeof config.storage].capacity}
                    onChange={(e) => updateStorageConfig(tier.key, 'capacity', parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{tier.unit}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">Performance: {tier.bandwidth}</p>
            </div>
          ))}
        </div>
      </ConfigSection>

      <ConfigSection
        title="Power & Cooling"
        icon={Zap}
        sectionKey="power"
        description="Define power capacity and cooling infrastructure"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Power Capacity (MW)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={config.power.totalPowerCapacity}
              onChange={(e) => updateConfig('power', 'totalPowerCapacity', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must support GPU TDP + 30% overhead
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooling Type
            </label>
            <select
              value={config.power.coolingType}
              onChange={(e) => updateConfig('power', 'coolingType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Air Cooled (Standard)">Air Cooled (Standard)</option>
              <option value="Liquid Cooled (Direct chip)">Liquid Cooled (Direct chip)</option>
              <option value="Immersion Cooled (Maximum density)">Immersion Cooled (Maximum density)</option>
              <option value="Hybrid Air/Liquid">Hybrid Air/Liquid</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Affects rack density and efficiency
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Power Redundancy
            </label>
            <select
              value={config.power.powerRedundancy}
              onChange={(e) => updateConfig('power', 'powerRedundancy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="N+1">N+1</option>
              <option value="N+2">N+2</option>
              <option value="2N">2N</option>
              <option value="2N+1">2N+1</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Power Usage Effectiveness (PUE)
            </label>
            <input
              type="number"
              min="1.0"
              max="2.0"
              step="0.1"
              value={config.power.pue}
              onChange={(e) => updateConfig('power', 'pue', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              1.0 = Perfect efficiency, 1.2 = Excellent, 1.5+ = Poor
            </p>
          </div>
        </div>
      </ConfigSection>
    </div>
  );
};
