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
# Background mode (recommended)
python3 server.py --background
# OR use the control script
./dashboard start

# Foreground mode (interactive)
python3 server.py --foreground

# Access at: http://YOUR_IP:7777
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

# 3. Start production server (background mode)
python3 server.py --background
# OR use control script: ./dashboard start

# 4. Open firewall (if needed)
sudo ufw allow 7777/tcp

# 5. Check status anytime
python3 server.py --status
# OR: ./dashboard status
```

**Share this URL:** `http://YOUR_UBUNTU_IP:7777`

📋 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Ubuntu setup guide**

## 📁 Project Structure

```
Grafana Sesterce/
├── sev1-warroom-dashboard.html    # Main dashboard HTML
├── dashboard-data-loader.js       # Data parsing and chart logic
├── serve-dashboard.py            # Local development server
├── server.py                     # Production server (smart)
├── dashboard                     # Control script
├── DEPLOYMENT.md                 # Ubuntu deployment guide
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

## 🎛️ Server Management

### Control Script (Recommended)
```bash
./dashboard start      # Start in background
./dashboard stop       # Stop server
./dashboard restart    # Restart server
./dashboard status     # Check status
./dashboard foreground # Start interactively
./dashboard cleanup    # Force cleanup port 7777
```

### Direct Python Commands
```bash
python3 server.py --background    # Start in background
python3 server.py --foreground    # Start in foreground
python3 server.py --status        # Check status
python3 server.py --stop          # Stop server
python3 server.py --force-cleanup # Force cleanup port 7777
```

### Smart Features
- **Auto-kill**: Automatically kills existing servers on port 7777
- **Background mode**: Runs as daemon, survives terminal close
- **PID tracking**: Tracks server process for clean management
- **Status checking**: Real-time server status and URL display
- **Force cleanup**: Aggressive port cleanup for stubborn processes
- **Retry logic**: Multiple attempts with escalating force levels

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
OSError: [Errno 98] Address already in use
❌ Error: Port 7777 is still in use after cleanup attempt
```

**Solutions (in order of preference):**

1. **Use built-in cleanup (Recommended):**
   ```bash
   # Force cleanup with control script
   ./dashboard cleanup
   
   # Or with Python directly
   python3 server.py --force-cleanup
   
   # Then start normally
   ./dashboard start
   ```

2. **Manual cleanup:**
   ```bash
   # Find and kill processes on port 7777
   sudo lsof -ti:7777 | xargs sudo kill -9
   
   # Then start server
   python3 server.py --background
   ```

3. **Wait it out:**
   ```bash
   # Sometimes processes take time to fully release ports
   # Wait 2-3 minutes, then try again
   python3 server.py --background
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
