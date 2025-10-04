# NullSector Tools - Container Deployment & Version Control Strategy

## Overview

This document outlines the comprehensive container deployment strategy for NullSector Tools, including version management, rollback capabilities, and production deployment best practices.

## Current Architecture

### Container Structure
```
nullsector-tools/
├── nullsector-dashboard/     # React frontend
├── calculator-api.py         # Flask backend API
├── docker-compose.yml        # Multi-service orchestration
├── Dockerfile.nginx         # Nginx reverse proxy
├── nginx-production-ssl.conf # Production SSL configuration
└── deployment/              # Deployment scripts and configs
```

### Service Components
- **Frontend**: React app served via Nginx
- **Backend**: Flask API with Python calculations
- **Reverse Proxy**: Nginx with SSL termination (Cloudflare)
- **Database**: File-based user management (upgradeable to PostgreSQL)

## Version Control Strategy

### 1. Container Registry Approach (Recommended)

**Advantages:**
- ✅ Immutable deployments
- ✅ Fast rollbacks (image pull only)
- ✅ Version history preserved indefinitely
- ✅ Supports multiple environments
- ✅ Industry standard approach
- ✅ Integrates with CI/CD pipelines

**Implementation:**
```bash
# Build and tag images
docker build -t nullsector/dashboard:1.9.5 ./nullsector-dashboard
docker build -t nullsector/api:1.9.5 ./
docker build -t nullsector/nginx:1.9.5 -f Dockerfile.nginx ./

# Push to registry
docker push nullsector/dashboard:1.9.5
docker push nullsector/api:1.9.5
docker push nullsector/nginx:1.9.5

# Tag as latest for current version
docker tag nullsector/dashboard:1.9.5 nullsector/dashboard:latest
```

**Docker Compose for Versioned Deployment:**
```yaml
version: '3.8'
services:
  frontend:
    image: nullsector/dashboard:${VERSION:-latest}
    restart: unless-stopped
    
  api:
    image: nullsector/api:${VERSION:-latest}
    restart: unless-stopped
    
  nginx:
    image: nullsector/nginx:${VERSION:-latest}
    ports:
      - "2053:2053"
    restart: unless-stopped
```

### 2. Container Snapshots Approach (Alternative)

**Advantages:**
- ✅ Local storage control
- ✅ No external dependencies
- ✅ Faster for small deployments

**Disadvantages:**
- ❌ Limited storage capacity
- ❌ No distributed deployment support
- ❌ Manual cleanup required
- ❌ Single point of failure

## Recommended Implementation

### Phase 1: Container Registry Setup

1. **Registry Selection Options:**
   - **Docker Hub** (Public/Private repos)
   - **GitHub Container Registry** (Integrated with source)
   - **AWS ECR** (Enterprise grade)
   - **Self-hosted Harbor** (Full control)

2. **Tagging Strategy:**
   ```
   nullsector/dashboard:1.9.5          # Specific version
   nullsector/dashboard:1.9            # Minor version
   nullsector/dashboard:1              # Major version
   nullsector/dashboard:latest         # Current production
   nullsector/dashboard:staging        # Staging environment
   ```

### Phase 2: Automated Build Pipeline

```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy
on:
  push:
    tags: ['v*']
    
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Extract version
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
        
      - name: Build images
        run: |
          docker build -t nullsector/dashboard:${{ steps.version.outputs.VERSION }} ./nullsector-dashboard
          docker build -t nullsector/api:${{ steps.version.outputs.VERSION }} ./
          docker build -t nullsector/nginx:${{ steps.version.outputs.VERSION }} -f Dockerfile.nginx ./
          
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push nullsector/dashboard:${{ steps.version.outputs.VERSION }}
          docker push nullsector/api:${{ steps.version.outputs.VERSION }}
          docker push nullsector/nginx:${{ steps.version.outputs.VERSION }}
```

### Phase 3: Deployment Scripts

**Production Deployment Script:**
```bash
#!/bin/bash
# deploy.sh

VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

echo "Deploying NullSector Tools version: $VERSION"

# Pull latest images
docker-compose pull

# Stop services gracefully
docker-compose down --timeout 30

# Start with new version
VERSION=$VERSION docker-compose up -d

# Health check
sleep 10
if curl -f http://localhost:2053/health; then
    echo "✅ Deployment successful"
    
    # Tag as current if deploying latest
    if [ "$VERSION" != "latest" ]; then
        docker tag nullsector/dashboard:$VERSION nullsector/dashboard:current
        docker tag nullsector/api:$VERSION nullsector/api:current
        docker tag nullsector/nginx:$VERSION nullsector/nginx:current
    fi
else
    echo "❌ Deployment failed - rolling back"
    ./rollback.sh
    exit 1
fi
```

