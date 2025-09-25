import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';
import { WarningBanner } from './common/WarningBanner';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // SECURITY: Credentials now validated server-side only
  // No client-side password storage or validation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
        onLogin(data.username);
      } else {
        setError(data.error || 'Invalid username or password');
        setPassword(''); // Clear password on error
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Warning Banner */}
      <WarningBanner />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
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
          <p className="text-gray-600 mt-2">GPU SuperCluster Calculator</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

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
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-medium py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
              style={{ backgroundColor: '#00c896' }}
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Null Sector Systems LTD. All rights reserved.
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Secure access to GPU cluster management
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

