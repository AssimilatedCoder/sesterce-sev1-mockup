# 🚀 NullSector React Dashboard

A modern, React-based dashboard combining the SEV-1 War Room Grafana mockup with an advanced GPU cost calculator, built with the NullSector design system.

## ✨ Features

### 📊 **Tab 1: SEV-1 War Room Dashboard**
- **Real-time incident monitoring** for NVIDIA SuperPod infrastructure
- **Multi-domain visibility**: GPU/Compute, Network Fabric, Storage, Platform
- **Synthetic telemetry data** from EMEA Pod-2 incident simulation
- **Grafana-style interface** with dark theme and authentic styling
- **Interactive charts** powered by Chart.js with time-series data

### 💰 **Tab 2: Advanced GPU Cost Calculator**
- **Comprehensive TCO modeling** for large-scale AI infrastructure
- **Multiple GPU models**: GB200, GB300, H100 with real pricing
- **Infrastructure scaling**: Power, cooling, networking, storage
- **Regional cost variations** with electricity rates
- **CAPEX/OPEX breakdown** with detailed component analysis
- **Modern NullSector UI** with Tailwind CSS styling

## 🎨 Design System

Built with the **NullSector Design System** featuring:
- **Brand colors**: Professional blue gradient palette
- **GPU-themed accents**: NVIDIA green, performance orange, purple
- **Dark mode support** with sophisticated color schemes
- **Modern typography**: Inter font family with JetBrains Mono
- **Responsive design** optimized for all screen sizes
- **Smooth animations** and micro-interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- nginx web server

### Installation & Setup

1. **Clone and setup:**
   ```bash
   git clone <repository>
   cd "Grafana NullSector"
   ```

2. **Install dependencies:**
   ```bash
   cd NullSector-dashboard
   npm install
   ```

3. **Build and deploy:**
   ```bash
   # Automated setup
   ./setup-react-dashboard.sh
   
   # Or manual setup
   npm run build
   ./react-dashboard start
   ```

4. **Access the dashboard:**
   - **Local**: http://localhost:7777
   - **Network**: http://YOUR_IP:7777

## 🎛️ Management Commands

### Dashboard Control Script
```bash
./react-dashboard start      # Start the dashboard
./react-dashboard stop       # Stop the dashboard  
./react-dashboard restart    # Restart the dashboard
./react-dashboard status     # Check status
./react-dashboard build      # Build React app
./react-dashboard test       # Test accessibility
./react-dashboard logs       # View nginx logs
```

### Development Mode
```bash
cd NullSector-dashboard
npm start                    # Development server on :3000
npm run build               # Production build
npm test                    # Run tests
```

## 📁 Project Structure

```
Grafana NullSector/
├── NullSector-dashboard/                 # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/                # Layout components
│   │   │   │   ├── Container.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── ...
│   │   │   └── features/              # Feature components
│   │   │       ├── GrafanaDashboard.tsx
│   │   │       ├── GPUCostCalculator.tsx
│   │   │       └── TabNavigation.tsx
│   │   ├── App.tsx                    # Main app component
│   │   └── index.css                  # Tailwind CSS imports
│   ├── public/
│   │   ├── superpod_sev1_fake_telemetry/  # Synthetic data
│   │   └── dashboard-data-loader.js       # Chart data loader
│   ├── build/                         # Production build
│   ├── tailwind.config.js            # Tailwind configuration
│   └── package.json
├── nginx-NullSector-dashboard.conf      # nginx configuration
├── setup-react-dashboard.sh          # Automated setup script
├── react-dashboard                    # Management script
└── README-REACT.md                   # This file
```

## 🔧 Technical Details

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS 3** for styling
- **Chart.js 4** for data visualization
- **Lucide React** for icons
- **Create React App** for build tooling

### Data Integration
- **CSV parsing** for synthetic telemetry data
- **Real-time updates** with Chart.js animations
- **CORS-enabled** API endpoints for data access
- **Fallback data generation** for missing files

### Infrastructure
- **nginx** for production serving
- **Static file optimization** with gzip compression
- **SPA routing** with fallback to index.html
- **Asset caching** with appropriate headers

## 🌐 Deployment Options

### Local Development
```bash
cd NullSector-dashboard
npm start                    # http://localhost:3000
```

### Production (nginx)
```bash
./react-dashboard start      # http://localhost:7777
```

### Custom Port
Edit `nginx-NullSector-dashboard.conf` and change the `listen` directive:
```nginx
listen 8080;                 # Custom port
```

## 🔍 Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
cd NullSector-dashboard
rm -rf node_modules package-lock.json
npm install
npm run build
```

### nginx Issues
```bash
# Check nginx status
sudo nginx -t                # Test configuration
./react-dashboard logs       # View error logs
./react-dashboard test       # Test endpoints
```

### Port Conflicts
```bash
# Kill processes on port 7777
sudo lsof -ti:7777 | xargs sudo kill -9

# Or use different port in nginx config
```

### Data Loading Issues
- Ensure `superpod_sev1_fake_telemetry/` directory exists in `public/`
- Check browser console for CORS errors
- Verify `dashboard-data-loader.js` is accessible

## 🎯 Key Features Comparison

| Feature | Original HTML | React Dashboard |
|---------|---------------|-----------------|
| **UI Framework** | Vanilla HTML/CSS | React + Tailwind CSS |
| **Design System** | Custom CSS | NullSector Design System |
| **Responsiveness** | Basic | Fully responsive |
| **Component Reuse** | None | Modular components |
| **State Management** | DOM manipulation | React state |
| **Build Process** | None | Optimized production build |
| **Development** | Static files | Hot reload + dev tools |
| **Maintainability** | Low | High |

## 🚀 Future Enhancements

- **Real-time data streaming** with WebSocket integration
- **User authentication** and role-based access
- **Dashboard customization** with drag-and-drop panels
- **Export functionality** for reports and data
- **Mobile app** with React Native
- **API integration** with actual monitoring systems

## 📄 License

This project is part of the NullSector GPU cloud infrastructure mockup and is intended for demonstration purposes.

---

**Built with ❤️ using React, Tailwind CSS, and the NullSector Design System**
