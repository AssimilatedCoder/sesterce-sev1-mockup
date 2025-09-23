import React, { useState } from 'react';
import { 
  Server, HardDrive, Zap, Shield, Database, 
  Network, Users, AlertTriangle, ChevronDown, ChevronUp,
  Calculator, DollarSign, Package
} from 'lucide-react';
import { calculateEnterpriseInfrastructureCosts } from '../../data/enterpriseInfrastructure';

interface CapexBreakdownTabProps {
  config: any;
  results: any;
}

export const CapexBreakdownTab: React.FC<CapexBreakdownTabProps> = ({ config, results }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['compute_hardware']));
  const [includeOptional, setIncludeOptional] = useState(false);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  if (!results || !config) {
    return (
      <div className="p-8 text-center">
        <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Run a calculation to see detailed CAPEX breakdown</p>
      </div>
    );
  }

  // Calculate enterprise infrastructure costs
  const rackCount = Math.ceil((results.actualGPUs || config.numGPUs) / 72); // Assuming GB200/GB300 primarily
  const enterpriseCosts = calculateEnterpriseInfrastructureCosts(
    results.actualGPUs || config.numGPUs,
    rackCount,
    config.fabricType || 'ethernet',
    includeOptional,
    config.gpuModel || 'gb200'
  );

  // Original CAPEX from calculator
  const originalCapex = results.totalCapex || 0;
  const gpuCapex = results.gpuCapex || 0;
  const networkCapex = results.networkCapex || 0;
  const storageCapex = results.storageCapex || 0;
  const coolingCapex = results.coolingCapex || 0;

  // Comprehensive CAPEX breakdown
  const comprehensiveCapex = originalCapex + enterpriseCosts.totalCapex;
  const comprehensiveAnnualOpex = (results.annualOpex || 0) + enterpriseCosts.totalAnnualOpex;

  // Group components by category
  const categorizedComponents = enterpriseCosts.breakdown.reduce((acc, item) => {
    const category = item.component.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof enterpriseCosts.breakdown>);

  // Category metadata
  const categoryInfo = {
    compute_hardware: {
      name: 'Complete Server Hardware',
      icon: Server,
      description: 'Chassis, memory, storage, management - beyond just GPUs',
      color: 'blue'
    },
    operations_fte: {
      name: 'Operations Staff (FTEs)',
      icon: Users,
      description: 'Required personnel for 24/7 operations',
      color: 'green'
    },
    power_backup: {
      name: 'Power & Backup Systems',
      icon: Zap,
      description: 'Generators, UPS, fuel storage, monitoring',
      color: 'yellow'
    },
    security_infrastructure: {
      name: 'Security Infrastructure',
      icon: Shield,
      description: 'Firewalls, DPI, IDS/IPS, SIEM, PKI',
      color: 'red'
    },
    backup_dr: {
      name: 'Backup & Disaster Recovery',
      icon: HardDrive,
      description: 'Backup systems, DR site, replication',
      color: 'purple'
    },
    platform_services: {
      name: 'Cloud Platform Services',
      icon: Database,
      description: 'Kafka, Spark, Elasticsearch, Redis, PostgreSQL',
      color: 'indigo'
    },
    network_management: {
      name: 'Network Management',
      icon: Network,
      description: 'UFM, Netris, monitoring, automation',
      color: 'cyan'
    },
    monitoring: {
      name: 'Monitoring & Observability',
      icon: AlertTriangle,
      description: 'Prometheus, Grafana, Jaeger, alerting',
      color: 'orange'
    }
  };

  return (
    <div className="space-y-6">
      {/* CAPEX Impact Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900">Complete CAPEX Analysis</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Original Calculator</p>
            <p className="text-2xl font-bold text-gray-700">{formatCurrency(originalCapex)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Missing Infrastructure</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(enterpriseCosts.totalCapex)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Real CAPEX</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(comprehensiveCapex)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">CAPEX Increase</p>
            <p className="text-2xl font-bold text-red-800">
              +{((enterpriseCosts.totalCapex / originalCapex) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Power Requirements Display */}
      {enterpriseCosts.powerRequirements && (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-bold text-gray-900">Cluster Power Requirements</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">GPU Power</p>
              <p className="text-xl font-bold text-yellow-700">
                {enterpriseCosts.powerRequirements.gpuPowerKW.toFixed(0)} kW
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Infrastructure Overhead</p>
              <p className="text-xl font-bold text-yellow-700">
                {enterpriseCosts.powerRequirements.infrastructureOverheadKW.toFixed(0)} kW
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Cluster Power</p>
              <p className="text-xl font-bold text-yellow-800">
                {enterpriseCosts.powerRequirements.totalClusterPowerKW.toFixed(0)} kW
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total (MW)</p>
              <p className="text-xl font-bold text-yellow-900">
                {enterpriseCosts.powerRequirements.totalClusterPowerMW.toFixed(1)} MW
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Infrastructure Components</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeOptional}
              onChange={(e) => setIncludeOptional(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-600">Include optional components</span>
          </label>
        </div>
      </div>

      {/* Original CAPEX Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Original Calculator CAPEX</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">GPU Hardware</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(gpuCapex)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Network className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Networking</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(networkCapex)}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <HardDrive className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Storage</p>
            <p className="text-lg font-bold text-purple-700">{formatCurrency(storageCapex)}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Cooling</p>
            <p className="text-lg font-bold text-yellow-700">{formatCurrency(coolingCapex)}</p>
          </div>
        </div>
      </div>

      {/* Missing Infrastructure Categories */}
      {Object.entries(categoryInfo).map(([categoryKey, categoryData]) => {
        const components = categorizedComponents[categoryKey] || [];
        if (components.length === 0) return null;

        const categoryCapex = components.reduce((sum, item) => sum + item.capex, 0);
        const categoryOpex = components.reduce((sum, item) => sum + item.annualOpex, 0);
        const isExpanded = expandedCategories.has(categoryKey);
        const IconComponent = categoryData.icon;

        return (
          <div key={categoryKey} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => toggleCategory(categoryKey)}
              className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-6 h-6 text-${categoryData.color}-600`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{categoryData.name}</h3>
                    <p className="text-sm text-gray-600">{categoryData.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(categoryCapex)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(categoryOpex)}/year</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="space-y-3 mt-4">
                  {components.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.component.name}</h4>
                        <p className="text-sm text-gray-600">{item.component.description}</p>
                        {item.details && (
                          <p className="text-xs text-blue-600 mt-1">📊 {item.details}</p>
                        )}
                        {item.component.vendor && (
                          <p className="text-xs text-gray-500">Vendor: {item.component.vendor}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium text-gray-900">{formatCurrency(item.capex)}</p>
                        {item.annualOpex > 0 && (
                          <p className="text-sm text-gray-600">{formatCurrency(item.annualOpex)}/year</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {item.quantity > 1 ? `${item.quantity}x units` : '1x unit'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Financial Impact Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">Financial Impact Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">CAPEX Impact</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Original CAPEX</span>
                <span className="font-medium">{formatCurrency(originalCapex)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Additional CAPEX</span>
                <span className="font-medium text-red-600">+{formatCurrency(enterpriseCosts.totalCapex)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Real CAPEX</span>
                <span className="font-bold text-red-700">{formatCurrency(comprehensiveCapex)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">OPEX Impact</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Original Annual OPEX</span>
                <span className="font-medium">{formatCurrency(results.annualOpex || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Additional Annual OPEX</span>
                <span className="font-medium text-red-600">+{formatCurrency(enterpriseCosts.totalAnnualOpex)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Annual OPEX</span>
                <span className="font-bold text-red-700">{formatCurrency(comprehensiveAnnualOpex)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">TCO Impact</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">5-Year TCO (Original)</span>
                <span className="font-medium">{formatCurrency(originalCapex + (results.annualOpex || 0) * 5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">5-Year TCO (Complete)</span>
                <span className="font-medium text-red-600">{formatCurrency(comprehensiveCapex + comprehensiveAnnualOpex * 5)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">TCO Increase</span>
                <span className="font-bold text-red-700">
                  +{(((comprehensiveCapex + comprehensiveAnnualOpex * 5) / (originalCapex + (results.annualOpex || 0) * 5) - 1) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Enterprise Infrastructure Analysis</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Server Hardware:</strong> Complete server costs (chassis, memory, storage, management) were missing from GPU-only calculations</p>
          <p>• <strong>French FTE Costs:</strong> Updated to reflect French market rates (€100k gross + 45% employer charges = €145k total cost per senior engineer)</p>
          <p>• <strong>Dynamic Power Sizing:</strong> Generators, UPS, and fuel storage now scale with actual cluster power requirements ({enterpriseCosts.powerRequirements?.totalClusterPowerMW.toFixed(1)} MW for this configuration)</p>
          <p>• <strong>N+1 Redundancy:</strong> Power infrastructure includes proper redundancy for enterprise SLAs</p>
          <p>• <strong>Security & Compliance:</strong> Enterprise security stack mandatory for production AI/ML workloads</p>
          <p>• <strong>Platform Services:</strong> Modern data platform (Kafka, Spark, Elasticsearch) essential for AI/ML operations</p>
          <p>• <strong>Total Impact:</strong> Real enterprise CAPEX is typically 2-3x higher than GPU-only calculations, with significant ongoing OPEX for operations staff</p>
        </div>
      </div>
    </div>
  );
};
