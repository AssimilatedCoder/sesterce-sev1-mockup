import React from 'react';
import { 
  Calculator, Zap, HardDrive, Network, DollarSign, 
  BarChart3, Settings, FileText, Shield, Users,
  CheckCircle, TrendingUp, Cpu,
  Server, Database, Gauge, Target,
  BookOpen, Layers, ArrowRight, AlertTriangle
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

      {/* Comprehensive User Manual */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">User Manual & Calculation Guide</h2>
        </div>

        <div className="space-y-8">
          {/* Architecture Overview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-600" />
              Service-Tier-Driven Architecture
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>New Approach:</strong> The calculator now uses a service-tier-driven methodology where you define your business services first, 
                and the infrastructure requirements are automatically calculated based on workload performance needs.
              </p>
              <p className="text-xs text-blue-700">
                This approach ensures optimal infrastructure sizing while maintaining cost efficiency and performance targets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Traditional Approach (Legacy)</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Manual storage configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Guesswork on performance requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Risk of over/under-provisioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Complex infrastructure decisions</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Service-Tier-Driven (New)</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Business service definition first</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Automatic performance calculations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Optimal infrastructure sizing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Intelligent validation & warnings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Process */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-gray-600" />
              Step-by-Step Configuration Process
            </h3>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-800 mb-2">Step 1: Basic GPU Configuration</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Start by defining your core GPU infrastructure parameters. These choices directly impact all downstream calculations.
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>GPU Model Selection:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        <li>• GB200: $70K, 2.7kW, 192GB - Extreme performance</li>
                        <li>• H100 SXM: $40K, 700W, 80GB - High performance</li>
                        <li>• H200: $45K, 700W, 141GB - Enhanced memory</li>
                        <li>• MI300X: $15K, 750W, 192GB - Cost-effective</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Configuration Impact:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        <li>• Higher GPU count = More storage bandwidth needed</li>
                        <li>• Liquid cooling required for &gt;1000 GPUs</li>
                        <li>• Location affects electricity costs significantly</li>
                        <li>• Utilization rate impacts power calculations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-800 mb-2">Step 2: Service Tier Definition</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Define your customer service tiers and their workload characteristics. This is the foundation of the new architecture.
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="space-y-3">
                    <div>
                      <strong>Service Tier Types:</strong>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <div className="font-medium text-blue-700">Tier 1: Whale Customers</div>
                          <div className="text-gray-600">Bare metal access, highest priority</div>
                          <div className="text-gray-500">Revenue: $50K/GPU/year</div>
                        </div>
                        <div>
                          <div className="font-medium text-purple-700">Tier 2: Orchestrated</div>
                          <div className="text-gray-600">Managed Kubernetes, shared resources</div>
                          <div className="text-gray-500">Revenue: $35K/GPU/year</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-700">Tier 3: Inference</div>
                          <div className="text-gray-600">API-based inference services</div>
                          <div className="text-gray-500">Revenue: $25K/GPU/year</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <strong>Workload Split Impact:</strong>
                      <ul className="space-y-1 text-gray-600">
                        <li>• <strong>Training workloads:</strong> High bandwidth (3-5 GB/s/GPU), sequential I/O, extreme performance storage</li>
                        <li>• <strong>Inference workloads:</strong> High IOPS (5-10K/GPU), random I/O, balanced performance storage</li>
                        <li>• <strong>Mixed workloads:</strong> Balanced requirements, cost-optimized tiers for non-critical data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-gray-800 mb-2">Step 3: Automatic Infrastructure Calculation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Based on your service tier configuration, the system automatically calculates optimal infrastructure requirements.
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>Storage Calculations:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        <li>• Bandwidth: Training% × 4 GB/s + Inference% × 1 GB/s</li>
                        <li>• IOPS: Training% × 2K + Inference% × 8K per GPU</li>
                        <li>• Tier distribution based on performance needs</li>
                        <li>• Automatic architecture selection (VAST, Ceph, etc.)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Network & Power:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        <li>• InfiniBand switches: GPUs ÷ 32 ports</li>
                        <li>• Storage network: Bandwidth ÷ 100 Gb/s</li>
                        <li>• Power: GPU power + storage + infrastructure</li>
                        <li>• Cooling: PUE multiplier based on type</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-gray-800 mb-2">Step 4: Validation & Optimization</h4>
                <p className="text-sm text-gray-600 mb-3">
                  The system continuously validates your configuration and provides optimization recommendations.
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="space-y-3">
                    <div>
                      <strong>Validation Categories:</strong>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <div className="font-medium text-red-600">Critical Errors</div>
                          <div className="text-gray-600">Configuration prevents deployment</div>
                        </div>
                        <div>
                          <div className="font-medium text-yellow-600">Warnings</div>
                          <div className="text-gray-600">Suboptimal but functional</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <strong>Common Validations:</strong>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Service tier percentages must sum to 100%</li>
                        <li>• Power density limits (35kW/rack typical)</li>
                        <li>• Financial viability (30%+ gross margin recommended)</li>
                        <li>• Storage performance vs. workload requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium text-gray-800 mb-2">Step 5: Financial Analysis & TCO</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Comprehensive financial analysis with service-tier-specific revenue modeling and ROI calculations.
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>CAPEX Components:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        <li>• GPU systems (typically 60-70% of CAPEX)</li>
                        <li>• Calculated storage (20-30% of CAPEX)</li>
                        <li>• Network infrastructure (5-10%)</li>
                        <li>• Power & cooling infrastructure (5-10%)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>OPEX Components:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        <li>• Electricity (location-specific rates)</li>
                        <li>• Cooling (15% of power cost)</li>
                        <li>• Staff (complexity-based scaling)</li>
                        <li>• Maintenance (8% of hardware CAPEX)</li>
                        <li>• Software licensing (calculated per tier)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Influences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-600" />
              How Your Choices Influence Calculations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Service Tier Mix Impact</h4>
                  <div className="space-y-2 text-xs text-blue-700">
                    <div><strong>High Training %:</strong> Increases storage bandwidth needs, drives extreme performance tier selection</div>
                    <div><strong>High Inference %:</strong> Increases IOPS requirements, balanced performance tiers sufficient</div>
                    <div><strong>Whale Tier %:</strong> Higher revenue per GPU, justifies premium infrastructure costs</div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">GPU Configuration Impact</h4>
                  <div className="space-y-2 text-xs text-green-700">
                    <div><strong>GPU Count:</strong> Linear scaling of storage/network requirements</div>
                    <div><strong>GPU Model:</strong> Affects power, memory, and performance characteristics</div>
                    <div><strong>Cooling Type:</strong> Liquid cooling reduces PUE from 1.5 to 1.1</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">Location & Power Impact</h4>
                  <div className="space-y-2 text-xs text-purple-700">
                    <div><strong>Electricity Rate:</strong> Directly affects OPEX, varies 10x globally ($0.05-$0.50/kWh)</div>
                    <div><strong>Currency:</strong> Real-time conversion affects financial projections</div>
                    <div><strong>Utilization:</strong> 90% vs 70% significantly impacts power costs</div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-2">Financial Parameters Impact</h4>
                  <div className="space-y-2 text-xs text-orange-700">
                    <div><strong>Depreciation:</strong> 3-5 years affects annual costs and ROI calculations</div>
                    <div><strong>Service Pricing:</strong> Revenue model determines gross margin and payback</div>
                    <div><strong>Scale:</strong> Larger deployments benefit from economies of scale</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-600" />
              Best Practices & Optimization Tips
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Service Tier Design</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li>• Balance training/inference based on actual customer needs</li>
                  <li>• Whale tiers should be &lt;50% of total allocation</li>
                  <li>• Consider inference-heavy tiers for cost optimization</li>
                  <li>• Validate gross margins &gt;30% for sustainability</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Infrastructure Optimization</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li>• Use liquid cooling for &gt;1000 GPUs</li>
                  <li>• Consider erasure coding for large storage deployments</li>
                  <li>• Monitor power density limits (35kW/rack)</li>
                  <li>• Validate network bandwidth requirements</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Financial Optimization</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li>• Target payback period &lt;3 years</li>
                  <li>• Consider low-cost electricity locations</li>
                  <li>• Balance performance vs. cost in storage tiers</li>
                  <li>• Monitor storage proportion of total CAPEX</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-600" />
              Common Issues & Troubleshooting
            </h3>

            <div className="space-y-4">
              <div className="border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Critical Validation Errors</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">"Service tier percentages must sum to 100%"</span>
                    <span className="text-red-600 text-xs">→ Adjust cluster allocation sliders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">"Negative gross margin"</span>
                    <span className="text-red-600 text-xs">→ Increase service pricing or reduce costs</span>
                  </div>
                </div>
              </div>

              <div className="border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Performance Warnings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">"High power density exceeds datacenter capacity"</span>
                    <span className="text-yellow-600 text-xs">→ Enable liquid cooling or add racks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">"Storage represents &gt;40% of CAPEX"</span>
                    <span className="text-yellow-600 text-xs">→ Review performance requirements</span>
                  </div>
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Optimization Opportunities</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">"Consider erasure coding for large scale"</span>
                    <span className="text-blue-600 text-xs">→ Reduces raw storage overhead</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">"Low training workload detected"</span>
                    <span className="text-blue-600 text-xs">→ Cost-optimized storage may suffice</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Information */}
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            <h4 className="font-medium text-gray-800 mb-2">Need Additional Support?</h4>
            <p className="text-sm text-gray-600 mb-3">
              This calculator provides production-validated calculations for enterprise GPU infrastructure. 
              For custom configurations or deployment assistance, consult with infrastructure specialists.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Calculator Version: v1.9.4</span>
              <span>•</span>
              <span>Last Updated: October 2025</span>
              <span>•</span>
              <span>Architecture: Service-Tier-Driven</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
