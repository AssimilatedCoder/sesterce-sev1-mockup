import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Chart: any;
    DashboardDataLoader: any;
  }
}

export const GrafanaDashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Chart.js and dashboard data loader
    const loadScripts = async () => {
      // Load Chart.js
      if (!window.Chart) {
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        chartScript.onload = () => {
          // Load date adapter
          const adapterScript = document.createElement('script');
          adapterScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js';
          adapterScript.onload = () => {
            // Configure Chart.js defaults
            if (window.Chart) {
              window.Chart.defaults.color = '#d9d9d9';
              window.Chart.defaults.backgroundColor = '#1f1f20';
              window.Chart.defaults.borderColor = '#404043';
              window.Chart.defaults.plugins.legend.labels.color = '#d9d9d9';
              window.Chart.defaults.scales.linear.grid.color = '#2f2f32';
              window.Chart.defaults.scales.time.grid.color = '#2f2f32';
            }
            
            // Load dashboard data loader
            loadDataLoader();
          };
          document.head.appendChild(adapterScript);
        };
        document.head.appendChild(chartScript);
      } else {
        loadDataLoader();
      }
    };

    const loadDataLoader = () => {
      if (!window.DashboardDataLoader) {
        const dataLoaderScript = document.createElement('script');
        dataLoaderScript.src = '/dashboard-data-loader.js';
        dataLoaderScript.onload = () => {
          // Initialize dashboard after a short delay
          setTimeout(async () => {
            if (window.DashboardDataLoader) {
              try {
                const loader = new window.DashboardDataLoader();
                await loader.initialize();
                
                // Set up auto-refresh
                setInterval(() => {
                  loader.updateGPUStats();
                  loader.updateSLAStats();
                }, 30000);
              } catch (error) {
                console.error('Failed to initialize dashboard:', error);
              }
            }
          }, 1000);
        };
        document.head.appendChild(dataLoaderScript);
      }
    };

    loadScripts();

    // Auto-refresh simulation
    const refreshInterval = setInterval(() => {
      const timestampElement = dashboardRef.current?.querySelector('.dashboard-meta span:last-child');
      if (timestampElement) {
        timestampElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
      }
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <div ref={dashboardRef} className="grafana-dashboard min-h-screen bg-gray-900 text-gray-100">
      {/* Dashboard Header */}
      <div className="dashboard-header bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">SEV-1 War Room — Nvidia SuperPod (RoCEv2 + VAST NVMe-oF)</h1>
            <div className="dashboard-meta flex items-center space-x-4 mt-2 text-sm text-gray-400">
              <span>🔴 INCIDENT ACTIVE</span>
              <span>Pod: EMEA-Pod-2</span>
              <span>Duration: 2h 14m</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              6h
            </button>
            <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
              24h
            </button>
            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              ⟳ 30s
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content p-4 space-y-6">
        
        {/* Row 1: EXEC / SLO (Business View) */}
        <div className="dashboard-row">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            Row 1 — Exec / SLO (Business View)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">Queue Wait P50/P90/P99 (SLO ≤ 10m)</h3>
              <div className="chart-container">
                <canvas id="queueWaitChart" width="400" height="200"></canvas>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">GPU Allocated vs Busy (%)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Allocated:</span>
                  <span className="metric-value text-white font-semibold" id="gpuAllocated">86%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Busy:</span>
                  <span className="metric-value text-white font-semibold" id="gpuBusy">54%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '54%'}}></div>
                </div>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">SLA Penalty Exposure</h3>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-400" id="slaRisk">$47.2K/hr</div>
                <div className="text-sm text-gray-400">Budget Burn: <span id="budgetBurn">$156K</span></div>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">Top-10 Customers</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">OpenAI</span>
                  <span className="text-red-400">DELAYED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Anthropic</span>
                  <span className="text-yellow-400">QUEUED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cohere</span>
                  <span className="text-green-400">RUNNING</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: GPU / Compute Domain */}
        <div className="dashboard-row">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            Row 2 — GPU / Compute
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">DCGM GPU Utilization (SM/Mem/Copy)</h3>
              <div className="chart-container">
                <canvas id="dcgmUtilChart" width="400" height="200"></canvas>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">NCCL All-Reduce Latency Heatmap</h3>
              <div className="chart-container">
                <canvas id="ncclLatencyChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Network Fabric */}
        <div className="dashboard-row">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            Row 3 — Network Fabric (RoCEv2 / EVPN)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">ECN Mark Rate (%)</h3>
              <div className="chart-container">
                <canvas id="ecnRateChart" width="400" height="200"></canvas>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">PFC Pause Counters</h3>
              <div className="chart-container">
                <canvas id="pfcPauseChart" width="400" height="200"></canvas>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">Per-Link Utilization</h3>
              <div className="chart-container">
                <canvas id="linkUtilChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Storage */}
        <div className="dashboard-row">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            Row 4 — Storage (VAST NVMe-oF / NFS / S3)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">NVMe-oF Latency P50/P90/P99</h3>
              <div className="chart-container">
                <canvas id="nvmeLatencyChart" width="400" height="200"></canvas>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">Queue Depth per FE</h3>
              <div className="chart-container">
                <canvas id="queueDepthChart" width="400" height="200"></canvas>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">Cache Hit/Miss + Prefetch</h3>
              <div className="chart-container">
                <canvas id="cacheStatsChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>

        {/* Row 5: Change & Event Timeline */}
        <div className="dashboard-row">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            Row 5 — Change & Event Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">Change Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-gray-400">18h ago:</span>
                  <span className="text-white">Fabric A spine replacement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-gray-400">4h ago:</span>
                  <span className="text-white">Storage FE rollout (aggressive prefetch)</span>
                </div>
              </div>
            </div>
            
            <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">NOC Events</h3>
              <div className="space-y-1 text-xs font-mono">
                <div className="text-red-400">ALARM: PFC pause storm detected</div>
                <div className="text-yellow-400">WARN: ECN mark rate threshold exceeded</div>
                <div className="text-blue-400">INFO: Failover completed on EVPN instance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 6: Cross-Domain Correlation */}
        <div className="dashboard-row">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            Row 6 — Cross-Domain Correlation (Summary Timeline)
          </h2>
          <div className="panel bg-gray-800 border border-gray-700 rounded p-4">
            <h3 className="panel-title text-sm font-medium text-gray-300 mb-3">Composite: ECN↑ → NVMe-oF P99↑ → GPU Util↓ → Queue Wait↑</h3>
            <div className="chart-container">
              <canvas id="compositeChart" width="800" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
