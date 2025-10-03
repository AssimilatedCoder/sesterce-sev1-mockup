// Global Electricity Prices for Large Commercial & Industrial (C&I) Customers
// Data source: power_prices_Q3_2025_CI_global_FIXED.html
// Last updated: Q3 2025

export interface ElectricityRate {
  location: string;
  country: string;
  region?: string;
  state?: string;
  priceUSD: number; // Base price in USD/kWh
  originalPrice: number;
  originalCurrency: string;
  customerType: 'commercial' | 'industrial' | 'business';
  period: string;
  notes?: string;
}

// 3-month average exchange rates for Q3 2025 (USD base)
export const EXCHANGE_RATES_Q3_2025 = {
  EUR: 1.087, // 1 EUR = 1.087 USD
  GBP: 1.267, // 1 GBP = 1.267 USD
  DKK: 0.157, // 1 DKK = 0.157 USD
  SEK: 0.096, // 1 SEK = 0.096 USD
  CAD: 0.741, // 1 CAD = 0.741 USD
  SAR: 0.267, // 1 SAR = 0.267 USD
  AED: 0.272, // 1 AED = 0.272 USD
  ZAR: 0.056, // 1 ZAR = 0.056 USD (cZAR = ZAR/100)
  NGN: 0.00067, // 1 NGN = 0.00067 USD
  EGP: 0.021, // 1 EGP = 0.021 USD
  MAD: 0.110, // 1 MAD = 0.110 USD
  KES: 0.0077, // 1 KES = 0.0077 USD
  GHS: 0.080, // 1 GHS = 0.080 USD
  TZS: 0.00041, // 1 TZS = 0.00041 USD
  DZD: 0.0077, // 1 DZD = 0.0077 USD
  ETB: 0.0071, // 1 ETB = 0.0071 USD
  UGX: 0.00029, // 1 UGX = 0.00029 USD
};

// Convert price to USD using exchange rates
const convertToUSD = (price: number, currency: string): number => {
  if (currency === 'USD') return price;
  const rate = EXCHANGE_RATES_Q3_2025[currency as keyof typeof EXCHANGE_RATES_Q3_2025];
  return rate ? price * rate : price;
};

// Europe - Business/Industrial Prices (March 2025)
const europeRates: ElectricityRate[] = [
  {
    location: 'Germany',
    country: 'Germany',
    region: 'Europe',
    originalPrice: 0.251,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.251, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'France',
    country: 'France',
    region: 'Europe',
    originalPrice: 0.153,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.153, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Italy',
    country: 'Italy',
    region: 'Europe',
    originalPrice: 0.340,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.340, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Spain',
    country: 'Spain',
    region: 'Europe',
    originalPrice: 0.137,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.137, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Belgium',
    country: 'Belgium',
    region: 'Europe',
    originalPrice: 0.241,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.241, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Netherlands',
    country: 'Netherlands',
    region: 'Europe',
    originalPrice: 0.208,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.208, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Finland',
    country: 'Finland',
    region: 'Europe',
    originalPrice: 0.097,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.097, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Denmark',
    country: 'Denmark',
    region: 'Europe',
    originalPrice: 1.951,
    originalCurrency: 'DKK',
    priceUSD: 0.307, // Pre-calculated in source
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Sweden',
    country: 'Sweden',
    region: 'Europe',
    originalPrice: 0.179, // Using USD value from source
    originalCurrency: 'USD',
    priceUSD: 0.179,
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Austria',
    country: 'Austria',
    region: 'Europe',
    originalPrice: 0.269,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.269, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Portugal',
    country: 'Portugal',
    region: 'Europe',
    originalPrice: 0.149,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.149, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Greece',
    country: 'Greece',
    region: 'Europe',
    originalPrice: 0.253,
    originalCurrency: 'EUR',
    priceUSD: convertToUSD(0.253, 'EUR'),
    customerType: 'business',
    period: 'Mar 2025'
  }
];

