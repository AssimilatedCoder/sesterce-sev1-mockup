import React from 'react';
import { ArrowRight, Users, HardDrive, Server, DollarSign, CheckCircle } from 'lucide-react';

interface ArchitectureFlowDiagramProps {
  isConfigured: boolean;
}

export const ArchitectureFlowDiagram: React.FC<ArchitectureFlowDiagramProps> = ({
  isConfigured
}) => {
  const steps = [
    {
      id: 'services',
      icon: <Users className="w-5 h-5" />,
      title: 'Service Tier Mix',
      description: 'Define customer services & workload splits',
      color: 'blue',
      status: isConfigured ? 'completed' : 'input'
    },
    {
      id: 'workloads',
      icon: <Server className="w-5 h-5" />,
      title: 'Workload Requirements',
      description: 'Calculate performance needs',
      color: 'purple',
      status: isConfigured ? 'completed' : 'calculated'
    },
    {
      id: 'storage',
      icon: <HardDrive className="w-5 h-5" />,
      title: 'Storage Tiers',
      description: 'Optimal architecture selection',
      color: 'green',
      status: isConfigured ? 'completed' : 'calculated'
    },
    {
      id: 'infrastructure',
      icon: <Server className="w-5 h-5" />,
      title: 'Infrastructure',
      description: 'Network, power & software sizing',
      color: 'orange',
      status: isConfigured ? 'completed' : 'calculated'
    },
    {
      id: 'tco',
      icon: <DollarSign className="w-5 h-5" />,
      title: 'TCO & ROI',
      description: 'Financial analysis & validation',
      color: 'red',
      status: isConfigured ? 'completed' : 'output'
    }
  ];

  const getStepColors = (step: typeof steps[0]) => {
    const baseColors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-600' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' }
    };

    if (step.status === 'input') {
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-300',
        text: 'text-blue-900',
        icon: 'text-blue-700'
      };
    }

    if (step.status === 'completed') {
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-800',
        icon: 'text-gray-600'
      };
    }

    return baseColors[step.color as keyof typeof baseColors];
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        <h3 className="text-sm font-semibold text-gray-800">
          Service-Tier-Driven Architecture Flow
        </h3>
      </div>
      
      <p className="text-xs text-gray-600 mb-4">
        Infrastructure requirements are automatically calculated based on your service tier configuration.
      </p>

      {/* Desktop Flow */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const colors = getStepColors(step);
          
          return (
            <React.Fragment key={step.id}>
              <div className={`flex-1 p-3 rounded-lg border ${colors.bg} ${colors.border} relative`}>
                <div className="flex items-start gap-3">
                  <div className={`${colors.icon} mt-0.5`}>
                    {step.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${colors.text} mb-1`}>
                      {step.title}
                    </h4>
                    <p className={`text-xs ${colors.text} opacity-80`}>
                      {step.description}
                    </p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        step.status === 'input' ? 'bg-blue-200 text-blue-800' :
                        step.status === 'calculated' ? 'bg-gray-200 text-gray-700' :
                        step.status === 'output' ? 'bg-red-200 text-red-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {step.status === 'input' ? 'User Input' :
                         step.status === 'calculated' ? 'Auto-Calculated' :
                         step.status === 'output' ? 'Results' :
                         'Completed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center px-2">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Flow */}
      <div className="md:hidden space-y-3">
        {steps.map((step, index) => {
          const colors = getStepColors(step);
          
          return (
            <React.Fragment key={step.id}>
              <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`${colors.icon} mt-0.5`}>
                    {step.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${colors.text}`}>
                        {step.title}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        step.status === 'input' ? 'bg-blue-200 text-blue-800' :
                        step.status === 'calculated' ? 'bg-gray-200 text-gray-700' :
                        step.status === 'output' ? 'bg-red-200 text-red-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {step.status === 'input' ? 'Input' :
                         step.status === 'calculated' ? 'Calculated' :
                         step.status === 'output' ? 'Results' :
                         'Done'}
                      </span>
                    </div>
                    <p className={`text-xs ${colors.text} opacity-80`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-px h-4 bg-gray-300"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-white rounded border border-gray-200">
        <h4 className="text-xs font-medium text-gray-800 mb-2">Flow Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <span className="text-gray-600">User Input Required</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span className="text-gray-600">Auto-Calculated</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span className="text-gray-600">Final Results</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
