import React from 'react';

interface ErrorStateProps {
  error: string;
}

/**
 * Component displays status when an error occurs
 */
export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-full bg-white rounded-lg border border-red-200">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-red-900 mb-2">An Error Occurred</h3>
        <p className="text-red-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