// United States - Commercial & Industrial Rates (July 2025)
const usRates: ElectricityRate[] = [
  // Commercial rates
  { location: 'Alabama', country: 'United States', state: 'Alabama', region: 'North America', originalPrice: 0.1450, originalCurrency: 'USD', priceUSD: 0.1450, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Alaska', country: 'United States', state: 'Alaska', region: 'North America', originalPrice: 0.2298, originalCurrency: 'USD', priceUSD: 0.2298, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Arizona', country: 'United States', state: 'Arizona', region: 'North America', originalPrice: 0.1346, originalCurrency: 'USD', priceUSD: 0.1346, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Arkansas', country: 'United States', state: 'Arkansas', region: 'North America', originalPrice: 0.1054, originalCurrency: 'USD', priceUSD: 0.1054, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'California', country: 'United States', state: 'California', region: 'North America', originalPrice: 0.2994, originalCurrency: 'USD', priceUSD: 0.2994, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Colorado', country: 'United States', state: 'Colorado', region: 'North America', originalPrice: 0.1327, originalCurrency: 'USD', priceUSD: 0.1327, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Connecticut', country: 'United States', state: 'Connecticut', region: 'North America', originalPrice: 0.2292, originalCurrency: 'USD', priceUSD: 0.2292, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Delaware', country: 'United States', state: 'Delaware', region: 'North America', originalPrice: 0.1252, originalCurrency: 'USD', priceUSD: 0.1252, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'District of Columbia', country: 'United States', state: 'District of Columbia', region: 'North America', originalPrice: 0.2070, originalCurrency: 'USD', priceUSD: 0.2070, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Florida', country: 'United States', state: 'Florida', region: 'North America', originalPrice: 0.1139, originalCurrency: 'USD', priceUSD: 0.1139, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Georgia', country: 'United States', state: 'Georgia', region: 'North America', originalPrice: 0.1270, originalCurrency: 'USD', priceUSD: 0.1270, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Hawaii', country: 'United States', state: 'Hawaii', region: 'North America', originalPrice: 0.3505, originalCurrency: 'USD', priceUSD: 0.3505, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Idaho', country: 'United States', state: 'Idaho', region: 'North America', originalPrice: 0.0959, originalCurrency: 'USD', priceUSD: 0.0959, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Illinois', country: 'United States', state: 'Illinois', region: 'North America', originalPrice: 0.1366, originalCurrency: 'USD', priceUSD: 0.1366, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Indiana', country: 'United States', state: 'Indiana', region: 'North America', originalPrice: 0.1411, originalCurrency: 'USD', priceUSD: 0.1411, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Iowa', country: 'United States', state: 'Iowa', region: 'North America', originalPrice: 0.1326, originalCurrency: 'USD', priceUSD: 0.1326, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Kansas', country: 'United States', state: 'Kansas', region: 'North America', originalPrice: 0.1165, originalCurrency: 'USD', priceUSD: 0.1165, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Kentucky', country: 'United States', state: 'Kentucky', region: 'North America', originalPrice: 0.1177, originalCurrency: 'USD', priceUSD: 0.1177, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Louisiana', country: 'United States', state: 'Louisiana', region: 'North America', originalPrice: 0.1157, originalCurrency: 'USD', priceUSD: 0.1157, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Maine', country: 'United States', state: 'Maine', region: 'North America', originalPrice: 0.2107, originalCurrency: 'USD', priceUSD: 0.2107, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Maryland', country: 'United States', state: 'Maryland', region: 'North America', originalPrice: 0.1514, originalCurrency: 'USD', priceUSD: 0.1514, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Massachusetts', country: 'United States', state: 'Massachusetts', region: 'North America', originalPrice: 0.2333, originalCurrency: 'USD', priceUSD: 0.2333, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Michigan', country: 'United States', state: 'Michigan', region: 'North America', originalPrice: 0.1495, originalCurrency: 'USD', priceUSD: 0.1495, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Minnesota', country: 'United States', state: 'Minnesota', region: 'North America', originalPrice: 0.1327, originalCurrency: 'USD', priceUSD: 0.1327, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Mississippi', country: 'United States', state: 'Mississippi', region: 'North America', originalPrice: 0.1260, originalCurrency: 'USD', priceUSD: 0.1260, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Missouri', country: 'United States', state: 'Missouri', region: 'North America', originalPrice: 0.1221, originalCurrency: 'USD', priceUSD: 0.1221, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Montana', country: 'United States', state: 'Montana', region: 'North America', originalPrice: 0.1282, originalCurrency: 'USD', priceUSD: 0.1282, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Nebraska', country: 'United States', state: 'Nebraska', region: 'North America', originalPrice: 0.0966, originalCurrency: 'USD', priceUSD: 0.0966, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Nevada', country: 'United States', state: 'Nevada', region: 'North America', originalPrice: 0.0973, originalCurrency: 'USD', priceUSD: 0.0973, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'New Hampshire', country: 'United States', state: 'New Hampshire', region: 'North America', originalPrice: 0.1970, originalCurrency: 'USD', priceUSD: 0.1970, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'New Jersey', country: 'United States', state: 'New Jersey', region: 'North America', originalPrice: 0.1838, originalCurrency: 'USD', priceUSD: 0.1838, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'New Mexico', country: 'United States', state: 'New Mexico', region: 'North America', originalPrice: 0.1239, originalCurrency: 'USD', priceUSD: 0.1239, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'New York', country: 'United States', state: 'New York', region: 'North America', originalPrice: 0.2306, originalCurrency: 'USD', priceUSD: 0.2306, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'North Carolina', country: 'United States', state: 'North Carolina', region: 'North America', originalPrice: 0.0971, originalCurrency: 'USD', priceUSD: 0.0971, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'North Dakota', country: 'United States', state: 'North Dakota', region: 'North America', originalPrice: 0.0780, originalCurrency: 'USD', priceUSD: 0.0780, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Ohio', country: 'United States', state: 'Ohio', region: 'North America', originalPrice: 0.1153, originalCurrency: 'USD', priceUSD: 0.1153, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Oklahoma', country: 'United States', state: 'Oklahoma', region: 'North America', originalPrice: 0.0991, originalCurrency: 'USD', priceUSD: 0.0991, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Oregon', country: 'United States', state: 'Oregon', region: 'North America', originalPrice: 0.1129, originalCurrency: 'USD', priceUSD: 0.1129, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Pennsylvania', country: 'United States', state: 'Pennsylvania', region: 'North America', originalPrice: 0.1263, originalCurrency: 'USD', priceUSD: 0.1263, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Rhode Island', country: 'United States', state: 'Rhode Island', region: 'North America', originalPrice: 0.2222, originalCurrency: 'USD', priceUSD: 0.2222, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'South Carolina', country: 'United States', state: 'South Carolina', region: 'North America', originalPrice: 0.1092, originalCurrency: 'USD', priceUSD: 0.1092, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'South Dakota', country: 'United States', state: 'South Dakota', region: 'North America', originalPrice: 0.1172, originalCurrency: 'USD', priceUSD: 0.1172, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Tennessee', country: 'United States', state: 'Tennessee', region: 'North America', originalPrice: 0.1291, originalCurrency: 'USD', priceUSD: 0.1291, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Texas', country: 'United States', state: 'Texas', region: 'North America', originalPrice: 0.0903, originalCurrency: 'USD', priceUSD: 0.0903, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Utah', country: 'United States', state: 'Utah', region: 'North America', originalPrice: 0.1046, originalCurrency: 'USD', priceUSD: 0.1046, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Vermont', country: 'United States', state: 'Vermont', region: 'North America', originalPrice: 0.1942, originalCurrency: 'USD', priceUSD: 0.1942, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Virginia', country: 'United States', state: 'Virginia', region: 'North America', originalPrice: 0.1047, originalCurrency: 'USD', priceUSD: 0.1047, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Washington', country: 'United States', state: 'Washington', region: 'North America', originalPrice: 0.1186, originalCurrency: 'USD', priceUSD: 0.1186, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'West Virginia', country: 'United States', state: 'West Virginia', region: 'North America', originalPrice: 0.1119, originalCurrency: 'USD', priceUSD: 0.1119, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Wisconsin', country: 'United States', state: 'Wisconsin', region: 'North America', originalPrice: 0.1339, originalCurrency: 'USD', priceUSD: 0.1339, customerType: 'commercial', period: 'Jul 2025' },
  { location: 'Wyoming', country: 'United States', state: 'Wyoming', region: 'North America', originalPrice: 0.1016, originalCurrency: 'USD', priceUSD: 0.1016, customerType: 'commercial', period: 'Jul 2025' },

  // Industrial rates (for data centers - typically lower)
  { location: 'Alabama (Industrial)', country: 'United States', state: 'Alabama', region: 'North America', originalPrice: 0.0808, originalCurrency: 'USD', priceUSD: 0.0808, customerType: 'industrial', period: 'Jul 2025' },
  { location: 'Alaska (Industrial)', country: 'United States', state: 'Alaska', region: 'North America', originalPrice: 0.1940, originalCurrency: 'USD', priceUSD: 0.1940, customerType: 'industrial', period: 'Jul 2025' },
  { location: 'Arizona (Industrial)', country: 'United States', state: 'Arizona', region: 'North America', originalPrice: 0.0944, originalCurrency: 'USD', priceUSD: 0.0944, customerType: 'industrial', period: 'Jul 2025' },
  { location: 'Arkansas (Industrial)', country: 'United States', state: 'Arkansas', region: 'North America', originalPrice: 0.0716, originalCurrency: 'USD', priceUSD: 0.0716, customerType: 'industrial', period: 'Jul 2025' },
  { location: 'California (Industrial)', country: 'United States', state: 'California', region: 'North America', originalPrice: 0.2531, originalCurrency: 'USD', priceUSD: 0.2531, customerType: 'industrial', period: 'Jul 2025' },
  { location: 'Texas (Industrial)', country: 'United States', state: 'Texas', region: 'North America', originalPrice: 0.0660, originalCurrency: 'USD', priceUSD: 0.0660, customerType: 'industrial', period: 'Jul 2025' },
  { location: 'Washington (Industrial)', country: 'United States', state: 'Washington', region: 'North America', originalPrice: 0.0699, originalCurrency: 'USD', priceUSD: 0.0699, customerType: 'industrial', period: 'Jul 2025' },
];

