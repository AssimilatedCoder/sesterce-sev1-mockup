// Comprehensive validation rules for the GPU cluster calculator
// Validates service tiers, infrastructure requirements, and financial metrics

import { 
  ServiceTierConfig, 
  StorageRequirements, 
  InfrastructureRequirements 
} from './workloadPerformanceCalculations';
import { EnhancedTCOResults } from './enhancedTCOCalculations';

export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  category: 'service_tiers' | 'storage' | 'infrastructure' | 'financial' | 'performance';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation?: string;
  affectedComponent?: string;
}

export interface ValidationSummary {
  isValid: boolean;
  errors: ValidationResult[];
  warnings: ValidationResult[];
  infos: ValidationResult[];
  criticalIssues: number;
  totalIssues: number;
}

/**
 * Validate service tier configuration
 */
export function validateServiceTiers(serviceTiers: ServiceTierConfig[], totalGPUs: number): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check if service tier percentages sum to 100%
  const totalClusterPercent = serviceTiers.reduce((sum, tier) => sum + tier.clusterPercent, 0);
  if (Math.abs(totalClusterPercent - 100) > 0.1) {
    results.push({
      type: 'error',
      category: 'service_tiers',
      message: `Service tier percentages must sum to 100% (currently ${totalClusterPercent.toFixed(1)}%)`,
      severity: 'critical',
      recommendation: 'Adjust the cluster allocation sliders to total exactly 100%',
      affectedComponent: 'ServiceTierConfiguration'
    });
  }

  // Check individual tier workload splits
  serviceTiers.forEach(tier => {
    if (Math.abs(tier.trainingPercent + tier.inferencePercent - 100) > 0.1) {
      results.push({
        type: 'error',
        category: 'service_tiers',
        message: `${tier.name}: Training + Inference must sum to 100% (currently ${(tier.trainingPercent + tier.inferencePercent).toFixed(1)}%)`,
        severity: 'high',
        recommendation: 'Adjust the workload split sliders for this tier',
        affectedComponent: 'ServiceTierConfiguration'
      });
    }
  });

  // Performance warnings based on workload mix
  const totalTrainingPercent = serviceTiers.reduce((sum, tier) => 
    sum + (tier.clusterPercent / 100) * (tier.trainingPercent / 100), 0) * 100;

  if (totalTrainingPercent > 80) {
    results.push({
      type: 'warning',
      category: 'service_tiers',
      message: `High training workload (${totalTrainingPercent.toFixed(1)}%) will require significant high-performance storage investment`,
      severity: 'medium',
      recommendation: 'Consider if some training workloads could use high-performance tiers instead of extreme performance',
      affectedComponent: 'ServiceTierConfiguration'
    });
  }

  if (totalTrainingPercent < 20) {
    results.push({
      type: 'warning',
      category: 'service_tiers',
      message: `Low training workload (${totalTrainingPercent.toFixed(1)}%) may indicate over-provisioned storage performance tiers`,
      severity: 'low',
      recommendation: 'Consider cost-optimized storage tiers for inference-heavy workloads',
      affectedComponent: 'ServiceTierConfiguration'
    });
  }

  // Check for unrealistic service tier distributions
  const extremeTier = serviceTiers.find(t => t.trainingPercent > 90);
  if (extremeTier && extremeTier.clusterPercent > 50) {
    results.push({
      type: 'warning',
      category: 'service_tiers',
      message: `${extremeTier.name} has >90% training workload and >50% cluster allocation - this is very expensive`,
      severity: 'medium',
      recommendation: 'Consider balancing workload types or reducing cluster allocation for cost optimization',
      affectedComponent: 'ServiceTierConfiguration'
    });
  }

  // MLOps-specific validations
  const mlOpsTier = serviceTiers.find(t => t.type === 'managedMLOps');
  if (mlOpsTier) {
    const mlOpsGPUs = (mlOpsTier.clusterPercent / 100) * totalGPUs;
    
    // Check if MLOps tier has sufficient scale
    if (mlOpsGPUs < 100 && mlOpsGPUs > 0) {
      results.push({
        type: 'warning',
        category: 'service_tiers',
        message: 'MLOps platform has overhead; consider minimum 100 GPUs for efficiency',
        severity: 'medium',
        recommendation: 'MLOps platforms have significant software and operational overhead that becomes cost-effective at larger scales',
        affectedComponent: 'ServiceTierConfiguration'
      });
    }
    
    // Check storage ratio for MLOps
    if (mlOpsTier.trainingPercent < 30) {
      results.push({
        type: 'info',
        category: 'service_tiers',
        message: 'Low training % for MLOps tier; consider Tier 4 (Inference) instead',
        severity: 'low',
        recommendation: 'MLOps platforms are optimized for training workflows with experiment tracking and model versioning',
        affectedComponent: 'ServiceTierConfiguration'
      });
    }
    
    if (mlOpsTier.trainingPercent > 75) {
      results.push({
        type: 'info',
        category: 'service_tiers',
        message: 'High training % for MLOps; customers might prefer Tier 2 (K8s) for more control',
        severity: 'low',
        recommendation: 'Very training-heavy workloads may benefit from direct Kubernetes access for custom optimization',
        affectedComponent: 'ServiceTierConfiguration'
      });
    }

    // Check for MLOps vs K8s tier balance
    const k8sTier = serviceTiers.find(t => t.type === 'orchestratedK8s');
    if (k8sTier && mlOpsTier.clusterPercent > k8sTier.clusterPercent * 2) {
      results.push({
        type: 'warning',
        category: 'service_tiers',
        message: 'MLOps tier significantly larger than K8s tier - verify target market alignment',
        severity: 'medium',
        recommendation: 'Ensure your customer base has sufficient demand for managed MLOps vs self-managed Kubernetes',
        affectedComponent: 'ServiceTierConfiguration'
      });
    }
  }

  // Check for balanced service category distribution
  const iaasTiers = serviceTiers.filter(t => t.serviceCategory === 'IaaS');
  const paasTiers = serviceTiers.filter(t => t.serviceCategory === 'PaaS');
  const saasTiers = serviceTiers.filter(t => t.serviceCategory === 'SaaS');
  
  const iaasPercent = iaasTiers.reduce((sum, t) => sum + t.clusterPercent, 0);
  const paasPercent = paasTiers.reduce((sum, t) => sum + t.clusterPercent, 0);
  const saasPercent = saasTiers.reduce((sum, t) => sum + t.clusterPercent, 0);

  if (paasPercent > 70) {
    results.push({
      type: 'info',
      category: 'service_tiers',
      message: `High PaaS allocation (${paasPercent.toFixed(1)}%) indicates platform-heavy business model`,
      severity: 'low',
      recommendation: 'Ensure sufficient operational expertise for managing multiple platform services',
      affectedComponent: 'ServiceTierConfiguration'
    });
  }

  return results;
}

