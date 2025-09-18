import React from 'react';
import { Info } from 'lucide-react';

export const StorageAnalysis: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-4">Storage Architecture Analysis</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
        <h3 className="flex items-center gap-2 text-xl font-bold text-blue-800 mb-3">
          <Info className="w-6 h-6" />
          Recommended: Mixed Architecture (VAST/Weka + Ceph)
        </h3>
        <p className="text-gray-700 mb-3">
          Industry best practice combines high-performance storage for hot data with cost-effective open-source for cold tiers:
        </p>
        <ul className="space-y-2 ml-8 text-gray-700">
          <li className="list-disc"><strong>Hot (20%):</strong> VAST/Weka for active training, &lt;1ms latency</li>
          <li className="list-disc"><strong>Warm (35%):</strong> Pure //E or NetApp for recent data</li>
          <li className="list-disc"><strong>Cold (35%):</strong> Ceph HDD with erasure coding</li>
          <li className="list-disc"><strong>Archive (10%):</strong> Object storage or tape</li>
          <li className="list-disc"><strong>Cost savings:</strong> 50-70% vs all-flash</li>
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h3 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-200">Storage Requirements by Scale</h3>
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left">GPU Count</th>
              <th className="px-6 py-4 text-left">Min Storage</th>
              <th className="px-6 py-4 text-left">Typical Storage</th>
              <th className="px-6 py-4 text-left">Hot Tier Size</th>
              <th className="px-6 py-4 text-left">Bandwidth Required</th>
              <th className="px-6 py-4 text-left">IOPS Required</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">1,000</td>
              <td className="px-6 py-4">2 PB</td>
              <td className="px-6 py-4">5 PB</td>
              <td className="px-6 py-4">0.5-1 PB</td>
              <td className="px-6 py-4">50 GB/s</td>
              <td className="px-6 py-4">1M IOPS</td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">10,000</td>
              <td className="px-6 py-4">20 PB</td>
              <td className="px-6 py-4">50 PB</td>
              <td className="px-6 py-4">5-10 PB</td>
              <td className="px-6 py-4">500 GB/s</td>
              <td className="px-6 py-4">10M IOPS</td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">50,000</td>
              <td className="px-6 py-4">100 PB</td>
              <td className="px-6 py-4">250 PB</td>
              <td className="px-6 py-4">25-50 PB</td>
              <td className="px-6 py-4">2.5 TB/s</td>
              <td className="px-6 py-4">50M IOPS</td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">100,000</td>
              <td className="px-6 py-4">200 PB</td>
              <td className="px-6 py-4">500 PB</td>
              <td className="px-6 py-4">50-100 PB</td>
              <td className="px-6 py-4">5 TB/s</td>
              <td className="px-6 py-4">100M IOPS</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-4">Storage Tier Characteristics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-400 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-gray-800">🔥 Hot Tier</span>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">15-20% of Total</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Performance</td>
                <td className="py-2 font-semibold">&gt;100GB/s per PB</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Latency</td>
                <td className="py-2 font-semibold">&lt;1ms</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Media</td>
                <td className="py-2 font-semibold">NVMe All-Flash</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Power/TB</td>
                <td className="py-2 font-semibold">10-15W</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Use Cases</td>
                <td className="py-2 font-semibold">Active training, checkpoints</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-400 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-gray-800">🌡 Warm Tier</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">30-40% of Total</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Performance</td>
                <td className="py-2 font-semibold">10-50GB/s per PB</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Latency</td>
                <td className="py-2 font-semibold">&lt;10ms</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Media</td>
                <td className="py-2 font-semibold">SSD/QLC Flash</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Power/TB</td>
                <td className="py-2 font-semibold">2-5W</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Use Cases</td>
                <td className="py-2 font-semibold">Recent models, validation data</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-400 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-gray-800">❄️ Cold Tier</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">30-40% of Total</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Performance</td>
                <td className="py-2 font-semibold">1-10GB/s per PB</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Latency</td>
                <td className="py-2 font-semibold">&lt;100ms</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Media</td>
                <td className="py-2 font-semibold">HDD/SATA</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Power/TB</td>
                <td className="py-2 font-semibold">6-8W</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Use Cases</td>
                <td className="py-2 font-semibold">Historical data, old versions</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-400 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-gray-800">🗄 Archive Tier</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">10-15% of Total</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Performance</td>
                <td className="py-2 font-semibold">Hours-Days retrieval</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Cost Target</td>
                <td className="py-2 font-semibold">&lt;$0.004/GB/month</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Media</td>
                <td className="py-2 font-semibold">Tape/Cloud Archive</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Power/TB</td>
                <td className="py-2 font-semibold">0-4W</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Use Cases</td>
                <td className="py-2 font-semibold">Compliance, backup</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
