import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit, Trash2, Key, Shield, Calendar, 
  AlertTriangle, CheckCircle, XCircle, Eye, EyeOff,
  RefreshCw, UserPlus, Settings
} from 'lucide-react';
import { generateSecureStarWarsPassword, generateTempStarWarsPassword, validatePassword } from '../../utils/starWarsPasswordGenerator';

interface User {
  username: string;
  role: string;
  created_at: string;
  expires_at: string | null;
  last_login: string | null;
  is_active: boolean;
}

interface Role {
  description: string;
  permissions: string[];
}

interface UserManagementTabProps {
  currentUser: string;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user',
    expires_days: 14
  });
  const [editUser, setEditUser] = useState({
    role: '',
    is_active: true,
    expires_days: 14
  });
  const [resetPassword, setResetPassword] = useState({
    password: '',
    showPassword: false
  });

  // Load users on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadUsers(), loadRoles()]);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Network error loading users');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      } else {
        console.warn('Failed to load roles, using defaults');
        // Fallback to default roles if API fails
        setRoles({
          admin: { description: 'Full system access', permissions: ['all'] },
          analyst: { description: 'Advanced calculator access', permissions: ['calculate', 'advanced'] },
          user: { description: 'Basic calculator access', permissions: ['calculate'] },
          viewer: { description: 'Read-only access', permissions: ['view'] }
        });
      }
    } catch (err) {
      console.warn('Network error loading roles, using defaults');
      // Fallback to default roles
      setRoles({
        admin: { description: 'Full system access', permissions: ['all'] },
        analyst: { description: 'Advanced calculator access', permissions: ['calculate', 'advanced'] },
        user: { description: 'Basic calculator access', permissions: ['calculate'] },
        viewer: { description: 'Read-only access', permissions: ['view'] }
      });
    }
  };

  const createUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`User ${newUser.username} created successfully`);
        setShowAddUser(false);
        setNewUser({ username: '', password: '', role: 'user', expires_days: 14 });
        loadUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error creating user');
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${selectedUser.username}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUser)
      });

      if (response.ok) {
        setSuccess(`User ${selectedUser.username} updated successfully`);
        setShowEditUser(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Network error updating user');
    }
  };

  const resetUserPassword = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${selectedUser.username}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: resetPassword.password })
      });

      if (response.ok) {
        setSuccess(`Password reset for ${selectedUser.username}`);
        setShowResetPassword(false);
        setSelectedUser(null);
        setResetPassword({ password: '', showPassword: false });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error resetting password');
    }
  };

  const deleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess(`User ${username} deleted successfully`);
        loadUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error deleting user');
    }
  };

  const generatePassword = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/generate-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.password;
      } else {
        // Fallback to client-side generation
        return generateSecureStarWarsPassword();
      }
    } catch (err) {
      // Fallback to client-side generation
      return generateSecureStarWarsPassword();
    }
  };

  const handleGeneratePassword = async (isTemp = false) => {
    const password = isTemp ? generateTempStarWarsPassword() : await generatePassword();
    
    if (showAddUser) {
      setNewUser({ ...newUser, password });
    } else if (showResetPassword) {
      setResetPassword({ ...resetPassword, password });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiresAt: string | null) => {
    if (!expiresAt) return { status: 'never', color: 'text-gray-500', icon: null };
    
    const days = getDaysUntilExpiry(expiresAt);
    if (days === null) return { status: 'never', color: 'text-gray-500', icon: null };
    
    if (days < 0) return { status: 'expired', color: 'text-gray-600', icon: <XCircle className="w-3 h-3 text-gray-500" /> };
    if (days <= 3) return { status: 'expiring', color: 'text-gray-600', icon: <AlertTriangle className="w-3 h-3 text-gray-500" /> };
    if (days <= 7) return { status: 'warning', color: 'text-gray-600', icon: <AlertTriangle className="w-3 h-3 text-gray-500" /> };
    return { status: 'active', color: 'text-gray-600', icon: <CheckCircle className="w-3 h-3 text-gray-500" /> };
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (currentUser !== 'admin') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        </div>
        <p className="text-gray-600">User management is only available to the super admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">User Management</h2>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const expiryStatus = getExpiryStatus(user.expires_at);
                  const daysUntilExpiry = getDaysUntilExpiry(user.expires_at);
                  
                  return (
                    <tr key={user.username} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">Created {formatDate(user.created_at)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'analyst'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'viewer'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                          {roles[user.role] && (
                            <span className="text-xs text-gray-500 mt-1">
                              {roles[user.role].description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Disabled
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 ${expiryStatus.color}`}>
                          {expiryStatus.icon}
                          <span className="text-sm">
                            {user.expires_at ? (
                              daysUntilExpiry !== null ? (
                                daysUntilExpiry < 0 ? 'Expired' : 
                                daysUntilExpiry === 0 ? 'Today' :
                                `${daysUntilExpiry} days`
                              ) : 'Never'
                            ) : 'Never'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.last_login)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUser({
                                role: user.role,
                                is_active: user.is_active,
                                expires_days: user.expires_at ? getDaysUntilExpiry(user.expires_at) || 14 : 14
                              });
                              setShowEditUser(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setResetPassword({ password: '', showPassword: false });
                              setShowResetPassword(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Reset password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {user.username !== 'admin' && (
                            <button
                              onClick={() => deleteUser(user.username)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                  <button
                    onClick={() => handleGeneratePassword(false)}
                    className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                    title="Generate Star Wars password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {newUser.password && (
                  <div className="mt-1">
                    {validatePassword(newUser.password).isValid ? (
                      <span className="text-xs text-green-600">✓ Password meets requirements</span>
                    ) : (
                      <span className="text-xs text-red-600">✗ Password too weak</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(roles).map(([roleKey, roleData]) => (
                    <option key={roleKey} value={roleKey}>
                      {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)} - {roleData.description}
                    </option>
                  ))}
                </select>
              </div>

              {newUser.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires in (days)</label>
                  <input
                    type="number"
                    value={newUser.expires_days}
                    onChange={(e) => setNewUser({ ...newUser, expires_days: parseInt(e.target.value) || 14 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 14 days (2 weeks)</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={createUser}
                disabled={!newUser.username || !newUser.password || !validatePassword(newUser.password).isValid}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create User
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User: {selectedUser.username}</h3>
              <button
                onClick={() => setShowEditUser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(roles).map(([roleKey, roleData]) => (
                    <option key={roleKey} value={roleKey}>
                      {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)} - {roleData.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editUser.is_active}
                    onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Account is active</span>
                </label>
              </div>

              {editUser.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires in (days)</label>
                  <input
                    type="number"
                    value={editUser.expires_days}
                    onChange={(e) => setEditUser({ ...editUser, expires_days: parseInt(e.target.value) || 14 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="365"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={updateUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update User
              </button>
              <button
                onClick={() => setShowEditUser(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reset Password: {selectedUser.username}</h3>
              <button
                onClick={() => setShowResetPassword(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={resetPassword.showPassword ? "text" : "password"}
                      value={resetPassword.password}
                      onChange={(e) => setResetPassword({ ...resetPassword, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={() => setResetPassword({ ...resetPassword, showPassword: !resetPassword.showPassword })}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {resetPassword.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleGeneratePassword(false)}
                    className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                    title="Generate Star Wars password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {resetPassword.password && (
                  <div className="mt-1">
                    {validatePassword(resetPassword.password).isValid ? (
                      <span className="text-xs text-green-600">✓ Password meets requirements</span>
                    ) : (
                      <span className="text-xs text-red-600">✗ Password too weak</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={resetUserPassword}
                disabled={!resetPassword.password || !validatePassword(resetPassword.password).isValid}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Reset Password
              </button>
              <button
                onClick={() => setShowResetPassword(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
