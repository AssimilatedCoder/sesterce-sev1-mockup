import React from 'react';
import { Network, Cpu, Activity } from 'lucide-react';

interface NetworkingTabEnhancedProps {
  config: any;
  results: any;
}

// Enhanced networking equipment costs based on research
const networkingEquipment = {
  infiniband: {
    switches: {
      quantum2_qm9700: { 
        name: 'Quantum-2 QM9700',
        ports: 64,
        speed: 400,
        price: 250000,
        power: 2000,
        reference: 'NVIDIA Quantum-2 Switch'
      },
      quantumX800_q3400: {
        name: 'Quantum-X800 Q3400',
        ports: 144,
        speed: 800,
        price: 400000,
        power: 3500,
        reference: 'NVIDIA Quantum-X800'
      }
    },
    cables: {
      osfp_400g: { price: 1500, power: 3.5 },
      osfp224_800g: { price: 2500, power: 4 }
    },
    transceivers: {
      dr4_400g: { price: 6000, power: 12 },
      dr4_800g: { price: 10000, power: 15 }
    }
  },
  ethernet: {
    switches: {
      spectrum4_sn5600: {
        name: 'Spectrum-4 SN5600',
        ports: 64,
        speed: 800,
        price: 150000,
        power: 1800,
        reference: 'NVIDIA Spectrum-4'
      },
      spectrum3_sn4600: {
        name: 'Spectrum-3 SN4600',
        ports: 64,
        speed: 400,
        price: 80000,
        power: 1200,
        reference: 'NVIDIA Spectrum-3'
      }
    },
    cables: {
      dac_400g: { price: 800, power: 2 },
      aoc_800g: { price: 1200, power: 3 }
    },
    transceivers: {
      qsfp_400g: { price: 4000, power: 10 },
      osfp_800g: { price: 8000, power: 14 }
    }
  }
};

