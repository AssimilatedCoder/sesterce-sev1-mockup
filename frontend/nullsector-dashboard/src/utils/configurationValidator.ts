/**
 * Utility functions to validate if configuration is complete enough for financial analysis
 */

export interface ConfigurationState {
  gpuModel: string;
  numGPUs: number;
  coolingType: string;
  region: string;
  utilization: number;
  depreciation: number;
  totalStorage: number;
  storageArchitecture: string;
  fabricType: string;
  topology: string;
  oversubscription: string;
  powerCapacity?: number;
  [key: string]: any;
}

export function isConfigurationComplete(config: ConfigurationState): boolean {
  // Defensive check - if config is not an object, return false
  if (!config || typeof config !== 'object') {
    return false;
  }

  // Check if essential parameters are set to non-default values
  const essentialFields = [
    'gpuModel',
    'numGPUs',
    'coolingType',
    'utilization',
    'totalStorage',
    'fabricType'
  ];

  // Check if all essential fields have meaningful values
  for (const field of essentialFields) {
    const value = config[field];
    if (value === undefined || value === null) {
      return false;
    }
    if (value === 0) {
      return false;
    }
    // Allow empty strings for optional override fields and region
    if (typeof value === 'string' && value === '' && !['pueOverride', 'gpuPriceOverride', 'customEnergyRate', 'region'].includes(field)) {
      return false;
    }
  }

  // Additional validation for specific fields
  if (config.numGPUs < 100) return false; // Minimum viable cluster size
  if (config.utilization < 10 || config.utilization > 100) return false;
  if (config.totalStorage < 1) return false; // Minimum storage

  return true;
}

export function getConfigurationCompleteness(config: ConfigurationState): {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
} {
  const requiredFields = [
    { key: 'gpuModel', name: 'GPU Model' },
    { key: 'numGPUs', name: 'GPU Count' },
    { key: 'coolingType', name: 'Cooling Type' },
    { key: 'utilization', name: 'Utilization Rate' },
    { key: 'totalStorage', name: 'Storage Capacity' },
    { key: 'fabricType', name: 'Network Fabric' },
    { key: 'region', name: 'Region/Location' },
    { key: 'storageArchitecture', name: 'Storage Architecture' }
  ];

  const missingFields: string[] = [];
  let completedFields = 0;

  for (const field of requiredFields) {
    const value = config[field.key];
    if (value && value !== '' && value !== 0) {
      completedFields++;
    } else {
      missingFields.push(field.name);
    }
  }

  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
  const isComplete = completionPercentage >= 80; // 80% completion threshold

  return {
    isComplete,
    completionPercentage,
    missingFields
  };
}

export function isBasicConfigurationSufficient(
  gpuCount: number,
  powerCapacity: number,
  storageCapacity: number,
  gpuModel?: string,
  networkingType?: string
): boolean {
  // Basic config is sufficient if core parameters are set
  return (
    gpuCount >= 100 &&
    powerCapacity >= 1 &&
    storageCapacity >= 1 &&
    gpuModel !== undefined &&
    networkingType !== undefined
  );
}
