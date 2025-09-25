import React, { useState } from 'react';
import { Lock, User, AlertCircle, Shield } from 'lucide-react';
import { WarningBanner } from './common/WarningBanner';

interface SecureLoginProps {
  onLogin: (token: string, username: string, role: string) => void;
}

export const SecureLogin: React.FC<SecureLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token securely
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('tokenExpiry', (Date.now() + data.expires_in * 1000).toString());
        onLogin(data.token, data.username, data.role);
      } else {
        setError(data.error || 'Login failed');
        setPassword(''); // Clear password on error
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Warning Banner - floating above login */}
        <div className="mb-8">
          <WarningBanner />
        </div>
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img src="/testlogo_white_bg.png" alt="Null Sector Systems LTD" className="h-48 w-auto" />
            <div className="flex flex-col">
              <h1 
                className="text-4xl font-bold leading-tight"
                style={{
                  fontFamily: 'Rationale, sans-serif',
                  fontWeight: 700,
                  color: '#ff6b35',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6)',
                  letterSpacing: '1px'
                }}
              >
                NULL SECTOR
              </h1>
              <h1 
                className="text-4xl font-bold leading-tight"
                style={{
                  fontFamily: 'Rationale, sans-serif',
                  fontWeight: 700,
                  color: '#ff6b35',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6)',
                  letterSpacing: '1px'
                }}
              >
                SYSTEMS LTD
              </h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">Secure GPU SuperCluster Calculator</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">Protected by JWT Authentication</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Enhanced Security</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    All calculations now processed server-side. Your credentials are hashed and protected.
                  </p>
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your username"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-medium py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#00c896' }}
            >
              {loading ? 'Signing In...' : 'Sign In Securely'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Null Sector Systems LTD. All rights reserved. | Secured with JWT Authentication
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Security Features</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span>Hashed Passwords</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span>JWT Tokens</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span>Rate Limiting</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span>Server-side Logic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
