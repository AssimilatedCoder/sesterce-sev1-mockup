import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  title: string;
  message: string;
  className?: string;
}

const WarningBanner: React.FC<WarningBannerProps> = ({ title, message, className = '' }) => {
  return (
    <div className={`bg-white/90 backdrop-blur-xl rounded-xl py-3 px-6 shadow-xl border-l-4 border-l-red-500 flex items-center gap-3 text-sm text-gray-800 ${className}`}>
      <AlertTriangle className="w-4 h-4 text-red-500" />
      <div className="flex-1">
        <span className="font-semibold mr-2">{title}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export { WarningBanner };
export default WarningBanner;
