// Dashboard Data Loader - Parses CSV files and populates charts with real data

class DashboardDataLoader {
    constructor() {
        this.data = {};
        this.charts = {};
    }

    // Parse CSV text into array of objects
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                const value = values[index];
                // Try to parse as number, otherwise keep as string
                if (!isNaN(value) && value !== '') {
                    row[header] = parseFloat(value);
                } else {
                    row[header] = value;
                }
            });
            data.push(row);
        }
        
        return data;
    }

    // Load all CSV files
    async loadAllData() {
        const files = [
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

        for (const file of files) {
            try {
                const response = await fetch(`superpod_sev1_fake_telemetry/${file}`);
                const csvText = await response.text();
                const key = file.replace('.csv', '');
                this.data[key] = this.parseCSV(csvText);
                console.log(`Loaded ${key}: ${this.data[key].length} records`);
            } catch (error) {
                console.warn(`Failed to load ${file}:`, error);
                // Generate fallback data for missing files
                this.data[file.replace('.csv', '')] = this.generateFallbackData(file);
            }
        }
    }

    // Generate fallback data if CSV files aren't accessible
    generateFallbackData(filename) {
        const now = new Date();
        const data = [];
        
        // Generate 24 hours of data points (every minute)
        for (let i = 0; i < 1440; i++) {
            const timestamp = new Date(now.getTime() - (1440 - i) * 60 * 1000);
            const timeStr = timestamp.toISOString();
            
            // Simulate the incident starting at 08:26 (around record 506)
            const isIncident = i > 506;
            
            switch (filename) {
                case 'queue_wait_quantiles.csv':
                    data.push({
                        timestamp: timeStr,
                        tenant: 'alpha',
                        p50_min: isIncident ? 15 + Math.random() * 10 : 4 + Math.random() * 2,
                        p90_min: isIncident ? 25 + Math.random() * 15 : 7 + Math.random() * 3,
                        p99_min: isIncident ? 31 + Math.random() * 8 : 9 + Math.random() * 2
                    });
                    break;
                    
                case 'gpu_utilization.csv':
                    data.push({
                        timestamp: timeStr,
                        gpu_allocated_percent: 90 + Math.random() * 2,
                        gpu_busy_percent: isIncident ? 54 + Math.random() * 10 : 86 + Math.random() * 2
                    });
                    break;
                    
                case 'network_ecn_rate.csv':
                    data.push({
                        timestamp: timeStr,
                        class: 'training',
                        ecn_mark_rate_percent: isIncident ? 4.8 + Math.random() * 2 : 0.2 + Math.random() * 0.1
                    });
                    break;
                    
                case 'vast_nvmeof_latency_quantiles.csv':
                    data.push({
                        timestamp: timeStr,
                        namespace: 'ns-01',
                        p50_ms: isIncident ? 1.2 + Math.random() * 0.5 : 0.25 + Math.random() * 0.1,
                        p90_ms: isIncident ? 2.1 + Math.random() * 0.8 : 0.35 + Math.random() * 0.1,
                        p99_ms: isIncident ? 2.8 + Math.random() * 1.2 : 0.38 + Math.random() * 0.05
                    });
                    break;
                    
                case 'composite_timeline.csv':
                    data.push({
                        timestamp: timeStr,
                        ecn_mark_rate_percent: isIncident ? 4.8 + Math.random() * 2 : 0.2 + Math.random() * 0.1,
                        nvmeof_p99_ms: isIncident ? 2.8 + Math.random() * 1.2 : 0.38 + Math.random() * 0.05,
                        gpu_util_percent: isIncident ? 54 + Math.random() * 10 : 86 + Math.random() * 2,
                        queue_p90_min: isIncident ? 31 + Math.random() * 8 : 7 + Math.random() * 3
                    });
                    break;
                    
                default:
                    // Generic fallback
                    data.push({
                        timestamp: timeStr,
                        value: Math.random() * 100
                    });
            }
        }
        
        return data;
    }

    // Update Queue Wait Chart (Row 1)
    updateQueueWaitChart() {
        console.log('📈 Updating Queue Wait Chart...');
        const ctx = document.getElementById('queueWaitChart');
        if (!ctx) {
            console.error('❌ Canvas element "queueWaitChart" not found!');
            return;
        }
        console.log('✅ Found queueWaitChart canvas element');

        const queueData = this.data.queue_wait_quantiles || this.generateFallbackData('queue_wait_quantiles.csv');
        
        // Group by tenant and create datasets
        const tenants = [...new Set(queueData.map(d => d.tenant))];
        const datasets = [];
        
        // For now, show aggregated data across all tenants
        const aggregatedData = {};
        queueData.forEach(row => {
            const time = new Date(row.timestamp);
            const key = time.toISOString();
            if (!aggregatedData[key]) {
                aggregatedData[key] = { p50: [], p90: [], p99: [], time };
            }
            aggregatedData[key].p50.push(row.p50_min);
            aggregatedData[key].p90.push(row.p90_min);
            aggregatedData[key].p99.push(row.p99_min);
        });

        // Calculate averages
        const timePoints = Object.keys(aggregatedData).sort();
        const p50Data = timePoints.map(key => ({
            x: aggregatedData[key].time,
            y: aggregatedData[key].p50.reduce((a, b) => a + b, 0) / aggregatedData[key].p50.length
        }));
        const p90Data = timePoints.map(key => ({
            x: aggregatedData[key].time,
            y: aggregatedData[key].p90.reduce((a, b) => a + b, 0) / aggregatedData[key].p90.length
        }));
        const p99Data = timePoints.map(key => ({
            x: aggregatedData[key].time,
            y: aggregatedData[key].p99.reduce((a, b) => a + b, 0) / aggregatedData[key].p99.length
        }));

        // Update or create chart
        if (this.charts.queueWait) {
            this.charts.queueWait.data.datasets[0].data = p50Data;
            this.charts.queueWait.data.datasets[1].data = p90Data;
            this.charts.queueWait.data.datasets[2].data = p99Data;
            this.charts.queueWait.update();
        } else {
            this.charts.queueWait = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'P50',
                        data: p50Data,
                        borderColor: '#73bf69',
                        backgroundColor: 'rgba(115, 191, 105, 0.1)',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'P90',
                        data: p90Data,
                        borderColor: '#ff9830',
                        backgroundColor: 'rgba(255, 152, 48, 0.1)',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'P99',
                        data: p99Data,
                        borderColor: '#e02f44',
                        backgroundColor: 'rgba(224, 47, 68, 0.1)',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour',
                                displayFormats: {
                                    hour: 'HH:mm'
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Minutes'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#d9d9d9'
                            }
                        }
                    }
                }
            });
        }
    }

    // Update GPU Utilization Stats (Row 1)
    updateGPUStats() {
        const gpuData = this.data.gpu_utilization || this.generateFallbackData('gpu_utilization.csv');
        
        if (gpuData.length > 0) {
            const latest = gpuData[gpuData.length - 1];
            
            const allocatedEl = document.getElementById('gpuAllocated');
            const busyEl = document.getElementById('gpuBusy');
            
            if (allocatedEl) {
                allocatedEl.textContent = `${latest.gpu_allocated_percent.toFixed(1)}%`;
                allocatedEl.className = latest.gpu_allocated_percent > 90 ? 'stat-value warning' : 'stat-value good';
            }
            
            if (busyEl) {
                busyEl.textContent = `${latest.gpu_busy_percent.toFixed(1)}%`;
                if (latest.gpu_busy_percent < 60) {
                    busyEl.className = 'stat-value critical';
                } else if (latest.gpu_busy_percent < 80) {
                    busyEl.className = 'stat-value warning';
                } else {
                    busyEl.className = 'stat-value good';
                }
            }
        }
    }

    // Update SLA Penalty Stats (Row 1)
    updateSLAStats() {
        const slaData = this.data.sla_penalty_and_budget || this.generateFallbackData('sla_penalty_and_budget.csv');
        
        if (slaData.length > 0) {
            const latest = slaData[slaData.length - 1];
            
            const penaltyEl = document.getElementById('slaPenalty');
            const budgetEl = document.getElementById('emergencyBudget');
            
            if (penaltyEl) {
                const penalty = Math.max(0, latest.sla_penalty_per_hour);
                penaltyEl.textContent = `$${penalty.toFixed(0)}/h`;
                penaltyEl.className = penalty > 1000 ? 'stat-value critical' : penalty > 0 ? 'stat-value warning' : 'stat-value good';
            }
            
            if (budgetEl) {
                budgetEl.textContent = `$${latest.emergency_budget_burn_cumulative.toFixed(0)}`;
            }
        }
    }

    // Update Cache Stats (Row 4)
    updateCacheStats() {
        const feData = this.data.vast_fe_util_and_cache || this.generateFallbackData('vast_fe_util_and_cache.csv');
        
        if (feData.length > 0) {
            // Calculate average cache hit rate
            const avgCacheHit = feData.reduce((sum, row) => sum + row.cache_hit_percent, 0) / feData.length;
            
            // Update the cache hit rate display in the stat panel
            const cachePanel = document.querySelector('.panel .stat-panel .stat-value.warning');
            if (cachePanel && cachePanel.textContent.includes('%')) {
                cachePanel.textContent = `${avgCacheHit.toFixed(1)}%`;
                if (avgCacheHit < 70) {
                    cachePanel.className = 'stat-value critical';
                } else if (avgCacheHit < 85) {
                    cachePanel.className = 'stat-value warning';
                } else {
                    cachePanel.className = 'stat-value good';
                }
            }
        }
    }

    // Update DCGM Utilization Chart (Row 2)
    updateDCGMChart() {
        const ctx = document.getElementById('dcgmUtilChart');
        if (!ctx) return;

        const dcgmData = this.data.dcgm_util_by_node || this.generateFallbackData('dcgm_util_by_node.csv');
        
        // Aggregate by timestamp
        const aggregated = {};
        dcgmData.forEach(row => {
            const time = new Date(row.timestamp);
            const key = time.toISOString();
            if (!aggregated[key]) {
                aggregated[key] = { sm: [], mem: [], copy: [], time };
            }
            aggregated[key].sm.push(row.sm_util_percent);
            aggregated[key].mem.push(row.mem_util_percent);
            aggregated[key].copy.push(row.copy_util_percent);
        });

        const timePoints = Object.keys(aggregated).sort();
        const smData = timePoints.map(key => ({
            x: aggregated[key].time,
            y: aggregated[key].sm.reduce((a, b) => a + b, 0) / aggregated[key].sm.length
        }));
        const memData = timePoints.map(key => ({
            x: aggregated[key].time,
            y: aggregated[key].mem.reduce((a, b) => a + b, 0) / aggregated[key].mem.length
        }));

        if (this.charts.dcgm) {
            this.charts.dcgm.data.datasets[0].data = smData;
            this.charts.dcgm.data.datasets[1].data = memData;
            this.charts.dcgm.update();
        } else {
            this.charts.dcgm = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'SM Utilization',
                        data: smData,
                        borderColor: '#ff6b35',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'Memory Utilization',
                        data: memData,
                        borderColor: '#4fc3f7',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { 
                            title: { display: true, text: 'Percentage' },
                            min: 0,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update ECN Rate Chart (Row 3)
    updateECNChart() {
        const ctx = document.getElementById('ecnRateChart');
        if (!ctx) return;

        const ecnData = this.data.network_ecn_rate || this.generateFallbackData('network_ecn_rate.csv');
        
        const trainingData = ecnData
            .filter(row => row.class === 'training')
            .map(row => ({
                x: new Date(row.timestamp),
                y: row.ecn_mark_rate_percent
            }));

        if (this.charts.ecn) {
            this.charts.ecn.data.datasets[0].data = trainingData;
            this.charts.ecn.update();
        } else {
            this.charts.ecn = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Training Class',
                        data: trainingData,
                        borderColor: '#e02f44',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { title: { display: true, text: 'Percentage' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update NVMe-oF Latency Chart (Row 4)
    updateNVMeChart() {
        const ctx = document.getElementById('nvmeLatencyChart');
        if (!ctx) return;

        const nvmeData = this.data.vast_nvmeof_latency_quantiles || this.generateFallbackData('vast_nvmeof_latency_quantiles.csv');
        
        // Aggregate by timestamp
        const aggregated = {};
        nvmeData.forEach(row => {
            const time = new Date(row.timestamp);
            const key = time.toISOString();
            if (!aggregated[key]) {
                aggregated[key] = { p50: [], p90: [], p99: [], time };
            }
            aggregated[key].p50.push(row.p50_ms);
            aggregated[key].p90.push(row.p90_ms);
            aggregated[key].p99.push(row.p99_ms);
        });

        const timePoints = Object.keys(aggregated).sort();
        const p50Data = timePoints.map(key => ({
            x: aggregated[key].time,
            y: aggregated[key].p50.reduce((a, b) => a + b, 0) / aggregated[key].p50.length
        }));
        const p90Data = timePoints.map(key => ({
            x: aggregated[key].time,
            y: aggregated[key].p90.reduce((a, b) => a + b, 0) / aggregated[key].p90.length
        }));
        const p99Data = timePoints.map(key => ({
            x: aggregated[key].time,
            y: aggregated[key].p99.reduce((a, b) => a + b, 0) / aggregated[key].p99.length
        }));

        if (this.charts.nvme) {
            this.charts.nvme.data.datasets[0].data = p50Data;
            this.charts.nvme.data.datasets[1].data = p90Data;
            this.charts.nvme.data.datasets[2].data = p99Data;
            this.charts.nvme.update();
        } else {
            this.charts.nvme = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'P50',
                        data: p50Data,
                        borderColor: '#73bf69',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'P90',
                        data: p90Data,
                        borderColor: '#ff9830',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'P99',
                        data: p99Data,
                        borderColor: '#e02f44',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { title: { display: true, text: 'Milliseconds' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update Composite Chart (Row 7)
    updateCompositeChart() {
        const ctx = document.getElementById('compositeChart');
        if (!ctx) return;

        const compositeData = this.data.composite_timeline || this.generateFallbackData('composite_timeline.csv');
        
        const ecnData = compositeData.map(row => ({
            x: new Date(row.timestamp),
            y: row.ecn_mark_rate_percent
        }));
        
        const nvmeData = compositeData.map(row => ({
            x: new Date(row.timestamp),
            y: row.nvmeof_p99_ms
        }));
        
        const gpuData = compositeData.map(row => ({
            x: new Date(row.timestamp),
            y: row.gpu_util_percent
        }));
        
        const queueData = compositeData.map(row => ({
            x: new Date(row.timestamp),
            y: row.queue_p90_min
        }));

        if (this.charts.composite) {
            this.charts.composite.data.datasets[0].data = ecnData;
            this.charts.composite.data.datasets[1].data = nvmeData;
            this.charts.composite.data.datasets[2].data = gpuData;
            this.charts.composite.data.datasets[3].data = queueData;
            this.charts.composite.update();
        } else {
            this.charts.composite = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'ECN Mark Rate (%)',
                        data: ecnData,
                        borderColor: '#e02f44',
                        yAxisID: 'y',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'NVMe-oF P99 (ms)',
                        data: nvmeData,
                        borderColor: '#ff9830',
                        yAxisID: 'y1',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'GPU Util (%)',
                        data: gpuData,
                        borderColor: '#4fc3f7',
                        yAxisID: 'y2',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'Queue P90 (min)',
                        data: queueData,
                        borderColor: '#9c27b0',
                        yAxisID: 'y3',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { 
                            type: 'linear', 
                            display: true, 
                            position: 'left',
                            title: { display: true, text: 'ECN %' }
                        },
                        y1: { 
                            type: 'linear', 
                            display: true, 
                            position: 'right', 
                            grid: { drawOnChartArea: false },
                            title: { display: true, text: 'Latency (ms)' }
                        },
                        y2: { 
                            type: 'linear', 
                            display: false,
                            min: 0,
                            max: 100
                        },
                        y3: { 
                            type: 'linear', 
                            display: false 
                        }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update NCCL Latency Chart (Row 2)
    updateNCCLChart() {
        const ctx = document.getElementById('ncclLatencyChart');
        if (!ctx) return;

        const ncclData = this.data.nccl_allreduce_latency || this.generateFallbackData('nccl_allreduce_latency.csv');
        
        const scatterData = ncclData.map(row => ({
            x: new Date(row.timestamp),
            y: row.allreduce_latency_ms
        }));

        if (this.charts.nccl) {
            this.charts.nccl.data.datasets[0].data = scatterData;
            this.charts.nccl.update();
        } else {
            this.charts.nccl = new Chart(ctx.getContext('2d'), {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'All-Reduce Latency',
                        data: scatterData,
                        backgroundColor: function(context) {
                            const value = context.parsed.y;
                            if (value > 20) return '#e02f44';
                            if (value > 10) return '#ff9830';
                            return '#73bf69';
                        },
                        pointRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { title: { display: true, text: 'Milliseconds' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update PFC Pause Chart (Row 3)
    updatePFCChart() {
        const ctx = document.getElementById('pfcPauseChart');
        if (!ctx) return;

        const pfcData = this.data.pfc_pause_rx || this.generateFallbackData('pfc_pause_rx.csv');
        
        // Calculate rate from cumulative values
        const rateData = {};
        pfcData.forEach(row => {
            const priority = row.priority;
            if (!rateData[priority]) rateData[priority] = [];
            rateData[priority].push({
                x: new Date(row.timestamp),
                y: row.pfc_pause_rx_cumulative
            });
        });

        const datasets = Object.keys(rateData).map((priority, index) => ({
            label: `Priority ${priority}`,
            data: rateData[priority],
            backgroundColor: ['#ff6b35', '#4fc3f7', '#73bf69', '#ff9830'][index % 4],
            borderColor: ['#ff6b35', '#4fc3f7', '#73bf69', '#ff9830'][index % 4],
            type: 'line',
            tension: 0.4,
            fill: false
        }));

        if (this.charts.pfc) {
            this.charts.pfc.data.datasets = datasets;
            this.charts.pfc.update();
        } else {
            this.charts.pfc = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { title: { display: true, text: 'Pause Frames' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update Link Utilization Chart (Row 3)
    updateLinkUtilChart() {
        const ctx = document.getElementById('linkUtilChart');
        if (!ctx) return;

        const linkData = this.data.per_link_utilization || this.generateFallbackData('per_link_utilization.csv');
        
        // Group by device and show top utilized links
        const deviceData = {};
        linkData.forEach(row => {
            const key = `${row.device}-${row.port}`;
            if (!deviceData[key]) deviceData[key] = [];
            deviceData[key].push({
                x: new Date(row.timestamp),
                y: row.utilization_percent
            });
        });

        // Show top 5 most utilized links
        const sortedDevices = Object.keys(deviceData)
            .sort((a, b) => {
                const avgA = deviceData[a].reduce((sum, point) => sum + point.y, 0) / deviceData[a].length;
                const avgB = deviceData[b].reduce((sum, point) => sum + point.y, 0) / deviceData[b].length;
                return avgB - avgA;
            })
            .slice(0, 5);

        const datasets = sortedDevices.map((device, index) => ({
            label: device,
            data: deviceData[device],
            borderColor: ['#e02f44', '#ff9830', '#ff6b35', '#4fc3f7', '#73bf69'][index],
            tension: 0.4,
            fill: false
        }));

        if (this.charts.linkUtil) {
            this.charts.linkUtil.data.datasets = datasets;
            this.charts.linkUtil.update();
        } else {
            this.charts.linkUtil = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { 
                            title: { display: true, text: 'Utilization %' },
                            min: 0,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update Queue Depth Chart (Row 4)
    updateQueueDepthChart() {
        const ctx = document.getElementById('queueDepthChart');
        if (!ctx) return;

        const queueData = this.data.vast_nvme_queue_depth || this.generateFallbackData('vast_nvme_queue_depth.csv');
        
        // Group by FE
        const feData = {};
        queueData.forEach(row => {
            if (!feData[row.fe]) feData[row.fe] = [];
            feData[row.fe].push({
                x: new Date(row.timestamp),
                y: row.queue_depth
            });
        });

        const datasets = Object.keys(feData).map((fe, index) => ({
            label: fe,
            data: feData[fe],
            borderColor: ['#ff6b35', '#4fc3f7', '#73bf69', '#ff9830'][index % 4],
            tension: 0.4,
            fill: false
        }));

        if (this.charts.queueDepth) {
            this.charts.queueDepth.data.datasets = datasets;
            this.charts.queueDepth.update();
        } else {
            this.charts.queueDepth = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { title: { display: true, text: 'Queue Depth' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update FE Utilization Chart (Row 4)
    updateFEUtilChart() {
        const ctx = document.getElementById('feUtilChart');
        if (!ctx) return;

        const feData = this.data.vast_fe_util_and_cache || this.generateFallbackData('vast_fe_util_and_cache.csv');
        
        // Aggregate by timestamp
        const aggregated = {};
        feData.forEach(row => {
            const time = new Date(row.timestamp);
            const key = time.toISOString();
            if (!aggregated[key]) {
                aggregated[key] = { cpu: [], nic: [], time };
            }
            aggregated[key].cpu.push(row.fe_cpu_percent);
            aggregated[key].nic.push(row.fe_nic_util_percent);
        });

        const timePoints = Object.keys(aggregated).sort();
        const cpuData = timePoints.map(key => ({
            x: aggregated[key].time,
            y: aggregated[key].cpu.reduce((a, b) => a + b, 0) / aggregated[key].cpu.length
        }));
        const nicData = timePoints.map(key => ({
            x: aggregated[key].time,
            y: aggregated[key].nic.reduce((a, b) => a + b, 0) / aggregated[key].nic.length
        }));

        if (this.charts.feUtil) {
            this.charts.feUtil.data.datasets[0].data = cpuData;
            this.charts.feUtil.data.datasets[1].data = nicData;
            this.charts.feUtil.update();
        } else {
            this.charts.feUtil = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'CPU Utilization',
                        data: cpuData,
                        borderColor: '#ff6b35',
                        tension: 0.4,
                        fill: false
                    }, {
                        label: 'NIC Utilization',
                        data: nicData,
                        borderColor: '#4fc3f7',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'time', 
                            time: { 
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            } 
                        },
                        y: { 
                            title: { display: true, text: 'Percentage' },
                            min: 0,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update IO Mix Chart (Row 4)
    updateIOMixChart() {
        const ctx = document.getElementById('ioMixChart');
        if (!ctx) return;

        const ioData = this.data.vast_io_mix || this.generateFallbackData('vast_io_mix.csv');
        
        // Calculate totals
        let totalSeq = 0, totalRand = 0;
        ioData.forEach(row => {
            totalSeq += row.seq_ops;
            totalRand += row.rand_ops;
        });

        if (this.charts.ioMix) {
            this.charts.ioMix.data.datasets[0].data = [totalSeq, totalRand];
            this.charts.ioMix.update();
        } else {
            this.charts.ioMix = new Chart(ctx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Sequential', 'Random'],
                    datasets: [{
                        data: [totalSeq, totalRand],
                        backgroundColor: ['#73bf69', '#ff9830'],
                        borderColor: ['#73bf69', '#ff9830'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            labels: { color: '#d9d9d9' },
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    // Update Transport Errors Chart (Row 4)
    updateTransportErrorsChart() {
        const ctx = document.getElementById('transportErrorsChart');
        if (!ctx) return;

        const errorData = this.data.vast_nvme_transport_errors || this.generateFallbackData('vast_nvme_transport_errors.csv');
        
        // Group by FE and calculate error rates
        const feErrors = {};
        errorData.forEach(row => {
            if (!feErrors[row.fe]) feErrors[row.fe] = 0;
            feErrors[row.fe] += row.nvmf_transport_errors;
        });

        const labels = Object.keys(feErrors);
        const data = Object.values(feErrors);

        if (this.charts.transportErrors) {
            this.charts.transportErrors.data.labels = labels;
            this.charts.transportErrors.data.datasets[0].data = data;
            this.charts.transportErrors.update();
        } else {
            this.charts.transportErrors = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Transport Errors',
                        data: data,
                        backgroundColor: '#e02f44',
                        borderColor: '#e02f44'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { title: { display: true, text: 'Error Count' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#d9d9d9' } }
                    }
                }
            });
        }
    }

    // Update Scheduler Charts (Row 6)
    updateSchedulerCharts() {
        const schedulerData = this.data.scheduler_metrics || this.generateFallbackData('scheduler_metrics.csv');
        
        // Backlog Chart
        const backlogCtx = document.getElementById('backlogChart');
        if (backlogCtx) {
            const backlogData = schedulerData.map(row => ({
                x: new Date(row.timestamp),
                y: row.queue_backlog_rate_per_min
            }));

            if (this.charts.backlog) {
                this.charts.backlog.data.datasets[0].data = backlogData;
                this.charts.backlog.update();
            } else {
                this.charts.backlog = new Chart(backlogCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Queue Backlog Rate',
                            data: backlogData,
                            borderColor: '#ff9830',
                            tension: 0.4,
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { 
                                type: 'time', 
                                time: { 
                                    unit: 'hour',
                                    displayFormats: { hour: 'HH:mm' }
                                } 
                            },
                            y: { title: { display: true, text: 'Jobs/min' } }
                        },
                        plugins: {
                            legend: { labels: { color: '#d9d9d9' } }
                        }
                    }
                });
            }
        }

        // Job Failure Chart
        const failureCtx = document.getElementById('jobFailureChart');
        if (failureCtx) {
            const retryData = schedulerData.map(row => ({
                x: new Date(row.timestamp),
                y: row.job_retries_per_min
            }));
            const failureData = schedulerData.map(row => ({
                x: new Date(row.timestamp),
                y: row.job_failures_per_min
            }));

            if (this.charts.jobFailure) {
                this.charts.jobFailure.data.datasets[0].data = retryData;
                this.charts.jobFailure.data.datasets[1].data = failureData;
                this.charts.jobFailure.update();
            } else {
                this.charts.jobFailure = new Chart(failureCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Retries',
                            data: retryData,
                            borderColor: '#ff9830',
                            tension: 0.4,
                            fill: false
                        }, {
                            label: 'Failures',
                            data: failureData,
                            borderColor: '#e02f44',
                            tension: 0.4,
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { 
                                type: 'time', 
                                time: { 
                                    unit: 'hour',
                                    displayFormats: { hour: 'HH:mm' }
                                } 
                            },
                            y: { title: { display: true, text: 'Count/min' } }
                        },
                        plugins: {
                            legend: { labels: { color: '#d9d9d9' } }
                        }
                    }
                });
            }
        }

        // Tenant Allocation Chart
        const tenantCtx = document.getElementById('tenantAllocChart');
        if (tenantCtx) {
            const tenantData = this.data.tenant_allocation_snapshot || [
                { tenant: 'omega-whale', gpu_allocations: 256 },
                { tenant: 'alpha', gpu_allocations: 64 },
                { tenant: 'bravo', gpu_allocations: 48 },
                { tenant: 'charlie', gpu_allocations: 32 },
                { tenant: 'delta', gpu_allocations: 24 }
            ];

            const labels = tenantData.map(row => row.tenant);
            const data = tenantData.map(row => row.gpu_allocations);

            if (this.charts.tenantAlloc) {
                this.charts.tenantAlloc.data.labels = labels;
                this.charts.tenantAlloc.data.datasets[0].data = data;
                this.charts.tenantAlloc.update();
            } else {
                this.charts.tenantAlloc = new Chart(tenantCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'GPU Allocations',
                            data: data,
                            backgroundColor: ['#e02f44', '#ff9830', '#ff6b35', '#4fc3f7', '#73bf69'],
                            borderColor: ['#e02f44', '#ff9830', '#ff6b35', '#4fc3f7', '#73bf69']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { title: { display: true, text: 'GPU Count' } }
                        },
                        plugins: {
                            legend: { labels: { color: '#d9d9d9' } }
                        }
                    }
                });
            }
        }
    }

    // Initialize all charts and data
    async initialize() {
        console.log('Loading dashboard data...');
        await this.loadAllData();
        
        console.log('Updating charts...');
        this.updateQueueWaitChart();
        this.updateGPUStats();
        this.updateSLAStats();
        this.updateCacheStats();
        this.updateDCGMChart();
        this.updateNCCLChart();
        this.updateECNChart();
        this.updatePFCChart();
        this.updateLinkUtilChart();
        this.updateNVMeChart();
        this.updateQueueDepthChart();
        this.updateFEUtilChart();
        this.updateIOMixChart();
        this.updateTransportErrorsChart();
        this.updateSchedulerCharts();
        this.updateCompositeChart();
        
        console.log('Dashboard data loaded successfully!');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Data loader starting...');
    try {
        const loader = new DashboardDataLoader();
        console.log('📊 Data loader created, initializing...');
        await loader.initialize();
        console.log('✅ Data loader initialization complete!');
        
        // Set up auto-refresh
        setInterval(() => {
            loader.updateGPUStats();
            loader.updateSLAStats();
        }, 30000);
    } catch (error) {
        console.error('❌ Data loader failed:', error);
    }
});
