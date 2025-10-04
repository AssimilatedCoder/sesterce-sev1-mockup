# NullSector Project Structure

This document describes the organized directory structure of the NullSector GPU SuperCluster Calculator project.

## 📁 Directory Overview

```
nullsector-tools/
├── 📁 backend/                    # Backend services and APIs
├── 📁 frontend/                   # Frontend applications
├── 📁 config/                     # Configuration files
├── 📁 scripts/                    # Automation and management scripts
├── 📁 docs/                       # Project documentation
├── 📁 tools/                      # Utilities and helper tools
├── 📁 assets/                     # Static assets and documents
├── 📁 logs/                       # Application logs
├── 📁 data/                       # Persistent data storage
├── manage.sh                      # Project management wrapper
├── docker-compose.yml             # Symlink to config/docker/docker-compose.yml
└── README.md                      # Main project documentation
```

## 📂 Detailed Structure

### Backend (`backend/`)
Contains all server-side code and configurations.

```
backend/
├── api/
│   ├── calculator-api.py          # Main Flask API server
│   ├── server.py                  # Alternative server implementation
│   └── serve-dashboard.py         # Dashboard serving utility
├── database/
│   └── user_database.py           # User database management
└── requirements.txt               # Python dependencies
```

### Frontend (`frontend/`)
Contains all client-side applications and assets.

```
frontend/
├── nullsector-dashboard/          # Main React dashboard application
│   ├── src/                       # React source code
│   ├── public/                    # Static assets
│   ├── package.json               # Node.js dependencies
│   └── README.md                  # Frontend documentation
├── dashboard-data-loader.js       # Data loading utilities
└── [symlinks to legacy dashboards]
```

### Configuration (`config/`)
Contains all configuration files organized by service.

```
config/
├── docker/
│   ├── docker-compose.yml         # Main Docker Compose configuration
│   ├── docker-compose.versioned.yml # Versioned deployment config
│   ├── Dockerfile.api             # API container definition
│   ├── Dockerfile.frontend        # Frontend container definition
│   └── Dockerfile.nginx           # Nginx container definition
└── nginx/
    ├── nginx-production.conf      # Production Nginx config
    ├── nginx-production-ssl.conf  # SSL-enabled production config
    ├── nginx-nullsector-dashboard.conf # Dashboard-specific config
    └── [other nginx configurations]
```

### Scripts (`scripts/`)
Organized automation scripts by category.

```
scripts/
├── deployment/
│   ├── deploy-docker.sh           # Main Docker deployment
│   ├── deploy-secure.sh           # Secure HTTPS deployment
│   ├── build-and-tag.sh           # Build and version tagging
│   ├── deploy.sh                  # Generic deployment script
│   └── rollback.sh                # Rollback deployment
├── management/
│   ├── project-manager.sh         # Central project management
│   ├── docker-manage.sh           # Docker container management
│   ├── nginx-management.sh        # Nginx service management
│   ├── update-and-restart.sh      # System update utility
│   ├── create-missing-logs.sh     # Log file management
│   └── [service control scripts]
├── setup/
│   ├── setup-react-dashboard.sh   # React development setup
│   ├── setup-nginx.sh             # Nginx configuration setup
│   ├── setup-github.sh            # GitHub integration setup
│   ├── fix-npm-installation.sh    # NPM troubleshooting
│   └── force-rebuild.sh           # Force rebuild utility
├── testing/
│   ├── test-user-persistence.py   # User database testing
│   ├── verify-user-persistence.sh # Persistence verification
│   ├── test-deployment.sh         # Deployment testing
│   ├── test-https-deployment.sh   # HTTPS deployment testing
│   ├── calculator-verification.md # Calculator testing guide
│   └── [test files and verification]
└── troubleshooting/
    ├── debug-frontend-blackscreen.sh # Frontend debugging
    ├── troubleshoot-remote.sh      # Remote server troubleshooting
    ├── check-status.sh             # System status checking
    ├── ubuntu-troubleshoot.sh      # Ubuntu-specific troubleshooting
    └── [debugging utilities]
```

### Documentation (`docs/`)
Comprehensive project documentation organized by topic.

```
docs/
├── api/                           # API documentation
├── architecture/
│   ├── GPU-Calculator-Process-Flow.md
│   ├── DUAL-MODE-ARCHITECTURE-IMPLEMENTATION.md
│   ├── STORAGE-REDESIGN-DOCUMENTATION.md
│   ├── VERSION-CONTROL-IMPLEMENTATION.md
│   └── [architecture documents]
├── deployment/
│   ├── DEPLOYMENT.md              # Main deployment guide
│   ├── DEPLOYMENT-STRATEGY.md     # Deployment strategy
│   ├── CLOUDFLARE-HTTPS-SETUP.md # HTTPS setup guide
│   └── README-DOCKER.md           # Docker-specific guide
├── security/
│   ├── SECURITY-GUIDE.md          # Security implementation guide
│   ├── SECURITY-ANALYSIS.md       # Security analysis
│   └── SECURITY-IMPLEMENTATION.md # Implementation details
├── troubleshooting/
│   └── BROWSER-DEBUG-GUIDE.md     # Browser debugging guide
├── README-AUTOMATED-DEPLOYMENT.md
├── README-REACT.md
├── README-SAFE-INSTALLATION.md
└── README-SECURE.md
```

### Tools (`tools/`)
Utility tools and helper scripts.

```
tools/
├── verification/
│   └── USER-CREDENTIALS.md        # User credential documentation
├── monitoring/                    # Monitoring utilities (future)
└── patches/
    └── fix-infinite-loop.patch    # Code patches
```

## 🚀 Usage Patterns

### Quick Commands
```bash
# Use the project manager for all operations
./manage.sh deploy                 # Deploy the application
./manage.sh status                 # Check service status
./manage.sh logs                   # View logs
./manage.sh test                   # Run tests
./manage.sh help                   # Show all commands
```

### Direct Script Access
```bash
# Deployment
./scripts/deployment/deploy-docker.sh

# Testing
./scripts/testing/verify-user-persistence.sh

# Troubleshooting
./scripts/troubleshooting/check-status.sh
```

## 🔄 Migration from Old Structure

The reorganization maintains backward compatibility through:

1. **Symlinks**: Key files have symlinks in the root directory
2. **Path Updates**: All scripts updated to use new paths
3. **Wrapper Scripts**: The `manage.sh` script provides unified access
4. **Documentation**: Clear migration path documented

## 📋 Benefits of New Structure

1. **Organization**: Clear separation of concerns
2. **Scalability**: Easy to add new components
3. **Maintenance**: Easier to find and update files
4. **Professional**: Industry-standard project layout
5. **Documentation**: Better organized documentation
6. **Automation**: Centralized management through `manage.sh`

## 🔧 Customization

To add new components:

1. **Scripts**: Add to appropriate `scripts/` subdirectory
2. **Documentation**: Add to relevant `docs/` subdirectory
3. **Configuration**: Add to `config/` with service-specific folders
4. **Tools**: Add utilities to `tools/` subdirectories

## 📚 Related Documentation

- [Main README](../README.md) - Project overview
- [Deployment Guide](deployment/DEPLOYMENT.md) - Deployment instructions
- [Security Guide](security/SECURITY-GUIDE.md) - Security implementation
- [API Documentation](api/) - API reference
