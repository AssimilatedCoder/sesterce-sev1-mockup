// Software Stack Types and Interfaces

export type LicensingModel = 'subscription' | 'perpetual' | 'opensource' | 'freemium';
export type SupportLevel = 'community' | 'business' | 'enterprise';
export type BudgetLevel = 'low' | 'medium' | 'high';
export type ExpertiseLevel = 'basic' | 'intermediate' | 'advanced';
export type PrimaryUseCase = 'training' | 'inference' | 'mixed';
export type VendorPreference = 'nvidia' | 'amd' | 'agnostic';

export interface SoftwareComponent {
  category: string;
  software: string;
  vendor: string;
  licensingModel: LicensingModel;
  costPerGPUPerYear: number;
  setupCost: number;
  dependencies: string[];
  description: string;
  includesSupport: boolean;
  supportTier?: SupportLevel;
}

export interface SoftwareStack {
  id: string;
  name: string;
  description: string;
  components: SoftwareComponent[];
  totalCostPerGPU: number;
  requiredFTEs: number;
  setupTime: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
}

export interface StackRequirements {
  gpuCount: number;
  budget: BudgetLevel;
  expertise: ExpertiseLevel;
  supportNeeds: SupportLevel;
  complianceRequirements: string[];
  primaryUseCase: PrimaryUseCase;
  multiTenancy: boolean;
  vendorPreference?: VendorPreference;
}

export interface OptimizedStack {
  stack: SoftwareStack;
  totalCost: number;
  annualCost: number;
  perGPUCost: number;
  tradeoffs: Tradeoff[];
  alternativeOptions: AlternativeOption[];
}

export interface Tradeoff {
  category: string;
  current: string;
  alternative: string;
  additionalCost: number;
  benefits: string[];
  roi: number;
  recommendation: 'strongly consider' | 'consider' | 'optional';
}

export interface AlternativeOption {
  stack: SoftwareStack;
  costDifference: number;
  keyDifferences: string[];
  switchingCost: number;
}

export interface StackCostBreakdown {
  upfrontCost: number;
  annualLicensing: number;
  annualSupport: number;
  annualOperational: number;
  totalAnnualCost: number;
  threeYearTCO: number;
  fiveYearTCO: number;
  perGPUPerYear: number;
}

export interface ComponentPricing {
  base: number;
  perGPU: number;
  perNode?: number;
  volumeDiscounts?: {
    threshold: number;
    discount: number;
  }[];
}
