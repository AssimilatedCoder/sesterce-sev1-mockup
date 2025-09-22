import React from 'react';
import { 
  Package, Users, Shield, DollarSign, Clock, 
  CheckCircle, AlertTriangle, Info, Zap
} from 'lucide-react';
import { softwareStacks, softwareComponents, calculateStackCost } from '../../data/softwareStacks';

interface SoftwareStackTabProps {
  config: any;
  results: any;
  formatNumber: (num: number) => string;
}

export const SoftwareStackTab: React.FC<SoftwareStackTabProps> = ({
  config,
  results,
  formatNumber
}) => {
  const currentStack = softwareStacks[config.softwareStack || 'canonical-enterprise'];
  const stackCost = results?.details?.softwareStackCost;

  return (
    <div className="space-y-6">
      {/* Current Stack Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Selected Software Stack: {currentStack?.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Annual Cost</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {stackCost ? formatNumber(stackCost.annualCost) : 'N/A'}
            </div>
            <div className="text-xs text-blue-600">
              {stackCost ? `${formatNumber(stackCost.perGPUCost)}/GPU/yr` : ''}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Required FTEs</span>
            </div>
            <div className="text-lg font-bold text-green-900">
              {currentStack?.requiredFTEs || 0}
            </div>
            <div className="text-xs text-green-600">
              Engineers @ $150K/yr
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Deployment</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {currentStack?.deploymentTime || 'N/A'}
            </div>
            <div className="text-xs text-purple-600">
              Time to production
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Vendor Lock-in</span>
            </div>
            <div className="text-lg font-bold text-orange-900 capitalize">
              {currentStack?.vendorLockIn || 'Unknown'}
            </div>
            <div className="text-xs text-orange-600">
              Flexibility level
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Description:</strong> {currentStack?.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {currentStack?.maturityLevel}
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {currentStack?.targetScale} scale
            </span>
            {currentStack?.complianceSupport?.map(compliance => (
              <span key={compliance} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {compliance}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Component Breakdown */}
      {stackCost && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Component Cost Breakdown
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Component</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Category</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Setup Cost</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Annual Cost</th>
                  <th className="text-right py-2 font-semibold text-gray-700">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {stackCost.breakdown.map((component: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{component.component}</td>
                    <td className="py-2 text-gray-600 capitalize">{component.category}</td>
                    <td className="py-2 text-right">{formatNumber(component.setupCost)}</td>
                    <td className="py-2 text-right">{formatNumber(component.annualCost)}</td>
                    <td className="py-2 text-right">
                      {((component.annualCost / stackCost.annualCost) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-2">Total</td>
                  <td className="py-2"></td>
                  <td className="py-2 text-right">{formatNumber(stackCost.upfrontCost)}</td>
                  <td className="py-2 text-right">{formatNumber(stackCost.annualCost)}</td>
                  <td className="py-2 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* All Available Stacks Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          All Available Software Stacks
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(softwareStacks).map(([stackId, stack]) => {
            const isSelected = stackId === (config.softwareStack || 'canonical-enterprise');
            const stackCostCalc = config.numGPUs > 0 ? 
              calculateStackCost(stackId, config.numGPUs, 3, config.supportTier || 'business') : null;
            
            return (
              <div 
                key={stackId} 
                className={`p-4 rounded-lg border-2 ${
                  isSelected 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {stack.name}
                  </h4>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {stackCostCalc ? formatNumber(stackCostCalc.perGPUCost) : `~${formatNumber(stack.totalCostPerGPU)}`}/GPU/yr
                    </div>
                    <div className="text-xs text-gray-600">
                      {stack.requiredFTEs} FTEs
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{stack.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {stack.maturityLevel}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {stack.vendorLockIn} lock-in
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {stack.deploymentTime}
                  </span>
                </div>
                
                {stack.complianceSupport && stack.complianceSupport.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {stack.complianceSupport.map(compliance => (
                      <span key={compliance} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {compliance}
                      </span>
                    ))}
                  </div>
                )}
                
                {stackId === 'bytplus-integrated' && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-700 font-medium">
                        Security Warning: Chinese vendor - not suitable for European compliance
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Components Reference */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Key Software Components Reference</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(softwareComponents)
            .filter(([_, component]) => 
              ['nvidia-ai-enterprise', 'run-ai', 'datadog', 'vast-data', 'weka', 'dell-omnia', 'bytplus'].includes(component.id)
            )
            .map(([componentId, component]) => (
              <div key={componentId} className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-800 mb-1">{component.name}</h4>
                <div className="text-xs text-gray-600 mb-2">{component.vendor}</div>
                <div className="text-sm font-bold text-gray-900">
                  {component.costPerGPUPerYear > 0 
                    ? `${formatNumber(component.costPerGPUPerYear)}/GPU/yr`
                    : 'Free'
                  }
                </div>
                <div className="text-xs text-gray-500 mt-1">{component.notes}</div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    component.licensingModel === 'opensource' ? 'bg-green-100 text-green-800' :
                    component.licensingModel === 'freemium' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {component.licensingModel}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
