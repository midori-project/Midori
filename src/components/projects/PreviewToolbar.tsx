import React from 'react';
import { 
  Eye, 
  RefreshCw, 
  Code, 
  Settings, 
  Rocket, 
  Loader, 
  Monitor, 
  Smartphone, 
  Tablet 
} from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface PreviewToolbarProps {
  projectName: string;
  isLoading: boolean;
  hasSnapshot: boolean;
  status: string;
  deviceType: DeviceType;
  wsConnected: boolean;
  previewUrl: string | null;
  dataError: string | null;
  filesCount: number;
  loadingMessage: string;
  onDeviceChange: (device: DeviceType) => void;
  onRefresh: () => void;
  onStartPreview: () => void;
  onStopPreview: () => void;
  onToggleEditor: () => void;
  onDeploy: () => void;
  isDeploying: boolean;
  isCodeEditorVisible: boolean;
  generateSubdomain: (name: string) => string;
}

/**
 * Toolbar สำหรับควบคุม Preview
 * ประกอบด้วยปุ่มต่างๆ เช่น Start Preview, Deploy, Device Selector
 */
export function PreviewToolbar({
  projectName,
  isLoading,
  hasSnapshot,
  status,
  deviceType,
  wsConnected,
  previewUrl,
  dataError,
  filesCount,
  loadingMessage,
  onDeviceChange,
  onRefresh,
  onStartPreview,
  onStopPreview,
  onToggleEditor,
  onDeploy,
  isDeploying,
  isCodeEditorVisible,
  generateSubdomain,
}: PreviewToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Project Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'กำลังโหลด...' : projectName}
            </h2>
            <p className="text-sm text-gray-500">
              {dataError ? (
                <span className="text-red-500">❌ {dataError}</span>
              ) : !hasSnapshot ? (
                <span className="text-amber-600">⚠️ ยังไม่มีเทมเพลต</span>
              ) : previewUrl ? (
                <span className="flex items-center space-x-2">
                  <span>Live preview</span>
                  {wsConnected ? (
                    <span className="text-green-500 text-xs">🔌 Connected</span>
                  ) : (
                    <span className="text-red-500 text-xs">🔌 Disconnected</span>
                  )}
                </span>
              ) : (
                'No preview available'
              )}
            </p>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            title="รีเฟรชข้อมูลจาก Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
          </button>

          {/* Start Preview Button */}
          <button
            onClick={onStartPreview}
            disabled={
              isLoading ||
              status === 'running' ||
              !hasSnapshot ||
              filesCount === 0 ||
              !!dataError
            }
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            title={!hasSnapshot ? 'กรุณาสร้างเทมเพลตก่อน' : 'เริ่ม Preview'}
          >
            <Eye className="w-4 h-4" />
            <span>
              {isLoading
                ? 'กำลังโหลดข้อมูล...'
                : !hasSnapshot
                ? 'ยังไม่มีเทมเพลต'
                : status === 'running'
                ? 'Running'
                : loadingMessage}
            </span>
          </button>

          {/* Stop Preview Button */}
          <button
            onClick={onStopPreview}
            disabled={isLoading || status !== 'running'}
            className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>Stop Preview</span>
          </button>

          {/* Files Button */}
          <button
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
            disabled={!hasSnapshot}
            title={!hasSnapshot ? 'ยังไม่มีไฟล์' : `มี ${filesCount} ไฟล์`}
          >
            <Code className="w-4 h-4" />
            <span>Files ({isLoading ? '...' : filesCount})</span>
          </button>

          {/* Toggle Editor Button */}
          <button
            onClick={onToggleEditor}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-1"
            title={isCodeEditorVisible ? 'Hide Code Editor' : 'Show Code Editor'}
          >
            <span>{isCodeEditorVisible ? '👁️ Hide Editor' : '👁️ Show Editor'}</span>
          </button>

          {/* Deploy Button */}
          <button
            onClick={onDeploy}
            disabled={!hasSnapshot || isLoading || !!dataError || isDeploying}
            className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-md"
            title={
              !hasSnapshot
                ? 'กรุณาสร้างเทมเพลตก่อน'
                : `Deploy ไปยัง ${generateSubdomain(projectName)}.midori.lol`
            }
          >
            {isDeploying ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>กำลัง Deploy...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>{!hasSnapshot ? 'ยังไม่มีเทมเพลต' : 'Deploy'}</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          {/* Device Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 ml-2">
            <button
              onClick={() => onDeviceChange('desktop')}
              className={`p-2 rounded-md transition-colors ${
                deviceType === 'desktop'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceChange('tablet')}
              className={`p-2 rounded-md transition-colors ${
                deviceType === 'tablet'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceChange('mobile')}
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
  );
}

