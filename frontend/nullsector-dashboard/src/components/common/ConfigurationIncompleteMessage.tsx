import React from 'react';
import { AlertTriangle, Settings } from 'lucide-react';

interface ConfigurationIncompleteMessageProps {
  tabName: string;
  description?: string;
}

export const ConfigurationIncompleteMessage: React.FC<ConfigurationIncompleteMessageProps> = ({ 
  tabName, 
  description 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 p-8">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuration Required</h3>
        <p className="text-gray-600 mb-4">
          {description || `To view ${tabName} data, please complete your cluster configuration first.`}
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center text-sm text-gray-700 mb-2">
            <Settings className="w-4 h-4 mr-2" />
            <span className="font-medium">Next Steps:</span>
          </div>
          <ol className="text-sm text-gray-600 text-left space-y-1">
            <li>1. Complete the <strong>Basic Cluster Config</strong> tab</li>
            <li>2. Or configure <strong>Advanced Cluster Config</strong> settings</li>
            <li>3. Return to this tab to view {tabName.toLowerCase()} analysis</li>
          </ol>
        </div>
        <p className="text-xs text-gray-500">
          Financial modeling requires complete infrastructure specifications to provide accurate calculations.
        </p>
      </div>
    </div>
  );
};

export default ConfigurationIncompleteMessage;