**Rollback Script:**
```bash
#!/bin/bash
# rollback.sh

TARGET_VERSION=${1:-current}

echo "Rolling back to version: $TARGET_VERSION"

# Stop current services
docker-compose down --timeout 30

# Deploy target version
VERSION=$TARGET_VERSION docker-compose up -d

# Verify rollback
sleep 10
if curl -f http://localhost:2053/health; then
    echo "✅ Rollback successful"
else
    echo "❌ Rollback failed - manual intervention required"
    exit 1
fi
```

### Phase 4: Version Management API

**Backend API Extensions:**
```python
# Add to calculator-api.py

@app.route('/api/version/current', methods=['GET'])
def get_current_version():
    return jsonify({
        'version': '1.9.5',
        'buildDate': '2025-10-03T12:00:00Z',
        'buildNumber': 195,
        'gitCommit': os.environ.get('GIT_COMMIT', 'unknown'),
        'environment': os.environ.get('ENVIRONMENT', 'production')
    })

@app.route('/api/version/history', methods=['GET'])
def get_version_history():
    # In production, this would query a database or registry API
    return jsonify(VERSION_HISTORY)

@app.route('/api/deploy/rollback', methods=['POST'])
@admin_required
def rollback_version():
    target_version = request.json.get('version')
    
    if not target_version:
        return jsonify({'error': 'Version required'}), 400
    
    # Trigger rollback script
    try:
        subprocess.run(['./rollback.sh', target_version], check=True)
        return jsonify({'status': 'success', 'message': f'Rolled back to {target_version}'})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'Rollback failed: {str(e)}'}), 500
```

## Production Deployment Checklist

### Pre-Deployment
- [ ] Version number updated in `src/config/version.ts`
- [ ] Release notes documented
- [ ] Breaking changes identified
- [ ] Database migrations prepared (if applicable)
- [ ] Environment variables updated

### Build Process
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Images built and tagged
- [ ] Images pushed to registry
- [ ] Deployment scripts updated

### Deployment
- [ ] Maintenance window scheduled (if required)
- [ ] Current version backed up
- [ ] New version deployed
- [ ] Health checks passing
- [ ] Rollback plan confirmed

### Post-Deployment
- [ ] Application functionality verified
- [ ] Performance metrics normal
- [ ] Error rates within acceptable limits
- [ ] User access confirmed
- [ ] Version management UI updated

## Monitoring & Alerting

### Health Checks
```yaml
# docker-compose.yml health checks
services:
  frontend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7779/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Deployment Monitoring
- Application startup time
- Memory usage post-deployment
- Response time metrics
- Error rate monitoring
- User session continuity

## Security Considerations

### Image Security
- Base images regularly updated
- Vulnerability scanning in CI/CD
- Secrets management (not in images)
- Non-root user execution
- Minimal image size (multi-stage builds)

### Deployment Security
- Registry access controls
- Deployment authentication
- Network segmentation
- SSL/TLS encryption
- Audit logging

## Disaster Recovery

### Backup Strategy
- Database backups (if applicable)
- Configuration backups
- Image registry backups
- User data backups

### Recovery Procedures
1. **Service Failure**: Automatic restart via Docker
2. **Version Issues**: Automated rollback
3. **Data Corruption**: Restore from backup
4. **Infrastructure Failure**: Multi-region deployment

## Cost Optimization

### Registry Management
- Automated cleanup of old images
- Lifecycle policies for image retention
- Compression and deduplication
- Regional registry selection

### Resource Optimization
- Right-sizing containers
- Resource limits and requests
- Horizontal pod autoscaling
- Efficient base images

## Future Enhancements

### Kubernetes Migration
- Helm charts for deployment
- Rolling updates with zero downtime
- Horizontal pod autoscaling
- Service mesh integration

### Advanced Deployment Patterns
- Blue-green deployments
- Canary releases
- Feature flags
- A/B testing infrastructure

### Observability
- Distributed tracing
- Centralized logging
- Metrics and alerting
- Performance monitoring

## Conclusion

The container registry approach provides the most robust and scalable solution for version management and rollback capabilities. This strategy ensures:

1. **Reliability**: Immutable deployments with predictable rollbacks
2. **Scalability**: Support for multiple environments and regions
3. **Maintainability**: Clear version history and automated processes
4. **Security**: Controlled access and audit trails
5. **Performance**: Fast deployments and rollbacks

The implementation can start simple with Docker Hub and evolve to enterprise-grade solutions as requirements grow.
