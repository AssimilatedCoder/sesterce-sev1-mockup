import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  className?: string;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ className = '' }) => {
  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          This is an early release of an experimental Super Cluster Calculation platform and may contain errors, including but not limited to pricing and calculations — do not blindly use this data. The platform contains a mix of dynamically generated/calculated data sections and static sections (e.g. design philosophy, 10k-100k Design Exercise, etc.). Improvements are being made continuously. Recommendations can be made to the admin you got access from.
        </div>
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      </div>
    </div>
  );
};