/**
 * Validate storage requirements and architecture
 */
export function validateStorageRequirements(
  storageReqs: StorageRequirements,
  totalGPUs: number
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check if storage bandwidth requirements exceed realistic thresholds
  const bandwidthPerGPU = storageReqs.totalBandwidth / totalGPUs;
  if (bandwidthPerGPU > 5) { // >5 GB/s per GPU is very high
    results.push({
      type: 'warning',
      category: 'storage',
      message: `Very high bandwidth requirement: ${bandwidthPerGPU.toFixed(1)} GB/s per GPU`,
      severity: 'medium',
      recommendation: 'Verify if training workloads truly need this level of storage performance',
      affectedComponent: 'CalculatedStorageArchitecture'
    });
  }

  // Check IOPS requirements
  const iopsPerGPU = storageReqs.totalIOPS / totalGPUs;
  if (iopsPerGPU > 10000) { // >10K IOPS per GPU is high
    results.push({
      type: 'info',
      category: 'storage',
      message: `High IOPS requirement: ${(iopsPerGPU / 1000).toFixed(1)}K IOPS per GPU indicates inference-heavy workloads`,
      severity: 'low',
      recommendation: 'Ensure storage architecture includes high-IOPS tiers (NVMe, SSD)',
      affectedComponent: 'CalculatedStorageArchitecture'
    });
  }

  // Warn if inference-heavy workloads are allocated to extreme performance storage
  if (storageReqs.performanceTierDistribution.extreme > 30) {
    const extremePercent = storageReqs.performanceTierDistribution.extreme;
    results.push({
      type: 'warning',
      category: 'storage',
      message: `${extremePercent.toFixed(1)}% of storage allocated to extreme performance tier - verify if needed`,
      severity: 'medium',
      recommendation: 'Extreme performance storage is optimized for training; consider high-performance tiers for mixed workloads',
      affectedComponent: 'CalculatedStorageArchitecture'
    });
  }

  // Check raw storage multiplier
  if (storageReqs.rawStorageMultiplier > 2.5) {
    results.push({
      type: 'warning',
      category: 'storage',
      message: `High raw storage multiplier (${storageReqs.rawStorageMultiplier.toFixed(2)}x) indicates significant overhead`,
      severity: 'medium',
      recommendation: 'Consider erasure coding instead of replication to reduce storage overhead',
      affectedComponent: 'CalculatedStorageArchitecture'
    });
  }

  return results;
}

