import React from 'react';
import { Thermometer, Zap, Droplets, Building2, AlertTriangle } from 'lucide-react';
import { gpuSpecs } from '../../data/gpuSpecs';

interface CoolingPowerTabEnhancedProps {
  config: any;
  results: any;
}

// Cooling system specifications from research
const coolingSpecs = {
  liquidCooling: {
    cdu: {
      coolit_chx2000: {
        name: 'CoolIT CHx2000',
        capacity: 2000000, // 2MW
        racks_supported: 12, // GB200 NVL72 racks
        price: 850000,
        power: 50000,
        flow_rate: 2400, // L/min
        reference: 'CoolIT Systems CHx2000'
      },
      motivair_2300: {
        name: 'Motivair 2.3MW CDU',
        capacity: 2300000,
        racks_supported: 15,
        price: 950000,
        power: 60000,
        flow_rate: 2800,
        reference: 'Motivair CDU Portfolio'
      }
    },
    infrastructure_per_rack: 180000, // Plumbing, controls, installation
    coolant_cost_per_liter: 25, // Propylene glycol mixture
    maintenance_annual: 0.05 // 5% of capital cost
  },
  airCooling: {
    crac_per_mw: 450000,
    efficiency_factor: 0.45, // 45% of IT load for cooling
    maintenance_annual: 0.08
  }
};

// Regional electricity rates
const regionRates: Record<string, { rate: number; name: string }> = {
  'us-texas': { rate: 0.047, name: 'US Texas' },
  'us-virginia': { rate: 0.085, name: 'US Virginia' },
  'us-california': { rate: 0.150, name: 'US California' },
  'europe': { rate: 0.120, name: 'Europe' },
  'asia': { rate: 0.100, name: 'Asia Pacific' }
};

