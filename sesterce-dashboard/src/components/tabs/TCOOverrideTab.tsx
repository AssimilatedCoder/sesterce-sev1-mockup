import React, { useState, useEffect } from 'react';
import { 
  Info, RotateCcw, Save, AlertTriangle, CheckCircle2,
  HardDrive, Network, DollarSign, Server, Thermometer
} from 'lucide-react';
import { activityLogger } from '../../utils/activityLogger';
import { useCurrency } from '../../hooks/useCurrency';

interface TCOOverrideTabProps {
  config: any;
  onOverrideChange: (overrides: TCOOverrides) => void;
  currentOverrides: TCOOverrides;
}

export interface TCOOverrides {
  // Hardware Configuration
  gpuUnitPrice?: number;
  depreciation?: number;
  
  // Power & Cooling
  pueOverride?: number;
  customEnergyRate?: number;
  utilization?: number;
  
  // Networking
  railsPerGPU?: number;
  
  // Storage
  totalStorage?: number;
  hotPercent?: number;
  warmPercent?: number;
  coldPercent?: number;
  archivePercent?: number;
  
  // Software & Support
  maintenancePercent?: number;
  staffMultiplier?: number;
  
  // Pricing Metrics
  bandwidthCostPerGPU?: number;
  softwareLicenseCostPerGPU?: number;
  coolingCostPerKW?: number;
  datacenterCostPerMW?: number;
  dpuUnitPrice?: number;
  
  // Network Infrastructure Costs
  switchPriceOverride?: number;
  cablePriceOverride?: number;
  transceiverPriceOverride?: number;
  
  // Storage Vendor Pricing Overrides
  vastPricePerGB?: number;
  wekaPricePerGB?: number;
  ddnPricePerGB?: number;
  purePricePerGB?: number;
  cephPricePerGB?: number;
  
  // Operational Cost Overrides
  powerCostMultiplier?: number;
  coolingOpexMultiplier?: number;
  staffCostOverride?: number;
}

