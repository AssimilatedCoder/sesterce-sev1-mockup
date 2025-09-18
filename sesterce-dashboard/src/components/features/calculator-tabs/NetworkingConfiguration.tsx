import React from 'react';
import { Network } from 'lucide-react';

interface NetworkingConfigurationProps {
  fabricType: string;
  setFabricType: (value: string) => void;
  topology: string;
  setTopology: (value: string) => void;
  oversubscription: string;
  setOversubscription: (value: string) => void;
  railsPerGPU: number;
  setRailsPerGPU: (value: number) => void;
}

export const NetworkingConfiguration: React.FC<NetworkingConfigurationProps> = ({
  fabricType,
  setFabricType,
  topology,
  setTopology,
  oversubscription,
  setOversubscription,
  railsPerGPU,
  setRailsPerGPU
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Network className="w-6 h-6 text-purple-500" />
        Networking Configuration
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">Fabric Type</label>
          <select 
            value={fabricType}
            onChange={(e) => setFabricType(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
          >
            <option value="infiniband">InfiniBand NDR (400Gbps)</option>
            <option value="ethernet">Ethernet (400GbE RoCEv2)</option>
            <option value="mixed">Mixed IB + Ethernet</option>
          </select>
        </div>

        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">Topology</label>
          <select 
            value={topology}
            onChange={(e) => setTopology(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
          >
            <option value="fat-tree">Fat-Tree (Non-blocking)</option>
            <option value="dragonfly">Dragonfly</option>
            <option value="rail-optimized">Rail-Optimized</option>
          </select>
        </div>

        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">Oversubscription Ratio</label>
          <select 
            value={oversubscription}
            onChange={(e) => setOversubscription(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
          >
            <option value="1:1">1:1 (Non-blocking)</option>
            <option value="2:1">2:1</option>
            <option value="3:1">3:1</option>
            <option value="4:1">4:1</option>
          </select>
        </div>

        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">Rails per GPU</label>
          <input 
            type="number" 
            value={railsPerGPU}
            onChange={(e) => setRailsPerGPU(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
            min="1"
            max="18"
          />
          <span className="text-xs text-gray-500 mt-1 block">H100: 8-18, GB200: 9</span>
        </div>
      </div>
    </div>
  );
};
