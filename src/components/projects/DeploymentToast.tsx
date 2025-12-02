import React from 'react';
import { XCircle } from 'lucide-react';

interface DeploymentToastProps {
  error: string | null;
  onClose: () => void;
}

/**
 * Toast notification สำหรับแสดงผลการ Deploy
 */
export function DeploymentToast({ error, onClose }: DeploymentToastProps) {
  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-red-800 font-semibold mb-1">Deployment Failed</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

