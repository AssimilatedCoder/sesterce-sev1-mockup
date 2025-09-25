import React, { useState } from 'react';
import { Network, Cpu, Zap, Activity, AlertTriangle, ExternalLink, Monitor, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface OperationsPlaybookTabProps {
  config: any;
  results: any;
}

export const OperationsPlaybookTab: React.FC<OperationsPlaybookTabProps> = ({ config, results }) => {
  const { numGPUs, gpuModel } = config;
  const [isPlaybookExpanded, setIsPlaybookExpanded] = useState(false);
  
  const isGB200 = gpuModel === 'gb200' || gpuModel === 'gb300';
  const isHClass = gpuModel.startsWith('h100') || gpuModel.startsWith('h200');
  
  const clusterSpecs = results?.details || {};
  const systemsTotal = clusterSpecs.systemsTotal || Math.ceil(numGPUs / (isGB200 ? 72 : 8));
  const rackPowerTotal = clusterSpecs.rackPowerTotal || 0;
  const coolingType = config.coolingType || 'air';

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
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg border border-indigo-200">
        <div
          className="p-6 cursor-pointer flex items-center justify-between hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 transition-all duration-200"
          onClick={() => setIsPlaybookExpanded(!isPlaybookExpanded)}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">GPU Cluster Troubleshooting Playbook</h3>
              <p className="text-sm text-indigo-600">
                {isGB200 ? 'GB200/GB300 NVL72' : 'H100/H200'} • RoCEv2 Ethernet • {systemsTotal <= 32 ? '2-Tier CLOS' : '3-Tier CLOS'}
              </p>
            </div>
          </div>
          {isPlaybookExpanded ? (
            <ChevronUp className="w-5 h-5 text-indigo-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-indigo-600" />
          )}
        </div>
        {isPlaybookExpanded && (
          <div className="px-6 pb-6">
            <div
              style={{
                fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: '11pt',
                lineHeight: '1.6',
                color: '#2c3e50',
                background: '#ffffff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}
              dangerouslySetInnerHTML={{ __html: getTroubleshootingGuideHTML() }}
            />
          </div>
        )}
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

// Comprehensive HTML Troubleshooting Guide with Mass-Scale Ethernet runbook styling
const getTroubleshootingGuideHTML = () => `
<style>
  :root {
    --bg: #ffffff;            /* clean white background */
    --panel: #f8f9fa;         /* light grey panels */
    --ink: #2c3e50;           /* dark blue-grey text */
    --muted: #6c757d;         /* muted grey text */
    --accent: #00c896;        /* sesterce green */
    --accent-2: #00b185;      /* darker sesterce green */
    --border: #dee2e6;        /* light grey borders */
    --ok: #00c896;            /* sesterce green for success */
    --warn: #ffc107;          /* yellow for warnings */
    --bad: #dc3545;           /* red for errors */
    --mono: 'Consolas', 'Monaco', 'Courier New', monospace;
    --sans: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html,body { 
    margin: 0; 
    padding: 0; 
    background: var(--bg); 
    color: var(--ink); 
    font-family: var(--sans);
    font-size: 11pt;
    line-height: 1.6;
    font-weight: 400;
  }
  
  .container { 
    max-width: 100%; 
    margin: 0; 
    padding: 0; 
  }
  
  /* Document Header with Sesterce styling */
  header.hero {
    text-align: center;
    padding: 30px 0;
    margin-bottom: 30px;
    border-bottom: 3px solid var(--accent);
    background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
    color: var(--ink);
  }
  
  .title { 
    font-size: 24pt; 
    font-weight: 300; 
    color: var(--ink); 
    letter-spacing: 0.5px; 
    margin-bottom: 10px; 
  }
  
  .subtitle { 
    font-size: 12pt; 
    color: var(--muted); 
    font-weight: 400; 
    line-height: 1.4; 
  }
  
  .meta { 
    margin-top: 15px;
    font-size: 10pt;
    color: #95a5a6;
  }
  nav.toc { background: var(--panel); border: 1px solid var(--border); padding: 1rem; border-radius: 10px; }
  nav.toc h2 { margin-top: 0; font-size: 1.1rem; }
  nav.toc a { color: var(--accent); text-decoration: none; }
  nav.toc ul { list-style: none; padding-left: 0; margin: 0; }
  nav.toc li { margin: 0.25rem 0; }
  section { margin-top: 2.2rem; }
  h1, h2, h3 { scroll-margin-top: 90px; }
  /* Headings with Sesterce green accent */
  h1 { 
    font-size: 16pt; 
    font-weight: 500; 
    color: var(--ink); 
    margin: 40px 0 20px 0; 
    padding-bottom: 8px; 
    border-bottom: 2px solid var(--accent); 
  }
  
  h2 { 
    font-size: 16pt; 
    font-weight: 500; 
    color: var(--ink); 
    margin: 40px 0 20px 0; 
    padding-bottom: 8px; 
    border-bottom: 2px solid var(--accent); 
  }
  
  h3 { 
    font-size: 13pt; 
    font-weight: 500; 
    color: #34495e; 
    margin: 30px 0 15px 0; 
  }
  h4 { 
    font-size: 12pt; 
    font-weight: 500; 
    color: #34495e; 
    margin: 20px 0 10px 0; 
  }
  /* Paragraphs and Lists */
  p { 
    margin: 12px 0; 
    text-align: justify; 
    color: #34495e; 
    line-height: 1.6;
  }
  
  ul, ol { 
    margin: 15px 0 15px 30px; 
    color: #34495e; 
  }
  
  li { 
    margin: 8px 0; 
    line-height: 1.6; 
  }
  
  .grid { display: grid; gap: 15px; margin: 20px 0; }
  @media (min-width: 768px) {
    .grid-2 { grid-template-columns: 1fr 1fr; }
  }
  
  .card { 
    background: var(--panel); 
    border: 1px solid var(--border); 
    border-radius: 12px; 
    padding: 15px; 
  }
        
  .alert {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border-left: 4px solid;
  }
  .alert-critical { background: #f8d7da; border-color: var(--bad); color: #721c24; }
  .alert-warning { background: #fff3cd; border-color: var(--warn); color: #856404; }
  .alert-info { background: #d1ecf1; border-color: var(--accent); color: #0c5460; }
  .alert-success { background: #d4edda; border-color: var(--ok); color: #155724; }
  
  /* Tables with Sesterce styling */
  table { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 20px 0; 
    font-size: 10pt; 
    background: #ffffff; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
  }
  
  th { 
    background: var(--accent); 
    color: #ffffff; 
    padding: 12px 15px; 
    text-align: left; 
    font-weight: 500; 
    font-size: 10pt; 
    border: 1px solid var(--accent-2); 
  }
  
  td { 
    padding: 10px 15px; 
    border: 1px solid #ecf0f1; 
    vertical-align: top; 
    background: #ffffff; 
  }
  
  tr:nth-child(even) td { 
    background: #f8f9fa; 
  }
  
  tr:hover td { 
    background: #e8f5f1; 
  }
  
  /* Code Blocks and Technical Specs */
  pre { 
    background: #f8f9fa; 
    border: 1px solid var(--border); 
    border-left: 3px solid var(--muted); 
    padding: 15px 20px; 
    margin: 20px 0; 
    font-family: var(--mono); 
    font-size: 9pt; 
    line-height: 1.5; 
    overflow-x: auto; 
    white-space: pre; 
    border-radius: 4px;
  }
  
  code { 
    background: #f8f9fa; 
    padding: 2px 6px; 
    font-family: var(--mono); 
    font-size: 9pt; 
    color: var(--accent); 
    border-radius: 2px; 
  }
        
  .dashboard {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
    color: var(--ink);
    font-family: var(--mono);
  }
  .dashboard-header {
    color: var(--accent);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-align: center;
    font-weight: 500;
  }
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  .metric {
    background: #ffffff;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    border-left: 4px solid;
  }
  .metric.healthy { border-left-color: var(--ok); }
  .metric.warning { border-left-color: var(--warn); }
  .metric.critical { border-left-color: var(--bad); }
  .metric-label { color: var(--muted); font-size: 0.9rem; }
  .metric-value { color: var(--ink); font-size: 1.5rem; font-weight: bold; }
  .metric-status { font-size: 0.8rem; margin-top: 0.5rem; }
  
  .command-block {
    background: var(--panel);
    color: var(--ink);
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    font-family: var(--mono);
    overflow-x: auto;
    margin: 1rem 0;
  }
  .command-prompt { color: var(--accent); }
  .command-output { color: var(--muted); }
  
  .troubleshooting-flow {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .flow-step {
    background: var(--panel);
    border: 1px solid var(--border);
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
    background: var(--accent);
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
    background: var(--panel);
    border-radius: 8px;
    margin: 1rem 0;
    border: 1px solid var(--border);
  }
  .topology-layer {
    margin: 1rem 0;
    padding: 1rem;
    background: white;
    border-radius: 6px;
    border: 1px solid var(--border);
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
    border: 1px solid var(--border);
  }
  .healthy-panel {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    border-color: var(--ok);
  }
  .problem-panel {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    border-color: var(--bad);
  }
  
  .toc {
    background: var(--panel);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid var(--border);
  }
  .toc ul {
    list-style: none;
    padding-left: 0;
  }
  .toc li {
    padding: 0.25rem 0;
  }
  .toc a {
    color: var(--accent);
    text-decoration: none;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  .toc a:hover {
    background-color: var(--panel);
  }
  
  @media (max-width: 768px) {
    .container { padding: 10px; }
    .metrics-grid { grid-template-columns: 1fr; }
    .metric-comparison { grid-template-columns: 1fr; }
  }
</style>

<header class="hero">
    <div class="title">GPU Cluster Troubleshooting Playbook</div>
    <div class="subtitle">RoCEv2 Ethernet | CLOS Networks | H100/H200 & GB200/GB300 NVL72</div>
    <div class="meta">Comprehensive guide for identifying and resolving large-scale ML training job issues</div>
</header>

<!-- Table of Contents -->
<nav class="toc">
    <h2>📋 Quick Navigation</h2>
    <ul>
        <li><a href="#emergency-checklist">🚨 Emergency Response Checklist</a></li>
        <li><a href="#grafana-dashboards">📊 Grafana Dashboard Monitoring</a></li>
        <li><a href="#network-troubleshooting">🌐 RoCEv2 Network Troubleshooting</a></li>
        <li><a href="#gpu-performance">🔧 GPU Performance Analysis</a></li>
        <li><a href="#training-degradation">📈 Training Job Degradation</a></li>
        <li><a href="#clos-topology">🏗️ CLOS Network Topology Issues</a></li>
        <li><a href="#commands-reference">💻 Commands & Scripts Reference</a></li>
    </ul>
</nav>

<!-- Emergency Response Checklist -->
<section id="emergency-checklist">
    <h1>🚨 Emergency Response Checklist</h1>
    <p>First 5 minutes when training job performance drops &gt;50%</p>
    
    <div class="alert alert-critical">
        <strong>⚠️ CRITICAL:</strong> Follow this checklist systematically. Each step takes 30-60 seconds.
    </div>

    <div class="troubleshooting-flow">
        <div class="flow-step">
            <h3>1. Check Grafana GPU Utilization Dashboard</h3>
            <p>Look for uneven GPU utilization across nodes. Healthy clusters show 90-96% utilization.</p>
            <pre><span class="command-prompt">$</span> curl -s "http://grafana:3000/api/datasources/proxy/1/api/v1/query?query=DCGM_FI_DEV_GPU_UTIL" | jq '.data.result[].value[1]'</pre>
        </div>

        <div class="flow-step">
            <h3>2. Verify NCCL AllReduce Performance</h3>
            <p>Normal AllReduce latency: H100 &lt;150ms, GB200 &lt;200ms. Check for stragglers.</p>
            <pre><span class="command-prompt">$</span> kubectl logs -l app=training-job | grep "AllReduce" | tail -10</pre>
        </div>

        <div class="flow-step">
            <h3>3. Check Network PFC Storm Detection</h3>
            <p>PFC pause duration &gt;100μs indicates network congestion issues.</p>
            <pre><span class="command-prompt">$</span> for switch in spine-{1..4} leaf-{1..32}; do
  ssh $switch "show interfaces ethernet priority-flow-control statistics"
done | grep -E "(pause|storm)"</pre>
        </div>

        <div class="flow-step">
            <h3>4. Validate Power and Thermal Status</h3>
            <p>Check for thermal throttling or power supply issues affecting performance.</p>
            <pre><span class="command-prompt">$</span> nvidia-smi dmon -s pucvmet -c 1 | awk '$4 > 80 {print "THERMAL WARNING: GPU"$1" at "$4"C"}'</pre>
        </div>
    </div>
</section>

<!-- Grafana Dashboard Monitoring -->
<section id="grafana-dashboards">
    <h1>📊 Grafana Dashboard Monitoring</h1>
    <p>Real-time metrics visualization for GPU clusters</p>
        <h3>Key Monitoring Metrics</h3>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Healthy Range</th>
                    <th>Alert Threshold</th>
                    <th>Critical Threshold</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>GPU Utilization</td>
                    <td>&gt; 90%</td>
                    <td>&lt; 80%</td>
                    <td>&lt; 60%</td>
                </tr>
                <tr>
                    <td>PFC Pause Duration</td>
                    <td>&lt; 50μs</td>
                    <td>&gt; 100μs</td>
                    <td>&gt; 500μs</td>
                </tr>
                <tr>
                    <td>NCCL AllReduce</td>
                    <td>&lt; 200ms</td>
                    <td>&gt; 500ms</td>
                    <td>&gt; 1000ms</td>
                </tr>
                <tr>
                    <td>Memory Utilization</td>
                    <td>80-90%</td>
                    <td>&gt; 95%</td>
                    <td>&gt; 98%</td>
                </tr>
                <tr>
                    <td>Temperature</td>
                    <td>&lt; 75°C</td>
                    <td>&gt; 85°C</td>
                    <td>&gt; 90°C</td>
                </tr>
            </tbody>
        </table>
</section>

<!-- Network Troubleshooting -->
<section id="network-troubleshooting">
    <h1>🌐 RoCEv2 Network Troubleshooting</h1>
    <p>Lossless Ethernet with DCQCN congestion control</p>
    
    <div class="card">
        <h3>Common Network Issues</h3>
        <ul>
            <li><strong>PFC Storms:</strong> Pause duration &gt;100μs indicates congestion</li>
            <li><strong>ECMP Hash Polarization:</strong> Uneven spine utilization (&gt;40% on single spine)</li>
            <li><strong>Buffer Overflow:</strong> Switch buffer utilization &gt;90%</li>
            <li><strong>RDMA Retries:</strong> Retry rate &gt;10 ppm indicates packet loss</li>
        </ul>
        
        <h3>Quick Diagnostics</h3>
        <pre># Check PFC statistics
ethtool -S mlx5_0 | grep pfc

# Monitor DCQCN rate control
ethtool -S mlx5_0 | grep -E "(cc_|cnp_|rp_)"

# Verify ECMP distribution
for spine in spine-{1..4}; do
  ssh $spine "show interfaces ethernet statistics"
done | awk '{print $1, $3}' | sort -k2 -n</pre>
    </div>
</section>

<!-- GPU Performance Analysis -->
<section id="gpu-performance">
    <h1>🔧 GPU Performance Analysis</h1>
    <p>Systematic approach to GPU cluster diagnostics</p>
    
    <div class="card">
        <h3>Performance Bottlenecks</h3>
        <ul>
            <li><strong>Memory Bandwidth:</strong> Target &gt;85% utilization for H100, &gt;90% for H200</li>
            <li><strong>NVLink Degradation:</strong> Check for failed links or reduced bandwidth</li>
            <li><strong>PCIe Issues:</strong> Verify Gen4 x16 connectivity for H-class GPUs</li>
            <li><strong>Thermal Throttling:</strong> Monitor junction temperatures &lt;95°C</li>
        </ul>
        
        <h3>Diagnostic Commands</h3>
        <pre># GPU health check
nvidia-smi --query-gpu=name,temperature.gpu,power.draw,memory.used,utilization.gpu --format=csv

# NVLink topology verification
nvidia-smi topo -m

# Memory bandwidth test
cd /usr/local/cuda/samples/1_Utilities/bandwidthTest && ./bandwidthTest</pre>
    </div>
</section>

<!-- Training Job Analysis -->
<section id="training-degradation">
    <h1>📈 Training Job Degradation</h1>
    <p>Identifying and resolving ML training performance issues</p>
    
    <div class="card">
        <h3>Performance Indicators</h3>
        <ul>
            <li><strong>Throughput Drop:</strong> &gt;25% reduction from baseline</li>
            <li><strong>Loss Convergence:</strong> NaN values or erratic patterns</li>
            <li><strong>Gradient Sync:</strong> Efficiency &lt;80% indicates stragglers</li>
            <li><strong>Memory Pressure:</strong> &gt;95% utilization causes OOM</li>
        </ul>
        
        <h3>Quick Fixes</h3>
        <pre># Check training throughput
kubectl logs -l app=training-job | grep "tokens/sec" | tail -10

# Identify straggler nodes
kubectl get pods -l app=training-job -o wide | \\
  while read pod node; do
    kubectl logs $pod | grep "step_time" | tail -1
  done | sort -k2 -n

# Monitor NCCL performance
export NCCL_DEBUG=INFO
export NCCL_DEBUG_SUBSYS=ALL</pre>
    </div>
</section>

<!-- Commands Reference -->
<section id="commands-reference">
    <h1>💻 Essential Commands</h1>
    <p>Quick reference for troubleshooting</p>
    
    <div class="grid grid-2">
        <div class="card">
            <h3>GPU Diagnostics</h3>
            <pre># Monitor all GPUs
nvidia-smi dmon -s pucvmet -c 10

# Check ECC errors
nvidia-smi --query-gpu=ecc.errors.corrected.total,ecc.errors.uncorrected.total --format=csv

# NVLink bandwidth test
nvidia-smi nvlink --status</pre>
        </div>
        
        <div class="card">
            <h3>Network Diagnostics</h3>
            <pre># RoCE interface status
ibstatus && ibv_devinfo

# RDMA performance test
ib_send_bw -d mlx5_0 -s 1048576 -n 1000 remote_host

# Network latency
qperf remote_host tcp_lat udp_lat</pre>
        </div>
    </div>
</section>
`;

export default OperationsPlaybookTab;