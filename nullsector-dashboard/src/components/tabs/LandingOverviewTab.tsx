import React from 'react';
import { 
  Calculator, Zap, HardDrive, Network, DollarSign, 
  BarChart3, Settings, FileText, Shield, Users,
  CheckCircle, TrendingUp, Cpu,
  Server, Database, Gauge, Target
} from 'lucide-react';

interface LandingOverviewTabProps {
  currentUser: string;
  userRole: string;
}

export const LandingOverviewTab: React.FC<LandingOverviewTabProps> = ({ 
  currentUser, 
  userRole 
}) => {
  const isAdmin = userRole === 'admin';
  const isPowerUser = userRole === 'power_user' || userRole === 'admin';

  const features = [
    {
      icon: <Calculator className="w-6 h-6 text-gray-600" />,
      title: "GPU Cluster Calculator",
      description: "Configure GPU models, quantities, cooling, and infrastructure parameters",
      available: true
    },
    {
      icon: <DollarSign className="w-6 h-6 text-gray-600" />,
      title: "Financial Analytics",
      description: "TCO analysis, CAPEX/OPEX breakdown, and ROI calculations",
      available: isPowerUser
    },
    {
      icon: <Network className="w-6 h-6 text-gray-600" />,
      title: "Networking Architecture",
      description: "RoCEv2, InfiniBand, and Ethernet fabric design with runbooks",
      available: true
    },
    {
      icon: <HardDrive className="w-6 h-6 text-gray-600" />,
      title: "Storage Configuration",
      description: "Multi-tier storage with VAST, Ceph, and enterprise solutions",
      available: true
    },
    {
      icon: <Zap className="w-6 h-6 text-gray-600" />,
      title: "Power & Cooling",
      description: "Comprehensive power analysis and cooling system design",
      available: true
    },
    {
      icon: <Settings className="w-6 h-6 text-gray-600" />,
      title: "Software Stack",
      description: "Kubernetes, MLOps platforms, and licensing optimization",
      available: true
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-gray-600" />,
      title: "Service Pricing",
      description: "Multi-tier pricing models and revenue optimization",
      available: isPowerUser
    },
    {
      icon: <FileText className="w-6 h-6 text-gray-600" />,
      title: "Design Documentation",
      description: "Complete technical architecture and design exercises",
      available: isAdmin
    },
    {
      icon: <Users className="w-6 h-6 text-gray-600" />,
      title: "User Management",
      description: "Role-based access control and user administration",
      available: isAdmin
    }
  ];

  const quickStats = [
    {
      icon: <Cpu className="w-5 h-5 text-gray-600" />,
      label: "GPU Models Supported",
      value: "15+",
      description: "H100, H200, GB200, MI300X, and more"
    },
    {
      icon: <Server className="w-5 h-5 text-gray-600" />,
      label: "Scale Range",
      value: "100 - 200K",
      description: "From small clusters to hyperscale"
    },
    {
      icon: <Database className="w-5 h-5 text-gray-600" />,
      label: "Storage Tiers",
      value: "12+",
      description: "All-NVMe to cost-optimized HDD"
    },
    {
      icon: <Target className="w-5 h-5 text-gray-600" />,
      label: "Accuracy",
      value: "±5%",
      description: "Production-validated calculations"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            GPU Supercluster TCO Calculator
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Comprehensive Total Cost of Ownership analysis for AI/ML infrastructure at scale. 
            Design, configure, and optimize GPU clusters from 100 to 200,000+ GPUs with 
            production-validated calculations and enterprise-grade architecture guidance.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              Welcome back, <span className="font-medium">{currentUser}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-gray-500" />
              Role: <span className="font-medium capitalize">{userRole === 'power_user' ? 'Power User' : userRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              {stat.icon}
              <h3 className="text-sm font-medium text-gray-700">{stat.label}</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <p className="text-xs text-gray-600">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg p-6 border shadow-sm transition-all ${
                feature.available 
                  ? 'border-gray-200 hover:border-gray-300 hover:shadow-md' 
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  feature.available ? 'bg-gray-100' : 'bg-gray-200'
                }`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium mb-2 ${
                    feature.available ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${
                    feature.available ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {feature.description}
                  </p>
                  {!feature.available && (
                    <p className="text-xs text-gray-400 mt-2 italic">
                      Requires {isAdmin ? 'admin' : 'power user'} access
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Start Guide</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-gray-900">Configure GPU Cluster</p>
                  <p className="text-sm text-gray-600">Select GPU model, quantity, and basic parameters</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-gray-900">Choose Location & Power</p>
                  <p className="text-sm text-gray-600">Set electricity rates and cooling requirements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mt-0.5">3</div>
                <div>
                  <p className="font-medium text-gray-900">Design Storage & Network</p>
                  <p className="text-sm text-gray-600">Configure storage tiers and networking architecture</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mt-0.5">4</div>
                <div>
                  <p className="font-medium text-gray-900">Review TCO Analysis</p>
                  <p className="text-sm text-gray-600">Examine CAPEX, OPEX, and total cost breakdown</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Key Capabilities</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Real-time electricity pricing (200+ locations)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Multi-currency support (USD, EUR, GBP)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Enterprise storage architecture guidance</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Production networking runbooks</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Software stack optimization</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Service pricing model templates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Updates</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Enhanced Storage Configuration</h3>
              <p className="text-sm text-gray-600 mt-1">
                New intelligent slider controls with automatic distribution balancing for storage tiers, 
                workload types, and multi-tenant configurations.
              </p>
              <p className="text-xs text-gray-500 mt-2">Updated: October 2025</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <Gauge className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Real-time Electricity Pricing</h3>
              <p className="text-sm text-gray-600 mt-1">
                Added comprehensive global electricity rates with Q3 2025 data, including all EEA countries 
                and automatic currency conversion.
              </p>
              <p className="text-xs text-gray-500 mt-2">Updated: October 2025</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Role-Based Access Control</h3>
              <p className="text-sm text-gray-600 mt-1">
                Implemented three-tier user system: Admin (full access), Power User (no user mgmt/logs), 
                and User (basic calculator only).
              </p>
              <p className="text-xs text-gray-500 mt-2">Updated: October 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
