// Enterprise Infrastructure Components and Costs

export interface InfrastructureComponent {
  id: string;
  name: string;
  category: string;
  costModel: 'per_gpu' | 'per_node' | 'per_rack' | 'per_cluster' | 'per_tb' | 'per_gbps';
  baseCost: number;
  annualCost?: number;
  scalingFactor?: number;
  description: string;
  vendor?: string;
  mandatory: boolean;
}

export const enterpriseInfrastructure: InfrastructureComponent[] = [
  // Complete Server Hardware (missing from current calculator)
  {
    id: 'server_chassis_gb200',
    name: 'GB200 NVL72 Server Chassis',
    category: 'compute_hardware',
    costModel: 'per_rack',
    baseCost: 150000, // Chassis, power supplies, cooling
    description: 'Complete server chassis with power supplies, fans, management controllers',
    vendor: 'NVIDIA/OEM',
    mandatory: true
  },
  {
    id: 'server_memory_gb200',
    name: 'System Memory (DDR5)',
    category: 'compute_hardware',
    costModel: 'per_rack',
    baseCost: 280000, // ~4TB DDR5 per NVL72 rack
    description: 'High-bandwidth DDR5 memory for Grace CPUs (4TB per rack)',
    vendor: 'Samsung/Micron/SK Hynix',
    mandatory: true
  },
  {
    id: 'server_storage_boot',
    name: 'Boot Storage (NVMe)',
    category: 'compute_hardware',
    costModel: 'per_rack',
    baseCost: 25000, // Boot drives per rack
    description: 'NVMe boot drives and local storage for OS and containers',
    vendor: 'Samsung/Intel',
    mandatory: true
  },
  {
    id: 'server_management',
    name: 'Server Management (BMC/IPMI)',
    category: 'compute_hardware',
    costModel: 'per_rack',
    baseCost: 15000,
    annualCost: 3000,
    description: 'Baseboard management controllers, IPMI, remote management',
    vendor: 'ASPEED/Nuvoton',
    mandatory: true
  },

  // FTE Requirements for Operations (Updated with French market rates)
  {
    id: 'fte_datacenter_technicians',
    name: 'Datacenter Technicians',
    category: 'operations_fte',
    costModel: 'per_cluster',
    baseCost: 0,
    annualCost: 720000, // 8 FTEs @ €90k total cost each (24/7 coverage, French labor costs)
    scalingFactor: 0.15, // +15% per 10k GPUs (more technicians needed for larger clusters)
    description: 'On-site hardware technicians for maintenance, repairs, installations (€62k gross + 45% employer charges)',
    mandatory: true
  },
  {
    id: 'fte_network_engineers',
    name: 'Network Operations Engineers',
    category: 'operations_fte',
    costModel: 'per_cluster',
    baseCost: 0,
    annualCost: 870000, // 6 FTEs @ €145k total cost each (French senior engineer rates)
    scalingFactor: 0.08,
    description: 'Network configuration, monitoring, troubleshooting, capacity planning (€100k gross + 45% charges)',
    mandatory: true
  },
  {
    id: 'fte_storage_engineers',
    name: 'Storage Operations Engineers',
    category: 'operations_fte',
    costModel: 'per_cluster',
    baseCost: 0,
    annualCost: 725000, // 5 FTEs @ €145k total cost each
    scalingFactor: 0.05,
    description: 'Storage system management, backup operations, capacity planning (€100k gross + 45% charges)',
    mandatory: true
  },
  {
    id: 'fte_security_engineers',
    name: 'Security Operations Engineers',
    category: 'operations_fte',
    costModel: 'per_cluster',
    baseCost: 0,
    annualCost: 870000, // 6 FTEs @ €145k total cost each (security premium)
    scalingFactor: 0.04,
    description: 'Security monitoring, incident response, compliance management (€100k gross + 45% charges)',
    mandatory: true
  },
  {
    id: 'fte_platform_engineers',
    name: 'Platform/DevOps Engineers',
    category: 'operations_fte',
    costModel: 'per_cluster',
    baseCost: 0,
    annualCost: 1160000, // 8 FTEs @ €145k total cost each (high demand skills)
    scalingFactor: 0.12,
    description: 'Kubernetes, CI/CD, automation, monitoring, user support (€100k gross + 45% charges)',
    mandatory: true
  },

  // Power Infrastructure Consumables (Dynamically sized based on cluster power)
  {
    id: 'diesel_generators',
    name: 'Backup Diesel Generators (N+1)',
    category: 'power_backup',
    costModel: 'per_rack', // Scale with power requirements
    baseCost: 35000, // €35k per MW capacity (N+1 redundancy included)
    annualCost: 2100, // 6% annual maintenance per MW
    description: 'Diesel generator sets sized for N+1 redundancy (120kW per rack + 20% overhead)',
    vendor: 'Caterpillar/Cummins/MTU',
    mandatory: true
  },
  {
    id: 'diesel_fuel_storage',
    name: 'Diesel Fuel Storage & Supply',
    category: 'power_backup',
    costModel: 'per_rack',
    baseCost: 8000, // €8k per rack (72-hour fuel storage)
    annualCost: 3600, // €3.6k per rack annual fuel costs (testing, delivery, consumption)
    description: 'Fuel storage tanks for 72-hour runtime, supply contracts, monthly testing',
    mandatory: true
  },
  {
    id: 'ups_batteries',
    name: 'UPS Battery Systems',
    category: 'power_backup',
    costModel: 'per_rack',
    baseCost: 25000, // €25k per rack (15-minute runtime)
    annualCost: 5000, // €5k per rack (battery replacement every 5 years + maintenance)
    description: 'UPS systems with 15-minute battery backup per rack (120kW capacity)',
    vendor: 'APC/Eaton/Vertiv/Schneider',
    mandatory: true
  },
  {
    id: 'power_distribution',
    name: 'Power Distribution Units (PDUs)',
    category: 'power_backup',
    costModel: 'per_rack',
    baseCost: 15000, // €15k per rack (redundant PDUs, monitoring)
    annualCost: 1000, // €1k per rack maintenance
    description: 'Intelligent PDUs with monitoring, dual-feed redundancy per rack',
    vendor: 'APC/Eaton/Raritan',
    mandatory: true
  },
  {
    id: 'power_monitoring',
    name: 'Power Monitoring & Management',
    category: 'power_backup',
    costModel: 'per_cluster',
    baseCost: 300000, // Base monitoring infrastructure
    annualCost: 75000, // Software licenses, support
    description: 'Centralized power quality monitoring, load balancing, automated transfer switches',
    vendor: 'Schneider Electric/Eaton/ABB',
    mandatory: true
  },

  // Enterprise Security Infrastructure (Scaled for cluster size)
  {
    id: 'firewalls_perimeter',
    name: 'Perimeter Firewalls (HA)',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 800000, // High-throughput firewalls with HA
    annualCost: 160000, // Licenses, support (20% annual)
    scalingFactor: 0.02, // +2% per 10k GPUs for additional throughput
    description: 'High-performance perimeter firewalls (400G+ throughput, HA pair)',
    vendor: 'Palo Alto PA-7080/Fortinet FG-6300F/Checkpoint 26000',
    mandatory: true
  },
  {
    id: 'firewalls_internal',
    name: 'Internal Segmentation Firewalls',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 450000, // Multiple internal firewalls
    annualCost: 90000, // 20% annual maintenance
    scalingFactor: 0.03, // +3% per 10k GPUs for more segments
    description: 'Internal network segmentation and micro-segmentation (VM-Series/virtual)',
    vendor: 'Palo Alto VM-Series/Fortinet FortiGate-VM',
    mandatory: true
  },
  {
    id: 'packet_inspection',
    name: 'Deep Packet Inspection (DPI)',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 1200000, // High-end DPI appliances
    annualCost: 300000, // Software licenses, support
    scalingFactor: 0.05, // +5% per 10k GPUs for traffic volume
    description: 'Network traffic analysis, threat detection, compliance monitoring (100G+ capacity)',
    vendor: 'Gigamon GigaVUE/Ixia Vision/Netscout nGeniusONE',
    mandatory: true
  },
  {
    id: 'ids_ips',
    name: 'Intrusion Detection/Prevention',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 600000, // Enterprise IDS/IPS systems
    annualCost: 180000, // Signatures, support
    scalingFactor: 0.04, // +4% per 10k GPUs
    description: 'Network and host-based intrusion detection and prevention (high-throughput)',
    vendor: 'Snort3/Suricata/Splunk Attack Analyzer',
    mandatory: true
  },
  {
    id: 'siem_platform',
    name: 'SIEM Platform (Enterprise)',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 500000, // SIEM infrastructure
    annualCost: 800000, // High licensing costs (data ingestion based)
    scalingFactor: 0.08, // +8% per 10k GPUs (more logs)
    description: 'Security information and event management platform (enterprise scale)',
    vendor: 'Splunk Enterprise Security/IBM QRadar/Micro Focus ArcSight',
    mandatory: true
  },
  {
    id: 'security_orchestration',
    name: 'SOAR Platform',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 300000,
    annualCost: 150000,
    scalingFactor: 0.02,
    description: 'Security Orchestration, Automation and Response platform',
    vendor: 'Phantom/Demisto/Swimlane',
    mandatory: true
  },

  // PKI and Certificate Management
  {
    id: 'pki_infrastructure',
    name: 'PKI Infrastructure (Enterprise)',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 250000, // HSMs, CA infrastructure
    annualCost: 75000, // Maintenance, certificates
    scalingFactor: 0.01, // +1% per 10k GPUs
    description: 'Public key infrastructure, certificate authority, HSMs (enterprise grade)',
    vendor: 'Entrust PKI/DigiCert CertCentral/Venafi TPP',
    mandatory: true
  },
  {
    id: 'certificate_management',
    name: 'Certificate Lifecycle Management',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 180000,
    annualCost: 120000, // High automation licensing
    scalingFactor: 0.02,
    description: 'Automated certificate provisioning, rotation, monitoring (enterprise scale)',
    vendor: 'Venafi Trust Protection Platform/Keyfactor Command',
    mandatory: true
  },

  // Backup and Disaster Recovery (Scaled for data volume)
  {
    id: 'backup_infrastructure',
    name: 'Enterprise Backup Infrastructure',
    category: 'backup_dr',
    costModel: 'per_cluster',
    baseCost: 3000000, // Backup appliances, dedup, tape libraries
    annualCost: 600000, // Tape media, cloud storage, licenses
    scalingFactor: 0.15, // +15% per 10k GPUs (more data)
    description: 'Enterprise backup systems with deduplication, tape libraries, cloud backup',
    vendor: 'Veeam Backup & Replication/Commvault/Veritas NetBackup',
    mandatory: true
  },
  {
    id: 'disaster_recovery_site',
    name: 'Disaster Recovery Site (Hot Standby)',
    category: 'backup_dr',
    costModel: 'per_cluster',
    baseCost: 8000000, // Secondary site setup (20% of primary)
    annualCost: 2000000, // Site operations, replication, staff
    scalingFactor: 0.20, // +20% per 10k GPUs (proportional DR capacity)
    description: 'Hot standby datacenter for disaster recovery and business continuity',
    vendor: 'Multi-vendor (mirrors primary site)',
    mandatory: false
  },
  {
    id: 'backup_network',
    name: 'Backup Network Infrastructure',
    category: 'backup_dr',
    costModel: 'per_cluster',
    baseCost: 800000, // Dedicated backup network
    annualCost: 160000, // WAN links, acceleration appliances
    scalingFactor: 0.10, // +10% per 10k GPUs (more backup traffic)
    description: 'Dedicated backup network, WAN acceleration, replication links (10G+ capacity)',
    vendor: 'Riverbed/Silver Peak/Cisco',
    mandatory: true
  },
  {
    id: 'backup_storage',
    name: 'Backup Storage (Disk + Tape)',
    category: 'backup_dr',
    costModel: 'per_cluster',
    baseCost: 1500000, // Backup storage arrays
    annualCost: 300000, // Storage maintenance, tape media
    scalingFactor: 0.25, // +25% per 10k GPUs (backup data grows significantly)
    description: 'Backup storage arrays, tape libraries, long-term retention',
    vendor: 'Dell EMC Data Domain/HPE StoreOnce/IBM TS4500',
    mandatory: true
  },

  // Cloud Platform Infrastructure (Scaled for AI/ML workloads)
  {
    id: 'kafka_cluster',
    name: 'Apache Kafka Cluster (HA)',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 500000, // Kafka nodes, ZooKeeper, Schema Registry
    annualCost: 250000, // Confluent Platform licenses, support
    scalingFactor: 0.08, // +8% per 10k GPUs (more data streams)
    description: 'High-throughput message streaming platform for ML data pipelines and event processing',
    vendor: 'Confluent Platform/Apache Kafka',
    mandatory: true
  },
  {
    id: 'spark_cluster',
    name: 'Apache Spark Cluster (GPU-enabled)',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 800000, // Spark nodes with GPU support, HDFS
    annualCost: 400000, // Databricks/support licenses
    scalingFactor: 0.12, // +12% per 10k GPUs (more compute nodes)
    description: 'GPU-accelerated big data processing and ML training platform',
    vendor: 'Databricks Runtime ML/Apache Spark with Rapids',
    mandatory: true
  },
  {
    id: 'elasticsearch_cluster',
    name: 'Elasticsearch/OpenSearch Cluster',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 400000, // ES cluster with ML features
    annualCost: 300000, // Elastic Stack licenses
    scalingFactor: 0.10, // +10% per 10k GPUs (more logs/metrics)
    description: 'Search and analytics engine for logs, metrics, ML model monitoring',
    vendor: 'Elastic Stack/OpenSearch with ML Commons',
    mandatory: true
  },
  {
    id: 'redis_cluster',
    name: 'Redis Enterprise Cluster',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 300000, // Redis Enterprise with modules
    annualCost: 200000, // Enterprise licenses
    scalingFactor: 0.06, // +6% per 10k GPUs (more caching needs)
    description: 'In-memory data store with ML modules for feature stores and caching',
    vendor: 'Redis Enterprise with RedisAI/RedisML',
    mandatory: true
  },
  {
    id: 'postgresql_cluster',
    name: 'PostgreSQL HA Cluster (ML-optimized)',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 350000, // PostgreSQL with ML extensions
    annualCost: 210000, // EnterpriseDB licenses, support
    scalingFactor: 0.04, // +4% per 10k GPUs
    description: 'High-availability relational database with ML extensions (pgvector, MADlib)',
    vendor: 'EnterpriseDB/PostgreSQL with ML extensions',
    mandatory: true
  },
  {
    id: 'mlflow_platform',
    name: 'MLflow Enterprise Platform',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 400000, // MLflow tracking, registry, serving
    annualCost: 300000, // Databricks MLflow licenses
    scalingFactor: 0.15, // +15% per 10k GPUs (more ML experiments)
    description: 'ML lifecycle management platform for experiment tracking and model registry',
    vendor: 'Databricks MLflow/Open Source MLflow',
    mandatory: true
  },
  {
    id: 'kubeflow_platform',
    name: 'Kubeflow ML Platform',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 300000, // Kubeflow pipelines, notebooks
    annualCost: 150000, // Support, additional components
    scalingFactor: 0.10, // +10% per 10k GPUs
    description: 'Kubernetes-native ML platform for pipelines, training, and serving',
    vendor: 'Google Cloud AI Platform/Open Source Kubeflow',
    mandatory: true
  },

  // Network Management and Orchestration (Scaled for cluster complexity)
  {
    id: 'ufm_platform',
    name: 'UFM (Unified Fabric Manager) Enterprise',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 400000, // UFM Enterprise with advanced features
    annualCost: 200000, // Support, updates
    scalingFactor: 0.05, // +5% per 10k GPUs (more fabric complexity)
    description: 'InfiniBand fabric management, monitoring, and optimization platform (enterprise)',
    vendor: 'NVIDIA UFM Enterprise/Mellanox',
    mandatory: false // Only for InfiniBand deployments
  },
  {
    id: 'netris_platform',
    name: 'Netris Network Automation Platform',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 500000, // Netris Controller, agents
    annualCost: 250000, // Licenses, support
    scalingFactor: 0.06, // +6% per 10k GPUs (more switches to manage)
    description: 'Intent-based network automation, orchestration, and self-healing networking',
    vendor: 'Netris Systems',
    mandatory: false
  },
  {
    id: 'network_monitoring',
    name: 'Enterprise Network Monitoring',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 600000, // Comprehensive monitoring stack
    annualCost: 300000, // Licenses, support
    scalingFactor: 0.08, // +8% per 10k GPUs (more devices to monitor)
    description: 'Comprehensive network monitoring, analytics, AI-driven troubleshooting',
    vendor: 'SolarWinds NPM/Datadog Network Monitoring/ThousandEyes',
    mandatory: true
  },
  {
    id: 'network_automation',
    name: 'Network Configuration Management',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 400000, // Automation platform
    annualCost: 200000, // Red Hat Ansible licenses, support
    scalingFactor: 0.04, // +4% per 10k GPUs
    description: 'Automated network configuration, compliance, change management, GitOps',
    vendor: 'Red Hat Ansible Network/Napalm/Nornir',
    mandatory: true
  },
  {
    id: 'network_security_monitoring',
    name: 'Network Security Monitoring',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 500000, // NSM platform
    annualCost: 250000, // Licenses, threat intelligence
    scalingFactor: 0.06, // +6% per 10k GPUs (more traffic to analyze)
    description: 'Network security monitoring, threat hunting, traffic analysis',
    vendor: 'Zeek/Suricata/Security Onion',
    mandatory: true
  },
  {
    id: 'network_orchestration',
    name: 'SDN Controller Platform',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 350000, // SDN controllers
    annualCost: 175000, // Support, licenses
    scalingFactor: 0.05, // +5% per 10k GPUs
    description: 'Software-defined networking controllers for dynamic network provisioning',
    vendor: 'OpenDaylight/ONOS/Cisco ACI',
    mandatory: true
  },

  // Monitoring and Observability (Enterprise-scale)
  {
    id: 'prometheus_grafana',
    name: 'Prometheus/Grafana Enterprise Stack',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 400000, // Enterprise Grafana, HA Prometheus
    annualCost: 300000, // Grafana Enterprise licenses
    scalingFactor: 0.10, // +10% per 10k GPUs (more metrics)
    description: 'Enterprise metrics collection, storage, and visualization platform with HA',
    vendor: 'Grafana Labs Enterprise/Prometheus HA',
    mandatory: true
  },
  {
    id: 'jaeger_tracing',
    name: 'Distributed Tracing Platform',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 200000, // Jaeger with enterprise storage
    annualCost: 150000, // Support, storage costs
    scalingFactor: 0.08, // +8% per 10k GPUs (more traces)
    description: 'Distributed tracing for microservices, ML pipelines, and GPU workloads',
    vendor: 'Jaeger/OpenTelemetry/Zipkin',
    mandatory: true
  },
  {
    id: 'alertmanager',
    name: 'Enterprise Alert Management',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 300000, // PagerDuty/Opsgenie enterprise
    annualCost: 200000, // Enterprise licenses
    scalingFactor: 0.04, // +4% per 10k GPUs (more alert sources)
    description: 'Intelligent alerting, escalation, incident management with ML-driven insights',
    vendor: 'PagerDuty/Atlassian Opsgenie/Splunk On-Call',
    mandatory: true
  },
  {
    id: 'apm_platform',
    name: 'Application Performance Monitoring',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 350000, // APM platform
    annualCost: 280000, // Per-host licensing
    scalingFactor: 0.12, // +12% per 10k GPUs (more applications)
    description: 'Application performance monitoring for ML workloads and microservices',
    vendor: 'Datadog APM/New Relic/AppDynamics',
    mandatory: true
  },
  {
    id: 'log_management',
    name: 'Centralized Log Management',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 400000, // Log aggregation platform
    annualCost: 500000, // Data ingestion costs
    scalingFactor: 0.15, // +15% per 10k GPUs (exponential log growth)
    description: 'Centralized log collection, analysis, and retention for compliance',
    vendor: 'Splunk Enterprise/Elastic Stack/Sumo Logic',
    mandatory: true
  },
  {
    id: 'gpu_monitoring',
    name: 'GPU Monitoring & Analytics',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 250000, // Specialized GPU monitoring
    annualCost: 125000, // NVIDIA licenses, support
    scalingFactor: 0.20, // +20% per 10k GPUs (linear with GPU count)
    description: 'Specialized GPU utilization, memory, and performance monitoring',
    vendor: 'NVIDIA DCGM/Prometheus GPU Exporter/Run:AI',
    mandatory: true
  }
];

