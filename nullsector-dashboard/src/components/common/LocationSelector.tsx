import React, { useState, useMemo } from 'react';
import { ChevronDown, MapPin, Zap, Info } from 'lucide-react';
import { ELECTRICITY_RATES, ElectricityRate, convertElectricityRate, getRecommendedRate } from '../../data/electricityPrices';
import { useCurrency } from '../../hooks/useCurrency';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  showRateInfo?: boolean;
  compact?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  showRateInfo = true,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'region' | 'country'>('all');
  const { selectedCurrency } = useCurrency();

  // Group locations by region and country
  const groupedLocations = useMemo(() => {
    const filtered = ELECTRICITY_RATES.filter(rate => {
      const matchesSearch = rate.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rate.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (rate.region && rate.region.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterBy === 'region') {
        return matchesSearch && rate.region;
      } else if (filterBy === 'country') {
        return matchesSearch;
      }
      return matchesSearch;
    });

    // Group by region first, then by country
    const grouped: Record<string, Record<string, ElectricityRate[]>> = {};
    
    filtered.forEach(rate => {
      const region = rate.region || 'Other';
      const country = rate.country;
      
      if (!grouped[region]) {
        grouped[region] = {};
      }
      if (!grouped[region][country]) {
        grouped[region][country] = [];
      }
      grouped[region][country].push(rate);
    });

    return grouped;
  }, [searchTerm, filterBy]);

  const selectedRate = useMemo(() => {
    return getRecommendedRate(selectedLocation) || ELECTRICITY_RATES.find(rate => rate.location === selectedLocation);
  }, [selectedLocation]);

  const formatRate = (rate: ElectricityRate) => {
    const convertedRate = convertElectricityRate(rate, selectedCurrency);
    const symbol = selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'GBP' ? '£' : '$';
    return `${symbol}${convertedRate.toFixed(4)}/kWh`;
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'industrial': return 'text-blue-600 bg-blue-50';
      case 'commercial': return 'text-green-600 bg-green-50';
      case 'business': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {Object.entries(groupedLocations).map(([region, countries]) => (
            <optgroup key={region} label={region}>
              {Object.entries(countries).map(([country, rates]) =>
                rates.map(rate => (
                  <option key={rate.location} value={rate.location}>
                    {rate.location} - {formatRate(rate)}
                  </option>
                ))
              )}
            </optgroup>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        <MapPin className="w-3 h-3 inline mr-1" />
        Location & Electricity Rate
      </label>
      
      {/* Current Selection Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <div className="text-left">
            <div className="font-medium">{selectedLocation}</div>
            {selectedRate && (
              <div className="text-xs text-gray-500">
                {formatRate(selectedRate)} • {selectedRate.customerType}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search and Filter */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 mb-2"
            />
            <div className="flex gap-1">
              {['all', 'region', 'country'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setFilterBy(filter as any)}
                  className={`px-2 py-1 text-xs rounded capitalize ${
                    filterBy === filter
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Location List */}
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(groupedLocations).map(([region, countries]) => (
              <div key={region}>
                <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 sticky top-0">
                  {region}
                </div>
                {Object.entries(countries).map(([country, rates]) => (
                  <div key={country}>
                    <div className="px-4 py-1 text-xs font-medium text-gray-600 bg-gray-25">
                      {country}
                    </div>
                    {rates.map(rate => (
                      <button
                        key={rate.location}
                        onClick={() => {
                          onLocationChange(rate.location);
                          setIsOpen(false);
                        }}
                        className={`w-full px-5 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                          selectedLocation === rate.location ? 'bg-green-50 text-green-700' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">{rate.location}</div>
                          <div className="text-xs text-gray-500">
                            {rate.period} • {rate.originalPrice} {rate.originalCurrency}
                            {rate.notes && ` • ${rate.notes}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getCustomerTypeColor(rate.customerType)}`}>
                            {rate.customerType}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {formatRate(rate)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {showRateInfo && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Info className="w-3 h-3" />
                <span>Rates converted to {selectedCurrency} using Q3 2025 averages</span>
              </div>
              {selectedRate && (
                <div className="mt-1 text-xs text-gray-500">
                  Industrial rates recommended for data centers where available
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rate Info Below */}
      {showRateInfo && selectedRate && !isOpen && (
        <div className="mt-1 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Original: {selectedRate.originalPrice} {selectedRate.originalCurrency}/kWh</span>
            <span className="text-green-600 font-medium">
              Converted: {formatRate(selectedRate)}
            </span>
          </div>
          {selectedRate.notes && (
            <div className="text-gray-400 mt-0.5">{selectedRate.notes}</div>
          )}
        </div>
      )}
    </div>
  );
};
