import React from 'react';
import { HardDrive, Database, TrendingUp } from 'lucide-react';

interface StorageTabProps {
  config: any;
  results: any;
}

export const StorageTab: React.FC<StorageTabProps> = ({ config, results }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-600" />
          Storage Architecture Analysis
        </h2>
        <p className="text-gray-700">
          AI workloads require massive storage capacity with extreme performance. A tiered architecture 
          optimizes cost while meeting diverse performance requirements across training, checkpointing, 
          and inference workloads.
        </p>
      </div>

      {/* Storage Tiers */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Tiered Storage Distribution</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-800">🔥 Hot Tier (NVMe)</h4>
              <p className="text-sm text-gray-600">Active training data, checkpoints</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{(config.totalStorage * 0.2).toFixed(1)} PB</p>
              <p className="text-sm text-gray-600">20% • 400+ GB/s</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-800">🌡 Warm Tier (SSD)</h4>
              <p className="text-sm text-gray-600">Recent datasets, model versions</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{(config.totalStorage * 0.35).toFixed(1)} PB</p>
              <p className="text-sm text-gray-600">35% • 100+ GB/s</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-800">❄️ Cold Tier (HDD)</h4>
              <p className="text-sm text-gray-600">Historical data, backups</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{(config.totalStorage * 0.35).toFixed(1)} PB</p>
              <p className="text-sm text-gray-600">35% • 20+ GB/s</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-800">🗄 Archive Tier</h4>
              <p className="text-sm text-gray-600">Compliance, long-term retention</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-600">{(config.totalStorage * 0.1).toFixed(1)} PB</p>
              <p className="text-sm text-gray-600">10% • Object store</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Requirements */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Performance Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Training Workloads</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Sequential read: 400+ GB/s sustained
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Checkpoint write: 100+ GB/s burst
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Latency: {'<1ms for hot data'}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                IOPS: 10M+ for metadata
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Capacity Planning</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                5-10 TB per GPU recommended
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                3x replication for hot tier
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                60-day retention for warm
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                7-year archive compliance
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      {results && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Storage Cost Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Blended $/GB/Month</p>
              <p className="text-2xl font-bold text-green-600">
                ${results.storageGbMonth?.toFixed(4) || '0.0000'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Annual Storage OPEX</p>
              <p className="text-2xl font-bold text-green-600">
                ${((results.breakdown?.opex.storage || 0) / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Storage CAPEX</p>
              <p className="text-2xl font-bold text-green-600">
                ${((results.breakdown?.capex.storage || 0) / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
