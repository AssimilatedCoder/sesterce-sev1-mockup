import React from 'react';
import { DollarSign, TrendingUp, BarChart3, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { EnhancedTCOResults, calculateROIMetrics } from '../../utils/enhancedTCOCalculations';

interface EnhancedTCOResultsProps {
  tcoResults: EnhancedTCOResults;
  formatCurrency: (amount: number) => string;
}

export const EnhancedTCOResultsComponent: React.FC<EnhancedTCOResultsProps> = ({
  tcoResults,
  formatCurrency
}) => {
  const roiMetrics = calculateROIMetrics(tcoResults);
  const isPositiveROI = roiMetrics.roi5Year > 0;
  const isHealthyMargin = tcoResults.revenueModel.grossMargin > 30;

  return (
    <div className="space-y-6">
      {/* TCO Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-3 h-3 text-gray-500" />
          Enhanced TCO Summary (Service-Tier Driven)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">5-Year TCO</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(tcoResults.tco.fiveYear)}
            </div>
            <div className="text-xs text-gray-500">Total cost of ownership</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">TCO per GPU</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(tcoResults.tco.perGPU)}
            </div>
            <div className="text-xs text-gray-500">5-year cost per GPU</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">CAPEX</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(tcoResults.capex.total)}
            </div>
            <div className="text-xs text-gray-500">Initial investment</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Annual OPEX</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(tcoResults.opex.annual.total)}
            </div>
            <div className="text-xs text-gray-500">Yearly operating costs</div>
          </div>
        </div>

        {/* CAPEX Breakdown */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">CAPEX Breakdown</h4>
          <div className="space-y-2">
            {[
              { label: 'GPU Systems', amount: tcoResults.capex.gpuSystems, percentage: (tcoResults.capex.gpuSystems / tcoResults.capex.total) * 100 },
              { label: 'Calculated Storage', amount: tcoResults.capex.calculatedStorage, percentage: (tcoResults.capex.calculatedStorage / tcoResults.capex.total) * 100 },
              { label: 'Networking Infrastructure', amount: tcoResults.capex.networkingInfrastructure, percentage: (tcoResults.capex.networkingInfrastructure / tcoResults.capex.total) * 100 },
              { label: 'Power & Cooling', amount: tcoResults.capex.powerCoolingInfrastructure, percentage: (tcoResults.capex.powerCoolingInfrastructure / tcoResults.capex.total) * 100 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</div>
                  <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Model & ROI */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-gray-500" />
          Revenue Model & ROI Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Annual Revenue</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(tcoResults.revenueModel.estimatedAnnualRevenue)}
            </div>
            <div className="text-xs text-gray-500">
              {formatCurrency(tcoResults.revenueModel.revenuePerGPU)} per GPU
            </div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Gross Margin</div>
            <div className={`text-lg font-bold ${isHealthyMargin ? 'text-gray-900' : 'text-red-600'}`}>
              {tcoResults.revenueModel.grossMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {isHealthyMargin ? 'Healthy margin' : 'Low margin'}
            </div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">5-Year ROI</div>
            <div className={`text-lg font-bold ${isPositiveROI ? 'text-gray-900' : 'text-red-600'}`}>
              {roiMetrics.roi5Year.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Return on investment</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Payback Period</div>
            <div className="text-lg font-bold text-gray-900">
              {tcoResults.revenueModel.paybackPeriod.toFixed(1)} years
            </div>
            <div className="text-xs text-gray-500">Break-even time</div>
          </div>
        </div>

        {/* Financial Health Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-3 rounded border ${isPositiveROI ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-2">
              {isPositiveROI ? 
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> :
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              }
              <div>
                <h4 className={`text-sm font-medium ${isPositiveROI ? 'text-green-800' : 'text-red-800'} mb-1`}>
                  ROI Analysis
                </h4>
                <p className={`text-xs ${isPositiveROI ? 'text-green-700' : 'text-red-700'}`}>
                  {isPositiveROI ? 
                    `Positive ROI of ${roiMetrics.roi5Year.toFixed(1)}% over 5 years indicates a profitable investment.` :
                    `Negative ROI of ${roiMetrics.roi5Year.toFixed(1)}% suggests reviewing service tier pricing or reducing costs.`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded border ${isHealthyMargin ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-start gap-2">
              {isHealthyMargin ? 
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> :
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              }
              <div>
                <h4 className={`text-sm font-medium ${isHealthyMargin ? 'text-green-800' : 'text-yellow-800'} mb-1`}>
                  Margin Health
                </h4>
                <p className={`text-xs ${isHealthyMargin ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isHealthyMargin ? 
                    `Gross margin of ${tcoResults.revenueModel.grossMargin.toFixed(1)}% provides good operational flexibility.` :
                    `Margin of ${tcoResults.revenueModel.grossMargin.toFixed(1)}% is below recommended 30% for infrastructure services.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Tier TCO Breakdown */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-3 h-3 text-gray-500" />
          TCO by Service Tier
        </h3>

        <div className="space-y-3">
          {Object.entries(tcoResults.tco.perServiceTier).map(([tierId, cost]) => {
            const percentage = (cost / tcoResults.tco.fiveYear) * 100;
            const tierName = tierId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return (
              <div key={tierId} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{tierName}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(cost)}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}% of total TCO</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Architecture Cost Breakdown */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-3 h-3 text-gray-500" />
          Calculated Storage Cost Breakdown
        </h3>

        <div className="space-y-3">
          {tcoResults.breakdown.storageByTier.map((storage, index) => (
            <div key={index} className="bg-white p-3 rounded border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{storage.tier}</h4>
                  <p className="text-xs text-gray-600">{storage.rationale}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(storage.capex + storage.opex * 5)}
                  </div>
                  <div className="text-xs text-gray-500">{storage.capacityPB.toFixed(1)} PB</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">CAPEX:</span>
                  <span className="ml-1 font-medium">{formatCurrency(storage.capex)}</span>
                </div>
                <div>
                  <span className="text-gray-600">OPEX (5yr):</span>
                  <span className="ml-1 font-medium">{formatCurrency(storage.opex * 5)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Per PB:</span>
                  <span className="ml-1 font-medium">{formatCurrency((storage.capex + storage.opex * 5) / storage.capacityPB)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Key Financial Insights</h4>
        <ul className="space-y-1 text-xs text-blue-700">
          <li>• Storage represents {((tcoResults.capex.calculatedStorage / tcoResults.capex.total) * 100).toFixed(1)}% of total CAPEX</li>
          <li>• Infrastructure scales automatically with service tier workload requirements</li>
          <li>• Revenue model assumes {formatCurrency(tcoResults.revenueModel.revenuePerGPU)} average revenue per GPU annually</li>
          <li>• Break-even occurs at {roiMetrics.breakEvenMonths.toFixed(1)} months with current service tier mix</li>
          {!isPositiveROI && <li>• Consider optimizing service tier pricing or reducing infrastructure costs</li>}
          {!isHealthyMargin && <li>• Gross margin below 30% may indicate pricing or cost structure issues</li>}
        </ul>
      </div>
    </div>
  );
};
