"use client";

import React, { useState, useEffect } from 'react';
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview';
import { Monitor, Smartphone, Tablet, RefreshCw, Code, Eye, Settings } from 'lucide-react';

// Client-side only time display component
function TimeDisplay() {
  const [time, setTime] = useState<string>('--:--:--');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return <span>--:--:--</span>;
  }

  return <span>{time}</span>;
}

interface ProjectPreviewProps {
  projectId: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const ProjectPreview: React.FC<ProjectPreviewProps> = ({ projectId }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  
  // ✅ Use Daytona preview hook with projectId
  const {
    previewUrl,
    loading: isLoading,
    error,
    sandboxId,
    status,
    startPreview,
    stopPreview
  } = useDaytonaPreview({ projectId });

  // ✅ Handle refresh action
  const handleRefresh = () => {
    startPreview();
  };
  
  // ✅ Calculate derived states
  const isError = status === 'error';
  const lastUpdated = null; // This hook doesn't provide lastUpdated

  const getDeviceWidth = () => {
    switch (deviceType) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{projectId}</h2>
              <p className="text-sm text-gray-500">
                {previewUrl ? 'Live preview' : 'No preview available'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Action Buttons */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1">
              <Code className="w-4 h-4" />
              <span>Files</span>
            </button>
            
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Device Type Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1 ml-2">
              <button
                onClick={() => setDeviceType('desktop')}
                className={`p-2 rounded-md transition-colors ${
                  deviceType === 'desktop' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceType('tablet')}
                className={`p-2 rounded-md transition-colors ${
                  deviceType === 'tablet' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceType('mobile')}
                className={`p-2 rounded-md transition-colors ${
                  deviceType === 'mobile' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden bg-gray-100 p-4">
        <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-full flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-gray-600">
                  {status === 'creating' ? 'กำลังสร้าง Preview...' : 'กำลังโหลด Preview...'}
                </p>
                {sandboxId && (
                  <p className="text-xs text-gray-400">Sandbox ID: {sandboxId}</p>
                )}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center space-y-4 p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview ไม่สามารถใช้งานได้</h3>
                  <p className="text-gray-600 mb-4">
                    {error || 'ไม่สามารถโหลด Preview ได้ กรุณาลองใหม่อีกครั้ง'}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    ลองใหม่
                  </button>
                </div>
              </div>
            ) : !previewUrl ? (
              <div className="flex flex-col items-center space-y-4 p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มี Preview</h3>
                  <p className="text-gray-600 mb-4">
                    Preview จะถูกสร้างขึ้นหลังจากสร้างหรือแก้ไขเว็บไซต์
                  </p>
                </div>
              </div>
            ) : (
              <div 
                className="w-full h-full"
                style={{ 
                  width: getDeviceWidth(),
                  maxWidth: deviceType === 'desktop' ? '100%' : getDeviceWidth(),
                  margin: '0 auto'
                }}
              >
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Project Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  onLoad={() => console.log('✅ Preview loaded:', previewUrl)}
                  onError={() => console.error('❌ Preview failed to load:', previewUrl)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Footer */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
              Invite
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
              Upgrade
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
              Publish
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {/* ✅ Dynamic status indicator */}
            <span className={`px-2 py-1 rounded-full text-xs ${
              status === 'running' ? 'bg-green-100 text-green-800' :
              status === 'creating' ? 'bg-yellow-100 text-yellow-800' :
              status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status === 'running' ? 'Live' :
               status === 'creating' ? 'Building' :
               status === 'error' ? 'Error' :
               'Offline'}
            </span>
            
            {/* ✅ Show last updated time or sandbox ID */}
            <span>
              {lastUpdated ? 
                `Last updated: ${new Date(lastUpdated).toLocaleString('th-TH')}` :
                sandboxId ? 
                  `Sandbox: ${sandboxId.slice(0, 8)}...` :
                  'No preview available'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;