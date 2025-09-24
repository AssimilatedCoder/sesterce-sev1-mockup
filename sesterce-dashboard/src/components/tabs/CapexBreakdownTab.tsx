import React, { useState } from 'react';
import { 
  Server, HardDrive, Zap, Shield, Database, 
  Network, Users, AlertTriangle, ChevronDown, ChevronUp,
  Calculator, DollarSign, Package, Cpu, Thermometer
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
  const gpuCount = results.actualGPUs || config.numGPUs;
  const gpuModel = config.gpuModel || 'gb200';
  
  const enterpriseCosts = calculateEnterpriseInfrastructureCosts(
    gpuCount,
    rackCount,
    config.fabricType || 'ethernet',
    includeOptional,
    gpuModel
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
      {/* CAPEX Overview Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Complete CAPEX Analysis</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Core Infrastructure</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(originalCapex)}</p>
            <p className="text-xs text-gray-500">GPUs, Storage, Network, Cooling</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Ancillary Infrastructure</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(enterpriseCosts.totalCapex)}</p>
            <p className="text-xs text-gray-500">Security, Backup, Platform, Operations</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Enterprise CAPEX</p>
            <p className="text-2xl font-bold text-indigo-700">{formatCurrency(comprehensiveCapex)}</p>
            <p className="text-xs text-gray-500">Production-ready deployment</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Infrastructure Ratio</p>
            <p className="text-2xl font-bold text-purple-700">
              {((enterpriseCosts.totalCapex / originalCapex) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500">Ancillary vs Core</p>
          </div>
        </div>
      </div>

      {/* Power & Infrastructure Analysis */}
      {enterpriseCosts.powerRequirements && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Power Requirements */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-bold text-gray-900">Power Requirements</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cluster Computing Load</span>
                <span className="font-semibold text-yellow-700">
                  {enterpriseCosts.powerRequirements?.gpuPowerKW?.toFixed(0) || '0'} kW
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cooling Systems</span>
                <span className="font-semibold text-yellow-700">
                  {enterpriseCosts.powerRequirements?.infrastructureOverheadKW ? 
                    (enterpriseCosts.powerRequirements.infrastructureOverheadKW * 0.6).toFixed(0) : '0'} kW
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Datacenter Ancillary</span>
                <span className="font-semibold text-yellow-700">
                  {enterpriseCosts.powerRequirements?.infrastructureOverheadKW ? 
                    (enterpriseCosts.powerRequirements.infrastructureOverheadKW * 0.4).toFixed(0) : '0'} kW
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Power Draw</span>
                <span className="text-xl font-bold text-yellow-900">
                  {enterpriseCosts.powerRequirements?.totalClusterPowerMW?.toFixed(1) || '0.0'} MW
                </span>
              </div>
            </div>
          </div>

          {/* Installed Power Infrastructure */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Installed Power Infrastructure</h3>
            </div>
            <div className="space-y-3">
              {enterpriseCosts.breakdown
                .filter(item => item.component.category === 'power_backup')
                .map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.component.name.replace(/\s*\([^)]*\)/g, '')}</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(item.capex)}
                    </span>
                  </div>
                ))}
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Power CAPEX</span>
                <span className="text-xl font-bold text-green-900">
                  {formatCurrency(
                    enterpriseCosts.breakdown
                      .filter(item => item.component.category === 'power_backup')
                      .reduce((sum, item) => sum + item.capex, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cooling Infrastructure Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cooling Requirements */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Cooling Requirements</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Heat Load (Computing)</span>
              <span className="font-semibold text-blue-700">
                {enterpriseCosts.powerRequirements?.gpuPowerKW ? 
                  (enterpriseCosts.powerRequirements.gpuPowerKW * 3.412).toFixed(0) : '0'} BTU/hr
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Infrastructure Heat</span>
              <span className="font-semibold text-blue-700">
                {enterpriseCosts.powerRequirements?.infrastructureOverheadKW ? 
                  (enterpriseCosts.powerRequirements.infrastructureOverheadKW * 3.412).toFixed(0) : '0'} BTU/hr
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cooling Technology</span>
              <span className="font-semibold text-blue-700">
                {config.coolingType === 'liquid' ? 'Liquid Cooling' : 'Air Cooling'}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Cooling Load</span>
              <span className="text-xl font-bold text-blue-900">
                {enterpriseCosts.powerRequirements?.totalClusterPowerKW ? 
                  ((enterpriseCosts.powerRequirements.totalClusterPowerKW * 3.412) / 1000000).toFixed(1) : '0.0'} MMBTU/hr
              </span>
            </div>
          </div>
        </div>

        {/* Installed Cooling Infrastructure */}
        <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-200">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-6 h-6 text-cyan-600" />
            <h3 className="text-lg font-bold text-gray-900">Installed Cooling Infrastructure</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cooling Systems</span>
              <span className="font-semibold text-cyan-700">
                {formatCurrency(coolingCapex)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Datacenter Infrastructure</span>
              <span className="font-semibold text-cyan-700">
                {formatCurrency(results.datacenterCapex || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Efficiency Rating</span>
              <span className="font-semibold text-cyan-700">
                PUE {results.pueValue?.toFixed(2) || '1.20'}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Cooling CAPEX</span>
              <span className="text-xl font-bold text-cyan-900">
                {formatCurrency(coolingCapex + (results.datacenterCapex || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

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

      {/* Core Infrastructure CAPEX */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Core Infrastructure CAPEX</h3>
          <span className="text-sm text-gray-500">({formatCurrency(originalCapex)} total)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">GPU Hardware</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(gpuCapex)}</p>
            <p className="text-xs text-gray-500">{((gpuCapex / originalCapex) * 100).toFixed(0)}% of core</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <Network className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Networking</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(networkCapex)}</p>
            <p className="text-xs text-gray-500">{((networkCapex / originalCapex) * 100).toFixed(0)}% of core</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
            <HardDrive className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Storage Systems</p>
            <p className="text-lg font-bold text-purple-700">{formatCurrency(storageCapex)}</p>
            <p className="text-xs text-gray-500">{((storageCapex / originalCapex) * 100).toFixed(0)}% of core</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
            <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Cooling & DC</p>
            <p className="text-lg font-bold text-orange-700">{formatCurrency(coolingCapex + (results.datacenterCapex || 0))}</p>
            <p className="text-xs text-gray-500">{(((coolingCapex + (results.datacenterCapex || 0)) / originalCapex) * 100).toFixed(0)}% of core</p>
          </div>
        </div>
      </div>

      {/* Ancillary Infrastructure Categories */}
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

      {/* Enterprise Infrastructure Analysis */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="font-semibold text-green-900 mb-3">Enterprise Infrastructure Analysis</h3>
        <div className="space-y-2 text-sm text-green-800">
          <p>• <strong>Complete Server Infrastructure:</strong> Includes chassis, memory, storage, and management controllers for production-ready systems</p>
          <p>• <strong>French Market Rates:</strong> Reflects accurate French employment costs (€100k gross + 45% employer charges = €145k total per senior engineer)</p>
          <p>• <strong>Dynamic Power Sizing:</strong> Infrastructure scales precisely with cluster requirements ({enterpriseCosts.powerRequirements?.totalClusterPowerMW.toFixed(1)} MW) including N+1 redundancy</p>
          <p>• <strong>Enterprise Security:</strong> Comprehensive security stack ensures compliance and protection for production AI/ML workloads</p>
          <p>• <strong>Modern Platform Services:</strong> Integrated data platform (Kafka, Spark, Elasticsearch) enables advanced AI/ML operations</p>
          <p>• <strong>Production Readiness:</strong> Complete enterprise infrastructure ensures reliability, security, and operational excellence</p>
          <p>• <strong>Accurate TCO:</strong> Comprehensive analysis provides realistic enterprise deployment costs for informed decision-making</p>
        </div>
      </div>
    </div>
  );
};