export const TCOOverrideTab: React.FC<TCOOverrideTabProps> = ({
  config,
  onOverrideChange,
  currentOverrides
}) => {
  const [overrides, setOverrides] = useState<TCOOverrides>(currentOverrides || {});
  const [hasChanges, setHasChanges] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Get currency formatting functions
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    setOverrides(currentOverrides || {});
  }, [currentOverrides]);

  const handleOverrideChange = (key: keyof TCOOverrides, value: number | string | undefined) => {
    const newOverrides = { ...overrides };
    let finalValue: number | undefined;
    
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      delete newOverrides[key];
      finalValue = undefined;
    } else {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        newOverrides[key] = numValue;
        finalValue = numValue;
      }
    }
    
    // Log the override change
    activityLogger.logOverrideChange(key, finalValue);
    
    setOverrides(newOverrides);
    setHasChanges(true);
  };

  const handleSave = () => {
    onOverrideChange(overrides);
    setHasChanges(false);
  };

  const handleReset = () => {
    setOverrides({});
    onOverrideChange({});
    setHasChanges(false);
  };

  const formatDefaultValue = (value: any): string => {
    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return String(value);
  };

  const getOverrideCount = () => {
    return Object.keys(overrides).length;
  };

  return (
    <div className="space-y-6">
      {/* Header and Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              TCO Calculator Override Center
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p className="font-medium">
                Use this page to override default values with negotiated prices, custom estimates, or region-specific costs.
              </p>
              {showInstructions && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">How to Use Overrides:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Enter Custom Values:</strong> Input your negotiated prices or custom estimates in any field</li>
                    <li><strong>Leave Blank for Defaults:</strong> Empty fields will use the calculator's standard values</li>
                    <li><strong>Real-time Updates:</strong> Changes apply immediately to all TCO calculations</li>
                    <li><strong>Percentage Adjustments:</strong> Use multipliers to adjust entire cost categories</li>
                    <li><strong>Save & Reset:</strong> Save your overrides for future sessions or reset to defaults</li>
                  </ul>
                  <div className="mt-3 p-3 bg-blue-100 rounded text-sm">
                    <strong>💡 Pro Tip:</strong> Start with hardware overrides (GPU prices, networking costs) as these typically 
                    have the biggest impact on TCO. Then fine-tune operational costs based on your specific requirements.
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Override Status */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getOverrideCount() > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm font-medium">
            {getOverrideCount()} override{getOverrideCount() !== 1 ? 's' : ''} active
          </span>
          {hasChanges && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
              hasChanges 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Save Overrides
          </button>
        </div>
      </div>

      {/* Hardware Configuration Overrides */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-500" />
            Hardware Configuration Overrides
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                GPU Unit Price Override
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.gpuUnitPrice || ''}
                  onChange={(e) => handleOverrideChange('gpuUnitPrice', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(config.gpuModel === 'gb200' ? 65000 : config.gpuModel === 'gb300' ? 85000 : 28000)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                Per GPU unit cost (negotiated pricing)
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Depreciation Period Override
              </label>
              <select
                value={overrides.depreciation || ''}
                onChange={(e) => handleOverrideChange('depreciation', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Default: {config.depreciation} years</option>
                <option value="3">3 Years (Aggressive)</option>
                <option value="4">4 Years (Standard)</option>
                <option value="5">5 Years (Conservative)</option>
                <option value="7">7 Years (Extended)</option>
              </select>
              <span className="text-xs text-gray-500 mt-1 block">
                Asset depreciation schedule
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Power & Cooling Overrides */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            Power & Cooling Overrides
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                PUE Override
              </label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max="3.0"
                value={overrides.pueOverride || ''}
                onChange={(e) => handleOverrideChange('pueOverride', e.target.value)}
                placeholder={`Default: ${config.coolingType === 'liquid' ? '1.09' : '1.4'}`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Power Usage Effectiveness ratio
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Custom Energy Rate ($/kWh)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.01"
                max="1.0"
                value={overrides.customEnergyRate || ''}
                onChange={(e) => handleOverrideChange('customEnergyRate', e.target.value)}
                placeholder={`Default: $0.047 (${config.region})`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Negotiated electricity rate
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cooling Cost per kW
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.coolingCostPerKW || ''}
                  onChange={(e) => handleOverrideChange('coolingCostPerKW', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(config.coolingType === 'liquid' ? 400 : 300)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                Cooling infrastructure cost per kW
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Utilization Rate Override (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                step="5"
                value={overrides.utilization || ''}
                onChange={(e) => handleOverrideChange('utilization', e.target.value)}
                placeholder={`Default: ${config.utilization}%`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Expected GPU utilization rate
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Data Center Cost per MW
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.datacenterCostPerMW || ''}
                  onChange={(e) => handleOverrideChange('datacenterCostPerMW', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(10000000)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                Data center infrastructure cost per MW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Networking Overrides */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-500" />
            Networking Infrastructure Overrides
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Switch Price Override
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.switchPriceOverride || ''}
                  onChange={(e) => handleOverrideChange('switchPriceOverride', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(config.fabricType === 'infiniband' ? 120000 : 85000)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                Per 64-port switch unit cost
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cable Price Override
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.cablePriceOverride || ''}
                  onChange={(e) => handleOverrideChange('cablePriceOverride', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(config.fabricType === 'infiniband' ? 500 : 200)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                Per cable cost (DAC/AOC)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Transceiver Price Override
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.transceiverPriceOverride || ''}
                  onChange={(e) => handleOverrideChange('transceiverPriceOverride', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(config.fabricType === 'infiniband' ? 1500 : 800)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                Per transceiver/optic cost
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                DPU Unit Price Override
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.dpuUnitPrice || ''}
                  onChange={(e) => handleOverrideChange('dpuUnitPrice', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(2500)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                BlueField-3 DPU unit cost
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Overrides */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-green-500" />
            Storage Vendor Pricing Overrides
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                VAST Data Price per GB
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  step="0.001"
                  value={overrides.vastPricePerGB || ''}
                  onChange={(e) => handleOverrideChange('vastPricePerGB', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(0.030)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Hot tier storage</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                WekaFS Price per GB
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  step="0.001"
                  value={overrides.wekaPricePerGB || ''}
                  onChange={(e) => handleOverrideChange('wekaPricePerGB', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(0.045)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Hot tier storage</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Pure Storage Price per GB
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  step="0.001"
                  value={overrides.purePricePerGB || ''}
                  onChange={(e) => handleOverrideChange('purePricePerGB', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(0.020)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Warm tier storage</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Ceph Price per GB
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  step="0.001"
                  value={overrides.cephPricePerGB || ''}
                  onChange={(e) => handleOverrideChange('cephPricePerGB', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(0.005)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Cold tier storage</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Total Storage Override (PB)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={overrides.totalStorage || ''}
                onChange={(e) => handleOverrideChange('totalStorage', e.target.value)}
                placeholder={`Default: ${config.totalStorage} PB`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">Total storage capacity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Cost Overrides */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Operational Cost Overrides
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Annual Maintenance (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={overrides.maintenancePercent || ''}
                  onChange={(e) => handleOverrideChange('maintenancePercent', e.target.value)}
                  placeholder={`Default: ${config.maintenancePercent}%`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Of hardware CAPEX</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Staff Cost Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="3.0"
                value={overrides.staffMultiplier || ''}
                onChange={(e) => handleOverrideChange('staffMultiplier', e.target.value)}
                placeholder={`Default: ${config.staffMultiplier}`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">Regional adjustment factor</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Bandwidth Cost per GPU/Year
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.bandwidthCostPerGPU || ''}
                  onChange={(e) => handleOverrideChange('bandwidthCostPerGPU', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(600)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Annual network bandwidth cost</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Software License Cost per GPU/Year
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  value={overrides.softwareLicenseCostPerGPU || ''}
                  onChange={(e) => handleOverrideChange('softwareLicenseCostPerGPU', e.target.value)}
                  placeholder={`Default: ${formatDefaultValue(500)}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Annual software licensing</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Power Cost Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="2.0"
                value={overrides.powerCostMultiplier || ''}
                onChange={(e) => handleOverrideChange('powerCostMultiplier', e.target.value)}
                placeholder="Default: 1.0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">Adjust total power costs</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cooling OPEX Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1.0"
                value={overrides.coolingOpexMultiplier || ''}
                onChange={(e) => handleOverrideChange('coolingOpexMultiplier', e.target.value)}
                placeholder={`Default: ${config.coolingType === 'liquid' ? '0.15' : '0.45'}`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">Cooling operational multiplier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Tier Distribution Overrides */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-500" />
            Storage Tier Distribution Overrides
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Hot Tier Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrides.hotPercent || ''}
                  onChange={(e) => handleOverrideChange('hotPercent', e.target.value)}
                  placeholder={`Default: ${config.hotPercent}%`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">🔥 High-performance storage</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Warm Tier Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrides.warmPercent || ''}
                  onChange={(e) => handleOverrideChange('warmPercent', e.target.value)}
                  placeholder={`Default: ${config.warmPercent}%`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">🌡 Balanced performance</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cold Tier Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrides.coldPercent || ''}
                  onChange={(e) => handleOverrideChange('coldPercent', e.target.value)}
                  placeholder={`Default: ${config.coldPercent}%`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">❄️ Cost-optimized storage</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Archive Tier Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrides.archivePercent || ''}
                  onChange={(e) => handleOverrideChange('archivePercent', e.target.value)}
                  placeholder={`Default: ${config.archivePercent}%`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">🗄 Long-term archive</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong>Note:</strong> Storage tier percentages should total 100%. 
                The calculator will automatically adjust if the total doesn't equal 100%.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      {getOverrideCount() > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-2">Active Overrides Summary</h4>
              <div className="text-sm text-green-700">
                <p className="mb-2">
                  You have <strong>{getOverrideCount()} override{getOverrideCount() !== 1 ? 's' : ''}</strong> active. 
                  These custom values will be used in all TCO calculations instead of the default values.
                </p>
                <div className="text-xs space-y-1">
                  {Object.entries(overrides).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <span className="font-mono">
                        {typeof value === 'number' && (key.includes('Price') || key.includes('Cost')) ? formatCurrency(value) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
