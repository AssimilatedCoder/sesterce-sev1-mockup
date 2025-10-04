import { useState, useEffect, useCallback } from 'react';
import { Currency, currencyConverter } from '../utils/currencyConverter';

export const useCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencyConverter.getSelectedCurrency()
  );
  const [, forceUpdate] = useState({});

  // Force re-render when currency changes
  const triggerUpdate = useCallback(() => {
    setSelectedCurrency(currencyConverter.getSelectedCurrency());
    forceUpdate({});
  }, []);

  useEffect(() => {
    // Listen for currency change events
    const handleCurrencyChange = (event: CustomEvent) => {
      setSelectedCurrency(event.detail.currency);
      triggerUpdate();
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, [triggerUpdate]);

  const formatCurrency = useCallback((amount: number, currency?: Currency): string => {
    return currencyConverter.formatCurrency(amount, currency);
  }, []);

  const formatCurrencyDetailed = useCallback((amount: number, currency?: Currency): string => {
    return currencyConverter.formatCurrencyDetailed(amount, currency);
  }, []);

  const convertToSelectedCurrency = useCallback((amount: number, baseCurrency: Currency = 'USD'): number => {
    return currencyConverter.convertToSelectedCurrency(amount, baseCurrency);
  }, []);

  const getCurrencySymbol = useCallback((currency?: Currency): string => {
    return currencyConverter.getCurrencySymbol(currency);
  }, []);

  const changeCurrency = useCallback((currency: Currency) => {
    currencyConverter.setSelectedCurrency(currency);
    setSelectedCurrency(currency);
    triggerUpdate();
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { 
      detail: { currency } 
    }));
  }, [triggerUpdate]);

  return {
    selectedCurrency,
    formatCurrency,
    formatCurrencyDetailed,
    convertToSelectedCurrency,
    getCurrencySymbol,
    changeCurrency,
    rateInfo: currencyConverter.getRateInfo()
  };
};
