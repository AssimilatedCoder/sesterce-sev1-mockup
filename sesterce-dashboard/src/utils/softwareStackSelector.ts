// Dynamic Software Stack Selection Logic

import {
  SoftwareStack,
  StackRequirements,
  OptimizedStack,
  Tradeoff,
  AlternativeOption,
  StackCostBreakdown,
  SupportLevel
} from '../types/softwareStack';
import { softwareStacks, softwareComponents } from '../data/softwareStackData';

export function recommendSoftwareStack(requirements: StackRequirements): SoftwareStack {
  // Decision tree for stack selection
  
  // Rule 1: Compliance drives certain choices
  if (requirements.complianceRequirements.includes('SecNumCloud')) {
    // Must use BytePlus or build compliant stack
    return softwareStacks.bytePlusStack;
  }
  
  // Rule 2: Budget constraints
  if (requirements.budget === 'low' && requirements.expertise === 'advanced') {
    return softwareStacks.hybridOpenStack;
  }
  
  if (requirements.budget === 'low' && requirements.expertise !== 'advanced') {
    // Low budget but not enough expertise for pure open source
    return softwareStacks.omniaStack;
  }
  
  // Rule 3: Support requirements
  if (requirements.supportNeeds === 'enterprise') {
    if (requirements.vendorPreference === 'nvidia') {
      return softwareStacks.nvidiaStack;
    }
    if (requirements.budget === 'high') {
      return softwareStacks.enterpriseStack;
    }
    return softwareStacks.omniaStack; // Enterprise support but budget conscious
  }
  
  // Rule 4: Multi-tenancy requirements
  if (requirements.multiTenancy && requirements.gpuCount > 500) {
    // BytePlus has built-in multi-tenancy
    if (requirements.complianceRequirements.length > 0) {
      return softwareStacks.bytePlusStack;
    }
    // Otherwise NVIDIA stack with Run:ai for advanced scheduling
    if (requirements.budget !== 'low') {
      return softwareStacks.nvidiaStack;
    }
  }
  
  // Rule 5: Performance requirements
  if (requirements.primaryUseCase === 'training' && requirements.budget !== 'low') {
    return softwareStacks.nvidiaStack;
  }
  
  // Rule 6: Default selections based on GPU count
  if (requirements.gpuCount >= 10000) {
    // Very large scale needs enterprise features
    return requirements.budget === 'high' 
      ? softwareStacks.enterpriseStack 
      : softwareStacks.omniaStack;
  }
  
  if (requirements.gpuCount >= 1000) {
    // Medium-large scale
    return requirements.supportNeeds === ('enterprise' as SupportLevel)
      ? softwareStacks.omniaStack
      : softwareStacks.hybridOpenStack;
  }
  
  // Small scale - optimize for cost
  return requirements.expertise === 'advanced'
    ? softwareStacks.hybridOpenStack
    : softwareStacks.omniaStack;
}

export function calculateStackCosts(
  stack: SoftwareStack,
  gpuCount: number,
  years: number = 3
): StackCostBreakdown {
  let upfrontCost = 0;
  let annualLicensing = 0;
  let annualSupport = 0;
  
  // Calculate component costs
  stack.components.forEach(component => {
    upfrontCost += component.setupCost;
    
    const annualCost = component.costPerGPUPerYear * gpuCount;
    
    if (component.includesSupport) {
      annualSupport += annualCost;
    } else {
      annualLicensing += annualCost;
    }
  });
  
  // Calculate operational costs (FTE salaries)
  const fteAnnualCost = 150000; // Average DevOps engineer salary
  const annualOperational = stack.requiredFTEs * fteAnnualCost;
  
  const totalAnnualCost = annualLicensing + annualSupport + annualOperational;
  const threeYearTCO = upfrontCost + (totalAnnualCost * 3);
  const fiveYearTCO = upfrontCost + (totalAnnualCost * 5);
  
  return {
    upfrontCost,
    annualLicensing,
    annualSupport,
    annualOperational,
    totalAnnualCost,
    threeYearTCO,
    fiveYearTCO,
    perGPUPerYear: totalAnnualCost / gpuCount
  };
}

export function optimizeStackSelection(
  requirements: StackRequirements
): OptimizedStack {
  const recommendedStack = recommendSoftwareStack(requirements);
  const costs = calculateStackCosts(recommendedStack, requirements.gpuCount);
  
  // Analyze tradeoffs
  const tradeoffs = analyzeTradeoffs(recommendedStack, requirements);
  
  // Find alternative options
  const alternatives = findAlternatives(recommendedStack, requirements);
  
  return {
    stack: recommendedStack,
    totalCost: costs.threeYearTCO,
    annualCost: costs.totalAnnualCost,
    perGPUCost: costs.perGPUPerYear,
    tradeoffs,
    alternativeOptions: alternatives
  };
}