// Other regions
const otherRates: ElectricityRate[] = [
  // United Kingdom
  {
    location: 'United Kingdom',
    country: 'United Kingdom',
    region: 'Europe',
    originalPrice: 0.243,
    originalCurrency: 'GBP',
    priceUSD: convertToUSD(0.243, 'GBP'),
    customerType: 'business',
    period: 'Q2 2025',
    notes: 'Non-domestic average (incl. CCL)'
  },

  // Canada
  {
    location: 'Canada',
    country: 'Canada',
    region: 'North America',
    originalPrice: 0.182,
    originalCurrency: 'CAD',
    priceUSD: convertToUSD(0.182, 'CAD'),
    customerType: 'business',
    period: 'Mar 2025'
  },

  // Middle East
  {
    location: 'Saudi Arabia (Industrial)',
    country: 'Saudi Arabia',
    region: 'Middle East',
    originalPrice: 0.20,
    originalCurrency: 'SAR',
    priceUSD: convertToUSD(0.20, 'SAR'),
    customerType: 'industrial',
    period: '2025',
    notes: 'SERA/SEC tariff (flat industrial)'
  },
  {
    location: 'Saudi Arabia (Commercial ≤6k kWh)',
    country: 'Saudi Arabia',
    region: 'Middle East',
    originalPrice: 0.22,
    originalCurrency: 'SAR',
    priceUSD: convertToUSD(0.22, 'SAR'),
    customerType: 'commercial',
    period: '2025',
    notes: 'SERA/SEC commercial tier 1'
  },
  {
    location: 'Saudi Arabia (Commercial >6k kWh)',
    country: 'Saudi Arabia',
    region: 'Middle East',
    originalPrice: 0.32,
    originalCurrency: 'SAR',
    priceUSD: convertToUSD(0.32, 'SAR'),
    customerType: 'commercial',
    period: '2025',
    notes: 'SERA/SEC commercial tier 2'
  },
  {
    location: 'UAE (Dubai)',
    country: 'United Arab Emirates',
    region: 'Middle East',
    originalPrice: 0.405,
    originalCurrency: 'AED',
    priceUSD: convertToUSD(0.405, 'AED'),
    customerType: 'business',
    period: 'Mar 2025',
    notes: 'Business tariff benchmark'
  },

  // Africa
  {
    location: 'Nigeria',
    country: 'Nigeria',
    region: 'Africa',
    originalPrice: 65.770,
    originalCurrency: 'NGN',
    priceUSD: 0.044, // Pre-calculated in source
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Egypt',
    country: 'Egypt',
    region: 'Africa',
    originalPrice: 1.940,
    originalCurrency: 'EGP',
    priceUSD: 0.041, // Pre-calculated in source
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Morocco',
    country: 'Morocco',
    region: 'Africa',
    originalPrice: 1.072,
    originalCurrency: 'MAD',
    priceUSD: 0.118, // Pre-calculated in source
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'Kenya',
    country: 'Kenya',
    region: 'Africa',
    originalPrice: 22.440,
    originalCurrency: 'KES',
    priceUSD: 0.174, // Pre-calculated in source
    customerType: 'business',
    period: 'Mar 2025'
  },
  {
    location: 'South Africa',
    country: 'South Africa',
    region: 'Africa',
    originalPrice: 134.90, // Standard rate in cZAR/kWh
    originalCurrency: 'ZAR',
    priceUSD: convertToUSD(1.3490, 'ZAR'), // Convert cZAR to ZAR
    customerType: 'industrial',
    period: '2025/26',
    notes: 'Eskom Megaflex standard rate (ex-VAT)'
  }
];

