import React from 'react';
import { Network, Zap, Server, Package, AlertTriangle } from 'lucide-react';
import { InfrastructureRequirements as InfraReqs } from '../../utils/workloadPerformanceCalculations';

interface InfrastructureRequirementsProps {
  infrastructureRequirements: InfraReqs;
  totalGPUs: number;
  formatCurrency: (amount: number) => string;
}

export const InfrastructureRequirements: React.FC<InfrastructureRequirementsProps> = ({
  infrastructureRequirements,
  totalGPUs,
  formatCurrency
}) => {
  const { network, power, software } = infrastructureRequirements;
  
  // Calculate total additional costs
  const totalSoftwareCost = software.vastLicense + software.kubernetesLicense + software.monitoringStack;
  const powerDensityPerRack = power.storagePowerKW / (power.additionalRacks || 1);
  const isHighPowerDensity = powerDensityPerRack > 35; // >35kW per rack is high density

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Server className="w-3 h-3 text-gray-500" />
        Infrastructure Requirements (Auto-Calculated)
      </h3>

      <p className="text-xs text-gray-600 mb-4">
        Additional infrastructure needed to support your calculated storage architecture.
      </p>

      {/* Network Fabric Requirements */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Network className="w-3 h-3 text-gray-500" />
          Network Fabric
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Minimum Bandwidth</div>
            <div className="text-lg font-bold text-gray-900">
              {network.minimumBandwidth.toFixed(1)} Tb/s
            </div>
            <div className="text-xs text-gray-500">Bisection bandwidth</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">InfiniBand Switches</div>
            <div className="text-lg font-bold text-gray-900">
              {network.infinibandSwitches}
            </div>
            <div className="text-xs text-gray-500">NDR switches needed</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Storage Network</div>
            <div className="text-lg font-bold text-gray-900">
              {network.storageNetworkPorts}
            </div>
            <div className="text-xs text-gray-500">200GbE ports</div>
          </div>
        </div>
      </div>

      {/* Power & Cooling Requirements */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Zap className="w-3 h-3 text-gray-500" />
          Power & Cooling
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Storage Power</div>
            <div className="text-lg font-bold text-gray-900">
              {power.storagePowerKW.toFixed(0)} kW
            </div>
            <div className="text-xs text-gray-500">Additional power needed</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Additional Cooling</div>
            <div className="text-lg font-bold text-gray-900">
              {power.coolingTons.toFixed(1)} tons
            </div>
            <div className="text-xs text-gray-500">Cooling capacity</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Rack Space</div>
            <div className="text-lg font-bold text-gray-900">
              {power.additionalRacks}
            </div>
            <div className="text-xs text-gray-500">Additional racks</div>
          </div>
        </div>
        
        {/* Power Density Warning */}
        {isHighPowerDensity && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-700">
                <p className="font-medium mb-1">High Power Density Warning:</p>
                <p>
                  {powerDensityPerRack.toFixed(1)} kW per rack exceeds typical datacenter capacity (35kW/rack). 
                  Consider liquid cooling or additional rack distribution.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Software Licensing */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Package className="w-3 h-3 text-gray-500" />
          Software Licensing
        </h4>
        <div className="space-y-3">
          {software.vastLicense > 0 && (
            <div className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">VAST Universal License</div>
                <div className="text-xs text-gray-600">Based on extreme performance tier capacity</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(software.vastLicense)}
                </div>
                <div className="text-xs text-gray-500">5-year term</div>
              </div>
            </div>
          )}
          
          <div className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Enterprise Kubernetes</div>
              <div className="text-xs text-gray-600">GPU orchestration and multi-tenancy</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(software.kubernetesLicense)}
              </div>
              <div className="text-xs text-gray-500">Annual license</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Monitoring Stack</div>
              <div className="text-xs text-gray-600">Prometheus, Grafana, alerting</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(software.monitoringStack)}
              </div>
              <div className="text-xs text-gray-500">Annual license</div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Infrastructure Impact */}
      <div className="p-4 bg-gray-100 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-800">Total Additional Software Costs</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalSoftwareCost)}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          {formatCurrency(totalSoftwareCost / totalGPUs)} per GPU additional software costs
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-300">
          <h5 className="text-sm font-medium text-gray-800 mb-2">Infrastructure Summary</h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-600">Network:</span>
              <span className="ml-1 font-medium">{network.infinibandSwitches} switches, {network.storageNetworkPorts} ports</span>
            </div>
            <div>
              <span className="text-gray-600">Power:</span>
              <span className="ml-1 font-medium">{power.storagePowerKW.toFixed(0)} kW, {power.additionalRacks} racks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scaling Recommendations */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">Infrastructure Scaling Notes:</p>
          <ul className="space-y-1">
            <li>• Network bandwidth scales with training workload percentage</li>
            <li>• Storage power consumption varies significantly by tier (NVMe vs HDD)</li>
            <li>• Software licensing costs are often negotiable at scale (&gt;10K GPUs)</li>
            <li>• Consider co-location vs owned datacenter based on power requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
