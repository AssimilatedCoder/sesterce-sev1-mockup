import React, { useState } from 'react';
import { Lock, User, AlertCircle, Shield } from 'lucide-react';
import { WarningBanner } from './common/WarningBanner';
import { MeshWaveBackground } from './common/MeshWaveBackground';

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
    <div className="min-h-screen bg-black overflow-hidden relative">
      <MeshWaveBackground />
      
      {/* Warning Banner - Positioned at 5% from bottom, 40% longer */}
      <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 z-10">
        <WarningBanner />
      </div>

      {/* Login Form - Dead center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-[420px] border border-gray-100" 
             style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          
          {/* Security indicator */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">Protected by JWT Authentication</span>
            </div>
          </div>
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
                  className="block w-full pl-14 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Username"
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
                  className="block w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In Securely'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
