import React, { useEffect } from 'react';

export const GrafanaDashboardOriginal: React.FC = () => {
  useEffect(() => {
    // This component simply loads the original dashboard HTML in an iframe
    // to preserve the exact layout and functionality
  }, []);

  return (
    <iframe 
      src="/sev1-warroom-dashboard.html" 
      className="w-full h-screen border-0"
      title="SEV-1 War Room Dashboard"
    />
  );
};
