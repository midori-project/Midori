import React from 'react';
import { RefreshCw } from 'lucide-react';

interface NoSnapshotStateProps {
  onRefresh: () => void;
  isLoading: boolean;
}

/**
 * Component displays status when there is no snapshot yet
 */
export function NoSnapshotState({ onRefresh, isLoading }: NoSnapshotStateProps) {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-300">
      <div className="text-center max-w-2xl px-8">
        <div className="text-8xl mb-6 animate-bounce">🐸</div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          No template for this project yet
        </h3>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Please create a template through the{' '}
          <span className="font-semibold text-purple-600">Chat Interface</span> on the left
          by typing commands such as "create a cafe website" or "create a landing page"
        </p>
        
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-center">
            <span className="text-2xl mr-2">💡</span>
            Example commands you can use:
          </h4>
          <div className="space-y-2 text-left">
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span className="text-gray-600">"Create a modern style cafe website"</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span className="text-gray-600">"Create a landing page for a restaurant"</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span className="text-gray-600">"Create a portfolio for a designer"</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span className="text-gray-600">"Create an e-commerce website"</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          <span>Midori AI is ready to help you create a website</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Check for New Template</span>
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Click this button after creating a template from Chat
        </p>
      </div>
    </div>
  );
}

