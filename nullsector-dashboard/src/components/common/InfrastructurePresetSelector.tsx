import React, { useState } from 'react';
import { Layers, Users, Zap, HardDrive, Network, ChevronDown, ChevronUp } from 'lucide-react';
import { INFRASTRUCTURE_PRESETS, InfrastructurePreset } from '../../data/infrastructurePresets';
import { InfrastructureConfig } from './InfrastructureConfiguration';

interface InfrastructurePresetSelectorProps {
  onPresetSelect: (config: InfrastructureConfig) => void;
}

export const InfrastructurePresetSelector: React.FC<InfrastructurePresetSelectorProps> = ({
  onPresetSelect
}) => {
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);

  const handlePresetSelect = (preset: InfrastructurePreset) => {
    onPresetSelect(preset.config);
  };

  const togglePresetDetails = (presetId: string) => {
    setExpandedPreset(expandedPreset === presetId ? null : presetId);
  };

  const getScaleColor = (gpuCount: number) => {
    if (gpuCount < 500) return 'text-green-600 bg-green-50';
    if (gpuCount < 2000) return 'text-blue-600 bg-blue-50';
    if (gpuCount < 10000) return 'text-orange-600 bg-orange-50';
    return 'text-purple-600 bg-purple-50';
  };

  const getScaleLabel = (gpuCount: number) => {
    if (gpuCount < 500) return 'Small';
    if (gpuCount < 2000) return 'Medium';
    if (gpuCount < 10000) return 'Large';
    return 'Hyperscale';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-600" />
          Infrastructure Presets
        </h3>
        <p className="text-sm text-gray-600">
          Start with a pre-configured infrastructure template based on common deployment scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INFRASTRUCTURE_PRESETS.map((preset) => (
          <div key={preset.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{preset.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getScaleColor(preset.config.compute.totalGPUs)}`}>
                  {getScaleLabel(preset.config.compute.totalGPUs)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-3 h-3" />
                  <span>{preset.config.compute.totalGPUs.toLocaleString()} × {preset.config.compute.gpuModel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Network className="w-3 h-3" />
                  <span>{preset.config.networking.fabricType.split(' ')[0]} {preset.config.networking.fabricType.split(' ')[1]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HardDrive className="w-3 h-3" />
                  <span>
                    {preset.config.storage.highPerf.capacity > 0 && `${preset.config.storage.highPerf.capacity} PB High-Perf`}
                    {preset.config.storage.capacityTier.capacity > 0 && ` + ${preset.config.storage.capacityTier.capacity} PB Capacity`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-3 h-3" />
                  <span>{preset.targetMarket}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePresetSelect(preset)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Use This Config
                </button>
                <button
                  onClick={() => togglePresetDetails(preset.id)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  {expandedPreset === preset.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {expandedPreset === preset.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <h5 className="font-medium text-gray-900 mb-2">Detailed Configuration</h5>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <h6 className="font-medium text-gray-800">Compute</h6>
                    <ul className="text-gray-600 ml-2 space-y-1">
                      <li>• {preset.config.compute.totalGPUs.toLocaleString()} × {preset.config.compute.gpuModel}</li>
                      <li>• {preset.config.compute.nodeConfiguration}</li>
                      <li>• CPU:GPU ratio {preset.config.compute.cpuToGpuRatio}</li>
                    </ul>
                  </div>

                  <div>
                    <h6 className="font-medium text-gray-800">Networking</h6>
                    <ul className="text-gray-600 ml-2 space-y-1">
                      <li>• {preset.config.networking.fabricType}</li>
                      <li>• {preset.config.networking.topologyType}</li>
                      <li>• {preset.config.networking.railConfiguration}</li>
                    </ul>
                  </div>

                  <div>
                    <h6 className="font-medium text-gray-800">Storage</h6>
                    <ul className="text-gray-600 ml-2 space-y-1">
                      {preset.config.storage.ultraHighPerf.capacity > 0 && (
                        <li>• Ultra-High Perf: {preset.config.storage.ultraHighPerf.capacity} {preset.config.storage.ultraHighPerf.unit}</li>
                      )}
                      {preset.config.storage.highPerf.capacity > 0 && (
                        <li>• High Performance: {preset.config.storage.highPerf.capacity} {preset.config.storage.highPerf.unit}</li>
                      )}
                      {preset.config.storage.mediumPerf.capacity > 0 && (
                        <li>• Medium Performance: {preset.config.storage.mediumPerf.capacity} {preset.config.storage.mediumPerf.unit}</li>
                      )}
                      {preset.config.storage.capacityTier.capacity > 0 && (
                        <li>• Capacity Tier: {preset.config.storage.capacityTier.capacity} {preset.config.storage.capacityTier.unit}</li>
                      )}
                      {preset.config.storage.objectStore.capacity > 0 && (
                        <li>• Object Storage: {preset.config.storage.objectStore.capacity} {preset.config.storage.objectStore.unit}</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h6 className="font-medium text-gray-800">Power & Cooling</h6>
                    <ul className="text-gray-600 ml-2 space-y-1">
                      <li>• {preset.config.power.totalPowerCapacity} MW capacity</li>
                      <li>• {preset.config.power.coolingType}</li>
                      <li>• {preset.config.power.powerRedundancy} redundancy</li>
                      <li>• PUE: {preset.config.power.pue}</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <h6 className="font-medium text-gray-800">Use Case</h6>
                    <p className="text-gray-600">{preset.useCase}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Select a preset that closely matches your requirements, then customize the configuration as needed. 
          The system will analyze your infrastructure and recommend optimal service tier allocation.
        </p>
      </div>
    </div>
  );
};
