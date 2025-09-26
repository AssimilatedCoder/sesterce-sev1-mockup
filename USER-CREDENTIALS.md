# GPU SuperCluster Calculator - User Credentials

## User Access Summary

The TCO Calculator now supports **five user accounts** with different permission levels:

### 🔑 **User Accounts**

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| **admin** | `Vader@66` | Super Admin | • Full access to all features<br/>• Access to admin-only tabs<br/>• Can view access logs<br/>• TCO Override access |
| **David** | `Sk7walk3r!` | Admin | • Full access to all features<br/>• Access to admin-only tabs<br/>• Cannot view access logs<br/>• TCO Override access |
| **Thomas** | `Th0mas@99` | Admin | • Full access to all features<br/>• Access to admin-only tabs<br/>• Cannot view access logs<br/>• TCO Override access |
| **Kiko** | `K1ko#2025` | Admin | • Full access to all features<br/>• Access to admin-only tabs<br/>• Cannot view access logs<br/>• TCO Override access |
| **Maciej** | `Mac1ej*77` | Admin | • Full access to all features<br/>• Access to admin-only tabs<br/>• Cannot view access logs<br/>• TCO Override access |

### 📋 **Permission Levels**

#### **Super Admin (admin only)**
- ✅ All calculator features and tabs
- ✅ Admin-only tabs (Documentation, Design Summary, Design Exercise)
- ✅ Access Logs tab (security monitoring)
- ✅ TCO Override page (custom pricing)

#### **Admin (David, Thomas, Kiko & Maciej)**
- ✅ All calculator features and tabs
- ✅ Admin-only tabs (Documentation, Design Summary, Design Exercise)
- ❌ Access Logs tab (super admin only)
- ✅ TCO Override page (custom pricing)

#### **Regular Users (if added in future)**
- ✅ All calculator features and tabs
- ❌ Admin-only tabs
- ❌ Access Logs tab
- ✅ TCO Override page (custom pricing)

### 🎯 **TCO Override Page Access**

**The TCO Override page is available to ALL users** - it's not restricted to admins because:
- Business users need to input negotiated vendor pricing
- Technical users need to adjust operational parameters
- Financial users need to customize cost assumptions
- All users benefit from real-world data customization

### 🔐 **Security Features**

- **JWT Authentication**: Secure token-based authentication system
- **Password Hashing**: All passwords are hashed using SHA-256
- **Rate Limiting**: 10 requests per minute per IP address
- **Access Logging**: All login attempts are logged with IP and timestamp
- **Session Management**: 24-hour token expiration

### 🌐 **Access URLs**

- **Development**: `http://localhost:3000` (React dev server)
- **Production**: `http://localhost:3025` (if served via API)
- **API Endpoint**: `http://localhost:5000` (Flask API server)

### 📝 **Usage Instructions**

1. **Navigate to the calculator** at the appropriate URL
2. **Login** with one of the credential sets above
3. **Access TCO Overrides** via the "TCO Overrides" tab in the User Input section
4. **Use admin features** if you have admin permissions (David, Thomas, or super admin)

### 🔧 **Technical Notes**

- Credentials are stored server-side in the Flask API (`calculator-api.py`)
- Frontend recognizes admin users in `GPUSuperclusterCalculatorV5Enhanced.tsx`
- All users have access to the core calculator and override functionality
- Admin tabs are conditionally rendered based on user role

### 🚀 **Recent Updates**

- ✅ Added Thomas as new admin user with same rights as David
- ✅ TCO Override page implemented and accessible to all users
- ✅ Override functionality integrated into all calculation logic
- ✅ Persistent override storage via localStorage
- ✅ Comprehensive override interface with grouped parameters

---

**Note**: These credentials are for development/testing purposes. In production, implement proper user management, stronger passwords, and additional security measures as needed.
