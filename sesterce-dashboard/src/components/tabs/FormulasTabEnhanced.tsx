import React from 'react';
import { FileText, Calculator } from 'lucide-react';

export const FormulasTabEnhanced: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
        Calculation Formulas & Methodology
      </h2>
      
      {/* GPU Power Calculations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">GPU & Compute Power Calculations</h3>
        <div className="space-y-4 font-mono text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">GB200/GB300 Rack Power:</div>
            <div>Rack_Power = (GPUs_per_rack × GPU_Power) + (Grace_CPUs × Grace_Power) + (NVLink_Switches × Switch_Power)</div>
            <div className="mt-1 text-gray-600">GB200: 72 × 1200W + 36 × 300W + 9 × 400W = 120kW</div>
            <div className="text-gray-600">GB300: 72 × 1400W + 36 × 350W + 9 × 500W = 140kW</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Total IT Power:</div>
            <div>IT_Power = GPU_Power + CPU_Power + NVLink_Power + DPU_Power + Network_Power + Storage_Power</div>
            <div className="mt-1 text-gray-600">DPU_Power = DPU_Count × 75W (BlueField-3)</div>
          </div>
        </div>
      </div>
      
      {/* PUE Calculations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Power Usage Effectiveness (PUE)</h3>
        <div className="space-y-4 font-mono text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Total Facility Power:</div>
            <div>Total_Power = IT_Power × PUE</div>
            <div className="mt-1 text-gray-600">Liquid Cooling PUE: 1.08-1.10 (Google achieves 1.09)</div>
            <div className="text-gray-600">Air Cooling PUE: 1.45-1.50</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Cooling Power:</div>
            <div>Cooling_Power = Total_Power - IT_Power</div>
            <div>Cooling_Power = IT_Power × (PUE - 1)</div>
          </div>
        </div>
      </div>
      
      {/* Networking Calculations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Clos Fabric Network Architecture</h3>
        <div className="space-y-4 font-mono text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Rail-Optimized Design:</div>
            <div>Rails_per_GPU = 9 (GB200/GB300) or 8 (H100)</div>
            <div>Total_Network_Ports = GPUs × Rails_per_GPU</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Pod-Based Scaling:</div>
            <div>GPUs_per_Pod = 1024 (standard)</div>
            <div>Leaf_Switches_per_Pod = ⌈GPUs_per_Pod / 64⌉</div>
            <div>Spine_Switches_per_Pod = ⌈(Leaf_Switches × Rails) / Switch_Radix⌉</div>
            <div>Core_Switches = 16 (≤25k GPUs), 32 (≤50k), 64 (>50k)</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Bisection Bandwidth:</div>
            <div>Bisection_BW = Core_Switches × Switch_Ports × Port_Speed / 8</div>
            <div className="mt-1 text-gray-600">1:1 oversubscription for RDMA traffic</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">BlueField-3 DPU Count:</div>
            <div>GB200/300: DPUs = ⌈GPUs / 2⌉ (one per compute tray)</div>
            <div>H100: DPUs = ⌈GPUs / 8⌉ (one per DGX node)</div>
          </div>
        </div>
      </div>
      
      {/* Cooling System Sizing */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Liquid Cooling System Sizing</h3>
        <div className="space-y-4 font-mono text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">CDU Requirements:</div>
            <div>CDU_Capacity = IT_Power × 1.2 (20% overhead)</div>
            <div>Num_CDUs = ⌈Num_Racks / CDU_Rack_Support⌉</div>
            <div className="mt-1 text-gray-600">CoolIT CHx2000: 2MW supports 12 GB200 racks</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Flow Rate Requirements:</div>
            <div>Flow_Rate = 2 L/s per GB200 rack</div>
            <div>Coolant_Volume = 200 L per rack</div>
            <div>Pressure_Drop = 2.1 bar across loop</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Infrastructure Cost:</div>
            <div>Cooling_CAPEX = (CDU_Cost × Num_CDUs) + (Infrastructure_per_Rack × Num_Racks)</div>
            <div className="mt-1 text-gray-600">Infrastructure: $180k/rack (plumbing, manifolds, controls)</div>
          </div>
        </div>
      </div>
      
      {/* Storage Calculations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Tiered Storage Architecture</h3>
        <div className="space-y-4 font-mono text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Storage Tier Distribution:</div>
            <div>Hot_Storage = Total_Storage × 0.20 (VAST/Weka NVMe)</div>
            <div>Warm_Storage = Total_Storage × 0.35 (SSD/QLC)</div>
            <div>Cold_Storage = Total_Storage × 0.35 (HDD/Ceph)</div>
            <div>Archive_Storage = Total_Storage × 0.10 (Tape/Glacier)</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Storage Cost per GB/Month:</div>
            <div>Monthly_Cost = Σ(Tier_Capacity × Vendor_Price_per_GB)</div>
            <div>Storage_Power = Σ(Tier_Capacity × Power_per_TB)</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Storage Bandwidth Requirements:</div>
            <div>BW_per_GPU = 4 GB/s (computer vision)</div>
            <div>Total_Storage_BW = GPUs × BW_per_GPU</div>
            <div className="mt-1 text-gray-600">VAST achieves >100GB/s per PB</div>
          </div>
        </div>
      </div>
      
      {/* TCO Calculations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Total Cost of Ownership (TCO)</h3>
        <div className="space-y-4 font-mono text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">CAPEX Components:</div>
            <div>CAPEX = GPU_Cost + Networking_Cost + Storage_Cost + Cooling_Infrastructure + Power_Distribution</div>
            <div className="mt-1 text-gray-600">Power Infrastructure: $2.4-3.8M per 1,024 GPU pod</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Annual OPEX:</div>
            <div>OPEX = Power_Cost + Cooling_Maintenance + HW_Maintenance + Staff + Bandwidth + Licenses</div>
            <div className="mt-1 text-gray-600">Power: Total_Power_MW × 8760 × $/kWh</div>
            <div className="text-gray-600">Maintenance: 3-5% of HW CAPEX</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">Cost per GPU-Hour:</div>
            <div>Cost_per_Hour = (Annual_Depreciation + Annual_OPEX) / (GPUs × 8760 × Utilization)</div>
            <div className="mt-1 text-gray-600">Depreciation period: 3-5 years</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-bold mb-2">10-Year TCO:</div>
            <div>TCO_10yr = CAPEX + (OPEX × 10)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
