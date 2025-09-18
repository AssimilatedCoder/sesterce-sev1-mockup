import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Chart: any;
    DashboardDataLoader: any;
  }
}

// Integrated data loader class
class DashboardDataLoader {
  data: any = {};
  charts: any = {};

  parseCSV(csvText: string) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        if (value !== undefined) {
          // Try to parse as number, otherwise keep as string
          row[header] = isNaN(Number(value)) ? value : Number(value);
        }
      });
      data.push(row);
    }
    
    return data;
  }

  async loadAllData() {
    const csvFiles = [
      'queue_wait_quantiles.csv',
      'gpu_utilization.csv',
      'sla_penalty_and_budget.csv',
      'composite_timeline.csv',
      'dcgm_util_by_node.csv',
      'network_ecn_rate.csv',
      'vast_nvmeof_latency_quantiles.csv',
      'tenant_allocation_snapshot.csv',
      'nccl_allreduce_latency.csv',
      'pfc_pause_rx.csv',
      'per_link_utilization.csv',
      'vast_fe_util_and_cache.csv',
      'vast_io_mix.csv',
      'vast_nvme_queue_depth.csv',
      'vast_nvme_transport_errors.csv',
      'scheduler_metrics.csv'
    ];

    const logFiles = [
      'noc_events.log',
      'nccl_logs.log',
      'evpn_events.log',
      'change_timeline.log'
    ];

    // Load CSV files
    for (const file of csvFiles) {
      try {
        const response = await fetch(`/superpod_sev1_fake_telemetry/${file}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const csvText = await response.text();
        const key = file.replace('.csv', '');
        this.data[key] = this.parseCSV(csvText);
        console.log(`✅ Loaded ${key}: ${this.data[key].length} records`);
      } catch (error) {
        console.warn(`⚠️ Failed to load ${file}:`, error);
        // Generate fallback data for missing files
        this.data[file.replace('.csv', '')] = this.generateFallbackData(file);
      }
    }

    // Load log files
    for (const file of logFiles) {
      try {
        const response = await fetch(`/superpod_sev1_fake_telemetry/${file}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const logText = await response.text();
        const key = file.replace('.log', '');
        this.data[key] = this.parseLogFile(logText);
        console.log(`✅ Loaded ${key}: ${this.data[key].length} log entries`);
      } catch (error) {
        console.warn(`⚠️ Failed to load ${file}:`, error);
        // Generate fallback log data
        this.data[file.replace('.log', '')] = this.generateFallbackLogData(file);
      }
    }
  }

  parseLogFile(logText: string) {
    const lines = logText.trim().split('\n');
    const entries = [];
    
    for (const line of lines) {
      if (line.trim()) {
        // Try to extract timestamp and message from log line
        const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})/);
        const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();
        
        entries.push({
          timestamp,
          message: line.trim(),
          level: line.includes('ERROR') ? 'error' : line.includes('WARN') ? 'warning' : 'info'
        });
      }
    }
    
    return entries;
  }

  generateFallbackLogData(filename: string) {
    const entries = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000)); // 30 min intervals
      
      if (filename.includes('noc_events')) {
        entries.push({
          timestamp: timestamp.toISOString(),
          message: `ALARM: PFC pause storm detected on leaf-${Math.floor(Math.random() * 20)}`,
          level: 'error'
        });
      } else if (filename.includes('change_timeline')) {
        entries.push({
          timestamp: timestamp.toISOString(),
          message: `DEPLOY: Storage FE rollout completed (aggressive prefetch enabled)`,
          level: 'info'
        });
      } else if (filename.includes('evpn_events')) {
        entries.push({
          timestamp: timestamp.toISOString(),
          message: `EVPN: MAC move detected on VXLAN ${Math.floor(Math.random() * 1000)}`,
          level: 'warning'
        });
      } else {
        entries.push({
          timestamp: timestamp.toISOString(),
          message: `INFO: System event ${i}`,
          level: 'info'
        });
      }
    }
    
    console.log(`🔄 Generated fallback log data for ${filename}: ${entries.length} entries`);
    return entries;
  }

  generateFallbackData(filename: string) {
    const now = new Date();
    const data = [];
    
    // Generate 100 data points over the last 6 hours
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - (6 * 60 * 60 * 1000) + (i * 3.6 * 60 * 1000));
      
      if (filename.includes('queue_wait')) {
        data.push({
          timestamp: timestamp.toISOString(),
          p50: 7 + Math.random() * 24,
          p90: 15 + Math.random() * 40,
          p99: 25 + Math.random() * 60
        });
      } else if (filename.includes('gpu_utilization')) {
        data.push({
          timestamp: timestamp.toISOString(),
          allocated_percent: 86 - Math.random() * 32,
          busy_percent: 54 - Math.random() * 20
        });
      } else if (filename.includes('sla_penalty')) {
        data.push({
          timestamp: timestamp.toISOString(),
          penalty_dollars_per_hour: 47200 + Math.random() * 10000,
          budget_burn_dollars: 156000 + Math.random() * 50000
        });
      } else {
        // Generic fallback
        data.push({
          timestamp: timestamp.toISOString(),
          value: Math.random() * 100
        });
      }
    }
    
    console.log(`🔄 Generated fallback data for ${filename}: ${data.length} records`);
    return data;
  }

  updateQueueWaitChart() {
    const canvas = document.getElementById('queueWaitChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.charts.queueWait) {
      this.charts.queueWait.destroy();
    }

    const queueData = this.data.queue_wait_quantiles || [];
    
    this.charts.queueWait = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: queueData.slice(-50).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'P50',
          data: queueData.slice(-50).map((d: any) => d.p50),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }, {
          label: 'P90',
          data: queueData.slice(-50).map((d: any) => d.p90),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
        }, {
          label: 'P99',
          data: queueData.slice(-50).map((d: any) => d.p99),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#d9d9d9' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updateGPUStats() {
    const gpuData = this.data.gpu_utilization || [];
    if (gpuData.length === 0) return;

    const latest = gpuData[gpuData.length - 1];
    
    const allocatedEl = document.getElementById('gpuAllocated');
    const busyEl = document.getElementById('gpuBusy');
    
    if (allocatedEl) allocatedEl.textContent = `${Math.round(latest.allocated_percent || 86)}%`;
    if (busyEl) busyEl.textContent = `${Math.round(latest.busy_percent || 54)}%`;
  }

  updateSLAStats() {
    const slaData = this.data.sla_penalty_and_budget || [];
    if (slaData.length === 0) return;

    const latest = slaData[slaData.length - 1];
    
    const riskEl = document.getElementById('slaRisk');
    const burnEl = document.getElementById('budgetBurn');
    
    if (riskEl) riskEl.textContent = `$${(latest.penalty_dollars_per_hour || 47200).toLocaleString()}/hr`;
    if (burnEl) burnEl.textContent = `$${(latest.budget_burn_dollars || 156000).toLocaleString()}`;
  }

  updateDCGMChart() {
    const canvas = document.getElementById('dcgmUtilChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.dcgm) {
      this.charts.dcgm.destroy();
    }

    const dcgmData = this.data.dcgm_util_by_node || [];
    
    this.charts.dcgm = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: dcgmData.slice(-30).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'SM Utilization',
          data: dcgmData.slice(-30).map((d: any) => d.sm_utilization || Math.random() * 100),
          borderColor: '#76B900',
          backgroundColor: 'rgba(118, 185, 0, 0.1)',
          tension: 0.4
        }, {
          label: 'Memory Utilization',
          data: dcgmData.slice(-30).map((d: any) => d.mem_utilization || Math.random() * 100),
          borderColor: '#FF6B35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updateECNChart() {
    const canvas = document.getElementById('ecnRateChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.ecn) {
      this.charts.ecn.destroy();
    }

    const ecnData = this.data.network_ecn_rate || [];
    
    this.charts.ecn = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: ecnData.slice(-30).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'ECN Mark Rate (%)',
          data: ecnData.slice(-30).map((d: any) => d.ecn_mark_rate_percent || (0.2 + Math.random() * 4.6)),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updateNVMeChart() {
    const canvas = document.getElementById('nvmeLatencyChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.nvme) {
      this.charts.nvme.destroy();
    }

    const nvmeData = this.data.vast_nvmeof_latency_quantiles || [];
    
    this.charts.nvme = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: nvmeData.slice(-30).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'P50',
          data: nvmeData.slice(-30).map((d: any) => d.p50 || (0.3 + Math.random() * 0.2)),
          borderColor: '#10B981',
          tension: 0.4
        }, {
          label: 'P90',
          data: nvmeData.slice(-30).map((d: any) => d.p90 || (0.5 + Math.random() * 0.5)),
          borderColor: '#F59E0B',
          tension: 0.4
        }, {
          label: 'P99',
          data: nvmeData.slice(-30).map((d: any) => d.p99 || (0.8 + Math.random() * 2.0)),
          borderColor: '#EF4444',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updateNCCLChart() {
    const canvas = document.getElementById('ncclLatencyChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.nccl) {
      this.charts.nccl.destroy();
    }

    const ncclData = this.data.nccl_allreduce_latency || [];
    
    // Create heatmap-style visualization using scatter plot
    this.charts.nccl = new window.Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'NCCL Latency (ms)',
          data: ncclData.slice(-50).map((d: any, i: number) => ({
            x: i,
            y: d.job_id || Math.floor(Math.random() * 10),
            r: (d.latency_ms || (5 + Math.random() * 15)) / 2
          })),
          backgroundColor: 'rgba(255, 107, 53, 0.6)',
          borderColor: '#FF6B35'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          y: {
            title: { display: true, text: 'Job ID', color: '#d9d9d9' },
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            title: { display: true, text: 'Time', color: '#d9d9d9' },
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updatePFCChart() {
    const canvas = document.getElementById('pfcPauseChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.pfc) {
      this.charts.pfc.destroy();
    }

    const pfcData = this.data.pfc_pause_rx || [];
    
    this.charts.pfc = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: pfcData.slice(-20).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'PFC Pause Rx',
          data: pfcData.slice(-20).map((d: any) => d.pause_rx_count || Math.random() * 1000000),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: '#EF4444',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updateLinkUtilChart() {
    const canvas = document.getElementById('linkUtilChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.linkUtil) {
      this.charts.linkUtil.destroy();
    }

    const linkData = this.data.per_link_utilization || [];
    
    this.charts.linkUtil = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: linkData.slice(-30).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'Link Utilization (%)',
          data: linkData.slice(-30).map((d: any) => d.utilization_percent || Math.random() * 100),
          borderColor: '#8e32e9',
          backgroundColor: 'rgba(142, 50, 233, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updateQueueDepthChart() {
    const canvas = document.getElementById('queueDepthChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.queueDepth) {
      this.charts.queueDepth.destroy();
    }

    const queueDepthData = this.data.vast_nvme_queue_depth || [];
    
    this.charts.queueDepth = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: queueDepthData.slice(-30).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'Queue Depth',
          data: queueDepthData.slice(-30).map((d: any) => d.queue_depth || (10 + Math.random() * 50)),
          borderColor: '#14B8A6',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updateCacheStatsChart() {
    const canvas = document.getElementById('cacheStatsChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.cacheStats) {
      this.charts.cacheStats.destroy();
    }

    const cacheData = this.data.vast_fe_util_and_cache || [];
    
    this.charts.cacheStats = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: cacheData.slice(-30).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'Cache Hit %',
          data: cacheData.slice(-30).map((d: any) => d.cache_hit_percent || (85 + Math.random() * 10)),
          borderColor: '#10B981',
          tension: 0.4
        }, {
          label: 'FE CPU %',
          data: cacheData.slice(-30).map((d: any) => d.fe_cpu_percent || (20 + Math.random() * 60)),
          borderColor: '#F59E0B',
          tension: 0.4
        }, {
          label: 'FE RAM %',
          data: cacheData.slice(-30).map((d: any) => d.fe_ram_percent || (40 + Math.random() * 40)),
          borderColor: '#EF4444',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          }
        }
      }
    });
  }

  updateCompositeChart() {
    const canvas = document.getElementById('compositeChart') as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts.composite) {
      this.charts.composite.destroy();
    }

    const compositeData = this.data.composite_timeline || [];
    
    this.charts.composite = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: compositeData.slice(-50).map((d: any) => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'ECN Mark Rate (%)',
          data: compositeData.slice(-50).map((d: any) => d.ecn_mark_rate || (0.2 + Math.random() * 4.6)),
          borderColor: '#EF4444',
          yAxisID: 'y'
        }, {
          label: 'NVMe-oF P99 (ms)',
          data: compositeData.slice(-50).map((d: any) => d.nvme_p99_latency || (0.38 + Math.random() * 2.42)),
          borderColor: '#F59E0B',
          yAxisID: 'y1'
        }, {
          label: 'GPU Util (%)',
          data: compositeData.slice(-50).map((d: any) => d.gpu_utilization || (86 - Math.random() * 32)),
          borderColor: '#76B900',
          yAxisID: 'y2'
        }, {
          label: 'Queue P90 (min)',
          data: compositeData.slice(-50).map((d: any) => d.queue_wait_p90 || (7 + Math.random() * 24)),
          borderColor: '#8e32e9',
          yAxisID: 'y3'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { labels: { color: '#d9d9d9' } }
        },
        scales: {
          x: {
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: '#2f2f32' },
            ticks: { color: '#d9d9d9' }
          },
          y1: {
            type: 'linear',
            display: false,
            position: 'right',
          },
          y2: {
            type: 'linear',
            display: false,
            position: 'right',
          },
          y3: {
            type: 'linear',
            display: false,
            position: 'right',
          }
        }
      }
    });
  }

  updateChangeTimeline() {
    const changeTimelineEl = document.querySelector('.change-timeline-content');
    if (!changeTimelineEl) return;

    const changeData = this.data.change_timeline || [];
    
    const timelineHTML = changeData.slice(-5).map((entry: any) => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const isError = entry.level === 'error';
      const isWarning = entry.level === 'warning';
      
      return `
        <div class="flex items-center space-x-2 mb-2">
          <span class="w-2 h-2 ${isError ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-blue-500'} rounded-full"></span>
          <span class="text-gray-400 text-xs">${time}:</span>
          <span class="text-white text-sm">${entry.message}</span>
        </div>
      `;
    }).join('');

    changeTimelineEl.innerHTML = timelineHTML || `
      <div class="flex items-center space-x-2">
        <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
        <span class="text-gray-400">18h ago:</span>
        <span class="text-white">Fabric A spine replacement</span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="w-2 h-2 bg-red-500 rounded-full"></span>
        <span class="text-gray-400">4h ago:</span>
        <span class="text-white">Storage FE rollout (aggressive prefetch)</span>
      </div>
    `;
  }

  updateNOCEvents() {
    const nocEventsEl = document.querySelector('.noc-events-content');
    if (!nocEventsEl) return;

    const nocData = this.data.noc_events || [];
    
    const eventsHTML = nocData.slice(-5).map((entry: any) => {
      const levelClass = entry.level === 'error' ? 'text-red-400' : 
                        entry.level === 'warning' ? 'text-yellow-400' : 'text-blue-400';
      const levelText = entry.level === 'error' ? 'ALARM' : 
                       entry.level === 'warning' ? 'WARN' : 'INFO';
      
      return `<div class="${levelClass} text-xs font-mono">${levelText}: ${entry.message}</div>`;
    }).join('');

    nocEventsEl.innerHTML = eventsHTML || `
      <div class="text-red-400 text-xs font-mono">ALARM: PFC pause storm detected</div>
      <div class="text-yellow-400 text-xs font-mono">WARN: ECN mark rate threshold exceeded</div>
      <div class="text-blue-400 text-xs font-mono">INFO: Failover completed on EVPN instance</div>
    `;
  }

  async initialize() {
    console.log('🚀 Loading dashboard data...');
    await this.loadAllData();
    
    console.log('📊 Updating charts...');
    // Row 1: EXEC / SLO
    this.updateQueueWaitChart();
    this.updateGPUStats();
    this.updateSLAStats();
    
    // Row 2: GPU / Compute
    this.updateDCGMChart();
    this.updateNCCLChart();
    
    // Row 3: Network Fabric
    this.updateECNChart();
    this.updatePFCChart();
    this.updateLinkUtilChart();
    
    // Row 4: Storage
    this.updateNVMeChart();
    this.updateQueueDepthChart();
    this.updateCacheStatsChart();
    
    // Row 5: Change & Event Timeline
    this.updateChangeTimeline();
    this.updateNOCEvents();
    
    // Row 6: Cross-Domain Correlation
    this.updateCompositeChart();
    
    console.log('✅ Dashboard data loaded successfully!');
  }
}

export const GrafanaDashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Chart.js and initialize dashboard
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
            
            // Initialize dashboard
            initializeDashboard();
          };
          document.head.appendChild(adapterScript);
        };
        document.head.appendChild(chartScript);
      } else {
        initializeDashboard();
      }
    };

    const initializeDashboard = async () => {
      // Wait for DOM elements to be ready
      setTimeout(async () => {
        try {
          console.log('🚀 Initializing dashboard...');
          const loader = new DashboardDataLoader();
          await loader.initialize();
          
          // Set up auto-refresh
          setInterval(() => {
            loader.updateGPUStats();
            loader.updateSLAStats();
          }, 30000);
        } catch (error) {
          console.error('❌ Failed to initialize dashboard:', error);
        }
      }, 1000);
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
              <div className="change-timeline-content space-y-2 text-sm">
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
              <div className="noc-events-content space-y-1 text-xs font-mono">
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
