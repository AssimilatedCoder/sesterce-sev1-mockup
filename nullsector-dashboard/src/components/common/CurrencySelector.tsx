import React, { useState, useEffect } from 'react';
import { DollarSign, Euro, Info } from 'lucide-react';
import { Currency, currencyConverter } from '../../utils/currencyConverter';

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void;
  showRateInfo?: boolean;
  compact?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  onCurrencyChange,
  showRateInfo = true,
  compact = false
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencyConverter.getSelectedCurrency()
  );
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Load currency from localStorage on mount
    const stored = currencyConverter.getSelectedCurrency();
    setSelectedCurrency(stored);
  }, []);

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    currencyConverter.setSelectedCurrency(currency);
    
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }

    // Trigger a custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('currencyChanged', { 
      detail: { currency } 
    }));
  };

  const rateInfo = currencyConverter.getRateInfo();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={selectedCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
        </select>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          Currency Display
        </h3>
        {showRateInfo && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-6 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                3-month rolling average rates
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => handleCurrencyChange('USD')}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
            selectedCurrency === 'USD'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">USD</span>
        </button>
        
        <button
          onClick={() => handleCurrencyChange('EUR')}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
            selectedCurrency === 'EUR'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <Euro className="w-4 h-4" />
          <span className="font-medium">EUR</span>
        </button>
      </div>

      {showRateInfo && (
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Exchange Rate:</span>
            <span className="font-medium">
              {rateInfo.rate === 1 ? 'Base Currency' : `${rateInfo.rate.toFixed(4)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Direction:</span>
            <span className="font-medium">{rateInfo.direction}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span className="font-medium">{rateInfo.lastUpdated}</span>
          </div>
        </div>
      )}
    </div>
  );
};