function analyzeTradeoffs(
  currentStack: SoftwareStack,
  requirements: StackRequirements
): Tradeoff[] {
  const tradeoffs: Tradeoff[] = [];
  
  // Analyze GPU software tradeoffs
  const hasNVAIE = currentStack.components.some(c => 
    c.software === 'NVIDIA AI Enterprise'
  );
  
  if (!hasNVAIE && requirements.gpuCount > 100) {
    tradeoffs.push({
      category: 'GPU Management',
      current: 'Open Source Drivers',
      alternative: 'NVIDIA AI Enterprise',
      additionalCost: 3500 * requirements.gpuCount,
      benefits: [
        'Enterprise support with SLAs',
        'Optimized performance',
        'Security patches',
        'Direct NVIDIA support'
      ],
      roi: 2.5,
      recommendation: requirements.primaryUseCase === 'training' 
        ? 'strongly consider' 
        : 'consider'
    });
  }
  
  // Analyze monitoring tradeoffs
  const hasEnterpriseMon = currentStack.components.some(c => 
    c.software === 'Datadog' || c.software === 'Splunk'
  );
  
  if (!hasEnterpriseMon && requirements.gpuCount > 500) {
    tradeoffs.push({
      category: 'Monitoring',
      current: 'Prometheus + Grafana',
      alternative: 'Datadog',
      additionalCost: 1800 * requirements.gpuCount,
      benefits: [
        'Advanced analytics and ML',
        'Automated alerting',
        'Compliance reporting',
        'No maintenance overhead'
      ],
      roi: 1.8,
      recommendation: 'consider'
    });
  }
  
  // Analyze scheduler tradeoffs
  const hasAdvancedScheduler = currentStack.components.some(c => 
    c.software === 'Run:ai'
  );
  
  if (!hasAdvancedScheduler && requirements.multiTenancy) {
    tradeoffs.push({
      category: 'GPU Scheduling',
      current: 'Basic Scheduler',
      alternative: 'Run:ai',
      additionalCost: 750 * requirements.gpuCount,
      benefits: [
        'Fractional GPU allocation',
        'Advanced queue management',
        'GPU utilization improvement (30-40%)',
        'Multi-tenant isolation'
      ],
      roi: 3.2,
      recommendation: 'strongly consider'
    });
  }
  
  return tradeoffs;
}

function findAlternatives(
  currentStack: SoftwareStack,
  requirements: StackRequirements
): AlternativeOption[] {
  const alternatives: AlternativeOption[] = [];
  const currentCosts = calculateStackCosts(currentStack, requirements.gpuCount);
  
  // Check all other stacks
  Object.values(softwareStacks).forEach(stack => {
    if (stack.id === currentStack.id) return;
    
    const altCosts = calculateStackCosts(stack, requirements.gpuCount);
    const costDiff = altCosts.threeYearTCO - currentCosts.threeYearTCO;
    
    // Only show alternatives within reasonable cost range
    if (Math.abs(costDiff) < currentCosts.threeYearTCO * 0.5) {
      const keyDifferences: string[] = [];
      
      // Compare key features
      if (stack.requiredFTEs !== currentStack.requiredFTEs) {
        keyDifferences.push(
          `${stack.requiredFTEs - currentStack.requiredFTEs > 0 ? 'More' : 'Less'} operational overhead (${stack.requiredFTEs} vs ${currentStack.requiredFTEs} FTEs)`
        );
      }
      
      if (stack.id === 'enterprise' && currentStack.id !== 'enterprise') {
        keyDifferences.push('Full enterprise support for all components');
      }
      
      if (stack.id === 'hybrid' && currentStack.id !== 'hybrid') {
        keyDifferences.push('Maximum cost savings with open source');
      }
      
      if (stack.id === 'nvidia' && currentStack.id !== 'nvidia') {
        keyDifferences.push('Optimized for NVIDIA hardware performance');
      }
      
      // Calculate switching cost (training, migration, etc.)
      const switchingCost = estimateSwitchingCost(currentStack, stack, requirements);
      
      alternatives.push({
        stack,
        costDifference: costDiff,
        keyDifferences,
        switchingCost
      });
    }
  });
  
  // Sort by cost difference
  return alternatives.sort((a, b) => a.costDifference - b.costDifference);
}

function estimateSwitchingCost(
  fromStack: SoftwareStack,
  toStack: SoftwareStack,
  requirements: StackRequirements
): number {
  let switchingCost = 0;
  
  // Training costs
  const trainingDays = Math.abs(toStack.requiredFTEs - fromStack.requiredFTEs) * 5;
  switchingCost += trainingDays * 1000; // $1000/day training cost
  
  // Migration complexity
  if (fromStack.id === 'hybrid' && toStack.id === 'enterprise') {
    // Moving from open source to enterprise is complex
    switchingCost += 100000;
  }
  
  if (fromStack.id === 'enterprise' && toStack.id === 'hybrid') {
    // Moving from enterprise to open source requires expertise
    switchingCost += 150000;
  }
  
  // Downtime costs (based on GPU count)
  const downtimeDays = 3; // Estimated migration downtime
  const dailyGPUCost = 100; // Opportunity cost per GPU per day
  switchingCost += requirements.gpuCount * dailyGPUCost * downtimeDays;
  
  return switchingCost;
}

// Helper function to add custom components to a stack
export function customizeStack(
  baseStack: SoftwareStack,
  additionalComponents: string[]
): SoftwareStack {
  const customStack = { ...baseStack };
  customStack.components = [...baseStack.components];
  
  additionalComponents.forEach(componentId => {
    const component = softwareComponents[componentId];
    if (component && !customStack.components.some(c => c.software === component.software)) {
      customStack.components.push(component);
      customStack.totalCostPerGPU += component.costPerGPUPerYear;
    }
  });
  
  return customStack;
}

// Export utility to get readable cost breakdown
export function formatCostBreakdown(breakdown: StackCostBreakdown): string {
  return `
Software Stack Cost Breakdown:
- Upfront Setup: $${breakdown.upfrontCost.toLocaleString()}
- Annual Licensing: $${breakdown.annualLicensing.toLocaleString()}
- Annual Support: $${breakdown.annualSupport.toLocaleString()}
- Annual Operations (${breakdown.totalAnnualCost / 150000} FTEs): $${breakdown.annualOperational.toLocaleString()}
- Total Annual Cost: $${breakdown.totalAnnualCost.toLocaleString()}
- 3-Year TCO: $${breakdown.threeYearTCO.toLocaleString()}
- 5-Year TCO: $${breakdown.fiveYearTCO.toLocaleString()}
- Cost per GPU per Year: $${breakdown.perGPUPerYear.toLocaleString()}
  `;
}