// Combine all rates
export const ELECTRICITY_RATES: ElectricityRate[] = [
  ...europeRates,
  ...usRates,
  ...otherRates
];

// Helper functions
export const getLocationsByRegion = (region: string): ElectricityRate[] => {
  return ELECTRICITY_RATES.filter(rate => rate.region === region);
};

export const getLocationsByCountry = (country: string): ElectricityRate[] => {
  return ELECTRICITY_RATES.filter(rate => rate.country === country);
};

export const getLocationByName = (location: string): ElectricityRate | undefined => {
  return ELECTRICITY_RATES.find(rate => rate.location === location);
};

export const getRegions = (): string[] => {
  const regions = new Set(ELECTRICITY_RATES.map(rate => rate.region).filter((region): region is string => Boolean(region)));
  return Array.from(regions).sort();
};

export const getCountries = (): string[] => {
  const countries = new Set(ELECTRICITY_RATES.map(rate => rate.country));
  return Array.from(countries).sort();
};

// Convert electricity rate to target currency
export const convertElectricityRate = (rate: ElectricityRate, targetCurrency: 'USD' | 'EUR' | 'GBP'): number => {
  if (targetCurrency === 'USD') {
    return rate.priceUSD;
  }
  
  // Convert from USD to target currency
  const conversionRates = {
    EUR: 1 / EXCHANGE_RATES_Q3_2025.EUR, // USD to EUR
    GBP: 1 / EXCHANGE_RATES_Q3_2025.GBP, // USD to GBP
  };
  
  return rate.priceUSD * conversionRates[targetCurrency];
};

// Get recommended rate for data centers (prefer industrial rates where available)
export const getRecommendedRate = (location: string): ElectricityRate | undefined => {
  const rates = ELECTRICITY_RATES.filter(rate => 
    rate.location === location || rate.location.includes(location)
  );
  
  // Prefer industrial rates for data centers
  const industrialRate = rates.find(rate => rate.customerType === 'industrial');
  if (industrialRate) return industrialRate;
  
  // Fall back to commercial/business rates
  const commercialRate = rates.find(rate => 
    rate.customerType === 'commercial' || rate.customerType === 'business'
  );
  return commercialRate || rates[0];
};
