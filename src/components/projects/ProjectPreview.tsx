"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview';
import { CodeEditor } from '@/components/CodeEditor/CodeEditor';
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

interface ProjectData {
  snapshot: {
    id: string;
    label: string | null;
    createdAt: string;
  };
  project: {
    id: string;
    name: string;
    description: string | null;
  };
  templateData: any;
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  filesCount: number;
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({ projectId }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  
  // State สำหรับ toggle Code Editor
  const [isCodeEditorVisible, setIsCodeEditorVisible] = useState(true);
  
  // ✅ State สำหรับข้อมูลจริงจาก DB
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [projectFiles, setProjectFiles] = useState<Array<{path: string, content: string, type: string}>>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Loading messages ที่เล่นวนไปเรื่อยๆ
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = [
    "กินกาแฟ...",
    "กินหมูปิ้ง 20 ไม้...",
    "กินข้าวกะเพรา...",
    "กินข้าวหมูกรอบ...",
    "กินข้าวกุ้งกะปิ...",
    "กินข้าวผัดกระเทียม...",
    "เกือบเสร็จแล้ว...",
    "กินข้าวผัดตะเข้...",
    "กินข้าวผัดหมู...",
  ];
  
  // ✅ ดึงข้อมูลจาก API/DB
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setDataError('ไม่พบ Project ID');
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        setDataError(null);

        const response = await fetch(`/api/projects/${projectId}/snapshot`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || result.error || 'ไม่สามารถดึงข้อมูลได้');
        }

