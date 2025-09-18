import React from 'react';
import { FileText, Calculator } from 'lucide-react';

export const FormulasTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          Calculation Methodology
        </h2>
        <p className="text-gray-700">
          This calculator uses industry-standard formulas and real-world data to provide accurate TCO estimates 
          for large-scale GPU deployments. All calculations are based on publicly available specifications and 
          validated deployment patterns.
        </p>
      </div>

      {/* Core Formulas */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Core TCO Formulas</h3>
        <div className="space-y-6">
          {/* Power Calculations */}
          <div className="border-l-4 border-yellow-400 pl-4">
            <h4 className="font-semibold text-gray-800 mb-2">Power Consumption</h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
              <p className="mb-2">Total_Power_MW = (GPU_Power_W × Num_GPUs × PUE) / 1,000,000</p>
              <p className="mb-2">Annual_Energy_MWh = Total_Power_MW × 8,760</p>
              <p>Annual_Power_Cost = Annual_Energy_MWh × Regional_Rate_per_kWh × 1,000</p>
            </div>
          </div>

          {/* Network Calculations */}
          <div className="border-l-4 border-purple-400 pl-4">
            <h4 className="font-semibold text-gray-800 mb-2">Network Architecture</h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
              <p className="mb-2">Pods = ceil(Num_GPUs / 1024)</p>
              <p className="mb-2">Leaf_Switches = Pods × 32</p>
              <p className="mb-2">Spine_Switches = Pods × 16</p>
              <p>Core_Switches = ceil(Pods / 4) × 8</p>
            </div>
          </div>

          {/* Cost per GPU Hour */}
          <div className="border-l-4 border-green-400 pl-4">
            <h4 className="font-semibold text-gray-800 mb-2">Cost per GPU Hour</h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
              <p className="mb-2">Annual_Depreciation = Total_CAPEX / Depreciation_Years</p>
              <p className="mb-2">Annual_GPU_Hours = Num_GPUs × 8,760 × (Utilization% / 100)</p>
              <p>Cost_per_GPU_Hour = (Annual_Depreciation + Annual_OPEX) / Annual_GPU_Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Key Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Infrastructure</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Infrastructure CAPEX: 15% of GPU cost</li>
              <li>• General maintenance: 3% of CAPEX annually</li>
              <li>• Network maintenance: 5% of network CAPEX</li>
              <li>• Facility lifespan: 15-20 years</li>
              <li>• GPU refresh cycle: 3-5 years</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Operational</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 24/7 operation (8,760 hours/year)</li>
              <li>• N+1 redundancy for critical systems</li>
              <li>• 99.99% uptime target</li>
              <li>• Staff costs included in maintenance</li>
              <li>• Insurance and licensing extra</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Advanced Formulas */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Advanced Calculations</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <h4 className="font-semibold text-gray-800 mb-2">Tiered Storage Costs</h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
              <p className="mb-2">Storage_CAPEX = Total_PB × 1,000,000 × $0.10/GB</p>
              <p className="mb-2">Hot_Tier_GB = Total_GB × 0.20</p>
              <p className="mb-2">Warm_Tier_GB = Total_GB × 0.35</p>
              <p className="mb-2">Cold_Tier_GB = Total_GB × 0.35</p>
              <p>Archive_Tier_GB = Total_GB × 0.10</p>
            </div>
          </div>

          <div className="border-l-4 border-red-400 pl-4">
            <h4 className="font-semibold text-gray-800 mb-2">Cooling Requirements</h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
              <p className="mb-2">CDUs_Required = ceil(Num_Racks / CDU_Coverage)</p>
              <p className="mb-2">Cooling_Capacity_MW = IT_Load_MW × (PUE - 1)</p>
              <p>Cooling_CAPEX = CDUs × $75,000 + Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Important Notes
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• All prices are estimates based on publicly available information</li>
          <li>• Actual costs vary significantly based on scale and negotiations</li>
          <li>• Regional factors can impact costs by ±30%</li>
          <li>• Formulas are simplified for clarity - production deployments require detailed analysis</li>
        </ul>
      </div>
    </div>
  );
};
