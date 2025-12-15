import React from 'react';

/**
 * Component displays data loading status
 */
export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">📦</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-pulse">
          Loading project data...
        </h3>
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <p className="text-gray-500 text-sm">
          Please wait a moment... We are fetching data from the database
        </p>
      </div>
    </div>
  );
}

