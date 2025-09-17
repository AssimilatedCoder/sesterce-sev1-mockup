# SEV-1 War Room Dashboard — Nvidia SuperPod (RoCEv2 + VAST NVMe-oF)

A realistic Grafana-style dashboard mockup for incident management in AI training infrastructure, simulating a SEV-1 incident caused by aggressive prefetch rollout in EMEA Pod-2.

## 🎯 Overview

This dashboard simulates a real-world SEV-1 incident showing:
- **Queue wait times** jumping from 7min → 31min (SLO breach)
- **GPU utilization** dropping from 86% → 54%
- **ECN mark rates** spiking from 0.2% → 4.8%
- **NVMe-oF P99 latency** rising from 0.38ms → 2.8ms
- **Cross-domain correlation** showing the complete incident cascade

## 📋 Prerequisites

- **Python 3.7+** (for the HTTP server)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **No additional dependencies** required

## 🚀 Quick Start

### 1. Clone from GitHub
```bash
git clone https://github.com/YOUR_USERNAME/grafana-sev1-dashboard.git
cd grafana-sev1-dashboard
```

### 2. Start the Dashboard Server

**Local Development:**
```bash
python3 serve-dashboard.py
# Access at: http://localhost:8080/sev1-warroom-dashboard.html
```

**Production/Ubuntu Server:**
```bash
python3 server.py
# Access at: http://YOUR_IP:7777/sev1-warroom-dashboard.html
```

**Expected output:**
```
🚀 Starting Grafana SEV-1 Dashboard Server...
📊 Dashboard URL: http://localhost:8080/sev1-warroom-dashboard.html
📁 Serving files from: /Users/avanhuys/Projects/Grafana Sesterce
🔄 Press Ctrl+C to stop the server

✅ Dashboard file: sev1-warroom-dashboard.html
✅ Data loader: dashboard-data-loader.js
✅ Data directory: superpod_sev1_fake_telemetry (20 CSV files)

🌐 Opening dashboard in browser: http://localhost:8080/sev1-warroom-dashboard.html
```

### 3. Access the Dashboard
**Local:** http://localhost:8080/sev1-warroom-dashboard.html  
**Ubuntu Server:** http://YOUR_UBUNTU_IP:7777

### 4. Stop the Server
Press `Ctrl+C` in the terminal to stop the server.

## 🌐 Ubuntu Server Deployment

For remote access on Ubuntu server:

### Quick Ubuntu Setup
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/grafana-sev1-dashboard.git
cd grafana-sev1-dashboard

# 2. Find your Ubuntu IP
hostname -I

# 3. Start production server
python3 server.py

# 4. Open firewall (if needed)
sudo ufw allow 7777/tcp
```

**Share this URL:** `http://YOUR_UBUNTU_IP:7777`

📋 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Ubuntu setup guide**

## 📁 Project Structure

```
Grafana Sesterce/
├── sev1-warroom-dashboard.html    # Main dashboard HTML
├── dashboard-data-loader.js       # Data parsing and chart logic
├── serve-dashboard.py            # HTTP server script
├── README.md                     # This file
└── superpod_sev1_fake_telemetry/ # Synthetic data files
    ├── queue_wait_quantiles.csv
    ├── gpu_utilization.csv
    ├── network_ecn_rate.csv
    ├── vast_nvmeof_latency_quantiles.csv
    ├── composite_timeline.csv
    ├── nccl_logs.log
    ├── change_timeline.log
    └── ... (20+ data files)
```

## 🎛️ Dashboard Features

### **7-Row Layout (Grafana War Room Standard)**

#### **Row 1: Exec/SLO (Business View)**
- Queue Wait P50/P90/P99 with SLO threshold (≤10min)
- GPU Allocated vs Busy percentages
- SLA Penalty Exposure ($/hour)
- Top-10 Whale Customer status

