import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  ValidationSummary as ValidationSummaryType, 
  ValidationResult,
  getValidationStatusColor,
  getValidationStatusMessage 
} from '../../utils/validationRules';

interface ValidationSummaryProps {
  validationSummary: ValidationSummaryType;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validationSummary
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusColor = getValidationStatusColor(validationSummary);
  const statusMessage = getValidationStatusMessage(validationSummary);

  const getIconForType = (type: ValidationResult['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getColorForType = (type: ValidationResult['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadge = (severity: ValidationResult['severity']) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-gray-500 text-white'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[severity]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const allIssues = [
    ...validationSummary.errors,
    ...validationSummary.warnings,
    ...validationSummary.infos
  ].sort((a, b) => {
    // Sort by severity: critical > high > medium > low
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  if (validationSummary.totalIssues === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-green-800">Configuration Validated</h3>
        </div>
        <p className="text-sm text-green-700 mt-1">
          All validation checks passed. Your configuration is ready for deployment.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${
      statusColor === 'red' ? 'bg-red-50 border-red-200' :
      statusColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
      'bg-green-50 border-green-200'
    }`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {statusColor === 'red' ? 
            <XCircle className="w-5 h-5 text-red-600" /> :
            statusColor === 'yellow' ?
            <AlertTriangle className="w-5 h-5 text-yellow-600" /> :
            <CheckCircle className="w-5 h-5 text-green-600" />
          }
          <h3 className={`text-sm font-semibold ${
            statusColor === 'red' ? 'text-red-800' :
            statusColor === 'yellow' ? 'text-yellow-800' :
            'text-green-800'
          }`}>
            Configuration Validation
          </h3>
          <div className="flex items-center gap-2 ml-2">
            {validationSummary.errors.length > 0 && (
              <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium">
                {validationSummary.errors.length} Error{validationSummary.errors.length > 1 ? 's' : ''}
              </span>
            )}
            {validationSummary.warnings.length > 0 && (
              <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs font-medium">
                {validationSummary.warnings.length} Warning{validationSummary.warnings.length > 1 ? 's' : ''}
              </span>
            )}
            {validationSummary.infos.length > 0 && (
              <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                {validationSummary.infos.length} Info
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${
            statusColor === 'red' ? 'text-red-700' :
            statusColor === 'yellow' ? 'text-yellow-700' :
            'text-green-700'
          }`}>
            {statusMessage}
          </span>
          {isExpanded ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> :
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {allIssues.map((issue, index) => (
            <div key={index} className={`p-3 rounded border ${getColorForType(issue.type)}`}>
              <div className="flex items-start gap-3">
                {getIconForType(issue.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium">
                      {issue.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(issue.severity)}
                      {issue.affectedComponent && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          {issue.affectedComponent}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mb-2">{issue.message}</p>
                  {issue.recommendation && (
                    <div className="p-2 bg-white bg-opacity-50 rounded text-xs">
                      <span className="font-medium">Recommendation:</span> {issue.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Summary Statistics */}
          <div className="mt-4 p-3 bg-white bg-opacity-50 rounded border border-gray-300">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Validation Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-600">Total Issues:</span>
                <span className="ml-1 font-medium">{validationSummary.totalIssues}</span>
              </div>
              <div>
                <span className="text-gray-600">Critical:</span>
                <span className="ml-1 font-medium text-red-600">{validationSummary.criticalIssues}</span>
              </div>
              <div>
                <span className="text-gray-600">Errors:</span>
                <span className="ml-1 font-medium text-red-600">{validationSummary.errors.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Warnings:</span>
                <span className="ml-1 font-medium text-yellow-600">{validationSummary.warnings.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
