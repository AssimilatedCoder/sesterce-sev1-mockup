import React from 'react';
import { FileText, Cpu, Network, Zap, Building2, Activity } from 'lucide-react';

interface DesignTabProps {
  config: any;
  results: any;
}

export const DesignTab: React.FC<DesignTabProps> = ({ config, results }) => {
  const { numGPUs, gpuModel } = config;
  
  // Calculate architecture breakdown based on design document
  const calculateArchitectureBreakdown = () => {
    const isGB200 = gpuModel === 'gb200' || gpuModel === 'gb300';
    
    // GB200 NVL72 system specifications from design doc
    const gpusPerSystem = isGB200 ? 72 : 8; // NVL72 vs DGX
    const systemsTotal = Math.ceil(numGPUs / gpusPerSystem);
    const racksTotal = systemsTotal; // Each NVL72 is one rack
    
    // Pod architecture (1,008 GPUs per pod from design doc)
    const gpusPerPod = isGB200 ? 1008 : 1024; // Design doc specifies 1,008 for GB200
    const systemsPerPod = isGB200 ? 14 : 128; // 14 NVL72 systems per pod
    const podsTotal = Math.ceil(numGPUs / gpusPerPod);
    
    // Network architecture per design doc
    const dpusPerSystem = isGB200 ? 4 : 1; // 4 dual-port BlueField-3 per NVL72
    const portsPerSystem = isGB200 ? 8 : 8; // 8x 400GbE per system
    const totalDPUs = systemsTotal * dpusPerSystem;
    const total400GLinks = systemsTotal * portsPerSystem;
    
    // Switch calculations per pod (from design doc)
    const leafSwitchesPerPod = 4; // 64-port switches
    const spineSwitchesPerPod = 4; // 64-port switches
    const totalLeafSwitches = podsTotal * leafSwitchesPerPod;
    const totalSpineSwitches = podsTotal * spineSwitchesPerPod;
    
    // Power calculations (120-132kW per NVL72 from design doc)
    const powerPerSystem = isGB200 ? 126 : 10.4; // kW per system
    const totalPowerMW = (systemsTotal * powerPerSystem) / 1000;
    
    // Enhanced storage architecture calculations
    const storageCapacityPerGPU = 5; // TB per GPU baseline
    const totalStorageCapacity = numGPUs * storageCapacityPerGPU / 1000; // PB
    
    // Storage tier distribution (production-proven)
    const tier0Capacity = totalStorageCapacity * 0.15; // Local NVMe
    const hotTierCapacity = totalStorageCapacity * 0.25; // All-flash shared
    const warmTierCapacity = totalStorageCapacity * 0.30; // Hybrid NVMe/SSD
    const coldTierCapacity = totalStorageCapacity * 0.25; // HDD-based
    const archiveTierCapacity = totalStorageCapacity * 0.05; // Object storage
    
    // Storage bandwidth requirements (2.7 GiB/s per GPU for training)
    const sustainedBandwidthTBps = (numGPUs * 2.7 * 1.074) / 1000; // Convert to TB/s
    const burstBandwidthTBps = sustainedBandwidthTBps * (numGPUs > 50000 ? 10 : 5);
    
    // Checkpoint calculations based on scale
    let modelSize = 0.1; // TB
    if (numGPUs >= 100000) modelSize = 15; // 1T parameters
    else if (numGPUs >= 50000) modelSize = 5.29; // 405B parameters
    else if (numGPUs >= 10000) modelSize = 0.912; // 70B parameters
    
    const checkpointFrequency = Math.max(1.5, 1 / (Math.ceil(numGPUs / 8) * 0.0065 * 24 / 60)); // minutes
    const checkpointStorage = modelSize * 50 * 3 / 1000; // PB (50 retention, 3x redundancy)
    
    return {
      gpusPerSystem,
      systemsTotal,
      racksTotal,
      gpusPerPod,
      systemsPerPod,
      podsTotal,
      dpusPerSystem,
      totalDPUs,
      total400GLinks,
      totalLeafSwitches,
      totalSpineSwitches,
      totalPowerMW,
      powerPerSystem,
      // Enhanced storage metrics
      totalStorageCapacity,
      tier0Capacity,
      hotTierCapacity,
      warmTierCapacity,
      coldTierCapacity,
      archiveTierCapacity,
      sustainedBandwidthTBps,
      burstBandwidthTBps,
      modelSize,
      checkpointFrequency,
      checkpointStorage
    };
  };
  
  const arch = calculateArchitectureBreakdown();
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          GPU Cluster Technical Architecture
        </h2>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Large-Scale GPU Cluster Reference Architecture
          </h3>
          <p className="text-gray-600">
            {numGPUs.toLocaleString()} {gpuModel.toUpperCase()} GPUs • RoCE v2 Ethernet Fabric • Pod-Based Design
          </p>
          <div className="mt-3 text-sm text-gray-500">
            Version 3.0 • Power Calculations Validated • {gpuModel === 'gb200' ? 'GB200 NVL72' : 'GB300 NVL72'} Rack-Scale System Architecture
          </div>
        </div>
      </div>

      {/* Architecture Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-green-600" />
          System Architecture Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{arch.gpusPerSystem}</div>
            <div className="text-sm text-gray-600">GPUs per {gpuModel === 'gb200' ? 'NVL72 System' : 'Node'}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{arch.systemsTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{gpuModel === 'gb200' ? 'NVL72 Systems' : 'Nodes'} Total</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{arch.racksTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Racks Required</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{arch.podsTotal}</div>
            <div className="text-sm text-gray-600">Pods ({arch.gpusPerPod} GPUs each)</div>
          </div>
        </div>
      </div>

      {/* Pod Architecture */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          Reference Pod Architecture
        </h3>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Recommended Pod Size: {arch.gpusPerPod} {gpuModel.toUpperCase()} GPUs ({arch.systemsPerPod} {gpuModel === 'gb200' ? 'NVL72' : 'DGX'} Systems)</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Failure Domain:</strong> Each pod represents manageable failure unit</li>
            <li>• <strong>Network Scale:</strong> {arch.systemsPerPod * 8} × 400GbE ports fits within 2-tier Clos topology</li>
            <li>• <strong>Power/Cooling:</strong> ~{((arch.systemsPerPod * arch.powerPerSystem) / 1000).toFixed(1)} MW per pod ({arch.powerPerSystem}kW per {gpuModel === 'gb200' ? 'NVL72' : 'system'})</li>
            <li>• <strong>Operational:</strong> Manageable upgrade/maintenance unit</li>
          </ul>
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Component</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Per Pod</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total ({arch.podsTotal} Pods)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">{gpuModel === 'gb200' ? 'GB200 NVL72 Systems' : 'DGX Systems'}</td>
              <td className="px-4 py-3">{arch.systemsPerPod} systems</td>
              <td className="px-4 py-3">{arch.systemsTotal.toLocaleString()} systems</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">Network Connections</td>
              <td className="px-4 py-3">{arch.systemsPerPod * 8}× 400GbE</td>
              <td className="px-4 py-3">{arch.total400GLinks.toLocaleString()}× 400GbE ports</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">BlueField-3 DPUs</td>
              <td className="px-4 py-3">{arch.systemsPerPod * arch.dpusPerSystem} DPUs</td>
              <td className="px-4 py-3">{arch.totalDPUs.toLocaleString()} DPUs total</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">Power Requirement</td>
              <td className="px-4 py-3">{((arch.systemsPerPod * arch.powerPerSystem) / 1000).toFixed(2)} MW</td>
              <td className="px-4 py-3">{arch.totalPowerMW.toFixed(1)} MW total</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Network Architecture */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-600" />
          Network Fabric Design - RoCE v2 Clos
        </h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 font-mono text-sm">
          <div className="font-bold mb-2">Pod Network Topology (Per {arch.gpusPerPod} GPU Pod):</div>
          <div>────────────────────────────────────────</div>
          <div>Architecture: 2-tier spine-leaf Clos</div>
          <div>{gpuModel === 'gb200' ? 'NVL72' : 'DGX'} Systems: {arch.systemsPerPod} ({arch.gpusPerPod} GPUs total)</div>
          <div>Network Ports: {arch.systemsPerPod * 8}× 400GbE (8 per system via BlueField-3 DPUs)</div>
          <div className="mt-2">
            <div>Switching Requirements:</div>
            <div>- Leaf Layer: 4× 64-port switches (256 ports total)</div>
            <div>  • {arch.systemsPerPod * 8} ports for {gpuModel === 'gb200' ? 'NVL72' : 'DGX'} downlinks</div>
            <div>  • 144 ports for spine uplinks (36 per leaf)</div>
            <div>- Spine Layer: 4× 64-port switches</div>
            <div>  • Non-blocking 1:1 bandwidth</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Switch Infrastructure</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Leaf Switches:</span>
                <span className="font-medium">{arch.totalLeafSwitches} total</span>
              </div>
              <div className="flex justify-between">
                <span>Spine Switches:</span>
                <span className="font-medium">{arch.totalSpineSwitches} total</span>
              </div>
              <div className="flex justify-between">
                <span>Total Switches:</span>
                <span className="font-medium">{arch.totalLeafSwitches + arch.totalSpineSwitches}</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Bandwidth Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Per Pod Bandwidth:</span>
                <span className="font-medium">{((arch.systemsPerPod * 8 * 400) / 1000).toFixed(1)} Tbps</span>
              </div>
              <div className="flex justify-between">
                <span>Total Bandwidth:</span>
                <span className="font-medium">{((arch.total400GLinks * 400) / 1000).toFixed(1)} Tbps</span>
              </div>
              <div className="flex justify-between">
                <span>Oversubscription:</span>
                <span className="font-medium">1:1 (Non-blocking)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Specifications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          {gpuModel === 'gb200' ? 'GB200 NVL72' : 'GB300 NVL72'} System Architecture
        </h3>
        
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-green-800 mb-2">{gpuModel === 'gb200' ? 'GB200 NVL72' : 'GB300 NVL72'} Rack-Scale System Components</h4>
          <p className="text-sm text-gray-700 mb-2">Each {gpuModel === 'gb200' ? 'NVL72' : 'NVL72'} is a complete integrated rack system:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Compute:</strong> 18× compute trays (2 Grace CPUs + 4 {gpuModel.toUpperCase()} GPUs each)</li>
            <li>• <strong>Total:</strong> 36 Grace CPUs + 72 {gpuModel.toUpperCase()} GPUs</li>
            <li>• <strong>Interconnect:</strong> 9× NVLink Switch trays (130 TB/s aggregate bandwidth)</li>
            <li>• <strong>Power:</strong> 8× 33kW power shelves ({gpuModel === 'gb200' ? '120-132kW' : '135-140kW'} typical)</li>
            <li>• <strong>Memory:</strong> {gpuModel === 'gb200' ? '13.5 TB HBM3e' : '20.7 TB HBM4'} + CPU memory</li>
            <li>• <strong>Cooling:</strong> Direct liquid cooling integrated (mandatory)</li>
            <li>• <strong>Network:</strong> 4× dual-port BlueField-3 DPUs (8× 400GbE total)</li>
          </ul>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Component</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Per System</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Per Pod ({arch.systemsPerPod} systems)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">BlueField-3 DPUs</td>
              <td className="px-4 py-3">4 DPUs (8 ports)</td>
              <td className="px-4 py-3">{arch.systemsPerPod * 4} DPUs ({arch.systemsPerPod * 8} ports)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">Network Bandwidth</td>
              <td className="px-4 py-3">3.2 Tbps</td>
              <td className="px-4 py-3">{(arch.systemsPerPod * 3.2).toFixed(1)} Tbps</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">ARM Cores</td>
              <td className="px-4 py-3">64 cores</td>
              <td className="px-4 py-3">{arch.systemsPerPod * 64} cores</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">DPU Memory</td>
              <td className="px-4 py-3">128GB DDR5</td>
              <td className="px-4 py-3">{((arch.systemsPerPod * 128) / 1000).toFixed(2)}TB</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium">Power per System</td>
              <td className="px-4 py-3">{arch.powerPerSystem}kW</td>
              <td className="px-4 py-3">{((arch.systemsPerPod * arch.powerPerSystem) / 1000).toFixed(2)} MW</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Pod Architecture Diagram
        </h3>
        
        <div className="bg-gray-50 p-6 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto">
          <div className="whitespace-pre">
{`         Pod Network Architecture (${arch.gpusPerPod} GPUs)

┌─────────────────────────────────────────────────────────────┐
│                     Pod Network Fabric                       │
│                    (4× Leaf, 4× Spine)                      │
└──────────┬─────────────────────┬──────────────────┘
             │                           │
    ┌────────▼──────────┐       ┌────────▼──────────┐
    │   ${gpuModel.toUpperCase()} Systems  │       │   VAST Storage   │
    │   (${arch.systemsPerPod} systems)   │       │    (1 CNode)     │
    │                  │       │                  │
    │ 8× 400G per sys  │       │   4× 400G total  │
    │ via BlueField-3  │◄──────►  NVMe-oF/RDMA   │
    │                  │       │                  │
    │  ${arch.gpusPerPod} GPUs     │       │     2 PB         │
    └──────────────────┘       └──────────────────┘
    
Data Flow Paths:
1. Training Data: Storage → Leaf → ${gpuModel.toUpperCase()} → GPU Memory
2. Checkpoints: GPU → ${gpuModel.toUpperCase()} → Leaf → Storage
3. Inter-GPU: ${gpuModel.toUpperCase()} ↔ Leaf ↔ Spine ↔ Leaf ↔ ${gpuModel.toUpperCase()}`}
          </div>
        </div>
      </div>

      {/* Enhanced Storage Architecture */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Production Storage Architecture
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Storage Capacity Distribution</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Capacity:</span>
                <span className="font-medium">{arch.totalStorageCapacity.toFixed(1)} PB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tier 0 (Local NVMe):</span>
                <span className="font-medium">{arch.tier0Capacity.toFixed(1)} PB (15%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hot Tier (All-Flash):</span>
                <span className="font-medium">{arch.hotTierCapacity.toFixed(1)} PB (25%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warm Tier (Hybrid):</span>
                <span className="font-medium">{arch.warmTierCapacity.toFixed(1)} PB (30%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cold Tier (HDD):</span>
                <span className="font-medium">{arch.coldTierCapacity.toFixed(1)} PB (25%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Archive Tier:</span>
                <span className="font-medium">{arch.archiveTierCapacity.toFixed(1)} PB (5%)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Performance Requirements</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sustained Bandwidth:</span>
                <span className="font-medium">{arch.sustainedBandwidthTBps.toFixed(1)} TB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Burst Bandwidth:</span>
                <span className="font-medium">{arch.burstBandwidthTBps.toFixed(1)} TB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model Size:</span>
                <span className="font-medium">{arch.modelSize.toFixed(1)} TB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Checkpoint Frequency:</span>
                <span className="font-medium">{arch.checkpointFrequency.toFixed(1)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Checkpoint Storage:</span>
                <span className="font-medium">{arch.checkpointStorage.toFixed(1)} PB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Per-GPU Bandwidth:</span>
                <span className="font-medium">2.7 GiB/s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Storage Architecture Rationale</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• <strong>Tier 0 Local NVMe:</strong> 95% power savings, sub-millisecond latency for active datasets</div>
            <div>• <strong>Hot Tier:</strong> Production-proven vendors (WEKA, VAST, DDN) for high-performance shared storage</div>
            <div>• <strong>Warm/Cold Tiers:</strong> Cost-optimized hybrid and HDD systems for archival and backup</div>
            <div>• <strong>Checkpoint Strategy:</strong> Failure-driven frequency based on {Math.ceil(numGPUs / 8)} nodes, 0.65% daily failure rate</div>
            <div>• <strong>Bandwidth Scaling:</strong> Linear scaling with GPU count, 30% network overhead included</div>
          </div>
        </div>
      </div>

      {/* Key Design Principles */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Key Design Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Scalability</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Pod-based architecture for linear scaling</li>
              <li>• Each pod operates independently</li>
              <li>• Add pods without redesigning architecture</li>
              <li>• Failure isolation per pod</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Performance</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Non-blocking network within pods</li>
              <li>• BlueField-3 DPU offload for RDMA</li>
              <li>• Direct liquid cooling for high density</li>
              <li>• Pod-local storage for performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
