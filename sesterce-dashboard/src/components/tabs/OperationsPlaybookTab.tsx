import React from 'react';
import { Network, Cpu, Zap, Activity, AlertTriangle, ExternalLink, Book, Monitor, Settings } from 'lucide-react';

interface OperationsPlaybookTabProps {
  config: any;
  results: any;
}

export const OperationsPlaybookTab: React.FC<OperationsPlaybookTabProps> = ({ config, results }) => {
  const { numGPUs, gpuModel } = config;
  
  const isGB200 = gpuModel === 'gb200' || gpuModel === 'gb300';
  const isHClass = gpuModel.startsWith('h100') || gpuModel.startsWith('h200');
  
  const clusterSpecs = results?.details || {};
  const systemsTotal = clusterSpecs.systemsTotal || Math.ceil(numGPUs / (isGB200 ? 72 : 8));
  const rackPowerTotal = clusterSpecs.rackPowerTotal || 0;
  const coolingType = config.coolingType || 'air';

  const openTroubleshootingGuide = () => {
    const newWindow = window.open('', '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow.document.write(getTroubleshootingGuideHTML());
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Cluster Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Monitor className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Designed Cluster Overview</h2>
            <p className="text-sm text-gray-600">Production-ready configuration summary</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* System Architecture */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Architecture</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-blue-700">{numGPUs.toLocaleString()} × {gpuModel.toUpperCase()}</div>
              <div className="text-blue-600">{systemsTotal} × {isGB200 ? 'NVL72 Racks' : '8-GPU Nodes'}</div>
              <div className="text-blue-600">{isGB200 ? 'NVLink Fabric' : 'PCIe + NVLink'}</div>
            </div>
          </div>

          {/* Network Topology */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Network</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-green-700">RoCEv2 Ethernet</div>
              <div className="text-green-600">{systemsTotal <= 32 ? '2-Tier CLOS' : '3-Tier CLOS'}</div>
              <div className="text-green-600">DCQCN Congestion Control</div>
            </div>
          </div>

          {/* Power & Cooling */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Power</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-orange-700">{(rackPowerTotal / 1000).toFixed(1)} MW Total</div>
              <div className="text-orange-600">{isGB200 ? '120kW/rack' : '8-11kW/node'}</div>
              <div className="text-orange-600">{coolingType === 'liquid' ? 'Liquid Cooling' : 'Air Cooling'}</div>
            </div>
          </div>

          {/* Monitoring */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">Monitoring</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-purple-700">DCGM + Prometheus</div>
              <div className="text-purple-600">Grafana Dashboards</div>
              <div className="text-purple-600">PagerDuty Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick NOC Links */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ExternalLink className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">NOC Quick Reference</h2>
            <p className="text-sm text-gray-600">Essential documentation and monitoring links</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* GPU System Documentation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              GPU System Docs
            </h3>
            <div className="space-y-2 text-sm">
              {isHClass && (
                <>
                  <a href="https://docs.nvidia.com/dgx/dgxh100-user-guide/dgxh100-user-guide.pdf" 
                     target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-3 h-3" />
                    DGX H100/H200 User Guide
                  </a>
                  <a href="https://docs.nvidia.com/dgx/dgxh100-service-manual/dgxh100-service-manual.pdf" 
                     target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-3 h-3" />
                    Service Manual
                  </a>
                </>
              )}
              {isGB200 && (
                <>
                  <a href="https://www.supermicro.com/datasheet/datasheet_SuperCluster_GB200_NVL72.pdf" 
                     target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-3 h-3" />
                    GB200 NVL72 Datasheet
                  </a>
                  <a href="https://docs.nvidia.com/pdf/nvidia-mission-control-software-with-nvidia-gb200-nvl72-systems-administration-guide.pdf" 
                     target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-3 h-3" />
                    Mission Control Admin Guide
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Network Documentation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Network className="w-4 h-4" />
              Network & RoCEv2
            </h3>
            <div className="space-y-2 text-sm">
              <a href="https://docs.nvidia.com/nvidia-spectrum-4-sn5000-2u-switch-systems-hardware-user-manual.pdf" 
                 target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-3 h-3" />
                Spectrum-4 Hardware Manual
              </a>
              <a href="https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/ucs-manager/GUI-User-Guides/RoCEv2-Configuration/4-1/b-RoCE-Configuration-Guide-4-1/b_RoCE_Config_Guide_Test_chapter_01.pdf" 
                 target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-3 h-3" />
                Cisco RoCEv2 Config Guide
              </a>
              <a href="https://www.arista.com/assets/data/pdf/Broadcom-RoCE-Deployment-Guide.pdf" 
                 target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-3 h-3" />
                Arista RoCE Deployment
              </a>
            </div>
          </div>

          {/* Monitoring Tools */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Monitoring Stack
            </h3>
            <div className="space-y-2 text-sm">
              <a href="https://github.com/NVIDIA/dcgm-exporter" 
                 target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-3 h-3" />
                DCGM Exporter GitHub
              </a>
              <a href="https://grafana.com/grafana/dashboards/12239-nvidia-dcgm-exporter-dashboard/" 
                 target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-3 h-3" />
                NVIDIA DCGM Dashboard
              </a>
              <a href="https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/" 
                 target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-3 h-3" />
                NCCL Documentation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting Playbook */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Initial Troubleshooting Playbook</h2>
            <p className="text-sm text-gray-600">Comprehensive guide for identifying and resolving ML training job issues</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {isGB200 ? 'GB200/GB300 NVL72' : 'H100/H200'} Troubleshooting Guide
              </h3>
              <p className="text-red-700 text-sm mb-4">
                Systematic approach to diagnosing issues in large-scale ML training jobs with RoCEv2 Ethernet networking
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">RoCEv2 Ethernet</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {systemsTotal <= 32 ? '2-Tier CLOS' : '3-Tier CLOS'}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">DCQCN/PFC</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Grafana Dashboards</span>
              </div>
            </div>
            <button
              onClick={openTroubleshootingGuide}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Book className="w-4 h-4" />
              Open Full Guide
            </button>
          </div>

          {/* Quick Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-4 h-4 text-red-600" />
                <h4 className="font-semibold text-red-800">Network Issues</h4>
              </div>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• PFC storms (&gt;100μs pause)</li>
                <li>• ECMP hash polarization</li>
                <li>• DCQCN rate limiting</li>
                <li>• Buffer overflows</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-orange-800">GPU Performance</h4>
              </div>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• Uneven GPU utilization</li>
                <li>• NVLink bandwidth drops</li>
                <li>• Memory bandwidth limits</li>
                <li>• Thermal throttling</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Training Degradation</h4>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• NCCL AllReduce timeouts</li>
                <li>• Gradient synchronization</li>
                <li>• Straggler detection</li>
                <li>• Loss convergence issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Metrics Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Critical Monitoring Thresholds</h2>
            <p className="text-sm text-gray-600">Key metrics to watch for proactive issue detection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Network Thresholds */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Network Health Thresholds</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">PFC Pause Duration:</span>
                <span className="font-mono text-red-600">&lt; 100μs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ECN Marking Rate:</span>
                <span className="font-mono text-orange-600">&lt; 1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RDMA Retry Rate:</span>
                <span className="font-mono text-yellow-600">&lt; 10 ppm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Buffer Utilization:</span>
                <span className="font-mono text-green-600">&lt; 80%</span>
              </div>
            </div>
          </div>

          {/* GPU Thresholds */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">GPU Performance Thresholds</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">GPU Utilization:</span>
                <span className="font-mono text-green-600">&gt; 90%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NVLink Efficiency:</span>
                <span className="font-mono text-green-600">&gt; 85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-mono text-orange-600">&lt; 85°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Utilization:</span>
                <span className="font-mono text-yellow-600">&lt; 95%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Comprehensive HTML Troubleshooting Guide
const getTroubleshootingGuideHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPU Cluster Troubleshooting Playbook - RoCEv2 Ethernet</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 2rem; 
            border-radius: 12px; 
            margin-bottom: 2rem;
            text-align: center;
        }
        .architecture-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .tab-button {
            padding: 12px 24px;
            border: none;
            background: #e9ecef;
            color: #495057;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        .tab-button.active {
            background: #007bff;
            color: white;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .section { 
            background: white; 
            margin-bottom: 2rem; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .section-header { 
            background: #f8f9fa; 
            padding: 1.5rem; 
            border-bottom: 1px solid #dee2e6;
        }
        .section-content { padding: 1.5rem; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        h2 { color: #495057; font-size: 1.5rem; margin-bottom: 1rem; }
        h3 { color: #6c757d; font-size: 1.25rem; margin-bottom: 0.75rem; }
        h4 { color: #868e96; font-size: 1.1rem; margin-bottom: 0.5rem; }
        
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid;
        }
        .alert-critical { background: #f8d7da; border-color: #dc3545; color: #721c24; }
        .alert-warning { background: #fff3cd; border-color: #ffc107; color: #856404; }
        .alert-info { background: #d1ecf1; border-color: #17a2b8; color: #0c5460; }
        .alert-success { background: #d4edda; border-color: #28a745; color: #155724; }
        
        .dashboard {
            background: #1a1a1a;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
            color: #fff;
            font-family: 'Courier New', monospace;
        }
        .dashboard-header {
            color: #00d4ff;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            text-align: center;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        .metric {
            background: #2d2d2d;
            padding: 1rem;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .metric.healthy { border-color: #28a745; }
        .metric.warning { border-color: #ffc107; }
        .metric.critical { border-color: #dc3545; }
        .metric-label { color: #aaa; font-size: 0.9rem; }
        .metric-value { color: #fff; font-size: 1.5rem; font-weight: bold; }
        .metric-status { font-size: 0.8rem; margin-top: 0.5rem; }
        
        .command-block {
            background: #2d3748;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            margin: 1rem 0;
        }
        .command-prompt { color: #68d391; }
        .command-output { color: #fbb6ce; }
        
        .troubleshooting-flow {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .flow-step {
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            padding: 1rem;
            position: relative;
        }
        .flow-step::after {
            content: '↓';
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: #007bff;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .flow-step:last-child::after { display: none; }
        
        .network-topology {
            text-align: center;
            padding: 2rem;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 1rem 0;
        }
        .topology-layer {
            margin: 1rem 0;
            padding: 1rem;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .code-snippet {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 0.75rem;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            margin: 0.5rem 0;
        }
        
        .metric-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .comparison-panel {
            border-radius: 8px;
            padding: 1.5rem;
        }
        .healthy-panel {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            border: 2px solid #28a745;
        }
        .problem-panel {
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            border: 2px solid #dc3545;
        }
        
        .toc {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        .toc li {
            padding: 0.25rem 0;
        }
        .toc a {
            color: #007bff;
            text-decoration: none;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .toc a:hover {
            background-color: #e9ecef;
        }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .metrics-grid { grid-template-columns: 1fr; }
            .metric-comparison { grid-template-columns: 1fr; }
            .architecture-tabs { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 GPU Cluster Troubleshooting Playbook</h1>
            <p style="font-size: 1.2rem; margin-top: 0.5rem;">RoCEv2 Ethernet | CLOS Networks | H100/H200 & GB200/GB300 NVL72</p>
            <p style="font-size: 1rem; opacity: 0.9; margin-top: 1rem;">Comprehensive guide for identifying and resolving large-scale ML training job issues</p>
        </div>

        <!-- Architecture Selection Tabs -->
        <div class="architecture-tabs">
            <button class="tab-button active" onclick="showTab('h100-h200')">H100/H200 Systems</button>
            <button class="tab-button" onclick="showTab('gb200-gb300')">GB200/GB300 NVL72</button>
            <button class="tab-button" onclick="showTab('network-common')">Network (Common)</button>
        </div>

        <!-- Table of Contents -->
        <div class="toc">
            <h3>📋 Quick Navigation</h3>
            <ul>
                <li><a href="#emergency-checklist">🚨 Emergency Response Checklist</a></li>
                <li><a href="#grafana-dashboards">📊 Grafana Dashboard Monitoring</a></li>
                <li><a href="#network-troubleshooting">🌐 RoCEv2 Network Troubleshooting</a></li>
                <li><a href="#gpu-performance">🔧 GPU Performance Analysis</a></li>
                <li><a href="#training-degradation">📈 Training Job Degradation</a></li>
                <li><a href="#clos-topology">🏗️ CLOS Network Topology Issues</a></li>
                <li><a href="#commands-reference">💻 Commands & Scripts Reference</a></li>
            </ul>
        </div>

        <!-- Emergency Response Checklist -->
        <div class="section" id="emergency-checklist">
            <div class="section-header">
                <h2>🚨 Emergency Response Checklist</h2>
                <p>First 5 minutes when training job performance drops &gt;50%</p>
            </div>
            <div class="section-content">
                <div class="alert alert-critical">
                    <strong>⚠️ CRITICAL:</strong> Follow this checklist systematically. Each step takes 30-60 seconds.
                </div>

                <div class="troubleshooting-flow">
                    <div class="flow-step">
                        <h4>1. Check Grafana GPU Utilization Dashboard</h4>
                        <p>Look for uneven GPU utilization across nodes. Healthy clusters show 90-96% utilization.</p>
                        <div class="command-block">
                            <span class="command-prompt">$</span> curl -s "http://grafana:3000/api/datasources/proxy/1/api/v1/query?query=DCGM_FI_DEV_GPU_UTIL" | jq '.data.result[].value[1]'
                        </div>
                    </div>

                    <div class="flow-step">
                        <h4>2. Verify NCCL AllReduce Performance</h4>
                        <p>Normal AllReduce latency: H100 <150ms, GB200 <200ms. Check for stragglers.</p>
                        <div class="command-block">
                            <span class="command-prompt">$</span> kubectl logs -l app=training-job | grep "AllReduce" | tail -10
                        </div>
                    </div>

                    <div class="flow-step">
                        <h4>3. Check Network PFC Storm Detection</h4>
                        <p>PFC pause duration &gt;100μs indicates network congestion issues.</p>
                        <div class="command-block">
                            <span class="command-prompt">$</span> for switch in spine-{1..4} leaf-{1..32}; do
  ssh $switch "show interfaces ethernet priority-flow-control statistics"
done | grep -E "(pause|storm)"
                        </div>
                    </div>

                    <div class="flow-step">
                        <h4>4. Validate Power and Thermal Status</h4>
                        <p>Check for thermal throttling or power supply issues affecting performance.</p>
                        <div class="command-block">
                            <span class="command-prompt">$</span> nvidia-smi dmon -s pucvmet -c 1 | awk '$4 > 80 {print "THERMAL WARNING: GPU"$1" at "$4"C"}'
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- H100/H200 Specific Content -->
        <div id="h100-h200" class="tab-content active">
            <div class="section" id="grafana-dashboards-h100">
                <div class="section-header">
                    <h2>📊 H100/H200 Grafana Dashboard Monitoring</h2>
                    <p>Real-time metrics visualization for 8-GPU node clusters</p>
                </div>
                <div class="section-content">
                    <div class="metric-comparison">
                        <div class="comparison-panel healthy-panel">
                            <h3>✅ Healthy H100/H200 Cluster</h3>
                            <div class="dashboard">
                                <div class="dashboard-header">🟢 PRODUCTION CLUSTER - HEALTHY STATE</div>
                                <div class="metrics-grid">
                                    <div class="metric healthy">
                                        <div class="metric-label">GPU Utilization</div>
                                        <div class="metric-value">94.2%</div>
                                        <div class="metric-status">✅ All 8 GPUs active</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">NVLink Bandwidth</div>
                                        <div class="metric-value">862 GB/s</div>
                                        <div class="metric-status">✅ 95.7% efficiency</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">Memory Usage</div>
                                        <div class="metric-value">68.2/80GB</div>
                                        <div class="metric-status">✅ Healthy headroom</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">Temperature</div>
                                        <div class="metric-value">72°C</div>
                                        <div class="metric-status">✅ Well managed</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">PFC Pause Duration</div>
                                        <div class="metric-value">12μs</div>
                                        <div class="metric-status">✅ Below 100μs threshold</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">Training Throughput</div>
                                        <div class="metric-value">847K tok/s</div>
                                        <div class="metric-status">✅ Target performance</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="comparison-panel problem-panel">
                            <h3>🚨 Problem H100/H200 Cluster</h3>
                            <div class="dashboard">
                                <div class="dashboard-header">🔴 PRODUCTION CLUSTER - DEGRADED STATE</div>
                                <div class="metrics-grid">
                                    <div class="metric critical">
                                        <div class="metric-label">GPU Utilization</div>
                                        <div class="metric-value">23.7%</div>
                                        <div class="metric-status">🚨 Severe underutilization</div>
                                    </div>
                                    <div class="metric critical">
                                        <div class="metric-label">NVLink Bandwidth</div>
                                        <div class="metric-value">284 GB/s</div>
                                        <div class="metric-status">🚨 67% degradation</div>
                                    </div>
                                    <div class="metric warning">
                                        <div class="metric-label">Memory Usage</div>
                                        <div class="metric-value">76.8/80GB</div>
                                        <div class="metric-status">⚠️ Near capacity</div>
                                    </div>
                                    <div class="metric critical">
                                        <div class="metric-label">Temperature</div>
                                        <div class="metric-value">89°C</div>
                                        <div class="metric-status">🚨 Thermal throttling</div>
                                    </div>
                                    <div class="metric critical">
                                        <div class="metric-label">PFC Pause Duration</div>
                                        <div class="metric-value">487μs</div>
                                        <div class="metric-status">🚨 PFC storm detected!</div>
                                    </div>
                                    <div class="metric critical">
                                        <div class="metric-label">Training Throughput</div>
                                        <div class="metric-value">142K tok/s</div>
                                        <div class="metric-status">🚨 83% performance drop</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="alert alert-info">
                        <strong>📊 Key H100/H200 Prometheus Queries:</strong>
                        <div class="command-block">
# GPU Utilization Heatmap
DCGM_FI_DEV_GPU_UTIL{cluster="prod-gpu-01"}

# NVLink Bandwidth per Node
sum(rate(nvlink_data_transmitted_bytes[1m])) by (node) * 8 / 1e9

# PCIe Link Status
DCGM_FI_DEV_PCIE_LINK_WIDTH * DCGM_FI_DEV_PCIE_LINK_GEN

# Memory Bandwidth Utilization
DCGM_FI_DEV_MEM_COPY_UTIL{cluster="prod-gpu-01"}

# Power Consumption per Node
sum(DCGM_FI_DEV_POWER_USAGE) by (node)
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <h2>🔧 H100/H200 Specific Troubleshooting</h2>
                    <p>8-GPU node architecture with PCIe and NVLink connectivity</p>
                </div>
                <div class="section-content">
                    <h3>Common H100/H200 Issues</h3>
                    
                    <h4>1. PCIe Link Degradation</h4>
                    <div class="alert alert-warning">
                        <strong>Symptom:</strong> GPU utilization drops to 60-70%, training throughput reduced by 30-40%
                    </div>
                    <div class="command-block">
<span class="command-prompt">$</span> # Check PCIe link status on all nodes
for node in gpu-node-{01..32}; do
  ssh $node "nvidia-smi -q -d SUPPORTED_CLOCKS | grep -A5 'PCIe'"
done

<span class="command-output"># Expected: PCIe Gen4 x16 (63 GB/s bidirectional)
# Problem: PCIe Gen3 x8 (15.75 GB/s) - 75% bandwidth loss</span>
                    </div>

                    <h4>2. NVLink Topology Issues</h4>
                    <div class="alert alert-critical">
                        <strong>Symptom:</strong> Uneven GPU memory access, NCCL AllReduce &gt;500ms
                    </div>
                    <div class="command-block">
<span class="command-prompt">$</span> # Verify NVLink topology
nvidia-smi nvlink --status
nvidia-smi topo -m

<span class="command-output"># Check for X (no connection) instead of NV12/NV18 links
# Verify 4x NVLink connections between GPU pairs</span>
                    </div>

                    <h4>3. Memory Bandwidth Bottlenecks</h4>
                    <div class="command-block">
<span class="command-prompt">$</span> # Test memory bandwidth with CUDA samples
cd /usr/local/cuda/samples/1_Utilities/bandwidthTest
./bandwidthTest --mode=range --start=1024 --end=134217728 --increment=2

<span class="command-output"># Expected H100: &gt;3000 GB/s
# Expected H200: &gt;4800 GB/s (with HBM3e)
# Problem: <2000 GB/s indicates memory subsystem issues</span>
                    </div>

                    <h4>4. Server Platform Specific Issues</h4>
                    <div class="alert alert-info">
                        <strong>OEM Server Considerations:</strong>
                        <ul>
                            <li><strong>Dell XE9680:</strong> Check BMC for CPU0/CPU1 PCIe lane distribution</li>
                            <li><strong>HPE DL380a:</strong> Verify iLO power capping settings</li>
                            <li><strong>Supermicro SYS-821GE:</strong> Monitor IPMI for thermal events</li>
                            <li><strong>Cisco UCS X440c:</strong> Check fabric interconnect bandwidth allocation</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- GB200/GB300 Specific Content -->
        <div id="gb200-gb300" class="tab-content">
            <div class="section" id="grafana-dashboards-gb200">
                <div class="section-header">
                    <h2>📊 GB200/GB300 NVL72 Grafana Monitoring</h2>
                    <p>72-GPU rack-scale system with NVLink fabric monitoring</p>
                </div>
                <div class="section-content">
                    <div class="metric-comparison">
                        <div class="comparison-panel healthy-panel">
                            <h3>✅ Healthy GB200 NVL72 Cluster</h3>
                            <div class="dashboard">
                                <div class="dashboard-header">🟢 NVL72 RACK - OPTIMAL PERFORMANCE</div>
                                <div class="metrics-grid">
                                    <div class="metric healthy">
                                        <div class="metric-label">GPU Domain Utilization</div>
                                        <div class="metric-value">96.8%</div>
                                        <div class="metric-status">✅ All 72 GPUs balanced</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">NVLink Fabric BW</div>
                                        <div class="metric-value">1.74 TB/s</div>
                                        <div class="metric-status">✅ 96.7% of 1.8TB/s</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">Unified Memory</div>
                                        <div class="metric-value">11.2/13.8TB</div>
                                        <div class="metric-status">✅ 81% utilization</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">Liquid Cooling ΔT</div>
                                        <div class="metric-value">18°C</div>
                                        <div class="metric-status">✅ Well below 25°C max</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">NVSwitch Health</div>
                                        <div class="metric-value">9/9 Active</div>
                                        <div class="metric-status">✅ Full fabric connectivity</div>
                                    </div>
                                    <div class="metric healthy">
                                        <div class="metric-label">Power Consumption</div>
                                        <div class="metric-value">114 kW</div>
                                        <div class="metric-status">✅ Within 120kW limit</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="comparison-panel problem-panel">
                            <h3>🚨 Problem GB200 NVL72 Cluster</h3>
                            <div class="dashboard">
                                <div class="dashboard-header">🔴 NVL72 RACK - FABRIC DEGRADED</div>
                                <div class="metrics-grid">
                                    <div class="metric critical">
                                        <div class="metric-label">GPU Domain Utilization</div>
                                        <div class="metric-value">41.2%</div>
                                        <div class="metric-status">🚨 NVSwitch failure detected</div>
                                    </div>
                                    <div class="metric critical">
                                        <div class="metric-label">NVLink Fabric BW</div>
                                        <div class="metric-value">743 GB/s</div>
                                        <div class="metric-status">🚨 59% fabric degradation</div>
                                    </div>
                                    <div class="metric critical">
                                        <div class="metric-label">Unified Memory</div>
                                        <div class="metric-value">13.79/13.8TB</div>
                                        <div class="metric-status">🚨 OOM imminent!</div>
                                    </div>
                                    <div class="metric critical">
                                        <div class="metric-label">Liquid Cooling ΔT</div>
                                        <div class="metric-value">28°C</div>
                                        <div class="metric-status">🚨 Exceeds thermal limit</div>
                                    </div>
                                    <div class="metric critical">
                                        <div class="metric-label">NVSwitch Health</div>
                                        <div class="metric-value">7/9 Active</div>
                                        <div class="metric-status">🚨 2 switches offline</div>
                                    </div>
                                    <div class="metric warning">
                                        <div class="metric-label">Power Consumption</div>
                                        <div class="metric-value">118 kW</div>
                                        <div class="metric-status">⚠️ Near 120kW limit</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="alert alert-info">
                        <strong>📊 Key GB200/GB300 Prometheus Queries:</strong>
                        <div class="command-block">
# NVL72 Domain Utilization
avg(DCGM_FI_DEV_GPU_UTIL{nvl72_domain="rack-01"})

# NVSwitch Fabric Bandwidth
sum(rate(nvswitch_data_transmitted_bytes[1m])) * 8 / 1e12

# Unified Memory Pressure
DCGM_FI_DEV_FB_USED / DCGM_FI_DEV_FB_TOTAL * 100

# Liquid Cooling Delta-T
nvl72_coolant_outlet_temp - nvl72_coolant_inlet_temp

# NVSwitch Health Status
count(nvswitch_status{status="active"}) by (rack)

# Power Distribution per NVL72 Rack
sum(DCGM_FI_DEV_POWER_USAGE{rack="nvl72-01"}) / 1000
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <h2>🏗️ GB200/GB300 NVL72 Architecture Troubleshooting</h2>
                    <p>Rack-scale system with 9 NVSwitch and liquid cooling</p>
                </div>
                <div class="section-content">
                    <h3>Critical GB200/GB300 Issues</h3>
                    
                    <h4>1. NVSwitch Fabric Failures</h4>
                    <div class="alert alert-critical">
                        <strong>Impact:</strong> Loss of 1 NVSwitch reduces fabric bandwidth by ~11%, 2+ switches cause severe degradation
                    </div>
                    <div class="command-block">
<span class="command-prompt">$</span> # Check NVSwitch status
nvidia-smi nvlink --status
nvswitch-info --query-switches

<span class="command-output"># Verify all 9 NVSwitch units are active
# Check for CRC errors or link retraining events</span>

<span class="command-prompt">$</span> # Test NVLink fabric connectivity
nvidia-smi topo -m | grep NV

<span class="command-output"># Expected: Full mesh connectivity between all 72 GPUs
# Problem: Partitioned domains or isolated GPUs</span>
                    </div>

                    <h4>2. Liquid Cooling System Issues</h4>
                    <div class="alert alert-critical">
                        <strong>Critical:</strong> GB200 NVL72 requires liquid cooling - air cooling is insufficient for 120kW per rack
                    </div>
                    <div class="command-block">
<span class="command-prompt">$</span> # Monitor cooling system via BMC
ipmitool -H nvl72-bmc-01 sdr type Temperature
ipmitool -H nvl72-bmc-01 sensor reading "Coolant Flow"

<span class="command-output"># Critical thresholds:
# Coolant Delta-T: <25°C (inlet to outlet)
# Flow rate: &gt;40 LPM per rack
# GPU junction temp: <95°C</span>

<span class="command-prompt">$</span> # Check for thermal throttling
nvidia-smi dmon -s pucvmet -c 10 | awk '$7 > 0 {print "THERMAL THROTTLE: GPU"$1}'
                    </div>

                    <h4>3. Unified Memory Management</h4>
                    <div class="alert alert-warning">
                        <strong>Challenge:</strong> 13.8TB unified memory space requires careful allocation to prevent OOM
                    </div>
                    <div class="command-block">
<span class="command-prompt">$</span> # Monitor memory allocation patterns
nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader,nounits | \
  awk '{used+=$1; total+=$2} END {printf "Memory: %.1fTB/%.1fTB (%.1f%%)\n", used/1024/1024, total/1024/1024, used/total*100}'

<span class="command-output"># Watch for memory fragmentation
# Monitor for memory leaks in long-running jobs</span>
                    </div>

                    <h4>4. Power Distribution & Management</h4>
                    <div class="command-block">
<span class="command-prompt">$</span> # Monitor power consumption and distribution
nvidia-smi -q -d POWER | grep "Power Draw"
ipmitool -H nvl72-bmc-01 sensor reading "Total Power"

<span class="command-output"># Verify power stays below 120kW per rack
# Check for power supply redundancy status</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Network Common Content -->
        <div id="network-common" class="tab-content">
            <div class="section" id="network-troubleshooting">
                <div class="section-header">
                    <h2>🌐 RoCEv2 Ethernet Network Troubleshooting</h2>
                    <p>Lossless Ethernet with DCQCN congestion control</p>
                </div>
                <div class="section-content">
                    <h3>RoCEv2 Network Health Dashboard</h3>
                    <div class="dashboard">
                        <div class="dashboard-header">📡 ROCEV2 NETWORK MONITORING</div>
                        <div class="metrics-grid">
                            <div class="metric healthy">
                                <div class="metric-label">ECN Marking Rate</div>
                                <div class="metric-value">0.02%</div>
                                <div class="metric-status">✅ Target <1%</div>
                            </div>
                            <div class="metric warning">
                                <div class="metric-label">RDMA Retry Rate</div>
                                <div class="metric-value">847 ppm</div>
                                <div class="metric-status">⚠️ Above 10 ppm threshold</div>
                            </div>
                            <div class="metric healthy">
                                <div class="metric-label">DCQCN Rate Control</div>
                                <div class="metric-value">385 Gbps</div>
                                <div class="metric-status">✅ Stable at line rate</div>
                            </div>
                            <div class="metric critical">
                                <div class="metric-label">Buffer Utilization</div>
                                <div class="metric-value">94%</div>
                                <div class="metric-status">🚨 Near overflow</div>
                            </div>
                        </div>
                    </div>

                    <h3>Critical RoCEv2 Configuration Parameters</h3>
                    <div class="alert alert-info">
                        <strong>Essential DCQCN Settings for ConnectX-7/8 NICs:</strong>
                    </div>
                    <div class="command-block">
# DCQCN Algorithm Configuration
ROCE_CC_ALGORITHM=DCQCN_ALGORITHM
DCQCN_ALPHA_INTERVAL=1024           # Rate decrease responsiveness
DCQCN_RATE_INCREASE_PERIOD=128      # Rate recovery speed  
DCQCN_CNP_TIMER=1000               # Congestion notification period
DCQCN_INITIAL_ALPHA_VALUE=1023     # Initial congestion response

# PFC Configuration (per priority)
PFC_XOFF_THRESHOLD=19456           # Pause frame trigger (bytes)
PFC_XON_THRESHOLD=16384            # Resume threshold
PFC_WATCHDOG_TIMEOUT=100000        # Storm detection (microseconds)

# ECN Marking Thresholds  
ECN_MIN_THRESHOLD=8192             # Start marking packets
ECN_MAX_THRESHOLD=16384            # Maximum marking
ECN_MARKING_PROBABILITY=100        # Mark probability (%)
                    </div>

                    <h3>PFC Storm Detection & Resolution</h3>
                    <div class="alert alert-critical">
                        <strong>🚨 PFC Storm Symptoms:</strong>
                        <ul>
            <li>Training throughput drops &gt;80%</li>
            <li>NCCL AllReduce timeouts &gt;5 seconds</li>
            <li>Switch buffer utilization &gt;95%</li>
            <li>PFC pause duration &gt;100μs sustained</li>
                        </ul>
                    </div>

                    <div class="command-block">
<span class="command-prompt">$</span> # Detect PFC storms across fabric
for switch in spine-{1..4} leaf-{1..32}; do
  echo "=== $switch ==="
  ssh $switch "show interfaces ethernet priority-flow-control statistics" | \
    awk '/pause.*duration/ && $NF > 100 {print "PFC STORM: "$0}'
done

<span class="command-output"># Look for sustained pause durations &gt;100μs
# Identify which priority classes are affected</span>

<span class="command-prompt">$</span> # Check DCQCN rate limiting on NICs
for node in gpu-node-{01..64}; do
  ssh $node "ethtool -S mlx5_0 | grep -E '(cc_|cnp_|rp_)'" 
done | grep -v " 0$"

<span class="command-output"># Monitor congestion control responses:
# cc_handled_packets: DCQCN rate reductions
# cnp_handled_packets: Congestion notifications processed  
# rp_cnp_handled: Rate point congestion responses</span>
                    </div>

                    <h3>ECMP Hash Polarization Detection</h3>
                    <div class="alert alert-warning">
                        <strong>Hash Polarization Impact:</strong> Uneven flow distribution can cause 40-60% throughput degradation
                    </div>
                    <div class="command-block">
<span class="command-prompt">$</span> # Check ECMP flow distribution across spine switches
for spine in spine-{1..4}; do
  ssh $spine "show interfaces ethernet statistics" | \
    awk '/Ethernet1\/1\/[1-4]/ {print $1, $3}' | \
    while read port bytes; do
      echo "$spine $port $bytes"
    done
done | sort -k3 -n

<span class="command-output"># Healthy: Flow distribution within ±5% across all spines
# Problem: One spine handling &gt;40% of traffic (hash polarization)</span>

<span class="command-prompt">$</span> # Analyze ECMP hash distribution  
tcpdump -i any -c 1000 -nn 'dst port 4040' | \
  awk '{print $3}' | cut -d. -f4 | sort | uniq -c | sort -rn

<span class="command-output"># Check if flows are hashing to same spine links
# Verify 5-tuple hash distribution is balanced</span>
                    </div>
                </div>
            </div>

            <div class="section" id="clos-topology">
                <div class="section-header">
                    <h2>🏗️ CLOS Network Topology Troubleshooting</h2>
                    <p>2-Tier and 3-Tier CLOS fabric analysis</p>
                </div>
                <div class="section-content">
                    <div class="network-topology">
                        <h3>CLOS Network Architecture</h3>
                        <div class="topology-layer">
                            <strong>Spine Layer (Aggregation)</strong><br>
                            4x Spectrum-4 switches (400G ports)<br>
                            Full mesh to all leaf switches
                        </div>
                        <div class="topology-layer">
                            <strong>Leaf Layer (Access)</strong><br>
                            32x Spectrum-3 switches (200G uplinks)<br>
                            8x downlinks per leaf to GPU nodes
                        </div>
                        <div class="topology-layer">
                            <strong>GPU Nodes</strong><br>
                            H100/H200: 8 GPUs per node<br>
                            GB200: 72 GPUs per NVL72 rack
                        </div>
                    </div>

                    <h3>CLOS Fabric Health Monitoring</h3>
                    <div class="dashboard">
                        <div class="dashboard-header">🌐 CLOS FABRIC HEALTH</div>
                        <div class="metrics-grid">
                            <div class="metric healthy">
                                <div class="metric-label">ECMP Distribution</div>
                                <div class="metric-value">25.1%</div>
                                <div class="metric-status">✅ Balanced (±0.2% std dev)</div>
                            </div>
                            <div class="metric healthy">
                                <div class="metric-label">Leaf-to-Leaf Latency</div>
                                <div class="metric-value">1.84μs</div>
                                <div class="metric-status">✅ P99 <2μs target</div>
                            </div>
                            <div class="metric warning">
                                <div class="metric-label">Spine Utilization</div>
                                <div class="metric-value">78%</div>
                                <div class="metric-status">⚠️ Approaching 80% threshold</div>
                            </div>
                            <div class="metric healthy">
                                <div class="metric-label">Multipath Efficiency</div>
                                <div class="metric-value">94.2%</div>
                                <div class="metric-status">✅ Good path utilization</div>
                            </div>
                        </div>
                    </div>

                    <h3>Common CLOS Issues & Solutions</h3>
                    
                    <h4>1. Oversubscription Hotspots</h4>
                    <div class="alert alert-warning">
                        <strong>Symptom:</strong> Specific leaf-to-leaf paths show &gt;200ms latency spikes
                    </div>
                    <div class="command-block">
<span class="command-prompt">$</span> # Measure inter-leaf latency matrix
for src_leaf in leaf-{01..32}; do
  for dst_leaf in leaf-{01..32}; do
    if [ "$src_leaf" != "$dst_leaf" ]; then
      ssh $src_leaf "ping -c 5 -i 0.1 $dst_leaf-mgmt" | \
        awk '/avg/ {printf "%s->%s: %s\n", "'$src_leaf'", "'$dst_leaf'", $4}'
    fi
  done
done | sort -t: -k2 -n | tail -10

<span class="command-output"># Identify leaf pairs with &gt;10ms latency
# Check spine utilization for those paths</span>
                    </div>

                    <h4>2. Spine Link Failures</h4>
                    <div class="command-block">
<span class="command-prompt">$</span> # Verify spine link redundancy
for spine in spine-{1..4}; do
  echo "=== $spine Link Status ==="
  ssh $spine "show interfaces status" | grep -E "(Up|Down)"
done

<span class="command-output"># Check for failed uplinks from leaves to spines
# Verify LACP bundle status if using link aggregation</span>
                    </div>

                    <h4>3. Buffer Management Issues</h4>
                    <div class="command-block">
<span class="command-prompt">$</span> # Monitor buffer utilization across fabric
for switch in spine-{1..4} leaf-{01..32}; do
  ssh $switch "show qos interface ethernet buffer-utilization" | \
    awk '$NF > 80 {print "'$switch':", $0}'
done

<span class="command-output"># Watch for buffer exhaustion &gt;90%
# Correlate with PFC pause frame generation</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Training Job Performance Analysis -->
        <div class="section" id="training-degradation">
            <div class="section-header">
                <h2>📈 Training Job Performance Degradation Analysis</h2>
                <p>Systematic approach to diagnosing ML training slowdowns</p>
            </div>
            <div class="section-content">
                <h3>Training Performance Dashboard</h3>
                <div class="metric-comparison">
                    <div class="comparison-panel healthy-panel">
                        <h3>✅ Healthy Training Job</h3>
                        <div class="dashboard">
                            <div class="dashboard-header">🟢 TRAINING METRICS - OPTIMAL</div>
                            <div class="metrics-grid">
                                <div class="metric healthy">
                                    <div class="metric-label">Throughput</div>
                                    <div class="metric-value">847K tok/s</div>
                                    <div class="metric-status">✅ Target performance</div>
                                </div>
                                <div class="metric healthy">
                                    <div class="metric-label">Loss Convergence</div>
                                    <div class="metric-value">1.847</div>
                                    <div class="metric-status">✅ Smoothly decreasing</div>
                                </div>
                                <div class="metric healthy">
                                    <div class="metric-label">NCCL AllReduce</div>
                                    <div class="metric-value">124ms</div>
                                    <div class="metric-status">✅ P99 <200ms</div>
                                </div>
                                <div class="metric healthy">
                                    <div class="metric-label">Gradient Sync</div>
                                    <div class="metric-value">94.2%</div>
                                    <div class="metric-status">✅ High efficiency</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="comparison-panel problem-panel">
                        <h3>🚨 Degraded Training Job</h3>
                        <div class="dashboard">
                            <div class="dashboard-header">🔴 TRAINING METRICS - DEGRADED</div>
                            <div class="metrics-grid">
                                <div class="metric critical">
                                    <div class="metric-label">Throughput</div>
                                    <div class="metric-value">142K tok/s</div>
                                    <div class="metric-status">🚨 83% degradation</div>
                                </div>
                                <div class="metric critical">
                                    <div class="metric-label">Loss Convergence</div>
                                    <div class="metric-value">NaN</div>
                                    <div class="metric-status">🚨 Gradient explosion!</div>
                                </div>
                                <div class="metric critical">
                                    <div class="metric-label">NCCL AllReduce</div>
                                    <div class="metric-value">3,847ms</div>
                                    <div class="metric-status">🚨 30x slower</div>
                                </div>
                                <div class="metric critical">
                                    <div class="metric-label">Gradient Sync</div>
                                    <div class="metric-value">23.7%</div>
                                    <div class="metric-status">🚨 Stragglers detected</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h3>Training Job Diagnostic Workflow</h3>
                <div class="troubleshooting-flow">
                    <div class="flow-step">
                        <h4>1. Identify Performance Baseline Deviation</h4>
                        <div class="command-block">
<span class="command-prompt">$</span> # Compare current vs baseline throughput
kubectl logs -l app=training-job | grep "tokens/sec" | tail -20 | \
  awk '{print $NF}' | awk '{sum+=$1; count++} END {print "Avg:", sum/count}'

<span class="command-output"># Baseline: 800K+ tokens/sec for H100 cluster
# Alert threshold: <600K tokens/sec (25% degradation)</span>
                        </div>
                    </div>

                    <div class="flow-step">
                        <h4>2. Check NCCL Communication Patterns</h4>
                        <div class="command-block">
<span class="command-prompt">$</span> # Enable NCCL debugging and analyze AllReduce timing
export NCCL_DEBUG=INFO
export NCCL_DEBUG_SUBSYS=ALL

kubectl logs -l app=training-job | grep -E "(AllReduce|ring|tree)" | tail -50

<span class="command-output"># Look for:
# - Ring formation failures
# - Slow nodes in AllReduce operations  
# - Network topology detection issues</span>
                        </div>
                    </div>

                    <div class="flow-step">
                        <h4>3. Analyze Gradient Synchronization Efficiency</h4>
                        <div class="command-block">
<span class="command-prompt">$</span> # Monitor gradient sync timing per GPU
python3 -c "
import torch.distributed as dist
import time

start_time = time.time()
dist.all_reduce(tensor, op=dist.ReduceOp.SUM)
sync_time = time.time() - start_time
print(f'AllReduce time: {sync_time*1000:.1f}ms')
"

<span class="command-output"># Target: <200ms for H100, <300ms for GB200
# Problem: &gt;1000ms indicates network issues</span>
                        </div>
                    </div>

                    <div class="flow-step">
                        <h4>4. Detect Straggler Nodes</h4>
                        <div class="command-block">
<span class="command-prompt">$</span> # Identify slow nodes in distributed training
kubectl get pods -l app=training-job -o wide | while read pod node; do
  kubectl logs $pod | grep "step_time" | tail -5 | \
    awk '{print "'$node':", $NF}' 
done | sort -k2 -n | tail -10

<span class="command-output"># Identify nodes with &gt;20% slower step times
# Correlate with GPU utilization and network metrics</span>
                        </div>
                    </div>
                </div>

                <h3>Common Training Degradation Root Causes</h3>
                
                <h4>1. Memory Bandwidth Saturation</h4>
                <div class="alert alert-warning">
                    <strong>Symptom:</strong> GPU utilization high (&gt;90%) but throughput low
                </div>
                <div class="command-block">
<span class="command-prompt">$</span> # Check memory bandwidth utilization
nvidia-smi dmon -s m -c 10 | awk 'NR>2 {print "GPU"$1": "$4"%"}'

<span class="command-output"># H100: Target &gt;85% memory bandwidth utilization  
# H200: Target &gt;90% with HBM3e improvements
# Low utilization indicates compute bottleneck</span>
                </div>

                <h4>2. Batch Size vs Memory Optimization</h4>
                <div class="command-block">
<span class="command-prompt">$</span> # Analyze memory usage patterns
nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu --format=csv,noheader | \
  awk -F, '{printf "GPU Memory: %.1fGB/%.1fGB (%.1f%%), Util: %s\n", $1/1024, $2/1024, ($1/$2)*100, $3}'

<span class="command-output"># Optimal: 80-90% memory usage with &gt;90% GPU utilization
# Problem: &gt;95% memory (frequent OOM) or &lt;70% (underutilized)</span>
                </div>

                <h4>3. Data Loading Pipeline Bottlenecks</h4>
                <div class="command-block">
<span class="command-prompt">$</span> # Monitor data loading vs compute ratio
kubectl logs -l app=training-job | grep -E "(data_time|batch_time)" | tail -20 | \
  awk '{print $1, $2}' | awk '{data+=$1; batch+=$2; count++} END {printf "Data: %.1fms, Compute: %.1fms, Ratio: %.2f\n", data/count, batch/count, data/batch}'

<span class="command-output"># Target ratio: data_time/batch_time < 0.1
# Problem: &gt;0.2 indicates I/O bottleneck</span>
                </div>
            </div>
        </div>

        <!-- Commands Reference -->
        <div class="section" id="commands-reference">
            <div class="section-header">
                <h2>💻 Commands & Scripts Reference</h2>
                <p>Essential diagnostic commands for rapid troubleshooting</p>
            </div>
            <div class="section-content">
                <h3>🔧 GPU Diagnostics</h3>
                <div class="command-block">
# GPU Health Check
nvidia-smi --query-gpu=name,temperature.gpu,power.draw,memory.used,memory.total,utilization.gpu --format=csv

# NVLink Topology Verification  
nvidia-smi topo -m

# GPU Memory Bandwidth Test
cd /usr/local/cuda/samples/1_Utilities/bandwidthTest && ./bandwidthTest

# Check for ECC Errors
nvidia-smi --query-gpu=ecc.errors.corrected.total,ecc.errors.uncorrected.total --format=csv

# Monitor GPU Performance Counters
nvidia-smi dmon -s pucvmet -c 10

# PCIe Link Status
nvidia-smi --query-gpu=pci.link.gen.current,pci.link.width.current --format=csv
                </div>

                <h3>🌐 Network Diagnostics</h3>
                <div class="command-block">
# RoCE Interface Status
ibstatus
ibv_devinfo

# RDMA Performance Test
ib_send_bw -d mlx5_0 -i 1 -s 1048576 -n 1000 &lt;remote_host&gt;
ib_read_bw -d mlx5_0 -i 1 -s 1048576 -n 1000 &lt;remote_host&gt;

# PFC Statistics  
ethtool -S mlx5_0 | grep pfc
mlxdump -d mlx5_0 fsdump --type FT | grep -A5 -B5 PFC

# DCQCN Status
ethtool -S mlx5_0 | grep -E "(cc_|cnp_|rp_)"

# Network Latency Test
qperf &lt;remote_host&gt; tcp_lat udp_lat

# Switch Buffer Status (Spectrum switches)
show qos interface ethernet buffer-utilization
show interfaces ethernet priority-flow-control statistics
                </div>

                <h3>🏗️ NCCL & Collective Operations</h3>
                <div class="command-block">
# NCCL Test Suite
/usr/local/nccl-tests/all_reduce_perf -b 1G -e 1G -f 2 -g 8

# NCCL Environment Variables for Debugging
export NCCL_DEBUG=INFO
export NCCL_DEBUG_SUBSYS=INIT,GRAPH,ENV,TUNING
export NCCL_SOCKET_IFNAME=eth0
export NCCL_IB_DISABLE=0
export NCCL_NET_GDR_LEVEL=5

# Ring and Tree Algorithm Testing
export NCCL_ALGO=Ring,Tree
export NCCL_PROTO=Simple,LL,LL128

# Check NCCL Network Topology
NCCL_DEBUG=INFO python3 -c "
import torch
import torch.distributed as dist
dist.init_process_group('nccl')
print('NCCL initialized successfully')
"
                </div>

                <h3>📊 Monitoring & Alerting</h3>
                <div class="command-block">
# Prometheus Query Examples
curl -s 'http://prometheus:9090/api/v1/query?query=DCGM_FI_DEV_GPU_UTIL' | jq '.data.result[].value[1]'

curl -s 'http://prometheus:9090/api/v1/query?query=rate(pfc_pause_duration_microseconds[5m])' | jq '.data.result[].value[1]'

# DCGM Metrics Collection
dcgmi discovery -l
dcgmi stats -g 0 -e 1001,1002,1003,1004 -c 10

# Custom GPU Monitoring Script
#!/bin/bash
while true; do
  nvidia-smi --query-gpu=timestamp,name,utilization.gpu,memory.used,temperature.gpu,power.draw --format=csv,noheader,nounits | \
  awk -F, '{printf "%s: GPU=%s%%, Mem=%sMB, Temp=%sC, Power=%sW\n", $2, $3, $4, $5, $6}'
  sleep 5
done

# Network Performance Monitoring
#!/bin/bash
for nic in mlx5_0 mlx5_1; do
  echo "=== $nic ==="
  ethtool -S $nic | grep -E "(rx_bytes|tx_bytes|rx_packets|tx_packets)" | \
    awk '{print $1, $2/1e9 "GB"}' 
done
                </div>

                <h3>🚨 Emergency Response Scripts</h3>
                <div class="command-block">
# Quick Cluster Health Check
#!/bin/bash
echo "=== GPU Cluster Health Check ==="
echo "1. GPU Status:"
nvidia-smi --query-gpu=name,utilization.gpu,temperature.gpu --format=csv,noheader | head -8

echo "2. Network Status:"
ibstatus | grep -E "(State|Rate)"

echo "3. Training Job Status:"
kubectl get pods -l app=training-job | grep -E "(Running|Error|Pending)"

echo "4. Critical Alerts:"
curl -s 'http://alertmanager:9093/api/v1/alerts' | jq '.data[] | select(.state=="firing") | .labels.alertname'

# PFC Storm Mitigation
#!/bin/bash  
echo "Detecting PFC storms..."
for switch in spine-{1..4} leaf-{01..32}; do
  ssh $switch "show interfaces ethernet priority-flow-control statistics" | \
    awk '/pause.*duration/ && $NF > 100 {print "PFC STORM on '$switch': "$0}'
done

# Auto-restart degraded training job
#!/bin/bash
CURRENT_THROUGHPUT=$(kubectl logs -l app=training-job | grep "tokens/sec" | tail -1 | awk '{print $NF}')
BASELINE_THROUGHPUT=800000

if [ "$CURRENT_THROUGHPUT" -lt $((BASELINE_THROUGHPUT * 70 / 100)) ]; then
  echo "Training degraded: $CURRENT_THROUGHPUT < $((BASELINE_THROUGHPUT * 70 / 100))"
  kubectl rollout restart deployment/training-job
fi
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 2rem; color: #6c757d; border-top: 1px solid #dee2e6; margin-top: 3rem;">
            <p><strong>GPU Cluster Troubleshooting Playbook v2.1</strong></p>
            <p>For H100/H200 & GB200/GB300 NVL72 systems with RoCEv2 Ethernet networking</p>
            <p style="font-size: 0.9rem; margin-top: 1rem;">
                🔧 <strong>Emergency Contact:</strong> NOC Team +1-800-GPU-HELP | 
                📊 <strong>Grafana:</strong> https://monitoring.gpu-cluster.local |
                🚨 <strong>Alerts:</strong> https://alerts.gpu-cluster.local
            </p>
        </div>
    </div>

    <script>
        function showTab(tabId) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all buttons
            document.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active');
            });
            
            // Show selected tab and mark button as active
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }

        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Auto-refresh metrics simulation (for demo purposes)
        function simulateMetricsUpdate() {
            const metrics = document.querySelectorAll('.metric-value');
            metrics.forEach(metric => {
                if (Math.random() > 0.95) { // 5% chance to update
                    const currentValue = parseFloat(metric.textContent);
                    if (!isNaN(currentValue)) {
                        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
                        const newValue = currentValue * (1 + variation);
                        metric.textContent = newValue.toFixed(1) + metric.textContent.replace(/[\d.]+/, '').trim();
                    }
                }
            });
        }

        // Update metrics every 30 seconds
        setInterval(simulateMetricsUpdate, 30000);
    </script>
</body>
</html>
`;
