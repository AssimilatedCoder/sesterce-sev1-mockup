# NullSector GPU SuperCluster Calculator

A comprehensive Total Cost of Ownership (TCO) calculator for GPU SuperClusters with advanced user management, security features, and deployment automation.

## 🏗️ Project Structure

```
nullsector-tools/
├── 📁 backend/                    # Backend services
│   ├── api/                       # API server files
│   ├── database/                  # Database management
│   └── requirements.txt           # Python dependencies
├── 📁 frontend/                   # Frontend applications
│   └── nullsector-dashboard/      # React dashboard
├── 📁 config/                     # Configuration files
│   ├── docker/                    # Docker configurations
│   └── nginx/                     # Nginx configurations
├── 📁 scripts/                    # Automation scripts
│   ├── deployment/                # Deployment scripts
│   ├── management/                # System management
│   ├── setup/                     # Initial setup
│   ├── testing/                   # Testing utilities
│   └── troubleshooting/           # Debug & troubleshooting
├── 📁 docs/                       # Documentation
│   ├── api/                       # API documentation
│   ├── architecture/              # System architecture
│   ├── deployment/                # Deployment guides
│   └── security/                  # Security documentation
├── 📁 tools/                      # Utilities and tools
│   ├── verification/              # Verification tools
│   ├── monitoring/                # Monitoring utilities
│   └── patches/                   # Code patches
├── 📁 assets/                     # Static assets and documents
├── 📁 logs/                       # Application logs
└── 📁 data/                       # Persistent data storage
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ (for development)

### Production Deployment
```bash
# Deploy the entire application (recommended)
./manage.sh deploy

# Or use direct script access
./scripts/deployment/deploy-docker.sh

# Verify deployment
./manage.sh verify
```

### Development Setup
```bash
# Setup development environment
./manage.sh setup-dev

# Start development servers
cd frontend/nullsector-dashboard
npm start
```

## 🔑 Default Credentials

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| **admin** | `Vader@66` | Super Admin | Full system access |
| **David** | `Sk7walk3r!` | Admin | All features except logs |
| **Thomas** | `Th0mas@99` | Power User | Advanced features |
| **Kiko** | `K1ko#2025` | User | Basic calculator |
| **Maciej** | `Mac1ej*77` | Power User | Advanced features |

## 🛡️ Security Features

- **Persistent User Management**: SQLite database with Docker volume persistence
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin, Power User, and User roles
- **Rate Limiting**: 10 requests per minute per IP
- **Password Hashing**: SHA-256 hashed passwords
- **Container Security**: Non-root user execution
- **HTTPS Support**: Cloudflare integration ready

## 📊 Key Features

### GPU Calculator
- **Multi-GPU Support**: NVIDIA RTX 6000 Blackwell, AMD MI355X
- **TCO Analysis**: Comprehensive cost modeling
- **Power Consumption**: Real-time power calculations
- **Cooling Requirements**: Advanced thermal modeling
- **Custom Overrides**: User-configurable parameters

### User Management
- **Web Interface**: Full CRUD operations for users
- **Bulk Operations**: Import/export user data
- **Audit Logging**: Complete activity tracking
- **Password Management**: Secure password reset
- **Account Expiration**: Configurable user expiry

### Deployment & Operations
- **Docker Containerization**: Full containerized deployment
- **Health Monitoring**: Comprehensive health checks
- **Log Management**: Centralized logging system
- **Backup & Recovery**: Automated database backups
- **Rolling Updates**: Zero-downtime deployments

## 🔧 Management Commands

### Unified Management (Recommended)
```bash
# All operations through the project manager
./manage.sh deploy                 # Deploy application
./manage.sh status                 # Check service status
./manage.sh logs                   # View all logs
./manage.sh test                   # Run all tests
./manage.sh verify                 # Verify system health
./manage.sh backup-db              # Backup user database
./manage.sh clean                  # Clean temporary files
./manage.sh help                   # Show all commands
```

### Direct Script Access (Advanced)
```bash
# Deployment
./scripts/deployment/deploy-docker.sh
./scripts/deployment/deploy-secure.sh

# Testing
./scripts/testing/test-user-persistence.py
./scripts/testing/verify-user-persistence.sh

# Troubleshooting
./scripts/troubleshooting/debug-frontend-blackscreen.sh
./scripts/troubleshooting/troubleshoot-remote.sh
```

## 🌐 Access URLs

- **Production**: `http://localhost:2053`
- **API**: `http://localhost:7779` (internal)
- **Development**: `http://localhost:3000`

## 📚 Documentation

- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment/)
- [Security Guide](docs/security/)
- [Architecture Overview](docs/architecture/)

## 🔄 Data Persistence

User data is now **fully persistent** across deployments:
- SQLite database stored in Docker volume
- Automatic migration of existing users
- Backup and restore capabilities
- Zero data loss during updates

## 🤝 Contributing

1. Follow the organized directory structure
2. Update documentation for any changes
3. Test all modifications thoroughly
4. Use the provided scripts for consistency

## 📞 Support

For issues and support:
1. Check the troubleshooting scripts in `scripts/troubleshooting/`
2. Review logs in the `logs/` directory
3. Consult the documentation in `docs/`

---

**NullSector Systems** - Advanced GPU SuperCluster Solutions
