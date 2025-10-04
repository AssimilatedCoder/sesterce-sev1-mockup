import React from 'react';
import { AlertTriangle, Info, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { ServiceMixRecommendation, ServiceConstraint, WorkloadDistribution } from '../../utils/serviceMixDerivation';

interface DerivedServiceMixProps {
  serviceMix: ServiceMixRecommendation;
  workloadDistribution: WorkloadDistribution;
  constraints: ServiceConstraint[];
  totalGPUs: number;
}

export const DerivedServiceMix: React.FC<DerivedServiceMixProps> = ({
  serviceMix,
  workloadDistribution,
  constraints,
  totalGPUs
}) => {
  const serviceDefinitions = {
    tier1_bareMetalWhale: {
      name: 'Tier 1: Bare Metal GPU Access',
      description: 'Direct hardware access for whale customers',
      color: 'purple',
      customers: 'OpenAI, Anthropic, Cohere, Meta AI'
    },
    tier2_orchestratedK8s: {
      name: 'Tier 2: Orchestrated Kubernetes',
      description: 'Managed Kubernetes with GPU scheduling',
      color: 'blue',
      customers: 'Fortune 500 ML teams, Fintech companies'
    },
    tier3_managedMLOps: {
      name: 'Tier 3: Managed MLOps Platform',
      description: 'Full MLOps stack with experiment tracking',
      color: 'green',
      customers: 'Mid-market enterprises, Healthcare AI'
    },
    tier4_inferenceService: {
      name: 'Tier 4: Inference-as-a-Service',
      description: 'API-based inference services',
      color: 'orange',
      customers: 'SaaS providers, API services'
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getConstraintIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConstraintColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-green-900">Recommended Service Mix</h3>
            <p className="text-sm text-green-700 mt-1">
              Based on your infrastructure capabilities, here's the optimal service tier allocation to maximize ROI.
            </p>
          </div>
        </div>
      </div>

      {/* Service Mix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(serviceMix).map(([tierKey, percentage]) => {
          const tier = serviceDefinitions[tierKey as keyof typeof serviceDefinitions];
          const workload = workloadDistribution[tierKey];
          const gpuCount = Math.round((percentage / 100) * totalGPUs);
          
          if (percentage === 0) return null;
          
          return (
            <div
              key={tierKey}
              className={`border-2 rounded-lg p-4 ${getColorClasses(tier.color)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{tier.name}</h4>
                  <p className="text-sm opacity-80 mt-1">{tier.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{percentage}%</div>
                  <div className="text-sm opacity-80">{gpuCount.toLocaleString()} GPUs</div>
                </div>
              </div>
              
              {workload && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Training: {workload.training}%</span>
                    <span>Inference: {workload.inference}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                    <div
                      className="bg-current h-2 rounded-full opacity-60"
                      style={{ width: `${workload.training}%` }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-xs opacity-70">
                <strong>Target customers:</strong> {tier.customers}
              </p>
            </div>
          );
        })}
      </div>

      {/* Constraints and Recommendations */}
      {constraints.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            Infrastructure Analysis & Recommendations
          </h4>
          
          {constraints.map((constraint, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getConstraintColor(constraint.severity)}`}
            >
              <div className="flex items-start gap-3">
                {getConstraintIcon(constraint.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-sm capitalize">
                      {constraint.type} {constraint.severity === 'critical' ? 'Issue' : 
                       constraint.severity === 'warning' ? 'Warning' : 'Note'}
                    </h5>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      constraint.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      constraint.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {constraint.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{constraint.message}</p>
                  <p className="text-xs font-medium">
                    <strong>Recommendation:</strong> {constraint.impact}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-600" />
          Infrastructure Utilization Summary
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Total GPUs</div>
            <div className="font-medium text-lg">{totalGPUs.toLocaleString()}</div>
          </div>
          
          <div>
            <div className="text-gray-600">Training Focus</div>
            <div className="font-medium text-lg">
              {Math.round(
                Object.entries(workloadDistribution).reduce((acc, [tier, workload]) => {
                  const allocation = serviceMix[tier as keyof ServiceMixRecommendation] / 100;
                  return acc + (workload.training * allocation);
                }, 0)
              )}%
            </div>
          </div>
          
          <div>
            <div className="text-gray-600">Inference Focus</div>
            <div className="font-medium text-lg">
              {Math.round(
                Object.entries(workloadDistribution).reduce((acc, [tier, workload]) => {
                  const allocation = serviceMix[tier as keyof ServiceMixRecommendation] / 100;
                  return acc + (workload.inference * allocation);
                }, 0)
              )}%
            </div>
          </div>
          
          <div>
            <div className="text-gray-600">Service Tiers</div>
            <div className="font-medium text-lg">
              {Object.values(serviceMix).filter(v => v > 0).length}/4
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Optimization Opportunities</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {serviceMix.tier1_bareMetalWhale > 0 && (
                <li>• Consider dedicated high-bandwidth zones for whale customers</li>
              )}
              {serviceMix.tier3_managedMLOps > 20 && (
                <li>• MLOps platform can generate additional revenue through data services</li>
              )}
              {serviceMix.tier4_inferenceService > 30 && (
                <li>• High inference allocation enables edge deployment opportunities</li>
              )}
              <li>• Monitor actual utilization to adjust service mix over time</li>
              <li>• Consider geographic distribution for latency-sensitive workloads</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
