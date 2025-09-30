import React from 'react';
import { HardDrive, TrendingUp, Database, Activity, DollarSign, Zap } from 'lucide-react';

interface StorageTabEnhancedProps {
  config: any;
  results: any;
}

export const StorageTabEnhanced: React.FC<StorageTabEnhancedProps> = ({ config, results }) => {
  const { totalStorage, storageArchitecture, hotPercent, warmPercent, coldPercent, archivePercent } = config;
  
  // Use results from main calculator if available
  const getStorageData = () => {
    if (results && results.storage) {
      return results.storage;
    }
    // Fallback calculations if no results available
    return {
      total: totalStorage * 1000000, // Convert PB to GB
      hot: totalStorage * (hotPercent / 100) * 1000000,
      warm: totalStorage * (warmPercent / 100) * 1000000,
      cold: totalStorage * (coldPercent / 100) * 1000000,
      archive: totalStorage * (archivePercent / 100) * 1000000,
      breakdown: {
        hot: { capacity: totalStorage * (hotPercent / 100), vendor: 'VAST Data', cost: 0 },
        warm: { capacity: totalStorage * (warmPercent / 100), vendor: 'Pure Storage', cost: 0 },
        cold: { capacity: totalStorage * (coldPercent / 100), vendor: 'Ceph', cost: 0 },
        archive: { capacity: totalStorage * (archivePercent / 100), vendor: 'AWS Glacier', cost: 0 }
      }
    };
  };

  const storageData = getStorageData();

  // Storage vendor specifications
  const storageVendors = {
    'vast': { 
      name: 'VAST Data', 
      performance: '400+ GB/s', 
      latency: '<100μs', 
      efficiency: '10:1 reduction',
      color: 'red'
    },
    'weka': { 
      name: 'WekaFS', 
      performance: '300+ GB/s', 
      latency: '<200μs', 
      efficiency: '8:1 reduction',
      color: 'orange'
    },
    'pure-e': { 
      name: 'Pure FlashBlade//E', 
      performance: '150+ GB/s', 
      latency: '<500μs', 
      efficiency: '5:1 reduction',
      color: 'blue'
    },
    'ceph': { 
      name: 'Ceph HDD', 
      performance: '20+ GB/s', 
      latency: '<5ms', 
      efficiency: '3:1 reduction',
      color: 'gray'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-600" />
          Storage Architecture Analysis
        </h2>
        <p className="text-gray-700 mb-4">
          AI workloads require massive storage capacity with extreme performance. A tiered architecture 
          optimizes cost while meeting diverse performance requirements across training, checkpointing, 
          and inference workloads.
        </p>
        
        {/* Storage Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-blue-600">{totalStorage}</div>
            <div className="text-sm text-gray-600">Total Capacity (PB)</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-green-600">{storageArchitecture}</div>
            <div className="text-sm text-gray-600">Architecture</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-purple-600">4</div>
            <div className="text-sm text-gray-600">Storage Tiers</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-orange-600">400+</div>
            <div className="text-sm text-gray-600">GB/s Peak</div>
          </div>
        </div>
      </div>

      {/* Storage Tiers Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Tiered Storage Distribution
        </h3>
        <div className="space-y-4">
          {/* Hot Tier */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                🔥 Hot Tier (NVMe)
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{hotPercent}%</span>
              </h4>
              <p className="text-sm text-gray-600">Active training data, checkpoints, model weights</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>• {storageVendors['vast'].performance}</span>
                <span>• {storageVendors['vast'].latency}</span>
                <span>• {storageVendors['vast'].efficiency}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{storageData.breakdown.hot.capacity.toFixed(1)} PB</p>
              <p className="text-sm text-gray-600">{storageData.breakdown.hot.vendor}</p>
              {results && (
                <p className="text-xs text-gray-500 mt-1">
                  ${(storageData.breakdown.hot.cost / 1000000).toFixed(1)}M CAPEX
                </p>
              )}
            </div>
          </div>
          
          {/* Warm Tier */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                🌡 Warm Tier (SSD)
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{warmPercent}%</span>
              </h4>
              <p className="text-sm text-gray-600">Recent datasets, model versions, intermediate results</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>• {storageVendors['pure-e'].performance}</span>
                <span>• {storageVendors['pure-e'].latency}</span>
                <span>• {storageVendors['pure-e'].efficiency}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{storageData.breakdown.warm.capacity.toFixed(1)} PB</p>
              <p className="text-sm text-gray-600">{storageData.breakdown.warm.vendor}</p>
              {results && (
                <p className="text-xs text-gray-500 mt-1">
                  ${(storageData.breakdown.warm.cost / 1000000).toFixed(1)}M CAPEX
                </p>
              )}
            </div>
          </div>
          
          {/* Cold Tier */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                ❄️ Cold Tier (HDD)
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{coldPercent}%</span>
              </h4>
              <p className="text-sm text-gray-600">Historical data, backups, older model versions</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>• {storageVendors['ceph'].performance}</span>
                <span>• {storageVendors['ceph'].latency}</span>
                <span>• {storageVendors['ceph'].efficiency}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{storageData.breakdown.cold.capacity.toFixed(1)} PB</p>
              <p className="text-sm text-gray-600">{storageData.breakdown.cold.vendor}</p>
              {results && (
                <p className="text-xs text-gray-500 mt-1">
                  ${(storageData.breakdown.cold.cost / 1000000).toFixed(1)}M CAPEX
                </p>
              )}
            </div>
          </div>
          
          {/* Archive Tier */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                🗄 Archive Tier (Object)
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{archivePercent}%</span>
              </h4>
              <p className="text-sm text-gray-600">Compliance, long-term retention, disaster recovery</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>• Object store</span>
                <span>• Minutes retrieval</span>
                <span>• 99.999999999% durability</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-600">{storageData.breakdown.archive.capacity.toFixed(1)} PB</p>
              <p className="text-sm text-gray-600">{storageData.breakdown.archive.vendor}</p>
              {results && (
                <p className="text-xs text-gray-500 mt-1">
                  ${(storageData.breakdown.archive.cost / 1000000).toFixed(1)}M CAPEX
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Requirements */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Performance Requirements & Specifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              Training Workloads
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Sequential read: 400+ GB/s sustained (hot tier)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Checkpoint write: 100+ GB/s burst capability
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Latency: {'<100μs for hot data access'}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                IOPS: 10M+ for metadata operations
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Parallel access: 1000+ concurrent streams
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Capacity Planning
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                5-10 TB per GPU recommended baseline
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                3x replication for hot tier availability
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                60-day retention for warm tier data
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                7-year archive compliance retention
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                20% growth buffer for expansion
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Storage Infrastructure Costs */}
      {results && results.storage && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Storage Infrastructure Costs
          </h3>
          
          {/* Cost Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Storage CAPEX</p>
              <p className="text-2xl font-bold text-green-600">
                ${((results.storage.hot + results.storage.warm + results.storage.cold + results.storage.archive) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Blended $/GB/Month</p>
              <p className="text-2xl font-bold text-blue-600">
                ${results.storageGbMonth?.toFixed(4) || '0.0000'}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Annual Storage OPEX</p>
              <p className="text-2xl font-bold text-purple-600">
                ${((results.breakdown?.opex?.storage || 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg text-center border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Cost per TB</p>
              <p className="text-2xl font-bold text-orange-600">
                ${((results.storage.hot + results.storage.warm + results.storage.cold + results.storage.archive) / (totalStorage * 1000)).toFixed(0)}
              </p>
            </div>
          </div>

          {/* Detailed Cost Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-semibold">Storage Tier</th>
                  <th className="text-right p-3 font-semibold">Capacity</th>
                  <th className="text-right p-3 font-semibold">Vendor</th>
                  <th className="text-right p-3 font-semibold">CAPEX</th>
                  <th className="text-right p-3 font-semibold">$/GB/Month</th>
                  <th className="text-right p-3 font-semibold">Performance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-red-600">🔥 Hot Tier</td>
                  <td className="p-3 text-right">{storageData.breakdown.hot.capacity.toFixed(1)} PB</td>
                  <td className="p-3 text-right">{storageData.breakdown.hot.vendor}</td>
                  <td className="p-3 text-right font-medium">${(storageData.breakdown.hot.cost / 1000000).toFixed(1)}M</td>
                  <td className="p-3 text-right">$0.0200</td>
                  <td className="p-3 text-right">400+ GB/s</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-orange-600">🌡 Warm Tier</td>
                  <td className="p-3 text-right">{storageData.breakdown.warm.capacity.toFixed(1)} PB</td>
                  <td className="p-3 text-right">{storageData.breakdown.warm.vendor}</td>
                  <td className="p-3 text-right font-medium">${(storageData.breakdown.warm.cost / 1000000).toFixed(1)}M</td>
                  <td className="p-3 text-right">$0.0120</td>
                  <td className="p-3 text-right">150+ GB/s</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-blue-600">❄️ Cold Tier</td>
                  <td className="p-3 text-right">{storageData.breakdown.cold.capacity.toFixed(1)} PB</td>
                  <td className="p-3 text-right">{storageData.breakdown.cold.vendor}</td>
                  <td className="p-3 text-right font-medium">${(storageData.breakdown.cold.cost / 1000000).toFixed(1)}M</td>
                  <td className="p-3 text-right">$0.0060</td>
                  <td className="p-3 text-right">20+ GB/s</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-600">🗄 Archive</td>
                  <td className="p-3 text-right">{storageData.breakdown.archive.capacity.toFixed(1)} PB</td>
                  <td className="p-3 text-right">{storageData.breakdown.archive.vendor}</td>
                  <td className="p-3 text-right font-medium">${(storageData.breakdown.archive.cost / 1000000).toFixed(1)}M</td>
                  <td className="p-3 text-right">$0.0025</td>
                  <td className="p-3 text-right">Object Store</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Storage Architecture Diagram */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Storage Architecture Overview
        </h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-red-100 p-4 rounded-lg border-2 border-red-300">
              <div className="text-2xl mb-2">🔥</div>
              <div className="font-semibold text-red-700">Hot Tier</div>
              <div className="text-xs text-red-600 mt-1">NVMe All-Flash</div>
              <div className="text-xs text-red-600">{'<100μs latency'}</div>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-300">
              <div className="text-2xl mb-2">🌡</div>
              <div className="font-semibold text-orange-700">Warm Tier</div>
              <div className="text-xs text-orange-600 mt-1">SSD Flash</div>
              <div className="text-xs text-orange-600">{'<500μs latency'}</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
              <div className="text-2xl mb-2">❄️</div>
              <div className="font-semibold text-blue-700">Cold Tier</div>
              <div className="text-xs text-blue-600 mt-1">HDD Storage</div>
              <div className="text-xs text-blue-600">{'<5ms latency'}</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
              <div className="text-2xl mb-2">🗄</div>
              <div className="font-semibold text-gray-700">Archive</div>
              <div className="text-xs text-gray-600 mt-1">Object Store</div>
              <div className="text-xs text-gray-600">Minutes retrieval</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Data automatically tiered based on access patterns and age</p>
            <p className="text-xs mt-1">Hot → Warm (30 days) → Cold (90 days) → Archive (365 days)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
