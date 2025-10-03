import React from 'react';
import { Users, Server } from 'lucide-react';

export type DesignMode = 'service' | 'infrastructure';

interface DesignModeSelectorProps {
  mode: DesignMode;
  onModeChange: (mode: DesignMode) => void;
}

export const DesignModeSelector: React.FC<DesignModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">GPU Cluster Design Approach</h2>
        <p className="text-sm text-gray-600">
          Choose your starting point for cluster design. Both approaches converge to the same TCO/ROI calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => onModeChange('service')}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            mode === 'service'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              mode === 'service' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Users className={`w-5 h-5 ${
                mode === 'service' ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-medium mb-1 ${
                mode === 'service' ? 'text-blue-900' : 'text-gray-900'
              }`}>
                Service-Driven Design
              </h3>
              <p className={`text-sm ${
                mode === 'service' ? 'text-blue-700' : 'text-gray-600'
              }`}>
                Start with customer needs & workloads
              </p>
              <p className={`text-xs mt-2 ${
                mode === 'service' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Define service tiers → Calculate infrastructure requirements
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onModeChange('infrastructure')}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            mode === 'infrastructure'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              mode === 'infrastructure' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Server className={`w-5 h-5 ${
                mode === 'infrastructure' ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-medium mb-1 ${
                mode === 'infrastructure' ? 'text-green-900' : 'text-gray-900'
              }`}>
                Infrastructure-First Design
              </h3>
              <p className={`text-sm ${
                mode === 'infrastructure' ? 'text-green-700' : 'text-gray-600'
              }`}>
                Start with hardware specifications
              </p>
              <p className={`text-xs mt-2 ${
                mode === 'infrastructure' ? 'text-green-600' : 'text-gray-500'
              }`}>
                Define infrastructure → Derive optimal service mix
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className={`p-4 rounded-lg border ${
        mode === 'service' 
          ? 'border-blue-200 bg-blue-50' 
          : 'border-green-200 bg-green-50'
      }`}>
        <div className="flex items-start gap-2">
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
            mode === 'service' ? 'bg-blue-500' : 'bg-green-500'
          }`} />
          <div>
            <p className={`text-sm font-medium ${
              mode === 'service' ? 'text-blue-900' : 'text-green-900'
            }`}>
              {mode === 'service' ? 'Service-Driven Approach' : 'Infrastructure-First Approach'}
            </p>
            <p className={`text-sm mt-1 ${
              mode === 'service' ? 'text-blue-700' : 'text-green-700'
            }`}>
              {mode === 'service'
                ? 'Define your target customer mix and workload distribution. The calculator will determine optimal infrastructure requirements and validate feasibility.'
                : 'Specify your infrastructure components (GPUs, networking, storage, power). The calculator will analyze capabilities and suggest optimal service tier allocation to maximize ROI.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
