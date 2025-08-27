'use client';

import React, { useState } from 'react';
import { GeneratedFile } from '@/types/sitegen';
import CodePreview from './CodePreview';
import WebsitePreview from './WebsitePreview';
import PerformanceMonitor from './PerformanceMonitor';

interface LovablePreviewProps {
  files: GeneratedFile[];
  projectStructure: any;
}

const LovablePreview: React.FC<LovablePreviewProps> = ({ files, projectStructure }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('code');

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">👨‍💻</span>
              Code Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">🌐</span>
              Website Preview
            </button>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Ready</span>
            </div>
            <span>•</span>
            <span>{files.length} files</span>
            <span>•</span>
            <span>{projectStructure?.framework || 'Next.js'}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' ? (
          <CodePreview 
            files={files} 
            projectStructure={projectStructure} 
          />
        ) : (
          <WebsitePreview 
            files={files} 
            projectStructure={projectStructure} 
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 text-white px-4 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>💾 Auto-saved</span>
          <span>🔧 Development Mode</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Powered by</span>
          <span className="font-medium text-blue-300">Midori AI</span>
        </div>
      </div>
      
      {/* Performance Monitor */}
      <PerformanceMonitor 
        onMetrics={(metrics) => {
          console.log('📊 Preview Performance:', metrics);
        }}
      />
    </div>
  );
};

export default LovablePreview;
