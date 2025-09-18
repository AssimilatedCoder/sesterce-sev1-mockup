import React, { useState } from 'react';
import { 
  Zap, HardDrive, Network, Settings, 
  Calculator, Cpu, Thermometer, Building2, 
  FileText, BookOpen, AlertTriangle
} from 'lucide-react';
import { createHash } from 'crypto';

// API configuration
const API_URL = process.env.REACT_APP_CALCULATOR_API_URL || 'http://localhost:7778';
const API_SECRET = process.env.REACT_APP_CALCULATOR_API_SECRET || 'change-this-secret-key';

interface CalculationResults {
  totalCapex: number;
  annualOpex: number;
  costPerHour: number;
  totalPowerMW: number;
  pueValue: number;
  storageGbMonth: number;
  networkBandwidth: number;
  tco10year: number;
  breakdown?: {
    capex: Record<string, number>;
    opex: Record<string, number>;
  };
}

export const GPUSuperclusterCalculatorSecure: React.FC = () => {
  // State for inputs (no business logic exposed)
  const [gpuModel, setGpuModel] = useState('gb200');
  const [numGPUs, setNumGPUs] = useState(10000);
  const [coolingType, setCoolingType] = useState('liquid');
  const [region, setRegion] = useState('us-east');
  const [utilization, setUtilization] = useState(90);
  const [depreciation, setDepreciation] = useState(4);
  const [storageCapacity, setStorageCapacity] = useState(50);
  const [storageVendor, setStorageVendor] = useState('vast');
  const [fabricType, setFabricType] = useState('infiniband');
  const [oversubscription, setOversubscription] = useState('1:1');
  const [pueOverride, setPueOverride] = useState('auto');
  const [gpuPriceOverride, setGpuPriceOverride] = useState('auto');
  const [maintenancePercent, setMaintenancePercent] = useState(3);
  const [staffMultiplier, setStaffMultiplier] = useState(1);
  
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate API signature
  const generateSignature = (params: Record<string, any>) => {
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map(k => params[k]).join('');
    // In production, use Web Crypto API instead
    return createHash('sha256').update(paramString + API_SECRET).digest('hex');
  };

  const calculateSecure = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        gpuModel,
        numGPUs,
        coolingType,
        region,
        utilization,
        depreciation,
        storageCapacity,
        storageVendor,
        fabricType,
        oversubscription,
        pueOverride,
        gpuPriceOverride,
        maintenancePercent,
        staffMultiplier,
        timestamp: Date.now()
      };
      
      // Add signature
      const signature = generateSignature(params);
      
      const response = await fetch(`${API_URL}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...params, signature })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        throw new Error(data.error || 'Calculation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // The rest of the component is purely UI - no calculations exposed
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-[1900px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-md">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GPU SuperCluster Cost Calculator
          </h1>
          <p className="text-base text-gray-600 mb-3">Complete Infrastructure & TCO Analysis Platform</p>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block bg-green-500 text-white px-4 py-1.5 rounded-full font-medium text-xs">
              v4.0 - Secure Edition
            </span>
            <span className="inline-block bg-gray-800 text-white px-4 py-1.5 rounded-full font-medium text-xs">
              API Protected
            </span>
          </div>
        </div>

        {/* Main Content - Same UI as before but no calculation logic */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* GPU Configuration */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              GPU Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">GPU Model</label>
                <select 
                  value={gpuModel} 
                  onChange={(e) => setGpuModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="gb200">GB200 NVL72</option>
                  <option value="gb300">GB300 NVL72</option>
                  <option value="h100-sxm">H100 SXM5</option>
                  <option value="h100-pcie">H100 PCIe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Number of GPUs</label>
                <input 
                  type="number" 
                  value={numGPUs}
                  onChange={(e) => setNumGPUs(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  min="1000"
                  max="200000"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Region</label>
                <select 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="us-east">US East</option>
                  <option value="us-west">US West</option>
                  <option value="eu-west">Europe West</option>
                  <option value="apac">Asia Pacific</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateSecure}
            disabled={loading}
            className={`w-full md:w-auto mx-auto block px-8 py-2.5 rounded-md text-sm font-semibold shadow-sm transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-md'
            }`}
          >
            {loading ? 'Calculating...' : 'Calculate Complete Analysis'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-xs text-gray-500 mb-1">Total CAPEX</div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(results.totalCapex)}</div>
                  <div className="text-xs text-gray-500">USD</div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-xs text-gray-500 mb-1">Annual OPEX</div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(results.annualOpex)}</div>
                  <div className="text-xs text-gray-500">USD/Year</div>
                </div>

                <div className="bg-green-500 text-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs mb-1">$/GPU-Hour</div>
                  <div className="text-2xl font-bold">${results.costPerHour.toFixed(2)}</div>
                  <div className="text-xs opacity-90">At Selected Utilization</div>
                </div>

                <div className="bg-green-500 text-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs mb-1">10-Year TCO</div>
                  <div className="text-2xl font-bold">{formatNumber(results.tco10year)}</div>
                  <div className="text-xs opacity-90">Total Cost</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