// Power sizing calculation based on actual cluster requirements
const calculatePowerRequirements = (gpuCount: number, rackCount: number, gpuModel: string) => {
  // Power consumption per GPU (including CPU, memory, networking)
  const gpuPowerMap: Record<string, number> = {
    'gb200': 1000, // 1000W per GB200 GPU (includes Grace CPU)
    'gb300': 1200, // 1200W per GB300 GPU
    'h100-sxm': 700, // 700W per H100 SXM
    'h100-pcie': 350, // 350W per H100 PCIe
    'a100-sxm': 400, // 400W per A100 SXM
    'a100-pcie': 250  // 250W per A100 PCIe
  };

  const gpuPower = gpuPowerMap[gpuModel] || 700; // Default to H100 SXM
  const totalGpuPower = (gpuCount * gpuPower) / 1000; // Convert to kW
  
  // Add infrastructure overhead (networking, storage, cooling, management)
  const infrastructureOverhead = totalGpuPower * 0.3; // 30% overhead
  const totalClusterPower = totalGpuPower + infrastructureOverhead; // kW
  
  // Convert to MW for generator sizing
  const totalClusterPowerMW = totalClusterPower / 1000;
  
  return {
    totalClusterPowerKW: totalClusterPower,
    totalClusterPowerMW: totalClusterPowerMW,
    gpuPowerKW: totalGpuPower,
    infrastructureOverheadKW: infrastructureOverhead
  };
};

