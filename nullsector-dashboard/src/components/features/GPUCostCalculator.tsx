import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useCurrency } from '../../hooks/useCurrency';

interface GPUSpec {
  name: string;
  memory: string;
  bandwidth: string;
  tdp: string;
  unitPrice: number;
  rackConfig: string;
  rackPrice: string;
  power: number; // watts
}

interface RegionRate {
  name: string;
  rate: number; // $/kWh
}

export const GPUCostCalculator: React.FC = () => {
  const { formatCurrency: formatCurrencyHook } = useCurrency();
  const [activeTab, setActiveTab] = useState('calculator');
  const [numGPUs, setNumGPUs] = useState(10000);
  const [gpuModel, setGpuModel] = useState('gb200');
  const [coolingType, setCoolingType] = useState('liquid');
  const [region, setRegion] = useState('us-east');

  // Calculations state
  const [calculations, setCalculations] = useState({
    totalCapex: 0,
    annualOpex: 0,
    costPerHour: 0,
    powerRequired: 0,
    breakdown: {
      gpuCost: 0,
      networkCost: 0,
      storageCost: 0,
      datacenterCost: 0,
      coolingCost: 0,
      softwareCost: 0
    }
  });

  const gpuSpecs: Record<string, GPUSpec> = {
    gb200: {
      name: 'GB200 NVL72',
      memory: '192GB HBM3e',
      bandwidth: '16 TB/s',
      tdp: '1,000W',
      unitPrice: 65000,
      rackConfig: '72 GPUs',
      rackPrice: '$3.2M',
      power: 1000
    },
    gb300: {
      name: 'GB300 NVL72',
      memory: '288GB HBM3e',
      bandwidth: '24 TB/s',
      tdp: '1,400W',
      unitPrice: 85000,
      rackConfig: '72 GPUs',
      rackPrice: '$4.5M',
      power: 1400
    },
    h100: {
      name: 'H100 80GB SXM',
      memory: '80GB HBM3',
      bandwidth: '3.35 TB/s',
      tdp: '700W',
      unitPrice: 30000,
      rackConfig: '8 GPUs',
      rackPrice: '$240K',
      power: 700
    }
  };

  const regionRates: Record<string, RegionRate> = {
    'us-east': { name: 'US East Coast', rate: 0.085 },
    'us-west': { name: 'US West Coast', rate: 0.120 },
    'europe': { name: 'Europe', rate: 0.110 },
    'asia': { name: 'Asia Pacific', rate: 0.100 }
  };

  const calculate = () => {
    const gpu = gpuSpecs[gpuModel];
    const electricityRate = regionRates[region].rate;

    // Calculate infrastructure requirements
    const gpuCost = numGPUs * gpu.unitPrice;
    const powerMW = (numGPUs * gpu.power) / 1000000;
    const pue = coolingType === 'liquid' ? 1.1 : 1.5;
    const totalPowerMW = powerMW * pue;

    // Infrastructure scaling
    const leafSwitches = Math.ceil(numGPUs / 128);
    const spineSwitches = Math.ceil(leafSwitches / 8);
    const networkCost = (leafSwitches * 250000) + (spineSwitches * 400000);

    const storagePB = Math.ceil(numGPUs / 500) * 10;
    const storageCost = storagePB * 1000 * 5000;

    const datacenterCost = totalPowerMW * 10000000;
    const coolingCost = powerMW * 1000 * (coolingType === 'liquid' ? 400 : 300);
    const softwareCost = numGPUs * 6500;

    const totalCapex = gpuCost + networkCost + storageCost + datacenterCost + coolingCost + softwareCost;

    // Calculate OPEX
    const annualPowerCost = totalPowerMW * 1000 * 8760 * electricityRate;
    const annualStaffCost = Math.ceil(powerMW / 2) * 166000;
    const annualMaintenance = (gpuCost + networkCost) * 0.03;
    const annualBandwidth = numGPUs * 600;
    const annualLicenses = numGPUs * 500;

    const annualOpex = annualPowerCost + annualStaffCost + annualMaintenance + annualBandwidth + annualLicenses;

    // Calculate cost per GPU-hour (90% utilization, 3-year depreciation)
    const costPerHour = ((totalCapex / 3) + annualOpex) / (numGPUs * 8760 * 0.90);

    setCalculations({
      totalCapex,
      annualOpex,
      costPerHour,
      powerRequired: totalPowerMW,
      breakdown: {
        gpuCost,
        networkCost,
        storageCost,
        datacenterCost,
        coolingCost,
        softwareCost
      }
    });
  };

  useEffect(() => {
    calculate();
  }, [numGPUs, gpuModel, coolingType, region]);

  // Use the currency hook for formatting
  const formatCurrency = formatCurrencyHook;

  const tabs = [
    { id: 'calculator', label: '💰 Cost Calculator' },
    { id: 'hardware', label: '🖥️ Hardware Specs' },
    { id: 'infrastructure', label: '🏗️ Infrastructure' },
    { id: 'opex', label: '📊 OPEX Analysis' },
    { id: 'tco', label: '📈 TCO Comparison' },
    { id: 'formulas', label: '📐 Formulas' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-gpu-purple p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">🚀 GPU Supercluster Cost Calculator</h1>
            <p className="text-xl opacity-90">Comprehensive Financial Model for Large-Scale AI Infrastructure</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-dark-border">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    ${activeTab === tab.id
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'calculator' && (
              <div className="space-y-8">
                {/* Quick Calculator */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Quick Cost Calculator</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of GPUs
                      </label>
                      <input
                        type="number"
                        value={numGPUs}
                        onChange={(e) => setNumGPUs(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-dark-surface dark:text-white"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">10,000 - 100,000 typical</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GPU Model
                      </label>
                      <select
                        value={gpuModel}
                        onChange={(e) => setGpuModel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="gb200">GB200 NVL72</option>
                        <option value="gb300">GB300 NVL72 (2025)</option>
                        <option value="h100">H100 80GB</option>
                      </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cooling Type
                      </label>
                      <select
                        value={coolingType}
                        onChange={(e) => setCoolingType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="liquid">Liquid Cooling</option>
                        <option value="air">Air Cooling</option>
                      </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Region
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-dark-surface dark:text-white"
                      >
                        {Object.entries(regionRates).map(([key, region]) => (
                          <option key={key} value={key}>{region.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white p-6 rounded-xl text-center">
                      <div className="text-sm opacity-90 mb-2">Total CAPEX</div>
                      <div className="text-3xl font-bold">{formatCurrency(calculations.totalCapex)}</div>
                      <div className="text-xs opacity-80">Million USD</div>
                    </div>

                    <div className="bg-gradient-to-br from-gpu-green to-gpu-cyan text-white p-6 rounded-xl text-center">
                      <div className="text-sm opacity-90 mb-2">Annual OPEX</div>
                      <div className="text-3xl font-bold">{formatCurrency(calculations.annualOpex)}</div>
                      <div className="text-xs opacity-80">Million USD/Year</div>
                    </div>

                    <div className="bg-gradient-to-br from-gpu-purple to-gpu-orange text-white p-6 rounded-xl text-center">
                      <div className="text-sm opacity-90 mb-2">$/GPU-Hour</div>
                      <div className="text-3xl font-bold">${calculations.costPerHour.toFixed(2)}</div>
                      <div className="text-xs opacity-80">@ 90% Utilization</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white p-6 rounded-xl text-center">
                      <div className="text-sm opacity-90 mb-2">Power Required</div>
                      <div className="text-3xl font-bold">{calculations.powerRequired.toFixed(1)}</div>
                      <div className="text-xs opacity-80">Megawatts</div>
                    </div>
                  </div>
                </div>

                {/* CAPEX Breakdown */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">CAPEX Breakdown</h2>
                  <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Component
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Unit Cost
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Total Cost
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            % of Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {gpuSpecs[gpuModel].name} GPUs
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                            ${gpuSpecs[gpuModel].unitPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                            {numGPUs.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                            {formatCurrency(calculations.breakdown.gpuCost)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {((calculations.breakdown.gpuCost / calculations.totalCapex) * 100).toFixed(1)}%
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            Networking (800GbE)
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            Various
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            -
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                            {formatCurrency(calculations.breakdown.networkCost)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {((calculations.breakdown.networkCost / calculations.totalCapex) * 100).toFixed(1)}%
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            Storage
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            $5,000/TB
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                            {(calculations.breakdown.storageCost / 5000).toLocaleString()} TB
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                            {formatCurrency(calculations.breakdown.storageCost)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {((calculations.breakdown.storageCost / calculations.totalCapex) * 100).toFixed(1)}%
                          </td>
                        </tr>
                        <tr className="bg-yellow-50 dark:bg-yellow-900/20 font-semibold">
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                            TOTAL CAPEX
                          </td>
                          <td className="px-6 py-4"></td>
                          <td className="px-6 py-4"></td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-mono">
                            {formatCurrency(calculations.totalCapex)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                            100%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hardware' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">GPU Hardware Specifications & Pricing</h2>
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">GPU Model</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Memory</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Bandwidth</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">TDP</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rack Config</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                      {Object.entries(gpuSpecs).map(([key, spec]) => (
                        <tr key={key} className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{spec.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{spec.memory}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{spec.bandwidth}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{spec.tdp}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">${spec.unitPrice.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{spec.rackConfig}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add other tabs content here */}
            {activeTab !== 'calculator' && activeTab !== 'hardware' && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {tabs.find(t => t.id === activeTab)?.label} Content
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This section contains detailed {activeTab} information and calculations.
                </p>
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="bg-gray-50 dark:bg-dark-bg px-8 py-6 border-t border-gray-200 dark:border-dark-border text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Export Options:</p>
            <div className="flex justify-center space-x-4">
              <Button variant="primary" size="sm">📊 Export to CSV</Button>
              <Button variant="outline" size="sm">📋 Copy Formulas</Button>
              <Button variant="outline" size="sm">📄 Generate PDF Report</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