/**
 * Validate infrastructure requirements
 */
export function validateInfrastructureRequirements(
  infraReqs: InfrastructureRequirements,
  totalGPUs: number
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check power density
  const powerDensityPerRack = infraReqs.power.storagePowerKW / (infraReqs.power.additionalRacks || 1);
  if (powerDensityPerRack > 35) { // >35kW per rack is high density
    results.push({
      type: 'warning',
      category: 'infrastructure',
      message: `High power density: ${powerDensityPerRack.toFixed(1)} kW per rack exceeds typical datacenter capacity (35kW/rack)`,
      severity: 'high',
      recommendation: 'Consider liquid cooling or additional rack distribution to manage power density',
      affectedComponent: 'InfrastructureRequirements'
    });
  }

  // Check network bandwidth scaling
  const bandwidthPerGPU = (infraReqs.network.minimumBandwidth * 1000) / totalGPUs; // Convert Tb/s to Gb/s
  if (bandwidthPerGPU > 800) { // >800 Gb/s per GPU is very high
    results.push({
      type: 'warning',
      category: 'infrastructure',
      message: `Very high network bandwidth requirement: ${bandwidthPerGPU.toFixed(0)} Gb/s per GPU`,
      severity: 'medium',
      recommendation: 'Verify if workload mix truly requires this level of network performance',
      affectedComponent: 'InfrastructureRequirements'
    });
  }

  // Check software licensing costs
  const licensingPerGPU = (infraReqs.software.kubernetesLicense + infraReqs.software.monitoringStack) / totalGPUs;
  if (licensingPerGPU > 200) { // >$200 per GPU for software is high
    results.push({
      type: 'info',
      category: 'infrastructure',
      message: `High software licensing cost: $${licensingPerGPU.toFixed(0)} per GPU annually`,
      severity: 'low',
      recommendation: 'Consider open-source alternatives or negotiate volume discounts for large deployments',
      affectedComponent: 'InfrastructureRequirements'
    });
  }

  return results;
}

/**
 * Validate financial metrics and TCO results
 */