export const calculateEnterpriseInfrastructureCosts = (
  gpuCount: number,
  rackCount: number,
  fabricType: string,
  includeOptional: boolean = false,
  gpuModel: string = 'gb200'
) => {
  let totalCapex = 0;
  let totalAnnualOpex = 0;
  const breakdown: Array<{
    component: InfrastructureComponent;
    capex: number;
    annualOpex: number;
    quantity: number;
    details?: string;
  }> = [];

  // Calculate power requirements for proper sizing
  const powerReqs = calculatePowerRequirements(gpuCount, rackCount, gpuModel);
  console.log('Debug - Power Requirements calculated:', powerReqs);

  enterpriseInfrastructure.forEach(component => {
    // Skip optional components if not requested
    if (!component.mandatory && !includeOptional) return;
    
    // Skip InfiniBand-specific components for Ethernet deployments
    if (component.id === 'ufm_platform' && fabricType !== 'infiniband') return;

    let quantity = 1;
    let capex = 0;
    let annualOpex = 0;
    let details = '';

    switch (component.costModel) {
      case 'per_gpu':
        quantity = gpuCount;
        break;
      case 'per_node':
        quantity = Math.ceil(gpuCount / 8); // Assuming 8 GPUs per node average
        break;
      case 'per_rack':
        quantity = rackCount;
        
        // Special handling for power infrastructure components
        if (component.id === 'diesel_generators') {
          // Size generators for N+1 redundancy (total power + 1 generator)
          const generatorSizeMW = 2.5; // Standard 2.5MW generator size
          const requiredGenerators = Math.ceil(powerReqs.totalClusterPowerMW / generatorSizeMW) + 1; // N+1
          quantity = requiredGenerators;
          details = `${requiredGenerators} x 2.5MW generators for ${powerReqs.totalClusterPowerMW.toFixed(1)}MW cluster (N+1)`;
        } else if (component.id === 'diesel_fuel_storage') {
          // Fuel storage scales with generator count and runtime requirements
          const generatorCount = Math.ceil(powerReqs.totalClusterPowerMW / 2.5) + 1;
          quantity = generatorCount;
          details = `72-hour fuel storage for ${generatorCount} generators`;
        } else if (component.id === 'ups_batteries') {
          // UPS systems scale with actual power requirements
          const upsCapacityMW = 1.0; // Standard 1MW UPS modules
          const requiredUPS = Math.ceil(powerReqs.totalClusterPowerMW / upsCapacityMW);
          quantity = requiredUPS;
          details = `${requiredUPS} x 1MW UPS modules for ${powerReqs.totalClusterPowerMW.toFixed(1)}MW cluster`;
        } else if (component.id === 'power_distribution') {
          // PDUs scale with rack count (already correct)
          details = `Redundant PDUs for ${rackCount} racks`;
        }
        break;
      case 'per_cluster':
        quantity = 1;
        // Apply scaling factor for large deployments
        if (component.scalingFactor) {
          const scalingMultiplier = 1 + (component.scalingFactor * Math.floor(gpuCount / 10000));
          quantity = scalingMultiplier;
          
          if (component.category === 'operations_fte') {
            details = `Scaled for ${gpuCount.toLocaleString()} GPUs (${scalingMultiplier.toFixed(2)}x base team)`;
          }
        }
        break;
    }

    capex = component.baseCost * quantity;
    annualOpex = (component.annualCost || 0) * quantity;

    totalCapex += capex;
    totalAnnualOpex += annualOpex;

    breakdown.push({
      component,
      capex,
      annualOpex,
      quantity,
      details
    });
  });

  return {
    totalCapex,
    totalAnnualOpex,
    breakdown,
    powerRequirements: powerReqs
  };
};
