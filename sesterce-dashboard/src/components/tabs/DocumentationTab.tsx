import React, { useState } from 'react';
import { 
  BookOpen, ChevronDown, ChevronUp, Calculator, Cpu, HardDrive, 
  Network, Zap, Shield, DollarSign, TrendingUp,
  Info, AlertCircle, CheckCircle
} from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const Section = ({ id, title, icon: Icon, children }: { 
    id: string; 
    title: string; 
    icon: React.ComponentType<any>; 
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {isExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="pt-6">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  const OptionCard = ({ title, description, impact, values, defaultValue }: {
    title: string;
    description: string;
    impact: string;
    values?: string[];
    defaultValue?: string;
  }) => (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-700 mb-2">{description}</p>
      <div className="flex items-start gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-green-700"><strong>Impact:</strong> {impact}</p>
      </div>
      {values && (
        <div className="text-xs text-gray-600">
          <strong>Options:</strong> {values.join(', ')}
          {defaultValue && <span className="ml-2 text-blue-600">(Default: {defaultValue})</span>}
        </div>
      )}
    </div>
  );

  const FormulaBox = ({ title, formula, explanation }: {
    title: string;
    formula: string;
    explanation: string;
  }) => (
    <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
      <h4 className="font-semibold text-blue-900 mb-2">{title}</h4>
      <div className="bg-white p-3 rounded border font-mono text-sm mb-2">
        {formula}
      </div>
      <p className="text-sm text-blue-800">{explanation}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GPU Supercluster Calculator Documentation</h1>
            <p className="text-gray-600">Comprehensive guide to understanding and using the enterprise GPU cluster TCO calculator</p>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <Section id="overview" title="Calculator Overview" icon={Info}>
        <div className="space-y-4">
          <p className="text-gray-700">
            The GPU Supercluster Calculator is an enterprise-grade Total Cost of Ownership (TCO) tool designed for 
            large-scale AI/ML infrastructure planning. It provides comprehensive cost analysis for GPU clusters 
            ranging from 1,000 to 200,000+ GPUs, including all enterprise infrastructure components.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">What It Calculates</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Complete CAPEX (Hardware + Infrastructure)</li>
                <li>• Annual OPEX (Power, Staff, Maintenance)</li>
                <li>• Revenue projections & EBITDA</li>
                <li>• Cost per GPU hour</li>
                <li>• 5-year cash flow analysis</li>
                <li>• Enterprise infrastructure requirements</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Key Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Dynamic scaling algorithms</li>
                <li>• Regional cost variations</li>
                <li>• Multiple GPU architectures</li>
                <li>• Enterprise security & compliance</li>
                <li>• French labor market rates</li>
                <li>• Multi-tier service pricing</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* GPU Configuration Section */}
      <Section id="gpu-config" title="GPU Configuration Options" icon={Cpu}>
        <div className="space-y-4">
          <p className="text-gray-700">
            GPU selection is the foundation of your cluster design, affecting power, cooling, networking, and cost calculations.
          </p>
          
          <OptionCard
            title="GPU Model"
            description="Selects the GPU architecture and determines system specifications, power consumption, and pricing."
            impact="Directly affects CAPEX (28-35% of total), power requirements, cooling needs, and networking topology."
            values={["GB200 (1000W)", "GB300 (1200W)", "H100-SXM (700W)", "H100-PCIe (350W)", "A100-SXM (400W)", "A100-PCIe (250W)"]}
            defaultValue="GB200"
          />
          
          <OptionCard
            title="Number of GPUs"
            description="Total GPU count drives system sizing, networking architecture, and infrastructure scaling."
            impact="Exponential impact on networking complexity, power infrastructure, and enterprise components. Triggers architecture transitions at 2K, 10K, 50K, 100K GPUs."
            defaultValue="10,000"
          />
          
          <OptionCard
            title="Utilization Rate (%)"
            description="Average GPU utilization affects power consumption, cooling requirements, and revenue calculations."
            impact="Linear impact on power costs and revenue. 90% vs 70% utilization = 28% difference in operating costs and revenue."
            defaultValue="90%"
          />
          
          <OptionCard
            title="Depreciation Period"
            description="Hardware depreciation period for CAPEX amortization and cost-per-hour calculations."
            impact="Longer periods reduce annual depreciation costs but may not reflect technology refresh cycles. 3-5 years typical for GPU infrastructure."
            values={["3 years", "4 years", "5 years"]}
            defaultValue="4 years"
          />

          <FormulaBox
            title="System Sizing Formula"
            formula="actualGPUs = Math.ceil(numGPUs / rackSize) × rackSize"
            explanation="Systems are sold in complete units (72 GPUs for GB200, 8 for H100 DGX). The calculator rounds up to complete systems, affecting actual GPU count and costs."
          />
        </div>
      </Section>

      {/* Service Tier Distribution Section */}
      <Section id="service-tiers" title="Service Tier Distribution" icon={DollarSign}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Service tiers represent different customer segments and pricing models for your GPU cluster, directly impacting revenue projections.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <OptionCard
                title="Tier 1: Bare Metal GPU (1.0x multiplier)"
                description="Direct hardware access via SLURM/PBS for advanced ML teams and HPC researchers."
                impact="Base pricing tier. Typically 30% allocation. Lowest margin but highest volume."
              />
              
              <OptionCard
                title="Tier 2: Orchestrated Kubernetes (1.45x multiplier)"
                description="Managed K8s with GPU operators for enterprise data science teams."
                impact="45% premium over base cost. Typically 35% allocation. Balanced margin and complexity."
              />
            </div>
            
            <div className="space-y-3">
              <OptionCard
                title="Tier 3: MLOps Platform (2.2x multiplier)"
                description="Turnkey AI/ML platform with integrated MLflow, Kubeflow, and AutoML."
                impact="120% premium over base cost. Typically 25% allocation. High margin, high value-add."
              />
              
              <OptionCard
                title="Tier 4: Inference-as-a-Service (3.0x multiplier)"
                description="Serverless inference endpoints with auto-scaling and <50ms latency."
                impact="200% premium over base cost. Typically 10% allocation. Highest margin, specialized workloads."
              />
            </div>
          </div>

          <FormulaBox
            title="Blended Revenue Rate"
            formula="blendedRate = Σ(baseCost × tierMultiplier × tierPercentage)"
            explanation="Calculates weighted average pricing across all service tiers based on allocation percentages. Higher-tier allocations significantly increase revenue potential."
          />
        </div>
      </Section>

      {/* Networking Configuration Section */}
      <Section id="networking" title="Networking Configuration" icon={Network}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Networking design affects performance, scalability, and costs. The calculator implements enterprise networking philosophies with proper scaling algorithms.
          </p>
          
          <OptionCard
            title="Fabric Type"
            description="Network fabric technology determines bandwidth, latency, and ecosystem compatibility."
            impact="InfiniBand: Higher performance, higher cost (~$120K/switch). Ethernet: Lower cost, broader ecosystem (~$85K/switch). Affects total network CAPEX by 20-40%."
            values={["InfiniBand NDR", "Ethernet RoCEv2", "InfiniBand XDR", "Ethernet 800G"]}
            defaultValue="Ethernet RoCEv2"
          />
          
          <OptionCard
            title="Network Topology"
            description="Network architecture affects scalability, bandwidth, and switch requirements."
            impact="Fat-tree: Best for large clusters, higher switch count. Dragonfly: Efficient for medium clusters. BCube: Cost-optimized for smaller deployments."
            values={["Fat-tree", "Dragonfly", "BCube"]}
            defaultValue="Fat-tree"
          />
          
          <OptionCard
            title="Oversubscription Ratio"
            description="Network oversubscription affects bandwidth guarantees and switch requirements."
            impact="1:1 (non-blocking) requires more switches but guarantees full bandwidth. 2:1 reduces switch count by ~40% but may limit performance for communication-heavy workloads."
            values={["1:1", "2:1", "4:1"]}
            defaultValue="1:1"
          />
          
          <OptionCard
            title="BlueField DPUs"
            description="Data Processing Units for network acceleration, security, and storage offload."
            impact="Adds $2,500 per DPU + 150W power. GB200: 4 DPUs per system. Enables advanced networking features and security isolation."
            defaultValue="Enabled for enterprise deployments"
          />

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">Architecture Scaling Points</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>≤2K GPUs:</strong> 2-tier leaf-spine architecture</li>
              <li>• <strong>2K-10K GPUs:</strong> 3-tier with pods (4 leaf + 4 spine per pod)</li>
              <li>• <strong>10K-50K GPUs:</strong> 3-tier multi-pod with core switches</li>
              <li>• <strong>≥50K GPUs:</strong> Hierarchical core with spine groups</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Storage Configuration Section */}
      <Section id="storage" title="Storage Configuration" icon={HardDrive}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Storage architecture affects performance, capacity, and costs. Multi-tier storage optimizes cost-performance for different data access patterns.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptionCard
              title="Hot Tier (High Performance)"
              description="NVMe-based storage for active datasets, model checkpoints, and real-time inference."
              impact="Highest cost (~$0.50/GB) but lowest latency (<100μs). Typically 10-20% of total capacity."
              values={["VAST Universal", "Pure FlashBlade", "Ceph All-NVMe"]}
            />
            
            <OptionCard
              title="Warm Tier (Balanced)"
              description="SSD-based storage for frequently accessed datasets and model artifacts."
              impact="Moderate cost (~$0.30/GB) with good performance (<1ms). Typically 30-40% of total capacity."
              values={["Ceph NVMe", "Pure FlashBlade", "VAST Universal"]}
            />
            
            <OptionCard
              title="Cold Tier (Capacity)"
              description="HDD-based storage for infrequently accessed data and long-term datasets."
              impact="Lower cost (~$0.15/GB) with higher latency (<5ms). Typically 40-50% of total capacity."
              values={["Ceph HDD", "Traditional NAS", "Object Storage"]}
            />
            
            <OptionCard
              title="Archive Tier (Long-term)"
              description="Object storage for compliance, backup, and rarely accessed historical data."
              impact="Lowest cost (~$0.05/GB) with highest latency (<100ms). Typically 10-20% of total capacity."
              values={["Ceph Object", "Cloud Storage", "Tape Libraries"]}
            />
          </div>

          <FormulaBox
            title="Storage Cost Calculation"
            formula="tierCost = capacityPB × 1000 × 1000 × vendor.pricePerGB"
            explanation="Converts petabyte capacity to gigabytes and multiplies by vendor-specific pricing. Total storage cost is sum of all tiers."
          />
        </div>
      </Section>

      {/* Power and Cooling Section */}
      <Section id="power-cooling" title="Power and Cooling Infrastructure" icon={Zap}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Power and cooling are critical infrastructure components that scale dynamically with cluster size and GPU selection.
          </p>
          
          <OptionCard
            title="Cooling Type"
            description="Cooling technology affects efficiency, cost, and power consumption."
            impact="Liquid cooling: Higher CAPEX ($400/kW) but 70% lower cooling OPEX. Air cooling: Lower CAPEX ($300/kW) but 3x higher cooling power consumption."
            values={["Liquid Cooling", "Air Cooling"]}
            defaultValue="Liquid (for high-density deployments)"
          />
          
          <OptionCard
            title="Power Usage Effectiveness (PUE)"
            description="Ratio of total facility power to IT equipment power. Varies by region and cooling type."
            impact="Lower PUE reduces total power consumption. 1.15 (liquid) vs 1.3 (air) = 13% difference in power costs."
            values={["1.15 (Liquid)", "1.2-1.3 (Air)", "Regional variations"]}
          />
          
          <OptionCard
            title="Regional Power Rates"
            description="Electricity costs vary significantly by geographic region."
            impact="Texas ($0.047/kWh) vs California ($0.150/kWh) = 3.2x difference in power costs. Major impact on OPEX."
            values={["Texas: $0.047/kWh", "Virginia: $0.085/kWh", "California: $0.150/kWh", "Europe: $0.120/kWh"]}
          />

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">Dynamic Power Infrastructure Sizing</h4>
            <div className="text-sm text-red-800 space-y-2">
              <p><strong>Generators:</strong> N+1 redundancy, 2.5MW units, sized for total cluster power</p>
              <p><strong>UPS Systems:</strong> 1MW modules, 15-minute runtime, scales with power requirements</p>
              <p><strong>Fuel Storage:</strong> 72-hour runtime capacity, scales with generator count</p>
              <p><strong>PDUs:</strong> Redundant per-rack distribution, intelligent monitoring</p>
            </div>
          </div>

          <FormulaBox
            title="Total Power Calculation"
            formula="totalPowerMW = (gpuPowerMW + storagePowerMW + dpuPowerMW) × PUE"
            explanation="Calculates total facility power including IT equipment and infrastructure overhead (cooling, lighting, UPS losses) based on PUE."
          />
        </div>
      </Section>

      {/* Enterprise Infrastructure Section */}
      <Section id="enterprise" title="Enterprise Infrastructure" icon={Shield}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Enterprise infrastructure components are essential for production deployments but often overlooked in GPU-only calculations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <OptionCard
                title="Security Infrastructure"
                description="Comprehensive security stack including firewalls, DPI, SIEM, and PKI."
                impact="€4-6M CAPEX + €1.5-2M annual OPEX. Mandatory for enterprise and compliance requirements."
              />
              
              <OptionCard
                title="Backup & Disaster Recovery"
                description="Enterprise backup systems, DR site, and business continuity infrastructure."
                impact="€13-15M CAPEX + €3-4M annual OPEX. Critical for data protection and compliance."
              />
              
              <OptionCard
                title="Platform Services"
                description="AI/ML platform including Kafka, Spark, MLflow, Kubeflow, and data services."
                impact="€3-4M CAPEX + €1.5-2M annual OPEX. Essential for modern ML operations."
              />
            </div>
            
            <div className="space-y-3">
              <OptionCard
                title="Network Management"
                description="UFM, Netris automation, monitoring, and SDN controllers."
                impact="€2-3M CAPEX + €1-1.5M annual OPEX. Required for enterprise network operations."
              />
              
              <OptionCard
                title="Monitoring & Observability"
                description="Enterprise monitoring stack with Grafana, Prometheus, APM, and logging."
                impact="€2-3M CAPEX + €1.5-2M annual OPEX. Critical for operations and troubleshooting."
              />
              
              <OptionCard
                title="Operations Staff (FTEs)"
                description="24/7 operations team including datacenter, network, security, and platform engineers."
                impact="€4.3M annual OPEX (33+ FTEs at French market rates). Scales with cluster complexity."
              />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">French Labor Market Rates</h4>
            <div className="text-sm text-orange-800 space-y-1">
              <li>• <strong>Gross Salary:</strong> €100K/year (senior engineer)</li>
              <li>• <strong>Employer Charges:</strong> +45% (€45K) for social security, health, pensions</li>
              <li>• <strong>Total Cost:</strong> €145K/year per FTE</li>
              <li>• <strong>Benefits:</strong> 5+ weeks vacation, comprehensive healthcare, job protection</li>
            </div>
          </div>
        </div>
      </Section>

      {/* Financial Analysis Section */}
      <Section id="financial" title="Financial Analysis & Revenue Modeling" icon={TrendingUp}>
        <div className="space-y-4">
          <p className="text-gray-700">
            The calculator provides comprehensive financial analysis including revenue projections, EBITDA, and cash flow modeling.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptionCard
              title="Revenue Projections"
              description="Based on service tier distribution and utilization rates."
              impact="10K GPUs at 90% utilization can generate $800M-1.2B annually depending on service mix."
            />
            
            <OptionCard
              title="EBITDA Analysis"
              description="Earnings before interest, taxes, depreciation, and amortization."
              impact="Typical EBITDA margins: 45-65% depending on service tier optimization and operational efficiency."
            />
            
            <OptionCard
              title="Cash Flow Projections"
              description="5-year cash flow analysis with growth and inflation assumptions."
              impact="Assumes 5% revenue growth and 3% cost inflation. Shows payback period and cumulative cash flow."
            />
            
            <OptionCard
              title="Sensitivity Analysis"
              description="Impact of utilization rates and pricing strategies on financial outcomes."
              impact="90% vs 70% utilization = 28% revenue difference. Pricing optimization can improve margins by 10-15%."
            />
          </div>

          <FormulaBox
            title="Cost Per GPU Hour"
            formula="costPerHour = (annualDepreciation + annualOpex) / (actualGPUs × 8760 × utilization)"
            explanation="Calculates the break-even cost per GPU hour including depreciation and all operating expenses, adjusted for actual utilization."
          />
        </div>
      </Section>

      {/* Calculation Methodology Section */}
      <Section id="methodology" title="Calculation Methodology" icon={Calculator}>
        <div className="space-y-4">
          <p className="text-gray-700">
            The calculator uses enterprise-grade methodologies based on real-world deployment experience and vendor specifications.
          </p>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">CAPEX Calculation Order</h4>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>System sizing (round up to complete systems)</li>
                <li>GPU hardware costs (actual GPUs × unit price)</li>
                <li>Storage costs (multi-tier, vendor-specific pricing)</li>
                <li>Network costs (topology-based switch/cable calculations)</li>
                <li>Power infrastructure (dynamically sized generators, UPS)</li>
                <li>Cooling infrastructure (technology-specific rates)</li>
                <li>Datacenter infrastructure ($10M/MW)</li>
                <li>Software stack (dynamic pricing based on selection)</li>
                <li>Enterprise infrastructure (scaled components)</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">OPEX Calculation Components</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Power consumption (total MW × regional rate × 8760 hours)</li>
                <li>Cooling operations (15% liquid, 45% air of power cost)</li>
                <li>Staff & personnel (French market rates with scaling)</li>
                <li>Hardware maintenance (3-5% of hardware CAPEX)</li>
                <li>Storage operations ($0.015/GB/month)</li>
                <li>Network bandwidth ($600/GPU/year)</li>
                <li>Software licenses (dynamic based on stack)</li>
                <li>Enterprise infrastructure operations (scaled OPEX)</li>
              </ol>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">Key Assumptions & Validation</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>System Sizing:</strong> Based on vendor specifications (GB200: 72 GPUs/system)</li>
              <li>• <strong>Power Calculations:</strong> Include 30% infrastructure overhead</li>
              <li>• <strong>Network Scaling:</strong> Follows NVIDIA reference architectures</li>
              <li>• <strong>Enterprise Costs:</strong> Based on real deployment experience</li>
              <li>• <strong>Regional Variations:</strong> Validated against market data</li>
              <li>• <strong>Scaling Factors:</strong> Derived from operational complexity analysis</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Best Practices Section */}
      <Section id="best-practices" title="Usage Best Practices" icon={CheckCircle}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Follow these best practices to get accurate and actionable results from the calculator.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">✅ Do This</h4>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Start with realistic utilization rates (70-90%)</li>
                <li>• Include enterprise infrastructure for production deployments</li>
                <li>• Consider regional power costs and regulations</li>
                <li>• Plan for proper service tier distribution</li>
                <li>• Account for scaling complexity in large deployments</li>
                <li>• Validate results against vendor quotes</li>
                <li>• Consider 3-5 year technology refresh cycles</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3">❌ Avoid This</h4>
              <ul className="text-sm text-red-800 space-y-2">
                <li>• Don't ignore enterprise infrastructure costs</li>
                <li>• Don't assume 100% utilization for planning</li>
                <li>• Don't overlook regional cost variations</li>
                <li>• Don't underestimate operational complexity</li>
                <li>• Don't skip disaster recovery planning</li>
                <li>• Don't ignore compliance requirements</li>
                <li>• Don't forget about staff scaling needs</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Scenario Planning Recommendations</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Conservative Scenario:</strong> 70% utilization, air cooling, 2:1 oversubscription</p>
              <p><strong>Optimistic Scenario:</strong> 90% utilization, liquid cooling, 1:1 oversubscription</p>
              <p><strong>Enterprise Scenario:</strong> Include all security, backup, and compliance components</p>
              <p><strong>Growth Planning:</strong> Model 2x and 5x scale scenarios for future expansion</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Limitations Section */}
      <Section id="limitations" title="Calculator Limitations & Disclaimers" icon={AlertCircle}>
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">Important Disclaimers</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Estimates based on public pricing and industry benchmarks</li>
              <li>• Actual costs may vary based on volume discounts and negotiations</li>
              <li>• Regional variations may not reflect all local factors</li>
              <li>• Technology and pricing subject to rapid change</li>
              <li>• Enterprise infrastructure costs are estimates for planning purposes</li>
              <li>• Consult with vendors and system integrators for detailed quotes</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">Known Limitations</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Does not include site preparation and construction costs</li>
              <li>• Assumes standard datacenter environments</li>
              <li>• May not reflect all compliance-specific requirements</li>
              <li>• Software licensing costs are estimates</li>
              <li>• Does not include financing costs or tax implications</li>
              <li>• Operational complexity may vary by organization</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-600 italic">
            This calculator is designed for planning and budgeting purposes. For production deployments, 
            engage with qualified system integrators and vendors for detailed design and accurate pricing.
          </p>
        </div>
      </Section>
    </div>
  );
};
