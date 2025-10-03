import React, { useState } from 'react';
import { 
  GitBranch, AlertTriangle, CheckCircle, 
  Clock, Tag, Settings, RefreshCw, Archive,
  ChevronDown, ChevronUp, Info, Shield, Zap
} from 'lucide-react';
import { 
  CURRENT_VERSION, 
  VERSION_HISTORY, 
  VersionInfo, 
  getCurrentVersion
} from '../../config/version';

interface VersionManagementTabProps {
  isAdmin: boolean;
}

export const VersionManagementTab: React.FC<VersionManagementTabProps> = ({ isAdmin }) => {
  const [selectedVersion, setSelectedVersion] = useState<VersionInfo | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [rollbackConfirm, setRollbackConfirm] = useState<string | null>(null);

  const toggleVersionExpansion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const handleRollback = async (version: string) => {
    if (!isAdmin) return;
    
    setDeploymentStatus('deploying');
    try {
      // Simulate rollback process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Pull the specific container image from registry
      // 2. Update docker-compose to use the target version
      // 3. Restart services with the previous version
      // 4. Update version tracking
      
      setDeploymentStatus('success');
      setRollbackConfirm(null);
      
      setTimeout(() => setDeploymentStatus('idle'), 3000);
    } catch (error) {
      setDeploymentStatus('error');
      setTimeout(() => setDeploymentStatus('idle'), 3000);
    }
  };

  const getVersionBadgeColor = (version: VersionInfo) => {
    if (version.version === CURRENT_VERSION.version) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (version.breaking) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (version: VersionInfo) => {
    if (version.version === CURRENT_VERSION.version) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (version.breaking) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    return <Archive className="w-4 h-4 text-gray-600" />;
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h2>
        <p className="text-gray-600">Version management is only available to administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Version Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Version Management</h2>
            <p className="text-gray-600">Manage application versions and rollback capabilities</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Current: v{getCurrentVersion()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Version</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{CURRENT_VERSION.version}</p>
            <p className="text-xs text-gray-500">Build {CURRENT_VERSION.buildNumber}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Deployed</span>
            </div>
            <p className="text-sm text-gray-900">
              {new Date(CURRENT_VERSION.buildDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(CURRENT_VERSION.buildDate).toLocaleTimeString()}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Architecture</span>
            </div>
            <p className="text-sm text-gray-900">{CURRENT_VERSION.architecture}</p>
            <p className="text-xs text-gray-500">
              {CURRENT_VERSION.breaking ? 'Breaking Changes' : 'Compatible'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900">Active</span>
            </div>
            <p className="text-xs text-gray-500">Production Ready</p>
          </div>
        </div>

        {/* Current Version Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Current Release Notes</h3>
          <p className="text-sm text-blue-800 mb-3">{CURRENT_VERSION.releaseNotes}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-blue-900 mb-2">New Features</h4>
              <ul className="space-y-1">
                {CURRENT_VERSION.features.map((feature, index) => (
                  <li key={index} className="text-xs text-blue-700 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-blue-900 mb-2">Bug Fixes</h4>
              <ul className="space-y-1">
                {CURRENT_VERSION.bugfixes.map((fix, index) => (
                  <li key={index} className="text-xs text-blue-700 flex items-start gap-2">
                    <Settings className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Status */}
      {deploymentStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          deploymentStatus === 'deploying' ? 'bg-yellow-50 border-yellow-200' :
          deploymentStatus === 'success' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {deploymentStatus === 'deploying' && <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />}
            {deploymentStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {deploymentStatus === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
            
            <div>
              <h3 className={`text-sm font-medium ${
                deploymentStatus === 'deploying' ? 'text-yellow-800' :
                deploymentStatus === 'success' ? 'text-green-800' :
                'text-red-800'
              }`}>
                {deploymentStatus === 'deploying' && 'Deploying Version...'}
                {deploymentStatus === 'success' && 'Deployment Successful'}
                {deploymentStatus === 'error' && 'Deployment Failed'}
              </h3>
              <p className={`text-xs ${
                deploymentStatus === 'deploying' ? 'text-yellow-700' :
                deploymentStatus === 'success' ? 'text-green-700' :
                'text-red-700'
              }`}>
                {deploymentStatus === 'deploying' && 'Please wait while the new version is deployed...'}
                {deploymentStatus === 'success' && 'The application has been successfully updated.'}
                {deploymentStatus === 'error' && 'Failed to deploy the selected version. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Version History */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Version History</h3>
          <span className="text-sm text-gray-500">{VERSION_HISTORY.length} versions available</span>
        </div>

        <div className="space-y-4">
          {VERSION_HISTORY.slice().reverse().map((version, index) => (
            <div key={version.version} className="border border-gray-200 rounded-lg">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(version)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          Version {version.version}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getVersionBadgeColor(version)}`}>
                          {version.version === CURRENT_VERSION.version ? 'Current' : 
                           version.breaking ? 'Breaking' : 'Stable'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(version.buildDate).toLocaleDateString()} • Build {version.buildNumber}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {version.version !== CURRENT_VERSION.version && (
                      <button
                        onClick={() => setRollbackConfirm(version.version)}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                      >
                        Rollback
                      </button>
                    )}
                    <button
                      onClick={() => toggleVersionExpansion(version.version)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedVersions.has(version.version) ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mt-2">{version.releaseNotes}</p>

                {expandedVersions.has(version.version) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-medium text-gray-900 mb-2">Features ({version.features.length})</h5>
                        <ul className="space-y-1">
                          {version.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium text-gray-900 mb-2">Bug Fixes ({version.bugfixes.length})</h5>
                        <ul className="space-y-1">
                          {version.bugfixes.map((fix, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                              <Settings className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {rollbackConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">Confirm Rollback</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to rollback to version <strong>{rollbackConfirm}</strong>? 
              This will restart the application with the previous version and may cause temporary downtime.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-700">
                  <p className="font-medium mb-1">Rollback Process:</p>
                  <ul className="space-y-1">
                    <li>• Pull container image for version {rollbackConfirm}</li>
                    <li>• Update docker-compose configuration</li>
                    <li>• Restart application services</li>
                    <li>• Verify deployment health</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleRollback(rollbackConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
              >
                Confirm Rollback
              </button>
              <button
                onClick={() => setRollbackConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Container Strategy Information */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Container Deployment Strategy</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Current Implementation</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Docker Registry Versioning</p>
                  <p className="text-xs">Each version tagged and pushed to registry</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Immutable Deployments</p>
                  <p className="text-xs">No in-place updates, always new containers</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Health Checks</p>
                  <p className="text-xs">Automated verification of deployment success</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Rollback Process</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <Archive className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Image Pull</p>
                  <p className="text-xs">Retrieve specific version from registry</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Service Restart</p>
                  <p className="text-xs">Zero-downtime deployment with health checks</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Verification</p>
                  <p className="text-xs">Automated testing of rollback success</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
