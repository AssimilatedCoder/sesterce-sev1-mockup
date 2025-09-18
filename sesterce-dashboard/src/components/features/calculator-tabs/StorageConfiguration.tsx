import React from 'react';
import { HardDrive } from 'lucide-react';

interface StorageConfigurationProps {
  totalStorage: number;
  setTotalStorage: (value: number) => void;
  storageArchitecture: string;
  setStorageArchitecture: (value: string) => void;
  hotPercent: number;
  setHotPercent: (value: number) => void;
  warmPercent: number;
  setWarmPercent: (value: number) => void;
  coldPercent: number;
  setColdPercent: (value: number) => void;
  archivePercent: number;
  setArchivePercent: (value: number) => void;
  hotVendor: string;
  setHotVendor: (value: string) => void;
  warmVendor: string;
  setWarmVendor: (value: string) => void;
  coldVendor: string;
  setColdVendor: (value: string) => void;
  archiveVendor: string;
  setArchiveVendor: (value: string) => void;
}

export const StorageConfiguration: React.FC<StorageConfigurationProps> = ({
  totalStorage,
  setTotalStorage,
  storageArchitecture,
  setStorageArchitecture,
  hotPercent,
  setHotPercent,
  warmPercent,
  setWarmPercent,
  coldPercent,
  setColdPercent,
  archivePercent,
  setArchivePercent,
  hotVendor,
  setHotVendor,
  warmVendor,
  setWarmVendor,
  coldVendor,
  setColdVendor,
  archiveVendor,
  setArchiveVendor
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <HardDrive className="w-6 h-6 text-blue-500" />
        Storage Configuration
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">Total Storage Capacity</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={totalStorage}
              onChange={(e) => setTotalStorage(parseInt(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
              min="1"
              max="1000"
              step="10"
            />
            <span className="text-gray-700 font-semibold">PB</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Total across all tiers</span>
        </div>

        <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">Storage Architecture</label>
          <select 
            value={storageArchitecture}
            onChange={(e) => setStorageArchitecture(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
          >
            <option value="mixed">Mixed (VAST/Weka + Ceph)</option>
            <option value="allflash">All-Flash (VAST/Pure)</option>
            <option value="hybrid">Hybrid (Flash + HDD)</option>
            <option value="opensource">Open Source (Ceph)</option>
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Storage Tier Distribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
            <label className="block text-sm font-bold text-gray-700 mb-2">🔥 Hot Tier</label>
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="number" 
                value={hotPercent}
                onChange={(e) => setHotPercent(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
                min="10"
                max="50"
              />
              <span className="text-gray-700 font-semibold">%</span>
            </div>
            <select 
              value={hotVendor}
              onChange={(e) => setHotVendor(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50 text-sm"
            >
              <option value="vast">VAST Data</option>
              <option value="weka">Weka NeuralMesh</option>
              <option value="ddn">DDN EXAScaler</option>
              <option value="pure-s">Pure FlashBlade//S</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
            <label className="block text-sm font-bold text-gray-700 mb-2">🌡 Warm Tier</label>
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="number" 
                value={warmPercent}
                onChange={(e) => setWarmPercent(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
                min="0"
                max="50"
              />
              <span className="text-gray-700 font-semibold">%</span>
            </div>
            <select 
              value={warmVendor}
              onChange={(e) => setWarmVendor(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50 text-sm"
            >
              <option value="pure-e">Pure FlashBlade//E</option>
              <option value="netapp">NetApp ONTAP</option>
              <option value="vast-capacity">VAST Capacity</option>
              <option value="ceph-ssd">Ceph SSD</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
            <label className="block text-sm font-bold text-gray-700 mb-2">❄️ Cold Tier</label>
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="number" 
                value={coldPercent}
                onChange={(e) => setColdPercent(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
                min="0"
                max="50"
              />
              <span className="text-gray-700 font-semibold">%</span>
            </div>
            <select 
              value={coldVendor}
              onChange={(e) => setColdVendor(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50 text-sm"
            >
              <option value="ceph">Ceph HDD</option>
              <option value="ddn-infinia">DDN Infinia</option>
              <option value="netapp-capacity">NetApp Capacity</option>
              <option value="object">S3-Compatible</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
            <label className="block text-sm font-bold text-gray-700 mb-2">🗄 Archive Tier</label>
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="number" 
                value={archivePercent}
                onChange={(e) => setArchivePercent(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
                min="0"
                max="30"
              />
              <span className="text-gray-700 font-semibold">%</span>
            </div>
            <select 
              value={archiveVendor}
              onChange={(e) => setArchiveVendor(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50 text-sm"
            >
              <option value="glacier">AWS Glacier</option>
              <option value="azure-archive">Azure Archive</option>
              <option value="tape">Tape Library</option>
              <option value="ceph-ec">Ceph Erasure Coded</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
