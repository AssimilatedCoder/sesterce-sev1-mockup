# Cloudflare HTTPS Setup Guide for NullSector Tools

## Overview
This guide explains how to configure Cloudflare for HTTPS encryption with your NullSector TCO Calculator and Dashboard. The setup uses Cloudflare's SSL/TLS termination while keeping your origin servers on HTTP for simplicity.

## Architecture
```
Internet → Cloudflare (SSL/TLS) → Your Server (HTTP) → Docker Containers
```

## Prerequisites
1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Domain Name**: You need a domain (e.g., `your-domain.com`)
3. **Server Access**: SSH access to your deployment server

## Step 1: DNS Configuration

### Add Your Domain to Cloudflare

1. **Log into Cloudflare Dashboard**
2. **Add Site**:
   - Enter your domain name
   - Choose a plan (Free plan works for basic HTTPS)
3. **DNS Records**:
   - Cloudflare will scan your existing DNS records
   - **Do NOT disable existing DNS records** - let Cloudflare proxy them

### Point Domain to Your Server

Add/update these DNS records in Cloudflare:

```
Type: A
Name: @ (or your subdomain)
Value: YOUR_SERVER_IP_ADDRESS
TTL: Auto
Proxy status: ☁️ Proxied (orange cloud)

Type: CNAME (if using subdomains)
Name: www (or api/dashboard)
Value: your-domain.com
TTL: Auto
Proxy status: ☁️ Proxied (orange cloud)
```

**Important**: Enable the orange cloud (proxy) for all records you want protected by Cloudflare's HTTPS.

## Step 2: SSL/TLS Configuration

### Enable HTTPS

1. **Go to SSL/TLS** in Cloudflare Dashboard
2. **Overview Tab**:
   - Set **SSL/TLS encryption mode** to: **Flexible**
   - This allows HTTPS to Cloudflare, HTTP to your origin server

### SSL/TLS Settings

1. **Edge Certificates**:
   - **Always Use HTTPS**: ✅ Enabled
   - **HTTP Strict Transport Security (HSTS)**: ✅ Enabled
   - **Minimum TLS Version**: TLS 1.2

2. **Origin Server**:
   - **Origin Server**: ✅ Keep as HTTP (your server runs HTTP)

## Step 3: Security Settings

### Configure WAF (Web Application Firewall)

1. **Go to Security** → **WAF**
2. **Managed Rules**:
   - Enable **Cloudflare Managed Ruleset**
   - Set paranoia level to: **Medium** (adjust based on your needs)

### Rate Limiting

1. **Go to Security** → **Rate Limiting**
2. **Create Rate Limiting Rule**:
   - **URL**: `*/api/*`
   - **Threshold**: 100 requests per minute
   - **Action**: Challenge (CAPTCHA)

## Step 4: Performance Optimization

### Caching Rules

1. **Go to Caching** → **Configuration**
2. **Create Page Rule** for better performance:

**Rule 1 - API Caching**:
- **URL Pattern**: `*your-domain.com/api/*`
- **Cache Level**: Bypass
- **Description**: Never cache API endpoints

**Rule 2 - Static Assets**:
- **URL Pattern**: `*your-domain.com/static/*`
- **Cache Level**: Cache Everything
- **Edge Cache TTL**: 1 hour
- **Description**: Cache static files aggressively

**Rule 3 - HTML Pages**:
- **URL Pattern**: `*your-domain.com/*`
- **Cache Level**: Standard
- **Description**: Standard caching for HTML

### Image Optimization

1. **Go to Speed** → **Optimization**
2. **Image Optimization**:
   - **Polish**: ✅ Enabled
   - **WebP**: ✅ Enabled (modern browsers)
   - **Image Resizing**: ✅ Enabled

## Step 5: Update Your Application

### Backend Configuration

Update your API server to handle HTTPS headers:

```python
# In your Flask API
@app.before_request
def handle_https():
    # Cloudflare provides these headers
    if request.headers.get('CF-Visitor'):
        # HTTPS request from Cloudflare
        request.is_secure = True
    elif request.headers.get('X-Forwarded-Proto') == 'https':
        # HTTPS request
        request.is_secure = True
```

