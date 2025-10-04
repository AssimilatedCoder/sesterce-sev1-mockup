import React from 'react';
import { TrendingUp, DollarSign, Calculator, BarChart3, PieChart, Target, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

interface FinancialAnalyticsTabProps {
  config: any;
  results: any;
}

export const FinancialAnalyticsTab: React.FC<FinancialAnalyticsTabProps> = ({ config, results }) => {
  const { formatCurrency: formatCurrencyHook } = useCurrency();
  
  // If no results yet, show a message
  if (!results || !config) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" /> Revenue & Financial Analysis
        </h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800 mb-1">No Financial Data Available</h4>
              <p className="text-sm text-yellow-700">
                Please configure your cluster parameters and click 'Calculate TCO' on the Calculator tab to see detailed revenue projections, EBITDA analysis, and financial metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate comprehensive financial metrics
  const calculateFinancialMetrics = () => {
    if (!results || !config) return null;

    const totalCapex = results.totalCapex || 0;
    const annualOpex = results.annualOpex || 0;
    const utilizationRate = config.utilization / 100;
    const actualGPUs = results.actualGPUs || config.numGPUs;
    const depreciationYears = config.depreciation || 5;

    // Revenue calculations based on service tiers
    const tierDistribution = config.tierDistribution || { tier1: 30, tier2: 35, tier3: 25, tier4: 10 };
    const baseCostPerGPUHour = (totalCapex / depreciationYears + annualOpex) / (actualGPUs * 8760 * utilizationRate);
    
    // Service tier multipliers (from existing logic)
    const tierMultipliers = {
      tier1: 1.0,    // Bare Metal
      tier2: 1.45,   // Kubernetes
      tier3: 2.2,    // MLOps Platform
      tier4: 3.0     // Inference-as-a-Service
    };

    // Calculate blended revenue rate
    let blendedRate = 0;
    Object.entries(tierDistribution).forEach(([tier, percentage]) => {
      const multiplier = tierMultipliers[tier as keyof typeof tierMultipliers] || 1.0;
      const pct = typeof percentage === 'number' ? percentage : 0;
      blendedRate += (baseCostPerGPUHour * multiplier * pct / 100);
    });

    // Annual revenue
    const annualRevenue = blendedRate * actualGPUs * 8760 * utilizationRate;
    const monthlyRevenue = annualRevenue / 12;

    // EBITDA calculations
    const annualDepreciation = totalCapex / depreciationYears;
    const ebitda = annualRevenue - annualOpex; // Earnings before interest, taxes, depreciation, amortization
    const netIncome = ebitda - annualDepreciation;
    const ebitdaMargin = (ebitda / annualRevenue) * 100;

    // ROI and payback
    const roi = (netIncome / totalCapex) * 100;
    const paybackPeriod = totalCapex / (annualRevenue - annualOpex);

    // Cash flow projections (5-year)
    const cashFlowProjections: Array<{
      year: number;
      revenue: number;
      opex: number;
      ebitda: number;
      netIncome: number;
      cumulativeCashFlow: number;
    }> = [];
    for (let year = 1; year <= 5; year++) {
      const yearlyRevenue = annualRevenue * Math.pow(1.05, year - 1); // 5% growth assumption
      const yearlyOpex = annualOpex * Math.pow(1.03, year - 1); // 3% cost inflation
      const yearlyEbitda = yearlyRevenue - yearlyOpex;
      const yearlyNetIncome = yearlyEbitda - annualDepreciation;
      
      cashFlowProjections.push({
        year,
        revenue: yearlyRevenue,
        opex: yearlyOpex,
        ebitda: yearlyEbitda,
        netIncome: yearlyNetIncome,
        cumulativeCashFlow: year === 1 ? yearlyNetIncome - totalCapex : 
          cashFlowProjections[year - 2].cumulativeCashFlow + yearlyNetIncome
      });
    }

    return {
      baseCostPerGPUHour,
      blendedRate,
      monthlyRevenue,
      annualRevenue,
      ebitda,
      ebitdaMargin,
      netIncome,
      roi,
      paybackPeriod,
      cashFlowProjections,
      annualDepreciation,
      totalCapex,
      annualOpex
    };
  };

  // Use the currency hook for formatting
  const formatCurrency = formatCurrencyHook;

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const metrics = calculateFinancialMetrics();

  if (!metrics) {
    return (
      <div className="p-8 text-center">
        <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Run a calculation to see financial analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Impact Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Revenue Impact Analysis</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.monthlyRevenue)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Annual Revenue</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.annualRevenue)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">EBITDA</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.ebitda)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">EBITDA Margin</p>
            <p className="text-2xl font-bold text-blue-600">{formatPercent(metrics.ebitdaMargin)}</p>
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profitability Metrics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Profitability</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Net Income</span>
              <span className="font-medium">{formatCurrency(metrics.netIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ROI</span>
              <span className="font-medium">{formatPercent(metrics.roi)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payback Period</span>
              <span className="font-medium">{metrics.paybackPeriod.toFixed(1)} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Blended Rate</span>
              <span className="font-medium">${metrics.blendedRate.toFixed(2)}/GPU-hr</span>
            </div>
          </div>
        </div>

        {/* Cost Structure */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Cost Structure</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total CAPEX</span>
              <span className="font-medium">{formatCurrency(metrics.totalCapex)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Annual OPEX</span>
              <span className="font-medium">{formatCurrency(metrics.annualOpex)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Annual Depreciation</span>
              <span className="font-medium">{formatCurrency(metrics.annualDepreciation)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Base Cost/GPU-hr</span>
              <span className="font-medium">${metrics.baseCostPerGPUHour.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown by Tier */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Revenue by Tier</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(config.tierDistribution || {}).map(([tier, percentage]) => {
              const tierNames = {
                tier1: 'Bare Metal',
                tier2: 'Kubernetes',
                tier3: 'MLOps Platform',
                tier4: 'Inference-as-a-Service'
              };
              const tierMultipliers = { tier1: 1.0, tier2: 1.45, tier3: 2.2, tier4: 3.0 };
              const pct = typeof percentage === 'number' ? percentage : 0;
              const tierRevenue = metrics.baseCostPerGPUHour * 
                (tierMultipliers[tier as keyof typeof tierMultipliers] || 1.0) * 
                (pct / 100) * 
                (results.actualGPUs || config.numGPUs) * 8760 * (config.utilization / 100);
              
              return (
                <div key={tier} className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {tierNames[tier as keyof typeof tierNames]} ({pct}%)
                  </span>
                  <span className="font-medium">{formatCurrency(tierRevenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5-Year Cash Flow Projection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">5-Year Cash Flow Projection</h3>
          <span className="text-sm text-gray-500">(5% revenue growth, 3% cost inflation)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Year</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-right py-2">OPEX</th>
                <th className="text-right py-2">EBITDA</th>
                <th className="text-right py-2">Net Income</th>
                <th className="text-right py-2">Cumulative Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {metrics.cashFlowProjections.map((year) => (
                <tr key={year.year} className="border-b border-gray-100">
                  <td className="py-2 font-medium">Year {year.year}</td>
                  <td className="text-right py-2">{formatCurrency(year.revenue)}</td>
                  <td className="text-right py-2">{formatCurrency(year.opex)}</td>
                  <td className="text-right py-2">{formatCurrency(year.ebitda)}</td>
                  <td className="text-right py-2">{formatCurrency(year.netIncome)}</td>
                  <td className={`text-right py-2 font-medium ${year.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(year.cumulativeCashFlow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Revenue Impact Sensitivity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Utilization Rate Impact</h4>
            <div className="space-y-2">
              {[50, 60, 70, 80, 90].map(util => {
                const impactRevenue = metrics.blendedRate * (results.actualGPUs || config.numGPUs) * 8760 * (util / 100);
                const isCurrentUtil = util === config.utilization;
                return (
                  <div key={util} className={`flex justify-between p-2 rounded ${isCurrentUtil ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                    <span className="text-sm">{util}% utilization</span>
                    <span className="font-medium">{formatCurrency(impactRevenue)}/year</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Pricing Strategy Impact</h4>
            <div className="space-y-2">
              {[0.8, 0.9, 1.0, 1.1, 1.2].map(multiplier => {
                const impactRevenue = metrics.annualRevenue * multiplier;
                const isCurrentPrice = multiplier === 1.0;
                return (
                  <div key={multiplier} className={`flex justify-between p-2 rounded ${isCurrentPrice ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                    <span className="text-sm">{multiplier === 1.0 ? 'Current pricing' : `${((multiplier - 1) * 100).toFixed(0)}% ${multiplier > 1 ? 'increase' : 'decrease'}`}</span>
                    <span className="font-medium">{formatCurrency(impactRevenue)}/year</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
