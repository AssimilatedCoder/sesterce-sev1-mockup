// Secure API client for protected backend communication

class SecureApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('authToken');
    
    // Check if token is expired
    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry && Date.now() > parseInt(expiry)) {
      this.clearToken();
    }
  }

  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    sessionStorage.removeItem('sesterceUser');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      this.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(username: string, password: string): Promise<{
    token: string;
    username: string;
    role: string;
    expires_in: number;
  }> {
    const response = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('tokenExpiry', (Date.now() + response.expires_in * 1000).toString());
    sessionStorage.setItem('sesterceUser', response.username);

    return response;
  }

  async verifyToken(): Promise<{
    valid: boolean;
    username: string;
    role: string;
  }> {
    if (!this.token) {
      throw new Error('No token available');
    }

    return this.makeRequest('/verify', {
      method: 'POST',
    });
  }

  async calculateTCO(config: {
    gpuModel: string;
    numGPUs: number;
    coolingType: string;
    region: string;
    fabricType: string;
    oversubscription: number;
    storageVendor: string;
    storageHot: number;
    storageWarm: number;
    storageCold: number;
    storageArchive: number;
    customEnergyRate?: string;
    maintenancePercent: number;
    staffMultiplier: number;
    enableBluefield: boolean;
    softwareStack: string;
    supportTier: string;
  }): Promise<{
    totalCapex: number;
    annualOpex: number;
    costPerHour: number;
    totalPowerMW: number;
    pueValue: number;
    storageGbMonth: number;
    networkBandwidth: number;
    tco10year: number;
    breakdown: {
      capex: Record<string, number>;
      opex: Record<string, number>;
    };
    details: {
      systemsNeeded: number;
      actualGPUs: number;
      requestedGPUs: number;
      gpusPerSystem: number;
      softwareStackCost: any;
    };
  }> {
    return this.makeRequest('/calculate', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout(): void {
    this.clearToken();
  }
}

// Export singleton instance
export const secureApi = new SecureApiClient();

// Export types for TypeScript
export interface TCOCalculationRequest {
  gpuModel: string;
  numGPUs: number;
  coolingType: string;
  region: string;
  fabricType: string;
  oversubscription: number;
  storageVendor: string;
  storageHot: number;
  storageWarm: number;
  storageCold: number;
  storageArchive: number;
  customEnergyRate?: string;
  maintenancePercent: number;
  staffMultiplier: number;
  enableBluefield: boolean;
  softwareStack: string;
  supportTier: string;
}

export interface TCOCalculationResponse {
  totalCapex: number;
  annualOpex: number;
  costPerHour: number;
  totalPowerMW: number;
  pueValue: number;
  storageGbMonth: number;
  networkBandwidth: number;
  tco10year: number;
  breakdown: {
    capex: Record<string, number>;
    opex: Record<string, number>;
  };
  details: {
    systemsNeeded: number;
    actualGPUs: number;
    requestedGPUs: number;
    gpusPerSystem: number;
    softwareStackCost: any;
  };
}
