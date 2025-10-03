import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Info } from 'lucide-react';
import { 
  ServiceTierConfig, 
  DEFAULT_SERVICE_TIERS, 
  validateServiceTiers,
  calculateStorageRequirements,
  calculateInfrastructureRequirements
} from '../../utils/workloadPerformanceCalculations';

interface ServiceTierConfigurationProps {
  totalGPUs: number;
  onServiceTiersChange: (tiers: ServiceTierConfig[]) => void;
  onStorageRequirementsChange: (requirements: any) => void;
  onInfrastructureRequirementsChange: (requirements: any) => void;
}

export const ServiceTierConfiguration: React.FC<ServiceTierConfigurationProps> = ({
  totalGPUs,
  onServiceTiersChange,
  onStorageRequirementsChange,
  onInfrastructureRequirementsChange
}) => {
  const [serviceTiers, setServiceTiers] = useState<ServiceTierConfig[]>(DEFAULT_SERVICE_TIERS);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [touchedTiers, setTouchedTiers] = useState<string[]>([]);

  // Recalculate requirements whenever service tiers change
  useEffect(() => {
    const storageReqs = calculateStorageRequirements(serviceTiers, totalGPUs);
    const infraReqs = calculateInfrastructureRequirements(storageReqs, totalGPUs);
    const validationWarnings = validateServiceTiers(serviceTiers);

    setWarnings(validationWarnings);
    onServiceTiersChange(serviceTiers);
    onStorageRequirementsChange(storageReqs);
    onInfrastructureRequirementsChange(infraReqs);
  }, [serviceTiers, totalGPUs, onServiceTiersChange, onStorageRequirementsChange, onInfrastructureRequirementsChange]);

  const handleClusterPercentChange = (tierId: string, value: number) => {
    if (!touchedTiers.includes(tierId)) {
      setTouchedTiers(prev => [...prev, tierId]);
    }

    const newTiers = [...serviceTiers];
    const tierIndex = newTiers.findIndex(t => t.id === tierId);
    if (tierIndex === -1) return;

    const oldValue = newTiers[tierIndex].clusterPercent;
    const diff = value - oldValue;
    
    // Update the changed tier
    newTiers[tierIndex].clusterPercent = Math.max(0, Math.min(100, value));
    
    // Adjust other tiers proportionally
    const otherTiers = newTiers.filter((_, i) => i !== tierIndex);
    const untouchedTiers = otherTiers.filter(t => !touchedTiers.includes(t.id));
    const adjustableTiers = untouchedTiers.length > 0 ? untouchedTiers : otherTiers;

    if (adjustableTiers.length > 0 && Math.abs(diff) > 0.1) {
      const totalAdjustable = adjustableTiers.reduce((sum, t) => sum + t.clusterPercent, 0);
      
      if (totalAdjustable > 0) {
        adjustableTiers.forEach(tier => {
          const proportion = tier.clusterPercent / totalAdjustable;
          const adjustment = diff * proportion;
          tier.clusterPercent = Math.max(0, Math.min(100, tier.clusterPercent - adjustment));
        });
      }
    }

    // Ensure total sums to 100%
    const total = newTiers.reduce((sum, t) => sum + t.clusterPercent, 0);
    if (Math.abs(total - 100) > 0.1) {
      const adjustment = (100 - total) / newTiers.length;
      newTiers.forEach(tier => {
        tier.clusterPercent = Math.max(0, Math.min(100, tier.clusterPercent + adjustment));
      });
    }

    setServiceTiers(newTiers);
  };

  const handleWorkloadSplitChange = (tierId: string, trainingPercent: number) => {
    const newTiers = serviceTiers.map(tier => 
      tier.id === tierId 
        ? { 
            ...tier, 
            trainingPercent: Math.max(0, Math.min(100, trainingPercent)),
            inferencePercent: 100 - Math.max(0, Math.min(100, trainingPercent))
          }
        : tier
    );
    setServiceTiers(newTiers);
  };

  const resetToDefaults = () => {
    setServiceTiers(DEFAULT_SERVICE_TIERS);
    setTouchedTiers([]);
  };

  const totalClusterPercent = serviceTiers.reduce((sum, tier) => sum + tier.clusterPercent, 0);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-3 h-3 text-gray-500" />
          Service Tier Configuration
        </h3>
        <button
          onClick={resetToDefaults}
          className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
        >
          Reset to Defaults
        </button>
      </div>

      <p className="text-xs text-gray-600 mb-4">
        Define your customer service mix. Each tier's workload split determines storage performance requirements.
      </p>

      {/* Service Tiers */}
      <div className="space-y-4">
        {serviceTiers.map((tier, index) => (
          <div key={tier.id} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{tier.name}</h4>
                <p className="text-xs text-gray-600">{tier.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Typical customers:</span> {tier.typicalCustomers}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {tier.clusterPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">of cluster</div>
              </div>
            </div>

            {/* Cluster Allocation Slider */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Cluster Allocation (% of {totalGPUs.toLocaleString()} GPUs)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={tier.clusterPercent}
                  onChange={(e) => handleClusterPercentChange(tier.id, parseInt(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(tier.clusterPercent)}
                  onChange={(e) => handleClusterPercentChange(tier.id, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-sm font-semibold text-gray-600">%</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((tier.clusterPercent / 100) * totalGPUs).toLocaleString()} GPUs allocated
              </div>
            </div>

            {/* Workload Split */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Training Workloads
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={tier.trainingPercent}
                    onChange={(e) => handleWorkloadSplitChange(tier.id, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-12 text-sm font-medium text-gray-900">
                    {tier.trainingPercent}%
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  High bandwidth, checkpoint writes
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Inference Workloads
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded h-2 relative">
                    <div 
                      className="bg-gray-400 h-2 rounded"
                      style={{ width: `${tier.inferencePercent}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm font-medium text-gray-900">
                    {tier.inferencePercent}%
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  High IOPS, model serving
                </div>
              </div>
            </div>

            {/* SLA Requirement */}
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <span className="font-medium">SLA:</span> {tier.slaRequirement}
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">Total Cluster Allocation</span>
          <span className={`text-lg font-bold ${Math.abs(totalClusterPercent - 100) < 0.1 ? 'text-gray-900' : 'text-red-600'}`}>
            {totalClusterPercent.toFixed(1)}%
          </span>
        </div>
        {Math.abs(totalClusterPercent - 100) > 0.1 && (
          <div className="text-xs text-red-600 mt-1">
            Must equal 100% (adjust sliders above)
          </div>
        )}
      </div>

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Configuration Warnings</h4>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-xs text-yellow-700">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">How this works:</p>
            <p>
              Your service tier mix automatically calculates storage performance requirements. 
              Training-heavy tiers need high-bandwidth storage, while inference-heavy tiers need high-IOPS storage. 
              The system will recommend optimal storage architectures based on these requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
