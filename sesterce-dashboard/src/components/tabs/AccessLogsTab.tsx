import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, Globe, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface AccessLogsTabProps {
  config: any;
  results: any;
}

interface LoginAttempt {
  timestamp: string;
  ip_address: string;
  username: string;
  success: boolean;
  user_agent: string;
}

interface UserActivity {
  timestamp: string;
  ip_address: string;
  username: string;
  activity_type: string;
  details: string;
  user_agent: string;
}

interface AccessLogsResponse {
  total_login_attempts: number;
  recent_login_attempts: LoginAttempt[];
  total_activities: number;
  recent_activities: UserActivity[];
  login_log_file: string;
  activity_log_file: string;
}

export const AccessLogsTab: React.FC<AccessLogsTabProps> = () => {
  const [logs, setLogs] = useState<AccessLogsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:7779/api/access-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch logs');
      }
    } catch (err) {
      setError('Network error. Could not fetch access logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getIPLocation = (ip: string) => {
    if (ip.startsWith('127.') || ip === 'localhost') return 'Local';
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return 'Private Network';
    return 'External';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Access Logs</h2>
              <p className="text-sm text-gray-600">Monitor login attempts and user access</p>
            </div>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {logs && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Successful Logins</h3>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {logs.recent_login_attempts.filter(attempt => attempt.success).length}
              </div>
              <div className="text-sm text-green-600">Last 100 attempts</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Failed Attempts</h3>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {logs.recent_login_attempts.filter(attempt => !attempt.success).length}
              </div>
              <div className="text-sm text-red-600">Last 100 attempts</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Unique IPs</h3>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {new Set(logs.recent_login_attempts.map(attempt => attempt.ip_address)).size}
              </div>
              <div className="text-sm text-blue-600">Last 100 attempts</div>
            </div>
          </div>
        )}
      </div>

      {/* User Activities Table */}
      {logs && logs.recent_activities && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent User Activities</h3>
            <p className="text-sm text-gray-600 mt-1">Last {logs.recent_activities.length} user actions</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.recent_activities.slice().reverse().map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {activity.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.activity_type === 'tab_click' ? 'bg-blue-100 text-blue-800' :
                        activity.activity_type === 'calculation' ? 'bg-green-100 text-green-800' :
                        activity.activity_type === 'override_change' ? 'bg-purple-100 text-purple-800' :
                        activity.activity_type === 'page_load' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.activity_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 max-w-xs truncate block">
                        {activity.details}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{activity.ip_address}</div>
                          <div className="text-xs text-gray-500">{getIPLocation(activity.ip_address)}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Access Log Table */}
      {logs && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Login Attempts</h3>
            <p className="text-sm text-gray-600 mt-1">Last {logs.recent_login_attempts.length} login attempts</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timestamp
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Username
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      IP Address
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Agent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.recent_login_attempts
                  .slice()
                  .reverse() // Show most recent first
                  .map((attempt, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(attempt.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{attempt.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 font-mono">{attempt.ip_address}</span>
                          <span className="text-xs text-gray-500">{getIPLocation(attempt.ip_address)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {attempt.success ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Success</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">Failed</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {attempt.user_agent}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          {logs.recent_login_attempts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No access attempts logged yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Log File Information */}
      {logs && (
        <div className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-800 mb-1">Security Information</div>
              <div className="text-sm text-blue-700">
                Complete access logs are stored in <code className="bg-blue-100 px-1 rounded">{logs.log_file}</code> on the server. 
                Total attempts logged: <strong>{logs.total_attempts}</strong>. 
                Logs include IP addresses, timestamps, success/failure status, and user agents for security monitoring.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
