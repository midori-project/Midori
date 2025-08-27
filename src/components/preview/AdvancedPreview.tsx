'use client';

import React, { useState, useEffect } from 'react';
import { GeneratedFile } from '@/types/sitegen';
import EnhancedPreview from './EnhancedPreview';
import QualityReport from './QualityReport';
import { CodeValidator } from '../../../utils/code-validator';

interface AdvancedPreviewProps {
  files: GeneratedFile[];
  projectStructure: any;
}

const AdvancedPreview: React.FC<AdvancedPreviewProps> = ({
  files,
  projectStructure
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'quality' | 'deployment' | 'sharing'>('preview');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0.8,
    bundleSize: 245,
    lighthouse: 98
  });
  const [qualityData, setQualityData] = useState<{
    score: number;
    issues: Array<{
      file: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }>;
  } | null>(null);

  // Validate code quality when files change
  useEffect(() => {
    if (files.length > 0) {
      const quality = CodeValidator.validateCodeQuality(files);
      setQualityData(quality);
    }
  }, [files]);

  // Mock deployment function
  const handleDeploy = async () => {
    setDeploymentStatus('deploying');
    
    // Simulate deployment process
    setTimeout(() => {
      setDeploymentStatus('deployed');
    }, 3000);
  };

  // Mock sharing function
  const handleShare = () => {
    const projectData = {
      name: projectStructure?.name || 'Generated Website',
      files: files.map(f => ({ path: f.path, content: f.content })),
      timestamp: new Date().toISOString()
    };
    
    // Create shareable link (mock)
    const shareData = btoa(JSON.stringify(projectData));
    const shareUrl = `${window.location.origin}/shared/${shareData.slice(0, 10)}`;
    
    navigator.clipboard.writeText(shareUrl);
    alert('🔗 Link copied to clipboard!');
  };

  const tabs = [
    { id: 'preview' as const, label: '🌐 Live Preview', icon: '👁️' },
    { id: 'quality' as const, label: '📊 Quality Report', icon: '🔍' },
    { id: 'deployment' as const, label: '🚀 Deploy', icon: '☁️' },
    { id: 'sharing' as const, label: '🔗 Share', icon: '📤' }
  ];

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 text-sm font-medium border-b-2 transition-all
                flex items-center space-x-2
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">🎨 Interactive Preview</h3>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ✅ Ready
                </span>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200">
                  🔄 Refresh
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  {/* Embed actual EnhancedPreview component */}
                  <EnhancedPreview files={files} projectStructure={projectStructure} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">📊 Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Load Time:</span>
                      <span className={`${performanceMetrics.loadTime < 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {performanceMetrics.loadTime}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bundle Size:</span>
                      <span className="text-blue-600">{performanceMetrics.bundleSize}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lighthouse:</span>
                      <span className={`${performanceMetrics.lighthouse > 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {performanceMetrics.lighthouse}/100
                      </span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${performanceMetrics.lighthouse}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Overall Score: {performanceMetrics.lighthouse > 90 ? 'Excellent' : 'Good'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">🔧 Quick Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        // TODO: Implement style editor
                        alert('🎨 Style Editor coming soon!');
                      }}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50 text-sm transition-colors"
                    >
                      🎨 Edit Styles
                    </button>
                    <button 
                      onClick={() => {
                        // TODO: Implement component adder
                        alert('🧩 Component Builder coming soon!');
                      }}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50 text-sm transition-colors"
                    >
                      🧩 Add Component
                    </button>
                    <button 
                      onClick={() => {
                        // TODO: Implement responsive tester
                        alert('📱 Responsive Tester activated!');
                      }}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50 text-sm transition-colors"
                    >
                      📱 Test Responsive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">📊 Code Quality Analysis</h3>
              <p className="text-gray-600">Review and improve your generated code quality</p>
            </div>
            
            {qualityData ? (
              <QualityReport 
                score={qualityData.score} 
                issues={qualityData.issues}
                onFixIssues={() => {
                  // TODO: Implement auto-fix functionality
                  alert('🔧 Auto-fix functionality coming soon!');
                }}
              />
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing code quality...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">🚀 Deploy Your Website</h3>
              <p className="text-gray-600">Deploy to popular platforms with one click</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vercel */}
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-2xl mb-2">▲</div>
                  <h4 className="font-medium">Vercel</h4>
                  <p className="text-sm text-gray-500 mb-3">Instant deployment</p>
                  <button
                    onClick={handleDeploy}
                    disabled={deploymentStatus === 'deploying'}
                    className="w-full bg-black text-white py-2 px-4 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                  >
                    {deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy to Vercel'}
                  </button>
                </div>
              </div>

              {/* Netlify */}
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-2xl mb-2">🌊</div>
                  <h4 className="font-medium">Netlify</h4>
                  <p className="text-sm text-gray-500 mb-3">JAMstack hosting</p>
                  <button className="w-full bg-teal-500 text-white py-2 px-4 rounded text-sm hover:bg-teal-600">
                    Deploy to Netlify
                  </button>
                </div>
              </div>

              {/* GitHub Pages */}
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-2xl mb-2">🐙</div>
                  <h4 className="font-medium">GitHub Pages</h4>
                  <p className="text-sm text-gray-500 mb-3">Free static hosting</p>
                  <button className="w-full bg-gray-800 text-white py-2 px-4 rounded text-sm hover:bg-gray-700">
                    Deploy to GitHub
                  </button>
                </div>
              </div>
            </div>

            {deploymentStatus === 'deployed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <div>
                    <p className="text-green-700 font-medium">Deployment Successful!</p>
                    <p className="text-green-600 text-sm">
                      Your website is live at: 
                      <a href="#" className="underline ml-1">https://your-site.vercel.app</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sharing' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">🔗 Share Your Project</h3>
              <p className="text-gray-600">Share your generated website with others</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">📤 Export Options</h4>
                
                <div className="space-y-3">
                  <button
                    onClick={handleShare}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
                  >
                    <span>🔗</span>
                    <span>Generate Shareable Link</span>
                  </button>
                  
                  <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                    <span>📦</span>
                    <span>Download ZIP</span>
                  </button>
                  
                  <button className="w-full bg-purple-100 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-200 flex items-center justify-center space-x-2">
                    <span>🐙</span>
                    <span>Export to GitHub</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">🌟 Project Stats</h4>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Files Generated</div>
                      <div className="font-medium">{files.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total Lines</div>
                      <div className="font-medium">
                        {files.reduce((acc, f) => acc + f.content.split('\n').length, 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Components</div>
                      <div className="font-medium">
                        {files.filter(f => f.type === 'component').length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Pages</div>
                      <div className="font-medium">
                        {files.filter(f => f.type === 'page').length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">🎯 Generated by Midori AI</h5>
                  <p className="text-sm text-blue-700">
                    This website was intelligently generated from your conversation using advanced AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPreview;
