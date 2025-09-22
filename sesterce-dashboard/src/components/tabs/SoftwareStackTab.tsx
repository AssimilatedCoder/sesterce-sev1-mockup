import React from 'react';
import { 
  Code, DollarSign, Users, Clock, CheckCircle, AlertTriangle,
  Package, Shield, Zap, TrendingUp
} from 'lucide-react';
import { softwareStacks } from '../../data/softwareStackData';
import { formatNumber } from '../../utils/formatters';

interface SoftwareStackTabProps {
  results: any;
}

export const SoftwareStackTab: React.FC<SoftwareStackTabProps> = ({ results }) => {
  if (!results || !results.softwareStack) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Code className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No software stack data available. Please run the calculator first.</p>
      </div>
    );
  }

  const { selected: stack, costs, requirements } = results.softwareStack;
  const { actualGPUs } = results.details;

  return (
    <div className="space-y-6">
      {/* Stack Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-600" />
          Selected Software Stack: {stack.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Total Annual Cost</h3>
            <p className="text-2xl font-bold text-blue-900">${formatNumber(costs.totalAnnualCost)}</p>
            <p className="text-xs text-blue-700 mt-1">${formatNumber(costs.perGPUPerYear)}/GPU/year</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-2">3-Year TCO</h3>
            <p className="text-2xl font-bold text-green-900">${formatNumber(costs.threeYearTCO)}</p>
            <p className="text-xs text-green-700 mt-1">Including setup costs</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">Operational Overhead</h3>
            <p className="text-2xl font-bold text-purple-900">{stack.requiredFTEs} FTEs</p>
            <p className="text-xs text-purple-700 mt-1">${formatNumber(stack.requiredFTEs * 150000)}/year</p>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{stack.description}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            Setup Time: {stack.setupTime}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4 text-gray-500" />
            {stack.components.length} Components
          </span>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Cost Breakdown
        </h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Setup Cost</p>
                <p className="font-semibold">${formatNumber(costs.upfrontCost)}</p>
              </div>
              <div>
                <p className="text-gray-600">Annual Licensing</p>
                <p className="font-semibold">${formatNumber(costs.annualLicensing)}</p>
              </div>
              <div>
                <p className="text-gray-600">Annual Support</p>
                <p className="font-semibold">${formatNumber(costs.annualSupport)}</p>
              </div>
              <div>
                <p className="text-gray-600">Annual Operations</p>
                <p className="font-semibold">${formatNumber(costs.annualOperational)}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">5-Year TCO</h4>
              <p className="text-xl font-bold text-gray-800">${formatNumber(costs.fiveYearTCO)}</p>
              <p className="text-xs text-gray-600 mt-1">
                ${formatNumber(costs.fiveYearTCO / actualGPUs / 5)}/GPU/year over 5 years
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Cost Efficiency</h4>
              <p className="text-xl font-bold text-gray-800">
                ${formatNumber(costs.perGPUPerYear / 8760)}/GPU/hour
              </p>
              <p className="text-xs text-gray-600 mt-1">Based on 24/7 operation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stack Components */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          Stack Components
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Software</th>
                <th className="pb-2 font-semibold">Vendor</th>
                <th className="pb-2 font-semibold">License Type</th>
                <th className="pb-2 font-semibold text-right">Cost/GPU/Year</th>
                <th className="pb-2 font-semibold text-right">Total Annual</th>
              </tr>
            </thead>
            <tbody>
              {stack.components.map((component: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2">{component.category}</td>
                  <td className="py-2 font-medium">{component.software}</td>
                  <td className="py-2">{component.vendor}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      component.licensingModel === 'opensource' ? 'bg-green-100 text-green-800' :
                      component.licensingModel === 'freemium' ? 'bg-blue-100 text-blue-800' :
                      component.licensingModel === 'subscription' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {component.licensingModel}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    ${formatNumber(component.costPerGPUPerYear)}
                  </td>
                  <td className="py-2 text-right font-medium">
                    ${formatNumber(component.costPerGPUPerYear * actualGPUs)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={5} className="pt-4 text-right">Total Software Costs:</td>
                <td className="pt-4 text-right">
                  ${formatNumber(stack.components.reduce((sum: number, c: any) => 
                    sum + (c.costPerGPUPerYear * actualGPUs), 0
                  ))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Stack Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Stack Advantages
          </h3>
          <ul className="space-y-2">
            {stack.pros.map((pro: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Considerations
          </h3>
          <ul className="space-y-2">
            {stack.cons.map((con: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best For */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Best Suited For
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stack.bestFor.map((use: string, idx: number) => (
            <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200">
              <Shield className="w-4 h-4 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-700">{use}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Criteria */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Stack Selection Criteria
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Budget Level</p>
            <p className="font-semibold capitalize">{requirements.budget}</p>
          </div>
          <div>
            <p className="text-gray-600">Team Expertise</p>
            <p className="font-semibold capitalize">{requirements.expertise}</p>
          </div>
          <div>
            <p className="text-gray-600">Support Needs</p>
            <p className="font-semibold capitalize">{requirements.supportNeeds}</p>
          </div>
          <div>
            <p className="text-gray-600">Primary Use Case</p>
            <p className="font-semibold capitalize">{requirements.primaryUseCase}</p>
          </div>
          <div>
            <p className="text-gray-600">Multi-Tenancy</p>
            <p className="font-semibold">{requirements.multiTenancy ? 'Required' : 'Not Required'}</p>
          </div>
          <div>
            <p className="text-gray-600">Compliance</p>
            <p className="font-semibold">
              {requirements.complianceRequirements.length > 0 
                ? requirements.complianceRequirements.join(', ')
                : 'None'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Stacks Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Alternative Stack Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-semibold">Stack</th>
                <th className="pb-2 font-semibold text-center">Cost/GPU/Year</th>
                <th className="pb-2 font-semibold text-center">FTEs</th>
                <th className="pb-2 font-semibold text-center">Setup Time</th>
                <th className="pb-2 font-semibold">Key Differentiator</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(softwareStacks).map((altStack: any) => (
                <tr 
                  key={altStack.id} 
                  className={`border-b hover:bg-gray-50 ${
                    altStack.id === stack.id ? 'bg-blue-50 font-medium' : ''
                  }`}
                >
                  <td className="py-2">
                    {altStack.name}
                    {altStack.id === stack.id && (
                      <span className="ml-2 text-xs text-blue-600">(Selected)</span>
                    )}
                  </td>
                  <td className="py-2 text-center">${formatNumber(altStack.totalCostPerGPU)}</td>
                  <td className="py-2 text-center">{altStack.requiredFTEs}</td>
                  <td className="py-2 text-center">{altStack.setupTime}</td>
                  <td className="py-2 text-xs">{altStack.pros[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