        if (result.success && result.data) {
          setProjectData(result.data);
          setProjectFiles(result.data.files || []);
          setProjectName(result.data.project?.name || projectId);
          console.log(`✅ โหลดข้อมูลจาก DB สำเร็จ: ${result.data.filesCount} ไฟล์`);
        } else {
          throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
        }
      } catch (error) {
        console.error('❌ Error fetching project data:', error);
        setDataError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        // ตั้งค่าเริ่มต้นเมื่อเกิด error
        setProjectFiles([]);
        setProjectName(projectId);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProjectData();
  }, [projectId]);
  
  // ✅ ใช้ข้อมูลจริงจาก DB แทน mock data
  const templateFiles = useMemo(() => {
    return projectFiles;
  }, [projectFiles]);
  
  // ✅ ใช้ useDaytonaPreview กับข้อมูลจาก DB
  const {
    sandboxId,
    status,
    previewUrlWithToken,
    error,
    loading,
    startPreview,
    stopPreview,
  } = useDaytonaPreview({ 
    projectId: projectId,  // ✅ ใช้ projectId จริง
    files: templateFiles   // ✅ ใช้ไฟล์จาก DB
  });
  
  // Extract data from preview
  const previewUrl = previewUrlWithToken;

  // ✅ Handle refresh action
  const handleRefresh = () => {
    startPreview();
  };
  
  // ✅ Calculate derived states
  const isError = status === 'error';
  const lastUpdated = null; // This hook doesn't provide lastUpdated

  // ✅ Log ข้อมูลเมื่อโหลด component จาก DB
  useEffect(() => {
    if (!isLoadingData && templateFiles.length > 0) {
      console.log(`✅ ProjectPreview loaded ${templateFiles.length} files from database`);
      console.log(`📦 Project: ${projectName} (ID: ${projectId})`);
      if (projectData) {
        console.log(`📸 Snapshot ID: ${projectData.snapshot.id}`);
        console.log(`📅 Created: ${new Date(projectData.snapshot.createdAt).toLocaleString('th-TH')}`);
      }
    }
  }, [isLoadingData, templateFiles.length, projectName, projectId, projectData]);

  // คีย์ลัดสำหรับ toggle Code Editor (เหมือนใน editor page)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+E หรือ Cmd+E เพื่อ toggle Code Editor
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setIsCodeEditorVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading message animation - เปลี่ยนข้อความทุก 1.5 วินาที
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  const getDeviceWidth = () => {
    switch (deviceType) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  // ดึง loading message ปัจจุบัน
  const getCurrentLoadingMessage = () => {
    return loadingMessages[loadingMessageIndex] || "กำลังโหลด...";
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
              <h2 className="text-lg font-semibold text-gray-900">
                {/* ✅ แสดงชื่อโปรเจคจริงจาก DB */}
                {isLoadingData ? 'กำลังโหลด...' : projectName || projectId}
              </h2>
              <p className="text-sm text-gray-500">
                {dataError ? (
                  <span className="text-red-500">❌ {dataError}</span>
                ) : previewUrl ? (
                  'Live preview'
                ) : (
                  'No preview available'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Action Buttons */}
            <button
              onClick={startPreview}
              disabled={isLoadingData || loading || status === 'running' || templateFiles.length === 0 || !!dataError}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading || isLoadingData ? 'animate-spin' : ''}`} />
              <span>
                {isLoadingData ? 'กำลังโหลดข้อมูล...' :
                 status === 'running' ? 'Running' : 
                 loading ? getCurrentLoadingMessage() : 
                 'Start Preview'}
              </span>
            </button>

            <button
              onClick={stopPreview}
              disabled={isLoadingData || loading || status !== 'running'}
              className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              <span>Stop Preview</span>
            </button>
            
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1">
              <Code className="w-4 h-4" />
              <span>Files ({isLoadingData ? '...' : templateFiles.length})</span>
            </button>
            
            <button
              onClick={() => setIsCodeEditorVisible(!isCodeEditorVisible)}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-1"
              title={isCodeEditorVisible ? "Hide Code Editor" : "Show Code Editor"}
            >
              <span>{isCodeEditorVisible ? '👁️ Hide Editor' : '👁️ Show Editor'}</span>
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
        {/* แสดง Loading state เมื่อกำลังโหลดข้อมูล */}
        {isLoadingData ? (
          <div className="flex items-center justify-center h-full bg-white rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-pulse">
                กำลังโหลดข้อมูลโปรเจค...
              </h3>
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
              <p className="text-gray-500 text-sm">
                กรุณารอสักครู่... กำลังดึงข้อมูลจากฐานข้อมูล
              </p>
            </div>
          </div>
        ) : dataError ? (
          <div className="flex items-center justify-center h-full bg-white rounded-lg border border-red-200">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                เกิดข้อผิดพลาด
              </h3>
              <p className="text-red-600 mb-6 max-w-md">
                {dataError}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                โหลดใหม่
              </button>
            </div>
          </div>
        ) : status !== 'running' ? (
          <div className="flex items-center justify-center h-full bg-white rounded-lg border border-gray-200">
            <div className="text-center">
              {loading ? (
                <>
                  <div className="text-6xl mb-4 animate-pulse">⚡</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-pulse">
                    {getCurrentLoadingMessage()}
                  </h3>
                  <div className="flex justify-center mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    กรุณารอสักครู่... เรากำลังเตรียมทุกอย่างให้คุณ
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Start Daytona Preview
                  </h3>
                  <p className="text-gray-600 mb-2 max-w-md">
                    Click "Start Preview" to create a Daytona sandbox and begin editing your code with live updates.
                  </p>
                  <p className="text-gray-500 mb-6 text-sm">
                    พบ {templateFiles.length} ไฟล์พร้อมใช้งาน
                  </p>
                  <button
                    onClick={startPreview}
                    disabled={loading || templateFiles.length === 0}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? getCurrentLoadingMessage() : 'Start Preview'}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={`grid gap-4 h-full ${
            isCodeEditorVisible 
              ? 'grid-cols-1 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {/* Code Editor */}
            {isCodeEditorVisible && (
              <div className="lg:col-span-2">
                <CodeEditor
                  sandboxId={sandboxId}
                  projectId={projectId}    // ✅ ใช้ projectId จริง
                  initialFiles={templateFiles} // ✅ ใช้ไฟล์จาก DB
                  className="h-full"
                />
              </div>
            )}

            {/* Live Preview */}
            <div className={isCodeEditorVisible ? "lg:col-span-1" : "col-span-1"}>
              <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    🔴 Live Preview
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Connected
                    </span>
                    {!isCodeEditorVisible && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Full Screen
                      </span>
                    )}
                  </h3>
                </div>
                
                <div className="h-full">
                  {previewUrl ? (
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
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        referrerPolicy="no-referrer"
                        allow="clipboard-read; clipboard-write"
                        onLoad={() => console.log('✅ ProjectPreview loaded:', previewUrl)}
                        onError={() => console.error('❌ ProjectPreview failed to load:', previewUrl)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <div>Loading preview...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Files:</span> {templateFiles.length} | 
              <span className="font-medium ml-2">Status:</span> {status} |
              {sandboxId && (
                <>
                  <span className="font-medium ml-2">Sandbox:</span> {sandboxId.substring(0, 12)}...
                </>
              )}
            </div>
            
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;