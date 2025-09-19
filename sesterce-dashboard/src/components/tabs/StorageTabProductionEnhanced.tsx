import React from 'react';
import { 
  HardDrive, TrendingUp, Database, DollarSign, Zap, 
  AlertTriangle, CheckCircle2, Info, BarChart3 
} from 'lucide-react';
import { calculateEnhancedStorage } from '../../utils/storageCalculationsEnhanced';
import { productionVendors, enterpriseVendors, productionDeployments } from '../../data/storageVendorsEnhanced';

interface StorageTabProductionEnhancedProps {
  config: any;
  results: any;
}

export const StorageTabProductionEnhanced: React.FC<StorageTabProductionEnhancedProps> = ({ config, results }) => {
  // Enhanced storage configuration
  const storageConfig = {
    gpuCount: config.numGPUs,
    gpuModel: config.gpuModel,
    workloadMix: {
      training: 70, // Default assumptions - could be made configurable
      inference: 20,
      finetuning: 10
    },
    tenantMix: {
      whale: 60,
      medium: 30,
      small: 10
    },
    budget: 'optimized' as const,
    storageVendor: 'auto' as const,
    tierDistribution: 'balanced' as const
  };

  // Calculate enhanced storage requirements
  const storageResults = calculateEnhancedStorage(storageConfig);
  
  return (
    <div className="space-y-6">
      {/* Software Licensing Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">Important Notice</h4>
            <p className="text-sm text-yellow-700">
              This TCO calculator does not yet include accurate, customer specific, Software Support and/or Licensing costs. 
              Assumptions used are based on Nvidia references per GPU and can be optimized using alternative SW stacks - e.g. OMNIA, Palette, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Header with Production Validation */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-600" />
          Production-Grade Storage Architecture Analysis
        </h2>
        <p className="text-gray-700 mb-4">
          Storage architecture based on real-world mega-scale deployments (xAI Colossus 100k GPUs, Meta RSC, NVIDIA SuperPOD). 
          Calculations include production-proven vendor data, failure-driven checkpoint requirements, and multi-tenant QoS modeling.
        </p>
        
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-blue-600">{storageResults.totalCapacity.totalPB.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Total Capacity (PB)</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-green-600">{storageResults.bandwidth.sustainedTBps.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Sustained TB/s</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-purple-600">{storageResults.vendors.primary.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Primary Vendor</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-orange-600">{storageResults.checkpoints.frequency.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Checkpoint (min)</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-red-600">{storageResults.powerConsumption.totalKW.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Power (kW)</div>
          </div>
        </div>
      </div>

      {/* Vendor Selection & Rationale */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Automated Vendor Selection
        </h3>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-800">Recommendation: {productionVendors[storageResults.vendors.primary]?.name || enterpriseVendors[storageResults.vendors.primary]?.name}</h4>
              <p className="text-sm text-green-700 mt-1">{storageResults.vendors.rationale}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Primary Storage Vendor</h4>
            {(() => {
              const vendor = productionVendors[storageResults.vendors.primary] || enterpriseVendors[storageResults.vendors.primary];
              if (!vendor) return <p>Vendor not found</p>;
              
              return (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Performance:</span>
                    <span className="font-medium">{vendor.performance.throughput}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Latency:</span>
                    <span className="font-medium">{vendor.performance.latency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Scale:</span>
                    <span className="font-medium">{vendor.scalability.maxGPUs.toLocaleString()} GPUs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost per PB:</span>
                    <span className="font-medium">${(vendor.costPerPB.total / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Deployments:</strong> {vendor.deployments.join(', ')}
                  </div>
                </div>
              );
            })()}
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Architecture Specifications</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tier 0 (Local NVMe):</span>
                <span className="font-medium">{storageResults.totalCapacity.tierBreakdown.tier0?.toFixed(1) || '0'} PB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hot Tier (All-Flash):</span>
                <span className="font-medium">{storageResults.totalCapacity.tierBreakdown.hotTier?.toFixed(1) || '0'} PB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warm Tier (Hybrid):</span>
                <span className="font-medium">{storageResults.totalCapacity.tierBreakdown.warmTier?.toFixed(1) || '0'} PB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cold Tier (HDD):</span>
                <span className="font-medium">{storageResults.totalCapacity.tierBreakdown.coldTier?.toFixed(1) || '0'} PB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Archive Tier:</span>
                <span className="font-medium">{storageResults.totalCapacity.tierBreakdown.archiveTier?.toFixed(1) || '0'} PB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Requirements & Bandwidth Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Performance Requirements & Bandwidth Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Sustained Bandwidth</h4>
            <div className="text-2xl font-bold text-blue-600">{storageResults.bandwidth.sustainedTBps.toFixed(1)} TB/s</div>
            <div className="text-sm text-blue-700">2.7 GiB/s per GPU minimum</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Burst Bandwidth</h4>
            <div className="text-2xl font-bold text-orange-600">{storageResults.bandwidth.burstTBps.toFixed(1)} TB/s</div>
            <div className="text-sm text-orange-700">For checkpoint storms</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Network Overhead</h4>
            <div className="text-2xl font-bold text-purple-600">{storageResults.bandwidth.networkOverhead.toFixed(1)} TB/s</div>
            <div className="text-sm text-purple-700">30% protocol overhead</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Latency Requirements by Tier</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(storageResults.performance.latency).map(([tier, latency]) => (
                <div key={tier} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{tier.replace('Tier', ' Tier')}:</span>
                  <span className="font-medium">{latency}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">IOPS Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total IOPS:</span>
                <span className="font-medium">{(storageResults.performance.iops.total / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Read IOPS:</span>
                <span className="font-medium">{(storageResults.performance.iops.read / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Write IOPS:</span>
                <span className="font-medium">{(storageResults.performance.iops.write / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkpoint Management */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Failure-Driven Checkpoint Management
        </h3>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">Critical: Checkpoint Frequency</h4>
              <p className="text-sm text-red-700">
                At {config.numGPUs.toLocaleString()} GPUs, checkpoints required every {storageResults.checkpoints.frequency.toFixed(1)} minutes
                {storageResults.checkpoints.frequency < 2 && " - This requires burst bandwidth capability!"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-gray-800">{storageResults.checkpoints.modelSize.toFixed(1)} TB</div>
            <div className="text-sm text-gray-600">Model Size</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-gray-800">{storageResults.checkpoints.frequency.toFixed(1)} min</div>
            <div className="text-sm text-gray-600">Checkpoint Frequency</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-gray-800">{storageResults.checkpoints.retention}</div>
            <div className="text-sm text-gray-600">Retention Count</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-gray-800">{(storageResults.checkpoints.storageRequired / 1000).toFixed(1)} PB</div>
            <div className="text-sm text-gray-600">Storage Required</div>
          </div>
        </div>
      </div>

      {/* TCO Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Total Cost of Ownership Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
            <div className="text-2xl font-bold text-green-600">${(storageResults.costs.capex.total / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600">Total CAPEX</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">${(storageResults.costs.opex.annual / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600">Annual OPEX</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">${(storageResults.costs.tco5Year / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600">5-Year TCO</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg text-center border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">${storageResults.costs.costPerGPU.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Cost per GPU</div>
          </div>
        </div>

        {/* Detailed Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">CAPEX by Storage Tier</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(storageResults.costs.capex.byTier).map(([tier, cost]) => (
                <div key={tier} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{tier.replace('Tier', ' Tier')}:</span>
                  <span className="font-medium">${(cost / 1000000).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Annual OPEX Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Power & Cooling:</span>
                <span className="font-medium">${(storageResults.costs.opex.power / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Support & Maintenance:</span>
                <span className="font-medium">${(storageResults.costs.opex.support / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Administration:</span>
                <span className="font-medium">${(storageResults.costs.opex.admin / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Power Consumption Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Power Consumption & Efficiency
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">{storageResults.powerConsumption.totalKW.toFixed(0)} kW</div>
            <div className="text-sm text-gray-600">Total Storage Power</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{((storageResults.powerConsumption.byTier.tier0 || 0) / storageResults.powerConsumption.totalKW * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Tier 0 Power Savings</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">${(storageResults.costs.opex.power / 1000).toFixed(0)}K</div>
            <div className="text-sm text-gray-600">Annual Power Cost</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-800">Power Efficiency Optimization</h4>
              <p className="text-sm text-green-700">
                Tier 0 local NVMe provides 95% power savings compared to external storage while maintaining sub-millisecond latency.
                Total storage power consumption: {storageResults.powerConsumption.totalKW.toFixed(0)} kW
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Deployment References */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Production Deployment References
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">xAI Colossus</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Scale:</strong> {productionDeployments.xaiColossus.gpus.toLocaleString()} H100 GPUs</div>
              <div><strong>Storage:</strong> {productionDeployments.xaiColossus.storage}</div>
              <div><strong>Network:</strong> {productionDeployments.xaiColossus.network}</div>
              <div><strong>Deployment:</strong> {productionDeployments.xaiColossus.deploymentTime}</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Meta RSC</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Scale:</strong> {productionDeployments.metaRSC.gpus.toLocaleString()} GPUs</div>
              <div><strong>Primary:</strong> {productionDeployments.metaRSC.storage.primary}</div>
              <div><strong>Cache:</strong> {productionDeployments.metaRSC.storage.cache}</div>
              <div><strong>Target BW:</strong> {productionDeployments.metaRSC.targetBandwidth}</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Microsoft OpenAI</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Storage:</strong> {productionDeployments.microsoftOpenAI.storage}</div>
              <div><strong>Performance:</strong> {productionDeployments.microsoftOpenAI.performance}</div>
              <div><strong>Scale:</strong> {productionDeployments.microsoftOpenAI.improvements}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings & Scale Thresholds */}
      {storageResults.warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Scale Thresholds & Critical Warnings
          </h3>
          <div className="space-y-2">
            {storageResults.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
