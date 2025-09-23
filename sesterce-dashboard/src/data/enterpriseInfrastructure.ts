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

  // Enterprise Security Infrastructure
  {
    id: 'firewalls_perimeter',
    name: 'Perimeter Firewalls',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 500000, // High-throughput firewalls
    annualCost: 100000, // Licenses, support
    description: 'High-performance perimeter firewalls (100G+ throughput)',
    vendor: 'Palo Alto/Fortinet/Checkpoint',
    mandatory: true
  },
  {
    id: 'firewalls_internal',
    name: 'Internal Segmentation Firewalls',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 300000,
    annualCost: 75000,
    description: 'Internal network segmentation and micro-segmentation',
    mandatory: true
  },
  {
    id: 'packet_inspection',
    name: 'Deep Packet Inspection (DPI)',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 800000,
    annualCost: 200000,
    description: 'Network traffic analysis, threat detection, compliance monitoring',
    vendor: 'Gigamon/Ixia/Netscout',
    mandatory: true
  },
  {
    id: 'ids_ips',
    name: 'Intrusion Detection/Prevention',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 400000,
    annualCost: 120000,
    description: 'Network and host-based intrusion detection and prevention',
    vendor: 'Snort/Suricata/Splunk',
    mandatory: true
  },
  {
    id: 'siem_platform',
    name: 'SIEM Platform',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 300000,
    annualCost: 400000, // High licensing costs
    description: 'Security information and event management platform',
    vendor: 'Splunk/QRadar/ArcSight',
    mandatory: true
  },

  // PKI and Certificate Management
  {
    id: 'pki_infrastructure',
    name: 'PKI Infrastructure',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 150000,
    annualCost: 50000,
    description: 'Public key infrastructure, certificate authority, HSMs',
    vendor: 'Entrust/DigiCert/Venafi',
    mandatory: true
  },
  {
    id: 'certificate_management',
    name: 'Certificate Lifecycle Management',
    category: 'security_infrastructure',
    costModel: 'per_cluster',
    baseCost: 100000,
    annualCost: 80000,
    description: 'Automated certificate provisioning, rotation, monitoring',
    vendor: 'Venafi/Keyfactor',
    mandatory: true
  },

  // Backup and Disaster Recovery
  {
    id: 'backup_infrastructure',
    name: 'Backup Infrastructure',
    category: 'backup_dr',
    costModel: 'per_cluster',
    baseCost: 2000000, // Backup appliances, tape libraries
    annualCost: 400000, // Tape media, cloud storage
    description: 'Enterprise backup systems, tape libraries, cloud backup',
    vendor: 'Veeam/Commvault/NetBackup',
    mandatory: true
  },
  {
    id: 'disaster_recovery_site',
    name: 'Disaster Recovery Site',
    category: 'backup_dr',
    costModel: 'per_cluster',
    baseCost: 5000000, // Secondary site setup
    annualCost: 1000000, // Site operations, replication
    description: 'Secondary datacenter for disaster recovery and business continuity',
    mandatory: false
  },
  {
    id: 'backup_network',
    name: 'Backup Network Infrastructure',
    category: 'backup_dr',
    costModel: 'per_cluster',
    baseCost: 500000,
    annualCost: 100000,
    description: 'Dedicated backup network, WAN acceleration, replication links',
    mandatory: true
  },

  // Cloud Platform Infrastructure
  {
    id: 'kafka_cluster',
    name: 'Apache Kafka Cluster',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 300000, // Kafka nodes, ZooKeeper
    annualCost: 150000, // Support, monitoring
    description: 'Message streaming platform for data pipelines and event processing',
    vendor: 'Confluent/Apache',
    mandatory: true
  },
  {
    id: 'spark_cluster',
    name: 'Apache Spark Cluster',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 400000, // Spark nodes, HDFS storage
    annualCost: 200000,
    description: 'Big data processing and analytics platform',
    vendor: 'Databricks/Apache',
    mandatory: true
  },
  {
    id: 'elasticsearch_cluster',
    name: 'Elasticsearch/OpenSearch Cluster',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 250000,
    annualCost: 180000,
    description: 'Search and analytics engine for logs, metrics, and data',
    vendor: 'Elastic/AWS',
    mandatory: true
  },
  {
    id: 'redis_cluster',
    name: 'Redis Cluster',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 150000,
    annualCost: 100000,
    description: 'In-memory data structure store for caching and session management',
    vendor: 'Redis Labs',
    mandatory: true
  },
  {
    id: 'postgresql_cluster',
    name: 'PostgreSQL HA Cluster',
    category: 'platform_services',
    costModel: 'per_cluster',
    baseCost: 200000,
    annualCost: 120000,
    description: 'High-availability relational database cluster',
    vendor: 'PostgreSQL/EnterpriseDB',
    mandatory: true
  },

  // Network Management and Orchestration
  {
    id: 'ufm_platform',
    name: 'UFM (Unified Fabric Manager)',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 200000,
    annualCost: 100000,
    description: 'InfiniBand fabric management and monitoring platform',
    vendor: 'NVIDIA/Mellanox',
    mandatory: false // Only for InfiniBand deployments
  },
  {
    id: 'netris_platform',
    name: 'Netris Network Automation',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 300000,
    annualCost: 150000,
    description: 'Network automation, orchestration, and intent-based networking',
    vendor: 'Netris',
    mandatory: false
  },
  {
    id: 'network_monitoring',
    name: 'Network Monitoring Platform',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 400000,
    annualCost: 200000,
    description: 'Comprehensive network monitoring, analytics, and troubleshooting',
    vendor: 'SolarWinds/PRTG/Datadog',
    mandatory: true
  },
  {
    id: 'network_automation',
    name: 'Network Configuration Management',
    category: 'network_management',
    costModel: 'per_cluster',
    baseCost: 250000,
    annualCost: 125000,
    description: 'Automated network configuration, compliance, and change management',
    vendor: 'Ansible/Napalm/Nornir',
    mandatory: true
  },

  // Monitoring and Observability
  {
    id: 'prometheus_grafana',
    name: 'Prometheus/Grafana Stack',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 200000,
    annualCost: 150000,
    description: 'Metrics collection, storage, and visualization platform',
    vendor: 'Grafana Labs',
    mandatory: true
  },
  {
    id: 'jaeger_tracing',
    name: 'Distributed Tracing (Jaeger)',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 100000,
    annualCost: 75000,
    description: 'Distributed tracing for microservices and ML pipelines',
    vendor: 'Jaeger/CNCF',
    mandatory: true
  },
  {
    id: 'alertmanager',
    name: 'Alert Management Platform',
    category: 'monitoring',
    costModel: 'per_cluster',
    baseCost: 150000,
    annualCost: 100000,
    description: 'Intelligent alerting, escalation, and incident management',
    vendor: 'PagerDuty/Opsgenie',
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
