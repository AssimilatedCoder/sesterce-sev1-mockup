import React from 'react';
import { HardDrive, Zap, Database, TrendingUp, Info, CheckCircle } from 'lucide-react';
import { 
  StorageRequirements, 
  getRecommendedStorageArchitecture 
} from '../../utils/workloadPerformanceCalculations';

interface CalculatedStorageArchitectureProps {
  storageRequirements: StorageRequirements;
  totalGPUs: number;
  formatCurrency: (amount: number) => string;
}

export const CalculatedStorageArchitecture: React.FC<CalculatedStorageArchitectureProps> = ({
  storageRequirements,
  totalGPUs,
  formatCurrency
}) => {
  const recommendedArchitecture = getRecommendedStorageArchitecture(storageRequirements);
  const totalCapacityPB = storageRequirements.totalCapacity / 1000;
  const rawCapacityPB = totalCapacityPB * storageRequirements.rawStorageMultiplier;

  // Storage tier cost estimates (simplified)
  const tierCosts = {
    'VAST Universal': 1300000,      // €1.3M per PB
    'Pure FlashBlade': 1400000,     // €1.4M per PB
    'Ceph All-NVMe': 700000,       // €700K per PB
    'Ceph HDD Cache': 200000       // €200K per PB
  };

  const totalStorageCost = recommendedArchitecture.reduce((sum, arch) => 
    sum + (arch.capacityPB * (tierCosts[arch.tier as keyof typeof tierCosts] || 0)), 0
  );

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <HardDrive className="w-3 h-3 text-gray-500" />
        Calculated Storage Architecture
      </h3>

      <p className="text-xs text-gray-600 mb-4">
        Storage tiers automatically calculated based on your service tier workload requirements.
      </p>

      {/* Storage Requirements Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Total Capacity</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{totalCapacityPB.toFixed(1)} PB</div>
          <div className="text-xs text-gray-500">Usable storage</div>
        </div>

        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Bandwidth</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{storageRequirements.totalBandwidth.toFixed(0)} GB/s</div>
          <div className="text-xs text-gray-500">Aggregate throughput</div>
        </div>

        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">IOPS</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{(storageRequirements.totalIOPS / 1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-500">Total IOPS needed</div>
        </div>

        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Raw Storage</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{rawCapacityPB.toFixed(1)} PB</div>
          <div className="text-xs text-gray-500">{storageRequirements.rawStorageMultiplier.toFixed(2)}x multiplier</div>
        </div>
      </div>

      {/* Recommended Storage Tiers */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-800">Recommended Storage Tiers</h4>
        
        {recommendedArchitecture.length === 0 ? (
          <div className="bg-white p-4 rounded border border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Configure service tiers above to see storage recommendations
            </p>
          </div>
        ) : (
          recommendedArchitecture.map((arch, index) => {
            const tierCost = arch.capacityPB * (tierCosts[arch.tier as keyof typeof tierCosts] || 0);
            const costPercentage = totalStorageCost > 0 ? (tierCost / totalStorageCost) * 100 : 0;

            return (
              <div key={index} className="bg-white p-4 rounded border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{arch.tier}</h5>
                    <p className="text-xs text-gray-600">{arch.rationale}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {arch.capacityPB.toFixed(1)} PB
                    </div>
                    <div className="text-xs text-gray-500">
                      {((arch.capacityPB / totalCapacityPB) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>

                {/* Performance Characteristics */}
                <div className="grid grid-cols-3 gap-4 mt-3 p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-xs text-gray-600">Latency</div>
                    <div className="text-sm font-medium text-gray-900">
                      {arch.tier.includes('VAST') ? '<100μs' :
                       arch.tier.includes('Pure') ? '<1ms' :
                       arch.tier.includes('Ceph All-NVMe') ? '<5ms' : '<20ms'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">5-Year TCO</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(tierCost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">% of Storage Cost</div>
                    <div className="text-sm font-medium text-gray-900">
                      {costPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Total Storage Cost */}
      {totalStorageCost > 0 && (
        <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">Total Storage 5-Year TCO</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalStorageCost)}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {formatCurrency(totalStorageCost / totalGPUs)} per GPU • {formatCurrency(totalStorageCost / (totalCapacityPB || 1))} per usable PB
          </div>
        </div>
      )}

      {/* Raw Storage Impact */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Raw Storage Impact:</p>
            <p>
              Due to replication and erasure coding, you need {rawCapacityPB.toFixed(1)} PB of raw storage 
              to provide {totalCapacityPB.toFixed(1)} PB usable capacity 
              ({((storageRequirements.rawStorageMultiplier - 1) * 100).toFixed(1)}% overhead).
            </p>
          </div>
        </div>
      </div>

      {/* Optimization Tips */}
      {storageRequirements.performanceTierDistribution.extreme > 50 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-700">
              <p className="font-medium mb-1">Optimization Opportunity:</p>
              <p>
                {storageRequirements.performanceTierDistribution.extreme.toFixed(1)}% of your workload requires extreme performance storage. 
                Consider if some training workloads could use high-performance tiers instead to reduce costs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
