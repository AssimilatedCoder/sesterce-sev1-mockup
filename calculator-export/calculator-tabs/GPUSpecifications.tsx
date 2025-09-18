import React from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';

export const GPUSpecifications: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-4">Detailed GPU Specifications</h2>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
        <h3 className="flex items-center gap-2 text-xl font-bold text-yellow-800 mb-3">
          <AlertTriangle className="w-6 h-6" />
          Critical Technical Specifications
        </h3>
        <ul className="space-y-2 ml-8 text-gray-700">
          <li className="list-disc"><strong>GB200/GB300:</strong> Liquid cooling ONLY - 120-140kW rack power exceeds air cooling</li>
          <li className="list-disc"><strong>H100:</strong> Supports both air and liquid cooling with different efficiency</li>
          <li className="list-disc"><strong>Power values:</strong> All verified from NVIDIA documentation</li>
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left">GPU Model</th>
              <th className="px-6 py-4 text-left">Power/GPU</th>
              <th className="px-6 py-4 text-left">Memory</th>
              <th className="px-6 py-4 text-left">Cooling Options</th>
              <th className="px-6 py-4 text-left">Rack Config</th>
              <th className="px-6 py-4 text-left">Total Rack Power</th>
              <th className="px-6 py-4 text-left">Unit Price</th>
              <th className="px-6 py-4 text-left">Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">GB200 NVL72</td>
              <td className="px-6 py-4">
                1,200W 
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  VERIFIED
                </span>
              </td>
              <td className="px-6 py-4">192GB HBM3e</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Liquid Only
                </span>
              </td>
              <td className="px-6 py-4">72 GPUs + 36 Grace CPUs</td>
              <td className="px-6 py-4">120kW</td>
              <td className="px-6 py-4">$65,000</td>
              <td className="px-6 py-4">
                <a 
                  href="https://www.nvidia.com/en-us/data-center/gb200-nvl72/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  NVIDIA <ExternalLink className="w-3 h-3" />
                </a>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">GB300 NVL72</td>
              <td className="px-6 py-4">
                1,400W 
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  VERIFIED
                </span>
              </td>
              <td className="px-6 py-4">288GB HBM3e</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Liquid Only
                </span>
              </td>
              <td className="px-6 py-4">72 GPUs + 36 Grace CPUs</td>
              <td className="px-6 py-4">135-140kW</td>
              <td className="px-6 py-4">$85,000</td>
              <td className="px-6 py-4">
                <a 
                  href="https://www.nvidia.com/en-us/data-center/gb300-nvl72/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  NVIDIA <ExternalLink className="w-3 h-3" />
                </a>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">H100 SXM5</td>
              <td className="px-6 py-4">
                700W 
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  VERIFIED
                </span>
              </td>
              <td className="px-6 py-4">80GB HBM3</td>
              <td className="px-6 py-4">Air OR Liquid</td>
              <td className="px-6 py-4">8 GPUs (HGX)</td>
              <td className="px-6 py-4">5.6kW (8 GPUs)</td>
              <td className="px-6 py-4">$30,000</td>
              <td className="px-6 py-4">
                <a 
                  href="https://www.nvidia.com/en-us/data-center/h100/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  NVIDIA <ExternalLink className="w-3 h-3" />
                </a>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">H100 PCIe</td>
              <td className="px-6 py-4">
                350W 
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  VERIFIED
                </span>
              </td>
              <td className="px-6 py-4">80GB HBM3</td>
              <td className="px-6 py-4">Air Cooled</td>
              <td className="px-6 py-4">Flexible</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">$25,000</td>
              <td className="px-6 py-4">
                <a 
                  href="https://www.nvidia.com/en-us/data-center/h100/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  NVIDIA <ExternalLink className="w-3 h-3" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-400 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 mb-4">GB200 NVL72 Details</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Architecture</td>
                <td className="py-2 text-gray-600">Blackwell + Grace</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Tensor Cores</td>
                <td className="py-2 text-gray-600">5th Gen</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">FP8 Performance</td>
                <td className="py-2 text-gray-600">20 PFLOPS</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Memory Bandwidth</td>
                <td className="py-2 text-gray-600">8TB/s per GPU</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">NVLink Bandwidth</td>
                <td className="py-2 text-gray-600">130TB/s aggregate</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Rack Weight</td>
                <td className="py-2 text-gray-600">1.36 metric tons</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Availability</td>
                <td className="py-2 text-gray-600">Now</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-400 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 mb-4">GB300 NVL72 Details</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Architecture</td>
                <td className="py-2 text-gray-600">Blackwell Ultra</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">vs GB200</td>
                <td className="py-2 text-gray-600">+50% FP4 performance</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Memory</td>
                <td className="py-2 text-gray-600">288GB HBM3e</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Power System</td>
                <td className="py-2 text-gray-600">Power smoothing tech</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Cooling</td>
                <td className="py-2 text-gray-600">Next-gen liquid</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Rack Power</td>
                <td className="py-2 text-gray-600">135-140kW</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Availability</td>
                <td className="py-2 text-gray-600">Q2-Q3 2025</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-400 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 mb-4">H100 SXM5 Details</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Architecture</td>
                <td className="py-2 text-gray-600">Hopper</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Tensor Cores</td>
                <td className="py-2 text-gray-600">640 4th Gen</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">FP8 Performance</td>
                <td className="py-2 text-gray-600">4 PFLOPS</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Memory Bandwidth</td>
                <td className="py-2 text-gray-600">3.35TB/s</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">NVLink</td>
                <td className="py-2 text-gray-600">18 links @ 900GB/s</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Form Factor</td>
                <td className="py-2 text-gray-600">SXM5</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Typical Config</td>
                <td className="py-2 text-gray-600">DGX H100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
