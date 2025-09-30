import React from 'react';
import { Settings } from 'lucide-react';

interface AdvancedOptionsProps {
  pueOverride?: number;
  setPueOverride: (value: number | undefined) => void;
  gpuPriceOverride?: number;
  setGpuPriceOverride: (value: number | undefined) => void;
  maintenancePercent: number;
  setMaintenancePercent: (value: number) => void;
  staffMultiplier: number;
  setStaffMultiplier: (value: number) => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  pueOverride,
  setPueOverride,
  gpuPriceOverride,
  setGpuPriceOverride,
  maintenancePercent,
  setMaintenancePercent,
  staffMultiplier,
  setStaffMultiplier
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-gray-600" />
        Advanced Options
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">PUE Override</label>
          <input 
            type="number" 
            value={pueOverride || ''}
            onChange={(e) => setPueOverride(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
            placeholder="Auto"
            step="0.01"
            min="1.0"
            max="2.0"
          />
          <span className="text-xs text-gray-500 mt-1 block">Leave blank for auto</span>
        </div>

        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">GPU Unit Price Override</label>
          <input 
            type="number" 
            value={gpuPriceOverride || ''}
            onChange={(e) => setGpuPriceOverride(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
            placeholder="Auto"
            step="1000"
          />
          <span className="text-xs text-gray-500 mt-1 block">Override default pricing</span>
        </div>

        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">Annual Maintenance %</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={maintenancePercent}
              onChange={(e) => setMaintenancePercent(parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
              min="1"
              max="10"
              step="0.5"
            />
            <span className="text-gray-700 font-semibold">%</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Of hardware CAPEX</span>
        </div>

        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">Staff Cost Multiplier</label>
          <input 
            type="number" 
            value={staffMultiplier}
            onChange={(e) => setStaffMultiplier(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
            min="0.5"
            max="3.0"
            step="0.1"
          />
          <span className="text-xs text-gray-500 mt-1 block">Adjust for region</span>
        </div>
      </div>
    </div>
  );
};
