# 🐳 NullSector Docker Deployment Guide

This document describes the Docker-based deployment of the NullSector GPU SuperCluster Calculator, which replaces the previous manual deployment process with containerized services.

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 2GB+ disk space

### Deploy with Docker (Recommended)

```bash
# One-command deployment
./deploy-docker.sh

# Or manually:
docker-compose up -d

# Check status
./docker-manage.sh status

# Access the application
open http://localhost:2053
```

## 🏗️ Architecture

The application now runs as **4 containerized services**:

### Services Overview

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **API Backend** | `nullsector-api` | 7779 | Flask API with JWT auth |
| **Frontend** | `nullsector-frontend` | 80 | React app (Nginx) |
| **Dashboard** | `nullsector-dashboard` | 7777 | Static SEV-1 dashboard |
| **Nginx Proxy** | `nullsector-nginx` | **2053** | Reverse proxy & load balancer |

### Network Architecture
```
Internet → Nginx (2053) → Frontend/API/Dashboard (internal network)
```

## 🔧 Management Commands

### Using the Management Script
```bash
./docker-manage.sh start    # Start all services
./docker-manage.sh stop     # Stop all services
./docker-manage.sh restart  # Restart all services
./docker-manage.sh build    # Rebuild images
./docker-manage.sh logs     # View logs
./docker-manage.sh status   # Check health
./docker-manage.sh clean    # Remove everything
```

### Direct Docker Compose
```bash
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # Follow logs
docker-compose ps             # Show status
docker-compose build          # Rebuild images
```

## 🔒 Security Features

### Container Security
- **Non-root execution**: All containers run as `appuser`
- **Minimal base images**: Ubuntu 22.04 LTS only
- **Health checks**: Automatic service monitoring
- **Resource limits**: Prevents resource exhaustion

### Application Security
- **JWT authentication**: Secure API access
- **Rate limiting**: DDoS protection
- **CORS headers**: Cross-origin request control
- **Security headers**: XSS, CSRF protection

## 📊 Monitoring & Health Checks

### Health Endpoints
- **API Health**: `http://localhost:7779/api/health`
- **Frontend Health**: `http://localhost:8080/health`
- **Nginx Health**: `http://localhost:80/health`

### Container Health
```bash
# Check all services
docker-compose ps

# View specific service logs
docker-compose logs api
docker-compose logs frontend

# Check resource usage
docker stats
```

## 🚨 Troubleshooting

### Common Issues

**Port 2053 already in use:**
```bash
# Find and kill process using port 2053
sudo lsof -ti:2053 | xargs sudo kill -9

# Or change port in docker-compose.yml
```

**Container fails to start:**
```bash
# Check logs for specific service
docker-compose logs <service-name>

# Rebuild if needed
docker-compose build --no-cache <service-name>
```

**Permission denied:**
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

### Logs Location
- Container logs: `docker-compose logs`
- Application logs: `./logs/` (mounted volume)
- Access logs: `./login_access.log`, `./user_activity.log`

## 🔄 Migration from Legacy Deployment

### Automatic Migration
The `deploy-secure.sh` script now **automatically detects Docker** and uses the Docker deployment method when available.

### Manual Migration Steps
1. **Install Docker**: Follow [Docker installation guide](https://docs.docker.com/get-docker/)
2. **Run Docker deployment**: `./deploy-docker.sh`
3. **Update bookmarks**: Change from `http://localhost:3025` to `http://localhost:2053`

### Legacy Support
The legacy deployment method is still available if Docker is not installed, but **Docker is strongly recommended**.

## 🛠️ Development

### Local Development Setup
```bash
# Start services in development mode
docker-compose -f docker-compose.dev.yml up

# Or modify existing compose file for development
# Add volume mounts for source code
```

### Building Custom Images
```bash
# Build specific service
docker-compose build api

# Build with no cache
docker-compose build --no-cache

# Tag and push custom images
docker tag nullsector-api:latest myregistry/nullsector-api:v1.0
docker push myregistry/nullsector-api:v1.0
```

## 📈 Scaling & Production

### Production Deployment
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# With environment variables
DOCKER_ENV=production docker-compose up -d
```

### Scaling Services
```bash
# Scale API service to 3 instances
docker-compose up -d --scale api=3

# Scale frontend to 2 instances
docker-compose up -d --scale frontend=2
```

### SSL/TLS Setup
```bash
# Add SSL certificates to nginx container
docker run -v /path/to/certs:/etc/ssl/certs nginx:alpine

# Or modify docker-compose.yml to mount certificates
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```bash
# API Configuration
CALCULATOR_API_SECRET=your-secret-here
JWT_SECRET=your-jwt-secret-here
FLASK_ENV=production

# Optional: Database (future use)
# DATABASE_URL=postgresql://user:pass@db:5432/nullsector
```

### Custom Ports
Edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:80"  # Change 2053 to your preferred port
```

## 📝 Changelog

### v2.0.0 - Docker Migration
- ✅ **Complete containerization** with Ubuntu 22.04 LTS base
- ✅ **Multi-service architecture** (API, Frontend, Dashboard, Nginx)
- ✅ **Port change**: 3025 → 2053
- ✅ **Health checks** and monitoring
- ✅ **Security hardening** with non-root containers
- ✅ **Simplified deployment** (single command)
- ✅ **Legacy compatibility** maintained

---

## 🎯 Key Benefits

| Before (Legacy) | After (Docker) |
|------------------|----------------|
| Manual dependency management | Automatic with containers |
| Complex multi-step deployment | Single command: `docker-compose up` |
| Port conflicts & cleanup | Isolated networking |
| Inconsistent environments | Guaranteed consistency |
| Difficult scaling | Easy horizontal scaling |
| Manual security updates | Automated base image updates |

**Result**: From 10+ manual steps to 1 command deployment! 🎉
