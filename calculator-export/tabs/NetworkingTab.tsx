import React from 'react';
import { Network, Activity, Zap, Server } from 'lucide-react';

interface NetworkingTabProps {
  config: any;
  results: any;
}

export const NetworkingTab: React.FC<NetworkingTabProps> = ({ config, results }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-600" />
          Network Architecture Overview
        </h2>
        <p className="text-gray-700 mb-4">
          GPU clusters require ultra-low latency, high-bandwidth networking to enable efficient distributed training. 
          The network architecture is critical for performance at scale.
        </p>
        {results && results.details && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{results.details.networking?.pods || 0}</div>
              <div className="text-sm text-gray-600">Pods (1024 GPUs)</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{results.details.networking?.leafSwitches || 0}</div>
              <div className="text-sm text-gray-600">Leaf Switches</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{results.details.networking?.spineSwitches || 0}</div>
              <div className="text-sm text-gray-600">Spine Switches</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{results.details.networking?.coreSwitches || 0}</div>
              <div className="text-sm text-gray-600">Core Switches</div>
            </div>
          </div>
        )}
      </div>

      {/* Topology Diagram Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">3-Tier Fat Tree Topology</h3>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <Server className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Network topology visualization would appear here</p>
          <p className="text-sm text-gray-500 mt-2">Showing leaf-spine-core architecture with rail optimization</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Network Performance Characteristics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Bandwidth</h4>
            <p className="text-2xl font-bold text-green-600">
              {results ? `${(results.networkBandwidth / 1000).toFixed(1)} Tbps` : '0 Tbps'}
            </p>
            <p className="text-sm text-gray-600">Aggregate fabric bandwidth</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Latency Target</h4>
            <p className="text-2xl font-bold text-blue-600">{'< 2 μs'}</p>
            <p className="text-sm text-gray-600">End-to-end within pod</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Oversubscription</h4>
            <p className="text-2xl font-bold text-purple-600">1:1</p>
            <p className="text-sm text-gray-600">Non-blocking fabric</p>
          </div>
        </div>
      </div>
    </div>
  );
};