export const NetworkingTabEnhanced: React.FC<NetworkingTabEnhancedProps> = ({ config, results }) => {
  const { numGPUs, gpuModel, fabricType, enableBluefield } = config;
  
  // Derived selections based on philosophy
  const nicSpeedGb = ((): number => {
    if (fabricType === 'ethernet-800g' || fabricType === 'infiniband-xdr') return 800;
    // Treat GB300 on InfiniBand as 800G class when defined, else 400G
    if (fabricType === 'infiniband' && gpuModel === 'gb300') return 800;
    return 400;
  })();

  const determineNetworkArchitecture = (gpus: number): '2-tier_leaf_spine' | '3-tier_with_pods' | '3-tier_multi_pod_with_core' => {
    if (gpus <= 2000) return '2-tier_leaf_spine';
    if (gpus <= 10000) return '3-tier_with_pods';
    return '3-tier_multi_pod_with_core';
  };

  const architecture = determineNetworkArchitecture(numGPUs || 0);

  // Use results from main calculator if available, otherwise calculate locally
  const getNetworkingData = () => {
    if (results && results.network) {
      // Use data from main calculator (preferred)
      return results.network;
    }
    // Fallback to local calculation if no results available
    return calculateNetworkingDetails();
  };
  
  const calculateNetworkingDetails = () => {
    const isGB200 = gpuModel === 'gb200';
    const isGB300 = gpuModel === 'gb300';
    const isInfiniband = fabricType === 'infiniband';
    
    // Determine switch type and configuration
    let switchSpec, cableSpec, transceiverSpec;
    
    if (isInfiniband) {
      if (isGB300) {
        switchSpec = networkingEquipment.infiniband.switches.quantumX800_q3400;
        cableSpec = networkingEquipment.infiniband.cables.osfp224_800g;
        transceiverSpec = networkingEquipment.infiniband.transceivers.dr4_800g;
      } else {
        switchSpec = networkingEquipment.infiniband.switches.quantum2_qm9700;
        cableSpec = networkingEquipment.infiniband.cables.osfp_400g;
        transceiverSpec = networkingEquipment.infiniband.transceivers.dr4_400g;
      }
    } else {
      if (isGB300 || isGB200) {
        switchSpec = networkingEquipment.ethernet.switches.spectrum4_sn5600;
        cableSpec = networkingEquipment.ethernet.cables.aoc_800g;
        transceiverSpec = networkingEquipment.ethernet.transceivers.osfp_800g;
      } else {
        switchSpec = networkingEquipment.ethernet.switches.spectrum3_sn4600;
        cableSpec = networkingEquipment.ethernet.cables.dac_400g;
        transceiverSpec = networkingEquipment.ethernet.transceivers.qsfp_400g;
      }
    }
    
    // Calculate fabric requirements
    const railsPerGPU = isGB200 || isGB300 ? 9 : 8;
    
    // Clos fabric calculations - Pod-based architecture (from design document)
    const gpusPerPod = isGB200 ? 1008 : 1024; // 1,008 GPUs per pod for GB200 (14 NVL72), 1024 for others
    const numPods = Math.ceil(numGPUs / gpusPerPod);
    
    // Leaf switches (ToR)
    const gpusPerLeaf = 64; // Typical for high-radix switches
    const leafSwitchesPerPod = Math.ceil(gpusPerPod / gpusPerLeaf);
    const totalLeafSwitches = leafSwitchesPerPod * numPods;
    
    // Spine switches (aggregation)
    const spineRadix = switchSpec.ports;
    let spineSwitchesPerPod = Math.ceil(leafSwitchesPerPod * railsPerGPU / spineRadix);
    // Minimum spine count for N+2 redundancy (philosophy rule)
    spineSwitchesPerPod = Math.max(spineSwitchesPerPod, 6);
    const totalSpineSwitches = spineSwitchesPerPod * numPods;
    
    // Core switches (for inter-pod connectivity)
    let coreSwitches = 0;
    if (architecture === '3-tier_multi_pod_with_core') {
      coreSwitches = numGPUs > 100000 ? 144 : (numGPUs > 50000 ? 64 : 36);
    }
    
    // Cable calculations
    const intraPodCables = totalLeafSwitches * railsPerGPU * gpusPerLeaf;
    const interPodCables = coreSwitches * spineRadix * numPods;
    const totalCables = intraPodCables + interPodCables;
    const totalTransceivers = totalCables * 2; // Both ends
    
    // BlueField-3 DPU calculations
    let dpuCount = 0;
    let dpuCost = 0;
    let dpuPower = 0;
    
    if (enableBluefield) {
      // BlueField-3 DPUs per design document specifications
      if (isGB200 || isGB300) {
        dpuCount = Math.ceil(numGPUs / 72) * 4; // 4 dual-port DPUs per NVL72 system
      } else {
        dpuCount = Math.ceil(numGPUs / 8); // One per DGX node
      }
      dpuCost = dpuCount * 2500; // BlueField-3 SuperNIC price
      dpuPower = dpuCount * 150; // 150W per DPU (design doc specification)
    }
    
    // Cost calculations
    const switchCost = (totalLeafSwitches + totalSpineSwitches + coreSwitches) * switchSpec.price;
    const cableCost = totalCables * cableSpec.price;
    const transceiverCost = totalTransceivers * transceiverSpec.price;
    
    // Power calculations
    const switchPower = (totalLeafSwitches + totalSpineSwitches + coreSwitches) * switchSpec.power;
    const cablePower = totalCables * cableSpec.power;
    const transceiverPower = totalTransceivers * transceiverSpec.power;
    
    // Total bandwidth calculations
    const bisectionBandwidth = (coreSwitches * switchSpec.ports * switchSpec.speed) / 8; // Gbps to GBps
    const totalBandwidth = numGPUs * switchSpec.speed * railsPerGPU / 8; // Theoretical max
    
    return {
      nic: {
        speedGbps: nicSpeedGb,
        perGpu: 1,
        dualHomed: true
      },
      switchSpec,
      topology: {
        leafSwitches: totalLeafSwitches,
        spineSwitches: totalSpineSwitches,
        coreSwitches,
        totalSwitches: totalLeafSwitches + totalSpineSwitches + coreSwitches,
        pods: numPods,
        railsPerGPU
      },
      cables: {
        total: totalCables,
        intraPod: intraPodCables,
        interPod: interPodCables
      },
      transceivers: totalTransceivers,
      dpus: {
        count: dpuCount,
        cost: dpuCost,
        power: dpuPower
      },
      costs: {
        switches: switchCost,
        cables: cableCost,
        transceivers: transceiverCost,
        dpus: dpuCost,
        total: switchCost + cableCost + transceiverCost + dpuCost
      },
      power: {
        switches: switchPower,
        cables: cablePower,
        transceivers: transceiverPower,
        dpus: dpuPower,
        total: switchPower + cablePower + transceiverPower + dpuPower
      },
      bandwidth: {
        bisection: bisectionBandwidth,
        theoretical: totalBandwidth,
        perGPU: switchSpec.speed * railsPerGPU
      }
    };
  };
  
  const networkDetails = getNetworkingData();
  
  // Add error handling for missing data
  if (!networkDetails || !networkDetails.topology) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
          Network Architecture Analysis
        </h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-yellow-700">
            Please run calculations first to see network architecture details.
          </p>
        </div>
      </div>
    );
  }
  
  // Ensure switchSpec exists with default values
  const switchSpec = networkDetails.switchSpec || {
    name: fabricType === 'infiniband' ? 'Quantum-2 QM9700' : 'Spectrum-4 SN5600',
    ports: 64,
    speed: fabricType.includes('800') ? 800 : 400,
    price: fabricType === 'infiniband' ? 250000 : 150000,
    power: fabricType === 'infiniband' ? 2000 : 1800
  };
  
  // Storage network sizing (philosophy rule 10)
  const storageNetwork = (() => {
    const g = numGPUs || 0;
    const storageTbps = (g / 1000) * 1.6; // Tbps
    const ports400G = Math.ceil((storageTbps * 1000) / 400); // convert Tbps->Gbps
    const sw64x400G = Math.ceil(storageTbps / 25.6); // 64x400G ~ 25.6 Tbps switch fabric
    const ports100G = Math.ceil(g / 10);
    const sw32x100G = Math.ceil(g / 320);
    return { storageTbps, ports400G, sw64x400G, ports100G, sw32x100G };
  })();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
        Network Architecture Analysis
      </h2>
      
      {/* Fabric Overview */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <h3 className="flex items-center gap-2 text-lg font-bold text-blue-800 mb-2">
          <Network className="w-5 h-5" />
          Clos Fabric Architecture - Pod-Based Design
        </h3>
        <p className="text-gray-700 mb-3">
          Architecture: <span className="font-semibold">
          {architecture === '2-tier_leaf_spine' ? '2-Tier Leaf-Spine' : (architecture === '3-tier_with_pods' ? '3-Tier with Pods' : '3-Tier Multi-Pod with Core')}
          </span>. {networkDetails.topology.pods} pods × {1024} GPUs each, {networkDetails.topology.railsPerGPU} rails/GPU, dual-homed ToR.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-xs text-gray-500">Leaf Switches (ToR)</div>
            <div className="text-xl font-bold">{networkDetails.topology.leafSwitches}</div>
            <div className="text-xs text-gray-500">{switchSpec.name}</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-xs text-gray-500">Spine Switches</div>
            <div className="text-xl font-bold">{networkDetails.topology.spineSwitches}</div>
            <div className="text-xs text-gray-500">{switchSpec.ports} ports @ {switchSpec.speed}G</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-xs text-gray-500">Core Switches</div>
            <div className="text-xl font-bold">{networkDetails.topology.coreSwitches}</div>
            <div className="text-xs text-gray-500">Inter-pod routing</div>
          </div>
        </div>
      </div>
      
      {/* BlueField-3 DPU Integration */}
      {config.enableBluefield && (
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg">
          <h3 className="flex items-center gap-2 text-lg font-bold text-purple-800 mb-2">
            <Cpu className="w-5 h-5" />
            BlueField-3 DPU Integration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-500">DPU Count</div>
              <div className="text-xl font-bold">{networkDetails.dpus.count.toLocaleString()}</div>
              <div className="text-xs text-gray-500">SuperNICs deployed</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-500">DPU Power</div>
              <div className="text-xl font-bold">{(networkDetails.dpus.power / 1000).toFixed(1)} kW</div>
              <div className="text-xs text-gray-500">150W per DPU</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-500">DPU Cost</div>
              <div className="text-xl font-bold">${(networkDetails.dpus.cost / 1000000).toFixed(2)}M</div>
              <div className="text-xs text-gray-500">$2,500 per unit</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h3 className="text-lg font-bold text-gray-800 p-4 border-b border-gray-200">
          Networking Infrastructure Costs
        </h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Component</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit Cost</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Cost</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Power (kW)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3">Switches (All Tiers)</td>
              <td className="px-4 py-3">{networkDetails.topology.totalSwitches.toLocaleString()}</td>
              <td className="px-4 py-3">${switchSpec.price.toLocaleString()}</td>
              <td className="px-4 py-3">${(networkDetails.costs.switches / 1000000).toFixed(2)}M</td>
              <td className="px-4 py-3">{(networkDetails.power.switches / 1000).toFixed(1)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3">Cables</td>
              <td className="px-4 py-3">{networkDetails.cables.total.toLocaleString()}</td>
              <td className="px-4 py-3">${fabricType === 'infiniband' ? '1,500-2,500' : '800-1,200'}</td>
              <td className="px-4 py-3">${(networkDetails.costs.cables / 1000000).toFixed(2)}M</td>
              <td className="px-4 py-3">{(networkDetails.power.cables / 1000).toFixed(1)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3">Transceivers</td>
              <td className="px-4 py-3">{networkDetails.transceivers.toLocaleString()}</td>
              <td className="px-4 py-3">${fabricType === 'infiniband' ? '6,000-10,000' : '4,000-8,000'}</td>
              <td className="px-4 py-3">${(networkDetails.costs.transceivers / 1000000).toFixed(2)}M</td>
              <td className="px-4 py-3">{(networkDetails.power.transceivers / 1000).toFixed(1)}</td>
            </tr>
            {config.enableBluefield && (
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3">BlueField-3 DPUs</td>
                <td className="px-4 py-3">{networkDetails.dpus.count.toLocaleString()}</td>
                <td className="px-4 py-3">$2,500</td>
                <td className="px-4 py-3">${(networkDetails.dpus.cost / 1000000).toFixed(2)}M</td>
                <td className="px-4 py-3">{(networkDetails.dpus.power / 1000).toFixed(1)}</td>
              </tr>
            )}
            <tr className="bg-yellow-50 font-bold">
              <td className="px-4 py-3">TOTAL</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3">${(networkDetails.costs.total / 1000000).toFixed(2)}M</td>
              <td className="px-4 py-3">{(networkDetails.power.total / 1000).toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Bandwidth Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Bisection Bandwidth</h4>
          <div className="text-2xl font-bold text-gray-900">{(networkDetails.bandwidth.bisection / 1000).toFixed(1)} TB/s</div>
          <div className="text-xs text-gray-500">Full bisection @ 1:1</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Per-GPU Bandwidth</h4>
          <div className="text-2xl font-bold text-gray-900">{networkDetails.bandwidth.perGPU} Gbps</div>
          <div className="text-xs text-gray-500">{networkDetails.topology.railsPerGPU} rails × {switchSpec.speed}G</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Aggregate Bandwidth</h4>
          <div className="text-2xl font-bold text-gray-900">{(networkDetails.bandwidth.theoretical / 1000).toFixed(1)} TB/s</div>
          <div className="text-xs text-gray-500">Theoretical maximum</div>
        </div>
      </div>

      {/* Network Architecture Details */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          Network Architecture Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Fabric Specifications</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Switch Model:</span>
                <span className="font-medium">{switchSpec.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Port Count:</span>
                <span className="font-medium">{switchSpec.ports} ports</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Port Speed:</span>
                <span className="font-medium">{switchSpec.speed}G</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NICs per GPU:</span>
                <span className="font-medium">1 × {nicSpeedGb}G (dual-homed ToR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Switch Power:</span>
                <span className="font-medium">{(switchSpec.power / 1000).toFixed(1)}kW</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Topology Configuration</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Architecture:</span>
                <span className="font-medium">{architecture === '2-tier_leaf_spine' ? '2-Tier Leaf-Spine' : (architecture === '3-tier_with_pods' ? '3-Tier with Pods' : '3-Tier Multi-Pod with Core')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Oversubscription:</span>
                <span className="font-medium">1:1 (Non-blocking)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rails per GPU:</span>
                <span className="font-medium">{networkDetails.topology.railsPerGPU}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pod Size:</span>
                <span className="font-medium">1,024 GPUs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Network Sizing (derived) */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Storage Network Sizing (Derived)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Required Storage BW</div>
            <div className="text-lg font-bold">{storageNetwork.storageTbps.toFixed(1)} Tbps</div>
            <div className="text-xs text-gray-500">~1.6 Tbps / 1,000 GPUs</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">VAST/WEKA 400G Ports</div>
            <div className="text-lg font-bold">{storageNetwork.ports400G.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Switches: {storageNetwork.sw64x400G}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Ceph/Object 100G Ports</div>
            <div className="text-lg font-bold">{storageNetwork.ports100G.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Switches: {storageNetwork.sw32x100G}</div>
          </div>
        </div>
      </div>

      {/* Networking Philosophy & Rationale */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Networking Philosophy & Selection Rationale</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            We adopt a pod-based Clos fabric with deterministic scaling milestones: ≤2,000 GPUs deploy as a 2‑tier leaf‑spine; 2,001–10,000 GPUs as a 3‑tier within pods; and &gt;10,000 GPUs as a 3‑tier multi‑pod with a core layer for inter‑pod routing. Each NVL72 rack is dual‑homed to a pair of ToR switches, with one 400G/800G NIC per GPU and {networkDetails.topology.railsPerGPU} rails per GPU to sustain collective operations.
          </p>
          <p>
            Non‑blocking (1:1) fabrics are the default for AI training. Minimum spine counts (≥6 per pod) ensure N+2 redundancy and predictable failure domains. At higher scales, core groups (e.g., 6–12) provide inter‑pod bisection while maintaining bounded hop‑count.
          </p>
          <p>
            Multi‑tenancy is supported through hierarchical QoS, per‑tenant VLANs/VRFs and optional DPU offload. For sovereign or high‑assurance deployments, BlueField‑3 enables micro‑segmentation, in‑line policy enforcement and storage/network isolation. Expect a planning uplift of ~15% network overhead for strict isolation, plus increased DPU density.
          </p>
          <p>
            Storage fabrics scale independently: as a rule of thumb we provision ~1.6 Tbps per 1,000 GPUs for training datasets across VAST/WEKA tiers (400G ports) while object/archival tiers (Ceph/S3) target lower bandwidth with many 100G ports. This separation preserves training throughput while optimizing cost for cold data.
          </p>
          <p>
            Security and resilience are built in: dual ToR per rack, multi‑rail links, ECMP across spines/cores, and explicit failure domains per pod. With adaptive routing and congestion control (IB NDR/XDR or RoCEv2 ECN/PFC), the fabric maintains near line‑rate performance with bounded latency for large collectives.
          </p>
        </div>
      </div>

      {/* Performance Characteristics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Network Performance Characteristics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Latency</h4>
            <p className="text-2xl font-bold text-green-600">{'< 2 μs'}</p>
            <p className="text-sm text-gray-600">End-to-end within pod</p>
            <div className="mt-2 text-xs text-gray-500">
              • Switch latency: ~300ns
              <br />• Cable latency: ~5ns/m
              <br />• RDMA/RoCEv2 optimized
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Throughput</h4>
            <p className="text-2xl font-bold text-blue-600">{networkDetails.bandwidth.perGPU} Gbps</p>
            <p className="text-sm text-gray-600">Per GPU sustained</p>
            <div className="mt-2 text-xs text-gray-500">
              • Line rate performance
              <br />• Zero packet loss
              <br />• Adaptive routing
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Scalability</h4>
            <p className="text-2xl font-bold text-purple-600">{networkDetails.topology.pods}</p>
            <p className="text-sm text-gray-600">Pods deployed</p>
            <div className="mt-2 text-xs text-gray-500">
              • Linear scaling
              <br />• Pod-to-pod routing
              <br />• Hierarchical QoS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