### CORS Configuration

Update CORS to allow your HTTPS domain:

```javascript
// In your React app
const corsOptions = {
    origin: [
        'https://your-domain.com',
        'https://www.your-domain.com'
    ],
    credentials: true
};
```

## Step 6: Deployment Verification

### Test HTTPS

1. **Deploy your updated configuration**:
   ```bash
   ./deploy-docker.sh
   ```

2. **Test HTTPS access**:
   - Visit `https://your-domain.com`
   - Check that the lock icon appears in the browser
   - Verify no mixed content warnings

3. **Test API endpoints**:
   ```bash
   curl -I https://your-domain.com/api/health
   ```
   Should return `200 OK` with HTTPS headers

### Monitor Traffic

1. **Cloudflare Analytics**:
   - **Go to Analytics** in Cloudflare Dashboard
   - Monitor HTTPS requests, caching hit rates, threats blocked

2. **Origin Server Logs**:
   ```bash
   docker-compose logs nginx
   ```
   Should show requests coming from Cloudflare IPs

## Step 7: API Integration (Optional)

### Generate Cloudflare API Token

If you want to automate DNS or SSL certificate management:

1. **Go to Profile** → **API Tokens**
2. **Create Token**:
   - **Permissions**:
     - Zone:Edit (for DNS)
     - Page Rules:Edit (for caching rules)
   - **Zone Resources**: Include your domain
   - **TTL**: 1 year

3. **Use API Token**:
   ```bash
   export CLOUDFLARE_API_TOKEN="your-api-token"
   export CLOUDFLARE_ZONE_ID="your-zone-id"
   ```

## Troubleshooting

### Common Issues

1. **Mixed Content Warnings**:
   - Ensure all resources (CSS, JS, images) use HTTPS URLs
   - Update your React app to use relative URLs for static assets

2. **API Calls Failing**:
   - Check CORS configuration allows your HTTPS domain
   - Verify API server receives correct headers from Cloudflare

3. **SSL Certificate Issues**:
   - Cloudflare certificates are automatic - no manual intervention needed
   - Check **Edge Certificates** in Cloudflare dashboard

4. **Performance Issues**:
   - Review caching rules in Cloudflare
   - Check **Speed** → **Optimization** settings

### Debug Commands

```bash
# Check SSL certificate
curl -I https://your-domain.com

# Check Cloudflare headers
curl -H "User-Agent: Mozilla/5.0" https://your-domain.com

# Monitor origin server
docker-compose logs -f nginx
```

## Security Best Practices

1. **HTTPS Only**:
   - Enable **Always Use HTTPS** in Cloudflare
   - Set up **HSTS** for maximum security

2. **Rate Limiting**:
   - Implement rate limiting for API endpoints
   - Use Cloudflare's rate limiting for DDoS protection

3. **WAF Rules**:
   - Enable Cloudflare Managed Rules
   - Add custom rules for your specific endpoints

4. **Origin Protection**:
   - Your origin server should only accept requests from Cloudflare IPs
   - Use **Origin Server** settings in Cloudflare

## Support

- **Cloudflare Documentation**: [developers.cloudflare.com](https://developers.cloudflare.com)
- **Community**: [community.cloudflare.com](https://community.cloudflare.com)
- **Status Page**: [cloudflarestatus.com](https://www.cloudflarestatus.com/)

## Next Steps

After HTTPS is working:

1. **Custom Domain SSL** (Optional):
   - Purchase and upload custom SSL certificates
   - Enable **Advanced Certificate Manager**

2. **CDN Optimization**:
   - Configure Argo Smart Routing
   - Set up Load Balancing for multiple servers

3. **Advanced Security**:
   - Enable **Bot Management**
   - Set up **DDoS Protection**

---

**Note**: Replace `your-domain.com` with your actual domain throughout this guide. The configuration files in this repository are pre-configured for Cloudflare HTTPS integration.
