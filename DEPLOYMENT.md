# Ubuntu Deployment Guide

## 🚀 Quick Ubuntu Setup

### 1. Clone from GitHub
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/grafana-sev1-dashboard.git
cd grafana-sev1-dashboard

# Or if you're uploading for the first time:
# git init
# git add .
# git commit -m "Initial commit: SEV-1 Dashboard"
# git branch -M main
# git remote add origin https://github.com/YOUR_USERNAME/grafana-sev1-dashboard.git
# git push -u origin main
```

### 2. Start the Server
```bash
# Make sure Python 3 is installed
python3 --version

# Start the production server
python3 server.py
```

### 3. Access Remotely
The server will display URLs like:
```
🌐 Server running on all interfaces:
   Local:    http://localhost:7777/sev1-warroom-dashboard.html
   Network:  http://192.168.1.100:7777/sev1-warroom-dashboard.html
   External: http://YOUR_UBUNTU_IP:7777/sev1-warroom-dashboard.html
```

**Share this URL:** `http://YOUR_UBUNTU_IP:7777/sev1-warroom-dashboard.html`

## 🔧 Ubuntu Server Configuration

### Find Your Ubuntu IP Address
```bash
# Get your IP address
ip addr show | grep inet

# Or simpler:
hostname -I
```

### Open Firewall (if needed)
```bash
# Ubuntu/Debian with ufw
sudo ufw allow 7777/tcp
sudo ufw reload

# Or with iptables
sudo iptables -A INPUT -p tcp --dport 7777 -j ACCEPT
```

### Run as Background Service (Optional)
```bash
# Using nohup (simple)
nohup python3 server.py > dashboard.log 2>&1 &

# Check if running
ps aux | grep server.py

# Stop background process
pkill -f server.py
```

### Create Systemd Service (Production)
```bash
# Create service file
sudo nano /etc/systemd/system/sev1-dashboard.service
```

**Service file content:**
```ini
[Unit]
Description=SEV-1 Dashboard Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/grafana-sev1-dashboard
ExecStart=/usr/bin/python3 server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable sev1-dashboard
sudo systemctl start sev1-dashboard
sudo systemctl status sev1-dashboard
```

## 🌐 Network Access

### Local Network Access
- **Same WiFi/LAN:** `http://UBUNTU_IP:7777/sev1-warroom-dashboard.html`
- **VPN:** Works if Ubuntu is on VPN network

### Internet Access (Advanced)
For internet access, you'll need:

1. **Port forwarding** on your router (7777 → Ubuntu IP)
2. **Dynamic DNS** service (if IP changes)
3. **Reverse proxy** with SSL (recommended for production)

**Example with nginx (optional):**
```bash
# Install nginx
sudo apt update
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/sev1-dashboard
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:7777;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port 7777
sudo lsof -i :7777

# Kill process
sudo kill -9 PID_NUMBER

# Or kill all Python processes (careful!)
sudo pkill -f server.py
```

### Permission Issues
```bash
# Make script executable
chmod +x server.py

# If port < 1024, run with sudo
sudo python3 server.py
```

### Firewall Blocking
```bash
# Check firewall status
sudo ufw status

# Disable firewall temporarily (testing only)
sudo ufw disable

# Re-enable with rule
sudo ufw enable
sudo ufw allow 7777
```

### Can't Access from Other Machines
1. **Check Ubuntu IP:** `hostname -I`
2. **Test locally:** `curl http://localhost:7777`
3. **Check firewall:** `sudo ufw status`
4. **Ping Ubuntu:** `ping UBUNTU_IP` from other machine
5. **Check router settings:** Some routers block inter-device communication

## 📊 Usage Examples

### Share with Team
```
Hey team! 👋

SEV-1 Dashboard is live at:
🔗 http://192.168.1.100:7777/sev1-warroom-dashboard.html

This shows our EMEA Pod-2 incident simulation with:
- Real-time metrics degradation
- Cross-domain correlation analysis
- Complete war room view

Best,
Your Name
```

### Demo Presentation
1. **Start server:** `python3 server.py`
2. **Share URL:** `http://YOUR_IP:7777/sev1-warroom-dashboard.html`
3. **Walk through:** 7 rows of incident data
4. **Highlight:** Real-time updates and correlation

## 🔒 Security Notes

- **Internal use only:** Server has no authentication
- **Firewall:** Only open port 7777 to trusted networks
- **HTTPS:** Consider nginx + SSL for production
- **Access logs:** Check `dashboard.log` for access patterns

---

**🚨 Dashboard Status:** READY FOR DEMO | **Port:** 7777 | **Access:** Network-wide
