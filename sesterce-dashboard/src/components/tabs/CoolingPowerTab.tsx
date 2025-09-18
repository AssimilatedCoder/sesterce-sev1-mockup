import React from 'react';
import { Thermometer, Zap, Droplets, AlertTriangle } from 'lucide-react';

interface CoolingPowerTabProps {
  config: any;
  results: any;
}

export const CoolingPowerTab: React.FC<CoolingPowerTabProps> = ({ config, results }) => {
  const spec = config.gpuModel.startsWith('gb') ? {
    rackPower: config.gpuModel === 'gb200' ? 120 : 140,
    liquidRequired: true
  } : {
    rackPower: 50,
    liquidRequired: false
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-red-600" />
          Cooling & Power Infrastructure
        </h2>
        <p className="text-gray-700 mb-4">
          GB200/GB300 systems require unprecedented power density and mandatory liquid cooling. 
          Traditional air cooling is no longer viable for these next-generation platforms.
        </p>
        {spec.liquidRequired && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="font-semibold text-red-800">Liquid Cooling Mandatory</p>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {spec.rackPower}kW per rack exceeds air cooling capabilities. Direct-to-chip liquid cooling required.
            </p>
          </div>
        )}
      </div>

      {/* Power Requirements */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Power Requirements Analysis
        </h3>
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">IT Load</p>
              <p className="text-2xl font-bold text-yellow-600">
                {((results.totalPowerMW || 0) / (results.pueValue || 1.1)).toFixed(1)} MW
              </p>
              <p className="text-xs text-gray-500">Raw compute power</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Facility</p>
              <p className="text-2xl font-bold text-orange-600">
                {results.totalPowerMW?.toFixed(1) || '0'} MW
              </p>
              <p className="text-xs text-gray-500">Including cooling</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">PUE</p>
              <p className="text-2xl font-bold text-green-600">
                {results.pueValue?.toFixed(2) || '1.10'}
              </p>
              <p className="text-xs text-gray-500">Power efficiency</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Annual Energy</p>
              <p className="text-2xl font-bold text-blue-600">
                {((results.totalPowerMW || 0) * 8760).toFixed(0)} MWh
              </p>
              <p className="text-xs text-gray-500">Total consumption</p>
            </div>
          </div>
        )}
      </div>

      {/* Cooling Architecture */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Liquid Cooling Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Primary Loop (Facility)</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Cooling towers or dry coolers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                15°C supply / 25°C return typical
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                N+1 redundancy required
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Variable speed pumps for efficiency
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Secondary Loop (IT)</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                CDU per 2-4 racks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Direct-to-chip cold plates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                25°C supply / 35°C return
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Leak detection mandatory
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Infrastructure Summary */}
      {results && results.details && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Infrastructure Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Cooling Units</p>
              <div className="space-y-1 text-sm">
                <p>• {results.details.cooling?.numRacks || 0} racks total</p>
                <p>• {results.details.cooling?.cdus || 0} CDUs required</p>
                <p>• {Math.ceil((results.details.cooling?.numRacks || 0) / 10)} cooling zones</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Power Distribution</p>
              <div className="space-y-1 text-sm">
                <p>• {Math.ceil((results.totalPowerMW || 0) / 2.5)} × 2.5MW feeds</p>
                <p>• 2N UPS configuration</p>
                <p>• 480V 3-phase distribution</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Facility Space</p>
              <div className="space-y-1 text-sm">
                <p>• {((results.details.cooling?.numRacks || 0) * 10).toFixed(0)} sq ft IT space</p>
                <p>• {((results.details.cooling?.numRacks || 0) * 5).toFixed(0)} sq ft mechanical</p>
                <p>• 12-15 ft ceiling minimum</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
