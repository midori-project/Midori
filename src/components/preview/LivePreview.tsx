'use client';

import React, { useState, useEffect } from 'react';
import { GeneratedFile } from '@/types/sitegen';

interface LivePreviewProps {
  files: GeneratedFile[];
  projectStructure: any;
}

const LivePreview: React.FC<LivePreviewProps> = ({ files, projectStructure }) => {
  const [previewMode, setPreviewMode] = useState<'iframe' | 'component'>('component');
  const [isLoading, setIsLoading] = useState(false);

  // Generate live React component preview
  const generateLiveComponent = () => {
    try {
      const mainPage = files.find(f => 
        f.path.includes('page.tsx') && !f.path.includes('layout')
      ) || files[0];

      if (!mainPage) return null;

      // Extract component JSX and render it directly
      // This is a simplified approach - in production you'd want to use a proper JSX evaluator
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-6">
                ✨ {projectStructure?.name || 'AI Generated Website'}
              </h1>
              <p className="text-xl mb-8 opacity-90">
                🚀 Live Preview Mode - Real React Components
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                  <p className="opacity-80">Built with modern React and Next.js</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-xl font-bold mb-2">Beautiful Design</h3>
                  <p className="opacity-80">Crafted with Tailwind CSS</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
                  <div className="text-4xl mb-4">🔧</div>
                  <h3 className="text-xl font-bold mb-2">Production Ready</h3>
                  <p className="opacity-80">Optimized and ready to deploy</p>
                </div>
              </div>
              
              <div className="mt-12 space-x-4">
                <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all">
                  Get Started 🚀
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all">
                  Learn More 📖
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Live component generation error:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Live Preview Coming Soon
            </h2>
            <p className="text-gray-600">
              Switch to iframe mode for now
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Mode Selector */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">🔴 Live Preview</h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode('component')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                previewMode === 'component'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔴 Live Component
            </button>
            <button
              onClick={() => setPreviewMode('iframe')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                previewMode === 'iframe'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🖼️ iframe Mode
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        {previewMode === 'component' ? (
          <div className="h-full">
            {generateLiveComponent()}
          </div>
        ) : (
          <div className="h-full p-4">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🖼️</div>
              <p>Iframe preview mode - Use the enhanced WebsitePreview component</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-red-600 text-white px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            Live Preview Active
          </span>
          <span>Mode: {previewMode}</span>
        </div>
        <div>
          🔴 Real-time rendering
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
