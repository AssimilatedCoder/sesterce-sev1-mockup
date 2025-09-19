import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

export const DesignExerciseTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Callout at the top */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">10k-100k Design Exercise</h2>
            <p className="text-gray-700 mb-2">
              This section contains the complete design exercise outcome for scaling from 10,000 to 100,000 GB200 GPUs. 
              The content below is static and based on the original exercise guidelines and requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Complete HTML document in iframe */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            GPU Cluster Technical Architecture Document - Complete
          </h3>
        </div>
        
        {/* Full document iframe */}
        <div className="w-full" style={{ height: '80vh' }}>
          <iframe
            src="/gpu-cluster-architecture-complete.html"
            className="w-full h-full border-0"
            title="GPU Cluster Technical Architecture - Complete Document"
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>
    </div>
  );
};