export const CoolingPowerTabEnhanced: React.FC<CoolingPowerTabEnhancedProps> = ({ config, results }) => {
  const { numGPUs, gpuModel, coolingType, region } = config;
  const spec = gpuSpecs[gpuModel];
  const regionRate = regionRates[region].rate;
  
  const calculateCoolingDetails = () => {
    const isGB200 = gpuModel === 'gb200';
    const isGB300 = gpuModel === 'gb300';
    
    // Calculate IT load
    const gpuPower = numGPUs * spec.powerPerGPU;
    const gracePower = isGB200 || isGB300 ? Math.ceil(numGPUs / 72) * (isGB200 ? 36 * 300 : 36 * 350) : 0;
    const nvlinkPower = isGB200 || isGB300 ? Math.ceil(numGPUs / 8) * (isGB200 ? 400 : 500) : 0;
    // DPU power: 4× dual-port BlueField-3 DPUs per NVL72 system at 150W each = 600W per system
    const dpuPower = config.enableBluefield ? 
      (isGB200 || isGB300 ? Math.ceil(numGPUs / 72) * 4 * 150 : Math.ceil(numGPUs / 8) * 150) : 0;
    const networkingPower = results?.networking?.power || 500000; // 500kW default
    const storagePower = results?.storage?.power || 200000; // 200kW default
    
    const totalITPower = gpuPower + gracePower + nvlinkPower + dpuPower + networkingPower + storagePower;
    
    // Apply PUE
    const pue = spec.pue[coolingType];
    const totalPower = totalITPower * pue;
    const coolingPower = totalPower - totalITPower;
    
    // Cooling system sizing
    let coolingSystem: any = {};
    if (coolingType === 'liquid') {
      const numRacks = Math.ceil(numGPUs / (spec.rackSize || 72));
      const coolingCapacityRequired = totalITPower;
      
      // Select CDU based on capacity
      const cduSpec = coolingCapacityRequired > 2000000 
        ? coolingSpecs.liquidCooling.cdu.motivair_2300
        : coolingSpecs.liquidCooling.cdu.coolit_chx2000;
      
      const numCDUs = Math.ceil(numRacks / cduSpec.racks_supported);
      
      coolingSystem = {
        type: 'Direct Liquid Cooling (DLC)',
        cdus: {
          model: cduSpec.name,
          count: numCDUs,
          capacity: cduSpec.capacity,
          cost: cduSpec.price * numCDUs,
          power: cduSpec.power * numCDUs
        },
        infrastructure: {
          cost: coolingSpecs.liquidCooling.infrastructure_per_rack * numRacks,
          description: 'Plumbing, manifolds, quick disconnects'
        },
        coolant: {
          volume: numRacks * 200, // Liters per rack
          cost: numRacks * 200 * coolingSpecs.liquidCooling.coolant_cost_per_liter,
          type: '30% propylene glycol mixture'
        },
        specifications: {
          inlet_temp: '25°C',
          flow_rate: `${(numRacks * 2).toFixed(1)} L/s total`,
          pressure_drop: '2.1 bar',
          approach_temp: '3°C'
        }
      };
    } else {
      // Air cooling calculations
      const cracCapacity = coolingPower;
      const numCRACs = Math.ceil(cracCapacity / 350000); // 350kW per CRAC unit
      
      coolingSystem = {
        type: 'Air Cooling',
        cracs: {
          count: numCRACs,
          capacity: 350000,
          cost: coolingSpecs.airCooling.crac_per_mw * (cracCapacity / 1000000),
          power: coolingPower
        },
        specifications: {
          inlet_temp: '18-27°C',
          delta_t: '10-15°C',
          airflow: `${(numGPUs * 200).toLocaleString()} CFM`
        }
      };
    }
    
    // Power distribution
    const numRacks = Math.ceil(numGPUs / (spec.rackSize || 72));
    const powerDistribution = {
      racksTotal: numRacks,
      powerPerRack: isGB200 ? 120 : (isGB300 ? 140 : 10.4),
      pduPerRack: 3, // N+1 configuration
      voltage: '415V',
      phase: '3-phase',
      amperage: '32A',
      totalPDUs: numRacks * 3,
      pduCost: 20000, // Per PDU
      distributionCost: numRacks * 3 * 20000
    };
    
    // Annual costs
    const annualPowerCost = (totalPower / 1000) * 8760 * regionRate;
    const annualCoolingMaintenance = coolingType === 'liquid' 
      ? (coolingSystem.cdus.cost + coolingSystem.infrastructure.cost) * coolingSpecs.liquidCooling.maintenance_annual
      : coolingSystem.cracs.cost * coolingSpecs.airCooling.maintenance_annual;
    
    return {
      power: {
        gpus: gpuPower,
        grace: gracePower,
        nvlink: nvlinkPower,
        dpus: dpuPower,
        networking: networkingPower,
        storage: storagePower,
        totalIT: totalITPower,
        cooling: coolingPower,
        totalFacility: totalPower
      },
      pue,
      cooling: coolingSystem,
      powerDistribution,
      costs: {
        capital: {
          cooling: coolingType === 'liquid' 
            ? coolingSystem.cdus.cost + coolingSystem.infrastructure.cost + coolingSystem.coolant.cost
            : coolingSystem.cracs.cost,
          powerDist: powerDistribution.distributionCost,
          total: 0 // Will be calculated
        },
        operating: {
          power: annualPowerCost,
          maintenance: annualCoolingMaintenance,
          total: annualPowerCost + annualCoolingMaintenance
        }
      }
    };
  };
  
  const coolingDetails = calculateCoolingDetails();
  coolingDetails.costs.capital.total = coolingDetails.costs.capital.cooling + coolingDetails.costs.capital.powerDist;
  
  return (
    <div className="space-y-6">
      {/* Software Licensing Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">Important Notice</h4>
            <p className="text-sm text-yellow-700">
              This TCO calculator does not yet include Software Support and/or Licensing costs. 
              Functionality arriving soon.
            </p>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
        Cooling & Power Infrastructure
      </h2>
      
      {/* Power Breakdown */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h3 className="text-lg font-bold text-gray-800 p-4 border-b border-gray-200">
          Power Consumption Breakdown
        </h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Component</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Power (kW)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Power (MW)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">% of IT Load</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3">GPUs ({numGPUs.toLocaleString()} × {spec.powerPerGPU}W)</td>
              <td className="px-4 py-3">{(coolingDetails.power.gpus / 1000).toFixed(0).toLocaleString()}</td>
              <td className="px-4 py-3">{(coolingDetails.power.gpus / 1000000).toFixed(2)}</td>
              <td className="px-4 py-3">{((coolingDetails.power.gpus / coolingDetails.power.totalIT) * 100).toFixed(1)}%</td>
            </tr>
            {(gpuModel === 'gb200' || gpuModel === 'gb300') && (
              <>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3">Grace CPUs</td>
                  <td className="px-4 py-3">{(coolingDetails.power.grace / 1000).toFixed(0).toLocaleString()}</td>
                  <td className="px-4 py-3">{(coolingDetails.power.grace / 1000000).toFixed(2)}</td>
                  <td className="px-4 py-3">{((coolingDetails.power.grace / coolingDetails.power.totalIT) * 100).toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3">NVLink Switch Trays</td>
                  <td className="px-4 py-3">{(coolingDetails.power.nvlink / 1000).toFixed(0).toLocaleString()}</td>
                  <td className="px-4 py-3">{(coolingDetails.power.nvlink / 1000000).toFixed(2)}</td>
                  <td className="px-4 py-3">{((coolingDetails.power.nvlink / coolingDetails.power.totalIT) * 100).toFixed(1)}%</td>
                </tr>
              </>
            )}
            {config.enableBluefield && (
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3">BlueField-3 DPUs</td>
                <td className="px-4 py-3">{(coolingDetails.power.dpus / 1000).toFixed(0).toLocaleString()}</td>
                <td className="px-4 py-3">{(coolingDetails.power.dpus / 1000000).toFixed(2)}</td>
                <td className="px-4 py-3">{((coolingDetails.power.dpus / coolingDetails.power.totalIT) * 100).toFixed(1)}%</td>
              </tr>
            )}
            <tr className="border-b border-gray-200 bg-blue-50 font-semibold">
              <td className="px-4 py-3">Total IT Load</td>
              <td className="px-4 py-3">{(coolingDetails.power.totalIT / 1000).toFixed(0).toLocaleString()}</td>
              <td className="px-4 py-3">{(coolingDetails.power.totalIT / 1000000).toFixed(2)}</td>
              <td className="px-4 py-3">100.0%</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3">Cooling Load (PUE factor)</td>
              <td className="px-4 py-3">{(coolingDetails.power.cooling / 1000).toFixed(0).toLocaleString()}</td>
              <td className="px-4 py-3">{(coolingDetails.power.cooling / 1000000).toFixed(2)}</td>
              <td className="px-4 py-3">PUE: {coolingDetails.pue.toFixed(2)}</td>
            </tr>
            <tr className="bg-yellow-50 font-bold">
              <td className="px-4 py-3">Total Facility Power</td>
              <td className="px-4 py-3">{(coolingDetails.power.totalFacility / 1000).toFixed(0).toLocaleString()}</td>
              <td className="px-4 py-3">{(coolingDetails.power.totalFacility / 1000000).toFixed(2)}</td>
              <td className="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Cooling System Details */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <h3 className="flex items-center gap-2 text-lg font-bold text-blue-800 mb-2">
          <Thermometer className="w-5 h-5" />
          {coolingDetails.cooling.type} System Requirements
        </h3>
        {coolingType === 'liquid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">CDU Specifications</h4>
              <table className="w-full bg-white rounded-lg">
                <tbody>
                  <tr className="border-b">
                    <td className="px-3 py-2 text-sm text-gray-600">Model</td>
                    <td className="px-3 py-2 text-sm font-semibold">{coolingDetails.cooling.cdus.model}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-3 py-2 text-sm text-gray-600">Quantity</td>
                    <td className="px-3 py-2 text-sm font-semibold">{coolingDetails.cooling.cdus.count}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-3 py-2 text-sm text-gray-600">Capacity</td>
                    <td className="px-3 py-2 text-sm font-semibold">{(coolingDetails.cooling.cdus.capacity / 1000000).toFixed(1)} MW each</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-600">Cost</td>
                    <td className="px-3 py-2 text-sm font-semibold">${(coolingDetails.cooling.cdus.cost / 1000000).toFixed(2)}M</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Operating Parameters</h4>
              <table className="w-full bg-white rounded-lg">
                <tbody>
                  <tr className="border-b">
                    <td className="px-3 py-2 text-sm text-gray-600">Inlet Temperature</td>
                    <td className="px-3 py-2 text-sm font-semibold">{coolingDetails.cooling.specifications.inlet_temp}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-3 py-2 text-sm text-gray-600">Flow Rate</td>
                    <td className="px-3 py-2 text-sm font-semibold">{coolingDetails.cooling.specifications.flow_rate}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-3 py-2 text-sm text-gray-600">Pressure Drop</td>
                    <td className="px-3 py-2 text-sm font-semibold">{coolingDetails.cooling.specifications.pressure_drop}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-600">Coolant Type</td>
                    <td className="px-3 py-2 text-sm font-semibold">{coolingDetails.cooling.coolant.type}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-500">CRAC Units</div>
              <div className="text-xl font-bold">{coolingDetails.cooling.cracs.count}</div>
              <div className="text-xs text-gray-500">350kW each</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-500">Total Airflow</div>
              <div className="text-xl font-bold">{coolingDetails.cooling.specifications.airflow}</div>
              <div className="text-xs text-gray-500">CFM required</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-500">Temperature Delta</div>
              <div className="text-xl font-bold">{coolingDetails.cooling.specifications.delta_t}</div>
              <div className="text-xs text-gray-500">Supply to return</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Power Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Power Distribution Infrastructure</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">Total Racks</div>
            <div className="text-xl font-bold">{coolingDetails.powerDistribution.racksTotal}</div>
            <div className="text-xs text-gray-500">{coolingDetails.powerDistribution.powerPerRack}kW each</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">PDUs Required</div>
            <div className="text-xl font-bold">{coolingDetails.powerDistribution.totalPDUs}</div>
            <div className="text-xs text-gray-500">3 per rack (N+1)</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Voltage/Phase</div>
            <div className="text-xl font-bold">{coolingDetails.powerDistribution.voltage}</div>
            <div className="text-xs text-gray-500">{coolingDetails.powerDistribution.phase}, {coolingDetails.powerDistribution.amperage}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Distribution Cost</div>
            <div className="text-xl font-bold">${(coolingDetails.powerDistribution.distributionCost / 1000000).toFixed(2)}M</div>
            <div className="text-xs text-gray-500">PDUs + installation</div>
          </div>
        </div>
      </div>
      
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Capital Costs</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cooling System</span>
              <span className="text-sm font-semibold">${(coolingDetails.costs.capital.cooling / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Power Distribution</span>
              <span className="text-sm font-semibold">${(coolingDetails.costs.capital.powerDist / 1000000).toFixed(2)}M</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-sm font-bold">Total CAPEX</span>
              <span className="text-sm font-bold">${(coolingDetails.costs.capital.total / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Annual Operating Costs</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Power @ ${regionRates[region].rate}/kWh</span>
              <span className="text-sm font-semibold">${(coolingDetails.costs.operating.power / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Maintenance</span>
              <span className="text-sm font-semibold">${(coolingDetails.costs.operating.maintenance / 1000000).toFixed(2)}M</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-sm font-bold">Total Annual OPEX</span>
              <span className="text-sm font-bold">${(coolingDetails.costs.operating.total / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Liquid Cooling System Architecture */}
      {coolingType === 'liquid' && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            Liquid Cooling System Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Primary Loop (Facility)</h4>
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
              <h4 className="font-semibold text-gray-700 mb-3">Secondary Loop (IT)</h4>
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
      )}

      {/* Power Infrastructure Requirements */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Power Infrastructure Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Electrical Distribution</h4>
            <div className="space-y-1 text-sm">
              <p>• {Math.ceil((coolingDetails.power.totalFacility / 1000000) / 2.5)} × 2.5MW feeds</p>
              <p>• 2N UPS configuration</p>
              <p>• 480V 3-phase distribution</p>
              <p>• {coolingDetails.powerDistribution.totalPDUs} PDUs total</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Backup Systems</h4>
            <div className="space-y-1 text-sm">
              <p>• N+1 generator redundancy</p>
              <p>• 15-minute UPS runtime</p>
              <p>• Automatic transfer switches</p>
              <p>• Load bank testing monthly</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Monitoring & Control</h4>
            <div className="space-y-1 text-sm">
              <p>• Real-time power monitoring</p>
              <p>• Automated load balancing</p>
              <p>• PUE tracking & optimization</p>
              <p>• Predictive maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Space Requirements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-600" />
          Facility Space Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">IT Space</h4>
            <p className="text-2xl font-bold text-blue-600">
              {((coolingDetails.powerDistribution.racksTotal) * 0.93).toFixed(1)} m²
            </p>
            <p className="text-sm text-gray-600">White space for racks</p>
            <div className="mt-2 text-xs text-gray-500">
              • 0.93 m² per rack
              <br />• Hot/cold aisle containment
              <br />• 3.7-4.6 m ceiling minimum
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Mechanical Space</h4>
            <p className="text-2xl font-bold text-green-600">
              {((coolingDetails.powerDistribution.racksTotal) * 0.46).toFixed(1)} m²
            </p>
            <p className="text-sm text-gray-600">Cooling & power equipment</p>
            <div className="mt-2 text-xs text-gray-500">
              • CDUs and pumps
              <br />• Electrical switchgear
              <br />• Monitoring systems
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Total Footprint</h4>
            <p className="text-2xl font-bold text-purple-600">
              {((coolingDetails.powerDistribution.racksTotal) * 1.39).toFixed(1)} m²
            </p>
            <p className="text-sm text-gray-600">Complete facility</p>
            <div className="mt-2 text-xs text-gray-500">
              • Including support areas
              <br />• Office & staging space
              <br />• Emergency egress paths
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
