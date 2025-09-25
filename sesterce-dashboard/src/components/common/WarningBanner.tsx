import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  className?: string;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ className = '' }) => {
  return (
    <div className={`bg-red-600 text-white py-2 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm font-medium">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="text-center">
          <strong>!!! WARNING !!!</strong> This is an early release of an experimental Super Cluster Calculation platform and may contain errors, including but not limited to pricing and calculations — do not blindly use this data. The platform contains a mix of dynamically generated/calculated data sections and static sections (e.g. design philosophy, 10k-100k Design Exercise, etc.). Improvements are being made continuously. Recommendations can be made to the admin you got access from. <strong>!!! WARNING !!!</strong>
        </span>
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      </div>
    </div>
  );
};