#### **Row 2: GPU/Compute Domain**
- DCGM GPU Utilization breakdown (SM/Memory/Copy)
- NCCL All-Reduce Latency heatmap
- Real-time NCCL WARN/ERROR log stream

#### **Row 3: Network Fabric (RoCEv2/EVPN)**
- ECN Mark Rate per traffic class
- PFC Pause counters (Rx/Tx per priority)
- Per-link utilization hotspot detection
- EVPN failover events table

#### **Row 4: Storage (VAST NVMe-oF)**
- NVMe-oF Latency P50/P90/P99
- Queue depth per frontend
- Cache hit rates and prefetch statistics
- FE CPU/RAM/NIC utilization
- IO mix (Sequential vs Random)
- Transport errors and timeouts

#### **Row 5: Change & Event Timeline**
- Annotated change management timeline
- NOC event overlay (alarms, SNMP traps)

#### **Row 6: Job Scheduler/Platform**
- Queue backlog growth rate
- Tenant allocation (Fair-share vs Whale)
- Job retry and failure rates

#### **Row 7: Cross-Domain Correlation**
- Composite timeline showing incident cascade
- ECN↑ → NVMe-oF P99↑ → GPU Util↓ → Queue Wait↑

## 🔧 Troubleshooting

### **Port Already in Use Error**
```bash
OSError: [Errno 48] Address already in use
```

**Solutions:**
1. **Kill existing server:**
   ```bash
   # Find the process using port 8080
   lsof -ti:8080 | xargs kill -9
   
   # Then restart
   python3 serve-dashboard.py
   ```

2. **Use a different port:**
   ```bash
   # Edit serve-dashboard.py and change PORT = 8080 to PORT = 8081
   # Then access: http://localhost:8081/sev1-warroom-dashboard.html
   ```

### **Browser Shows "Loading..." Charts**
- Ensure the HTTP server is running
- Check browser console (F12) for JavaScript errors
- Verify CSV files exist in `superpod_sev1_fake_telemetry/` directory

### **Charts Not Updating**
- Refresh the page (F5)
- Clear browser cache (Ctrl+Shift+R)
- Check that all CSV files are properly formatted

## 📊 Incident Timeline

The dashboard simulates this incident progression:

| Time | Event | Impact |
|------|-------|--------|
| **16:26 (Day -1)** | Fabric A: 2 spines replaced | Baseline established |
| **06:26** | VAST FE rollout: Aggressive prefetch ENABLED | Normal operations |
| **08:26** | 🚨 **INCIDENT START** | Metrics begin degrading |
| **08:27-09:40** | Cascade effect across all domains | SLO breaches, customer impact |
| **09:41** | Rollback: VAST FE prefetch DISABLED | Recovery begins |

## 🎨 Customization

### **Modify Data**
Edit CSV files in `superpod_sev1_fake_telemetry/` to change metrics:
- `queue_wait_quantiles.csv` - Job queue times
- `gpu_utilization.csv` - GPU busy/allocated percentages
- `network_ecn_rate.csv` - Network congestion
- `vast_nvmeof_latency_quantiles.csv` - Storage latency

### **Update Styling**
Modify `sev1-warroom-dashboard.html` CSS for:
- Color schemes
- Panel layouts
- Typography
- Responsive breakpoints

### **Add New Charts**
Extend `dashboard-data-loader.js` to:
- Parse additional CSV files
- Create new Chart.js visualizations
- Add custom data transformations

## 🏗️ Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js with time-series support
- **Data Format**: CSV files with timestamp-based metrics
- **Server**: Python built-in HTTP server with CORS support
- **Styling**: Custom CSS mimicking Grafana's dark theme
- **Responsive**: Mobile-friendly grid layout

## 📝 License

This is a demonstration/mockup project for educational and presentation purposes.

---

**🚨 SEV-1 Status**: ACTIVE | **Duration**: 2h 14m | **Impact**: EMEA Pod-2 | **SLO**: BREACHED
