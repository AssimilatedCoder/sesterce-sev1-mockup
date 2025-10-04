// Centralized version management for NullSector GPU Calculator
// This file should be updated for each release

export interface VersionInfo {
  version: string;
  buildDate: string;
  buildNumber: number;
  gitCommit?: string;
  releaseNotes: string;
  breaking: boolean;
  features: string[];
  bugfixes: string[];
  architecture: string;
}

export const CURRENT_VERSION: VersionInfo = {
  version: "1.9.5",
  buildDate: new Date().toISOString(),
  buildNumber: 195,
  releaseNotes: "4-Tier MLOps Platform Implementation + Dynamic Calculations",
  breaking: false,
  features: [
    "Added Tier 3: Managed MLOps Platform (PaaS)",
    "Dynamic TCO calculation without manual button",
    "Real-time input validation with yellow warnings",
    "Enhanced mid-market business strategy documentation",
    "Removed redundant Advanced Options section",
    "Service-tier-driven architecture with IaaS/PaaS/SaaS hierarchy"
  ],
  bugfixes: [
    "Fixed validation function parameter passing",
    "Resolved TypeScript compilation errors",
    "Cleaned up unused imports and variables"
  ],
  architecture: "Service-Tier-Driven"
};

// Version history for rollback and changelog
export const VERSION_HISTORY: VersionInfo[] = [
  {
    version: "1.9.4",
    buildDate: "2025-10-03T10:00:00.000Z",
    buildNumber: 194,
    releaseNotes: "Enhanced Storage Architecture + User Management",
    breaking: false,
    features: [
      "Comprehensive storage architecture redesign",
      "4-tier service structure foundation",
      "Enhanced user management with role-based access",
      "Landing page with detailed documentation",
      "Ceph storage calculations with erasure coding"
    ],
    bugfixes: [
      "Fixed storage tier distribution logic",
      "Resolved slider synchronization issues",
      "Updated validation rules for new architecture"
    ],
    architecture: "Service-Tier-Driven"
  },
  {
    version: "1.9.3",
    buildDate: "2025-10-02T15:30:00.000Z",
    buildNumber: 193,
    releaseNotes: "HTTPS Implementation + Electricity Pricing",
    breaking: false,
    features: [
      "Cloudflare HTTPS integration",
      "Location-based electricity pricing (200+ locations)",
      "Multi-currency support (USD, EUR, GBP)",
      "Enhanced UI with grayscale design consistency"
    ],
    bugfixes: [
      "Fixed nginx configuration issues",
      "Resolved redirect loops in HTTPS setup",
      "Updated currency conversion rates"
    ],
    architecture: "Legacy"
  },
  CURRENT_VERSION
];

// Utility functions
export const getCurrentVersion = (): string => CURRENT_VERSION.version;
export const getBuildInfo = (): string => `${CURRENT_VERSION.version} (Build ${CURRENT_VERSION.buildNumber})`;
export const getVersionHistory = (): VersionInfo[] => VERSION_HISTORY;
export const isBreakingChange = (): boolean => CURRENT_VERSION.breaking;

// Version comparison utilities
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
};

export const isNewerVersion = (version: string): boolean => {
  return compareVersions(version, CURRENT_VERSION.version) > 0;
};

export const getNextVersion = (type: 'major' | 'minor' | 'patch' = 'patch'): string => {
  const [major, minor, patch] = CURRENT_VERSION.version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
};
