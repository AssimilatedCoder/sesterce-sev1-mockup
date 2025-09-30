import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  className?: string;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white/90 backdrop-blur-xl border border-red-200 border-l-4 border-l-red-500 rounded-xl py-3 px-6 shadow-xl ${className}`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-medium text-red-800 mr-2">Experimental Platform:</span>
          <span className="text-sm text-red-700">
            This is an early release of an experimental Super Cluster Calculation platform and may contain errors, including but not limited to pricing and calculations — do not blindly use this data. The platform contains a mix of dynamically generated/calculated data sections and static sections (e.g. design philosophy, 10k-100k Design Exercise, etc.). Improvements are being made continuously. Recommendations can be made to the admin you got access from.
          </span>
        </div>
      </div>
    </div>
  );
};
