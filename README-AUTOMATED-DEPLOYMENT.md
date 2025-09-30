# 🚀 Automated Deployment Guide

## **One-Command Operations**

All scripts now handle building automatically - no manual `npm run build` required!

### **🔄 Update and Restart (Recommended)**
```bash
./update-and-restart.sh
```
**What it does:**
- Pulls latest changes from git
- Detects if React rebuild is needed
- Stops services cleanly
- Starts services (auto-builds if needed)
- Shows final status

### **🚀 Simple Start (Auto-Build)**
```bash
./start-simple.sh
```
**What it does:**
- Checks if React build exists or is outdated
- Automatically runs `npm install` if needed
- Automatically runs `npm run build` if needed
- Starts API server on port 7779
- Starts static server on port 3025

### **🛡️ Secure Start (Auto-Build)**
```bash
./secure-dashboard start
```
**What it does:**
- Same auto-build logic as simple start
- Uses Nginx instead of Python HTTP server
- Requires sudo for Nginx configuration

## **🔍 Build Detection Logic**

Scripts automatically rebuild when:
- `build/` directory doesn't exist
- Source files in `src/` are newer than `build/`
- `package.json` is newer than `build/`
- Dependencies in `node_modules/` are missing

## **📋 Available Commands**

| Command | Purpose | Auto-Build | Sudo Required |
|---------|---------|------------|---------------|
| `./update-and-restart.sh` | Complete update cycle | ✅ | No |
| `./start-simple.sh` | Start with Python HTTP server | ✅ | No |
| `./stop-simple.sh` | Stop simple services | ❌ | No |
| `./secure-dashboard start` | Start with Nginx | ✅ | Yes |
| `./secure-dashboard stop` | Stop secure services | ❌ | Yes |
| `./deploy-secure.sh` | Initial deployment setup | ✅ | No |

## **🎯 Recommended Workflow**

### **First Time Setup:**
```bash
git clone <repository>
cd nullsector-sev1-mockup
./deploy-secure.sh
```

### **Regular Updates:**
```bash
./update-and-restart.sh
```

### **Manual Start/Stop:**
```bash
./start-simple.sh    # Start
./stop-simple.sh     # Stop
```

## **✅ What's Automated**

- **Git Updates**: Automatic pull from main branch
- **Dependency Installation**: `npm install` when needed
- **React Building**: `npm run build` when source changes
- **Service Management**: Start/stop API and web servers
- **Build Optimization**: Source maps disabled for security
- **Environment Setup**: Virtual environment activation
- **Port Management**: Automatic port conflict resolution

## **🔧 Build Process Details**

When auto-build triggers:
1. **Check Dependencies**: Install `node_modules` if missing
2. **Security Build**: `GENERATE_SOURCEMAP=false npm run build`
3. **Validation**: Verify build completed successfully
4. **Service Start**: Launch API and web servers
5. **Status Report**: Show access URLs and credentials

## **🚨 Troubleshooting**

### **Build Fails:**
```bash
cd nullsector-dashboard
npm install --force
npm run build
cd ..
./start-simple.sh
```

### **Port Conflicts:**
```bash
./kill-port-7778.sh  # Clear old processes
./start-simple.sh    # Uses port 7779
```

### **Permission Issues:**
```bash
chmod +x *.sh        # Make scripts executable
```

## **🎉 Zero-Manual-Steps Deployment**

With these automated scripts, you never need to:
- Remember to run `npm run build`
- Manually install dependencies
- Check if builds are outdated
- Handle port conflicts manually
- Remember complex startup sequences

**Just run `./update-and-restart.sh` and everything is handled automatically!**