export function validateFinancialMetrics(
  tcoResults: EnhancedTCOResults,
  totalGPUs: number
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check ROI
  if (tcoResults.revenueModel.grossMargin < 0) {
    results.push({
      type: 'error',
      category: 'financial',
      message: `Negative gross margin (${tcoResults.revenueModel.grossMargin.toFixed(1)}%) indicates unprofitable configuration`,
      severity: 'critical',
      recommendation: 'Increase service tier pricing or reduce infrastructure costs',
      affectedComponent: 'EnhancedTCOResults'
    });
  } else if (tcoResults.revenueModel.grossMargin < 20) {
    results.push({
      type: 'warning',
      category: 'financial',
      message: `Low gross margin (${tcoResults.revenueModel.grossMargin.toFixed(1)}%) provides little operational flexibility`,
      severity: 'high',
      recommendation: 'Target 30%+ gross margin for sustainable infrastructure services',
      affectedComponent: 'EnhancedTCOResults'
    });
  }

  // Check payback period
  if (tcoResults.revenueModel.paybackPeriod > 5) {
    results.push({
      type: 'warning',
      category: 'financial',
      message: `Long payback period (${tcoResults.revenueModel.paybackPeriod.toFixed(1)} years) may indicate poor investment`,
      severity: 'medium',
      recommendation: 'Consider optimizing service tier pricing or reducing CAPEX',
      affectedComponent: 'EnhancedTCOResults'
    });
  }

  // Check TCO per GPU reasonableness
  if (tcoResults.tco.perGPU > 200000) { // >$200K per GPU over 5 years is very high
    results.push({
      type: 'warning',
      category: 'financial',
      message: `Very high TCO per GPU: ${(tcoResults.tco.perGPU / 1000).toFixed(0)}K over 5 years`,
      severity: 'medium',
      recommendation: 'Review storage and infrastructure requirements for cost optimization opportunities',
      affectedComponent: 'EnhancedTCOResults'
    });
  }

  // Check storage cost proportion
  const storageProportion = (tcoResults.capex.calculatedStorage / tcoResults.capex.total) * 100;
  if (storageProportion > 40) {
    results.push({
      type: 'info',
      category: 'financial',
      message: `Storage represents ${storageProportion.toFixed(1)}% of total CAPEX - higher than typical 20-30%`,
      severity: 'low',
      recommendation: 'Consider if storage performance requirements can be optimized',
      affectedComponent: 'EnhancedTCOResults'
    });
  }

  return results;
}

/**
 * Comprehensive validation of entire configuration
 */
export function validateConfiguration(
  serviceTiers: ServiceTierConfig[],
  storageRequirements: StorageRequirements,
  infrastructureRequirements: InfrastructureRequirements,
  tcoResults: EnhancedTCOResults,
  totalGPUs: number
): ValidationSummary {
  const allResults: ValidationResult[] = [
    ...validateServiceTiers(serviceTiers, totalGPUs),
    ...validateStorageRequirements(storageRequirements, totalGPUs),
    ...validateInfrastructureRequirements(infrastructureRequirements, totalGPUs),
    ...validateFinancialMetrics(tcoResults, totalGPUs)
  ];

  const errors = allResults.filter(r => r.type === 'error');
  const warnings = allResults.filter(r => r.type === 'warning');
  const infos = allResults.filter(r => r.type === 'info');
  const criticalIssues = allResults.filter(r => r.severity === 'critical').length;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    infos,
    criticalIssues,
    totalIssues: allResults.length
  };
}

/**
 * Get validation status color for UI
 */
export function getValidationStatusColor(summary: ValidationSummary): string {
  if (summary.criticalIssues > 0) return 'red';
  if (summary.errors.length > 0) return 'red';
  if (summary.warnings.length > 0) return 'yellow';
  return 'green';
}

/**
 * Get validation status message for UI
 */
export function getValidationStatusMessage(summary: ValidationSummary): string {
  if (summary.criticalIssues > 0) {
    return `${summary.criticalIssues} critical issue${summary.criticalIssues > 1 ? 's' : ''} found`;
  }
  if (summary.errors.length > 0) {
    return `${summary.errors.length} error${summary.errors.length > 1 ? 's' : ''} found`;
  }
  if (summary.warnings.length > 0) {
    return `${summary.warnings.length} warning${summary.warnings.length > 1 ? 's' : ''} found`;
  }
  if (summary.infos.length > 0) {
    return `Configuration looks good (${summary.infos.length} info note${summary.infos.length > 1 ? 's' : ''})`;
  }
  return 'Configuration validated successfully';
}
