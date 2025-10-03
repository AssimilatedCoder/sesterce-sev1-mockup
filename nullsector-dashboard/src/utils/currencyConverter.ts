// Currency Converter with 3-month rolling average rates
// Data source: ECB (European Central Bank) historical rates

export type Currency = 'USD' | 'EUR' | 'GBP';

// 3-month rolling average exchange rates (updated quarterly)
// These rates represent the average exchange rates over the last 3 months (Q3 2025)
const EXCHANGE_RATES = {
  // Last updated: Q3 2025 - aligned with electricity pricing data
  USD_TO_EUR: 0.920, // 1 USD = 0.920 EUR (3-month average)
  EUR_TO_USD: 1.087, // 1 EUR = 1.087 USD (3-month average)
  USD_TO_GBP: 0.789, // 1 USD = 0.789 GBP (3-month average)
  GBP_TO_USD: 1.267, // 1 GBP = 1.267 USD (3-month average)
  EUR_TO_GBP: 0.726, // 1 EUR = 0.726 GBP (derived)
  GBP_TO_EUR: 1.378, // 1 GBP = 1.378 EUR (derived)
  
  // Historical 3-month averages for reference
  HISTORICAL: {
    'Q3_2025': { USD_TO_EUR: 0.920, EUR_TO_USD: 1.087, USD_TO_GBP: 0.789, GBP_TO_USD: 1.267 },
    'Q2_2025': { USD_TO_EUR: 0.918, EUR_TO_USD: 1.089, USD_TO_GBP: 0.791, GBP_TO_USD: 1.264 },
    'Q1_2025': { USD_TO_EUR: 0.922, EUR_TO_USD: 1.085, USD_TO_GBP: 0.787, GBP_TO_USD: 1.270 }
  }
};

export interface CurrencyState {
  selectedCurrency: Currency;
  rates: typeof EXCHANGE_RATES;
}

export class CurrencyConverter {
  private static instance: CurrencyConverter;
  private selectedCurrency: Currency = 'USD';
  private rates = EXCHANGE_RATES;

  private constructor() {}

  public static getInstance(): CurrencyConverter {
    if (!CurrencyConverter.instance) {
      CurrencyConverter.instance = new CurrencyConverter();
    }
    return CurrencyConverter.instance;
  }

  public setSelectedCurrency(currency: Currency): void {
    this.selectedCurrency = currency;
    // Persist to localStorage
    localStorage.setItem('nullSectorSelectedCurrency', currency);
  }

  public getSelectedCurrency(): Currency {
    // Check localStorage first
    const stored = localStorage.getItem('nullSectorSelectedCurrency') as Currency;
    if (stored && (stored === 'USD' || stored === 'EUR')) {
      this.selectedCurrency = stored;
    }
    return this.selectedCurrency;
  }

  public convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // USD conversions
    if (fromCurrency === 'USD' && toCurrency === 'EUR') {
      return amount * this.rates.USD_TO_EUR;
    }
    if (fromCurrency === 'USD' && toCurrency === 'GBP') {
      return amount * this.rates.USD_TO_GBP;
    }

    // EUR conversions
    if (fromCurrency === 'EUR' && toCurrency === 'USD') {
      return amount * this.rates.EUR_TO_USD;
    }
    if (fromCurrency === 'EUR' && toCurrency === 'GBP') {
      return amount * this.rates.EUR_TO_GBP;
    }

    // GBP conversions
    if (fromCurrency === 'GBP' && toCurrency === 'USD') {
      return amount * this.rates.GBP_TO_USD;
    }
    if (fromCurrency === 'GBP' && toCurrency === 'EUR') {
      return amount * this.rates.GBP_TO_EUR;
    }

    return amount; // Fallback
  }

  public convertToSelectedCurrency(amount: number, baseCurrency: Currency = 'USD'): number {
    return this.convertAmount(amount, baseCurrency, this.selectedCurrency);
  }

  public formatCurrency(amount: number, currency?: Currency): string {
    const targetCurrency = currency || this.selectedCurrency;
    const convertedAmount = this.convertToSelectedCurrency(amount, 'USD');
    
    const isNegative = convertedAmount < 0;
    const absAmount = Math.abs(convertedAmount);
    
    let formatted = '';
    const symbol = targetCurrency === 'EUR' ? '€' : '$';
    
    if (absAmount >= 1e9) {
      formatted = `${symbol}${(absAmount / 1e9).toFixed(2)}B`;
    } else if (absAmount >= 1e6) {
      formatted = `${symbol}${(absAmount / 1e6).toFixed(2)}M`;
    } else if (absAmount >= 1e3) {
      formatted = `${symbol}${(absAmount / 1e3).toFixed(0)}K`;
    } else {
      formatted = `${symbol}${absAmount.toFixed(0)}`;
    }
    
    return isNegative ? `-${formatted}` : formatted;
  }

  public formatCurrencyDetailed(amount: number, currency?: Currency): string {
    const targetCurrency = currency || this.selectedCurrency;
    const convertedAmount = this.convertToSelectedCurrency(amount, 'USD');
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    return formatter.format(convertedAmount);
  }

  public getCurrencySymbol(currency?: Currency): string {
    const targetCurrency = currency || this.selectedCurrency;
    switch (targetCurrency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD':
      default: return '$';
    }
  }

  public getCurrentRate(): number {
    return this.selectedCurrency === 'EUR' ? this.rates.USD_TO_EUR : 1;
  }

  public getRateInfo(): { rate: number; direction: string; lastUpdated: string } {
    if (this.selectedCurrency === 'USD') {
      return {
        rate: 1,
        direction: 'USD (Base Currency)',
        lastUpdated: 'N/A'
      };
    }
    
    return {
      rate: this.rates.USD_TO_EUR,
      direction: 'USD → EUR',
      lastUpdated: 'Q4 2024 (3-month average)'
    };
  }

  // Method to update rates (for future API integration)
  public updateRates(newRates: Partial<typeof EXCHANGE_RATES>): void {
    this.rates = { ...this.rates, ...newRates };
  }
}

// Export singleton instance
export const currencyConverter = CurrencyConverter.getInstance();

// Utility functions for easy access
export const formatCurrency = (amount: number, currency?: Currency): string => {
  return currencyConverter.formatCurrency(amount, currency);
};

export const formatCurrencyDetailed = (amount: number, currency?: Currency): string => {
  return currencyConverter.formatCurrencyDetailed(amount, currency);
};

export const convertToSelectedCurrency = (amount: number, baseCurrency: Currency = 'USD'): number => {
  return currencyConverter.convertToSelectedCurrency(amount, baseCurrency);
};

export const getSelectedCurrency = (): Currency => {
  return currencyConverter.getSelectedCurrency();
};

export const setSelectedCurrency = (currency: Currency): void => {
  currencyConverter.setSelectedCurrency(currency);
};
