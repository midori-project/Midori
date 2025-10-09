"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview';
import { CodeEditor } from '@/components/CodeEditor/CodeEditor';
import { Monitor, Smartphone, Tablet, RefreshCw, Code, Eye, Settings, Rocket, ExternalLink, CheckCircle, XCircle, Loader } from 'lucide-react';

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
  const [hasSnapshot, setHasSnapshot] = useState<boolean>(false);
  
  // WebSocket connection state
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [wsError, setWsError] = useState<string | null>(null);
  
  // ✅ State สำหรับ Deployment
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentSuccess, setDeploymentSuccess] = useState<{
    url: string;
    subdomain: string;
    deployedAt: string;
  } | null>(null);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    url: string;
    state: string;
    meta: any;
    createdAt: string;
  }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
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
  
  // ✅ ฟังก์ชันดึงข้อมูลจาก API/DB (แยกออกมาเพื่อใช้ซ้ำได้)
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
        setHasSnapshot(result.hasSnapshot !== false); // ✅ เช็คว่ามี snapshot หรือไม่
        
        if (result.hasSnapshot) {
          console.log(`✅ โหลดข้อมูลจาก DB สำเร็จ: ${result.data.filesCount} ไฟล์`);
        } else {
          console.log(`⚠️ ${result.message}`);
        }
      } else {
        throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('❌ Error fetching project data:', error);
      setDataError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      setHasSnapshot(false);
      // ตั้งค่าเริ่มต้นเมื่อเกิด error
      setProjectFiles([]);
      setProjectName(projectId);
    } finally {
      setIsLoadingData(false);
    }
  };

  // ✅ ฟังก์ชันดึงประวัติ deployment
  const fetchDeploymentHistory = async () => {
    if (!projectId) return;
    
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/projects/${projectId}/deploy`);
      const result = await response.json();
      
      if (result.success && result.deployments) {
        setDeploymentHistory(result.deployments);
        
        // ถ้ามี deployment ที่สำเร็จล่าสุด ให้เซ็ตเป็น default
        const latestSuccess = result.deployments.find((d: any) => d.state === 'ready');
        if (latestSuccess && latestSuccess.meta?.subdomain) {
          setDeploymentSuccess({
            url: latestSuccess.url,
            subdomain: latestSuccess.meta.subdomain,
            deployedAt: latestSuccess.createdAt,
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching deployment history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ✅ เรียกครั้งแรกเมื่อ component โหลด
  useEffect(() => {
    fetchProjectData();
    fetchDeploymentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ✅ WebSocket integration for real-time snapshot monitoring
  useEffect(() => {
    if (!projectId) return;

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/api/project-context/ws`
      : `ws://localhost:3000/api/project-context/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('🔌 WebSocket connected for project:', projectId);
      setWsConnected(true);
      setWsError(null);
      // Subscribe to project updates
      ws.send(JSON.stringify({
        type: 'subscribe',
        projectId: projectId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 WebSocket message received:', data);
        
        if (data.type === 'snapshot_created' || data.type === 'project_updated') {
          console.log('🔄 Snapshot detected, refreshing project data...');
          fetchProjectData();
        }
      } catch (error) {
        /* console.error('❌ Error parsing WebSocket message:', error); */
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setWsConnected(false);
    };

    ws.onerror = (error) => {
      /* console.error('❌ WebSocket error:', error); */
      setWsConnected(false);
      setWsError('WebSocket connection failed');
    };

    return () => {
      ws.close();
    };
  }, [projectId]);
  
  // ✅ แปลงชื่อโปรเจคเป็น subdomain format
  const generateSubdomain = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // เอาตัวอักษรพิเศษออก
      .replace(/\s+/g, '-') // แปลง space เป็น hyphen
      .replace(/-+/g, '-') // แปลง hyphen ซ้ำเป็นตัวเดียว
      .substring(0, 50) // จำกัดความยาว
      .replace(/^-|-$/g, ''); // เอา hyphen หน้าหลังออก
  };

  // ✅ ฟังก์ชัน Deploy โปรเจค
  const handleDeploy = async () => {
    // ใช้ชื่อโปรเจคเป็น subdomain อัตโนมัติ
    const autoSubdomain = generateSubdomain(projectName || projectId);
    
    if (!autoSubdomain) {
      setDeploymentError('ไม่สามารถสร้าง subdomain จากชื่อโปรเจคได้');
      return;
    }

    setIsDeploying(true);
    setDeploymentError(null);
    setDeploymentSuccess(null);

    try {
      console.log(`🚀 Starting deployment for ${projectId} with subdomain: ${autoSubdomain}`);

      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subdomain: autoSubdomain }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการ deploy');
      }

      console.log('✅ Deployment successful:', result);

      setDeploymentSuccess({
        url: result.deployment.url,
        subdomain: result.deployment.subdomain,
        deployedAt: result.deployment.deployedAt,
      });
      
      // รีเฟรชประวัติ deployment
      await fetchDeploymentHistory();
      
    } catch (error: any) {
      console.error('❌ Deployment failed:', error);
      setDeploymentError(error.message || 'เกิดข้อผิดพลาดในการ deploy');
    } finally {
      setIsDeploying(false);
    }
  };
  
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

  // ✅ Auto-preview when snapshot is available
  useEffect(() => {
    if (hasSnapshot && templateFiles.length > 0 && status !== 'running' && !loading) {
      console.log('🚀 Auto-starting preview for available snapshot...');
      startPreview();
    }
  }, [hasSnapshot, templateFiles.length, status, loading, startPreview]);
  
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
          
          <div className="flex items-center space-x-2">
            {/* Refresh Data Button */}
            <button
              onClick={fetchProjectData}
              disabled={isLoadingData}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              title="รีเฟรชข้อมูลจาก Database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>{isLoadingData ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
            </button>

            {/* Action Buttons */}
            <button
              onClick={startPreview}
              disabled={isLoadingData || loading || status === 'running' || !hasSnapshot || templateFiles.length === 0 || !!dataError}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              title={!hasSnapshot ? 'กรุณาสร้างเทมเพลตก่อน' : 'เริ่ม Preview'}
            >
              <Eye className="w-4 h-4" />
              <span>
                {isLoadingData ? 'กำลังโหลดข้อมูล...' :
                 !hasSnapshot ? 'ยังไม่มีเทมเพลต' :
                 status === 'running' ? 'Running' : 
                 loading ? getCurrentLoadingMessage() : 
                 'Start Preview'}
              </span>
            </button>

            <button
              onClick={stopPreview}
              disabled={isLoadingData || loading || status !== 'running'}
              className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Stop Preview</span>
            </button>
            
            <button 
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
              disabled={!hasSnapshot}
              title={!hasSnapshot ? 'ยังไม่มีไฟล์' : `มี ${templateFiles.length} ไฟล์`}
            >
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
            
            {/* ปุ่ม Deploy */}
            <button
              onClick={handleDeploy}
              disabled={!hasSnapshot || isLoadingData || !!dataError || isDeploying}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-md"
              title={!hasSnapshot ? 'กรุณาสร้างเทมเพลตก่อน' : `Deploy ไปยัง ${generateSubdomain(projectName || projectId)}.midori.lol`}
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
        ) : !hasSnapshot ? (
          /* ✅ UI พิเศษเมื่อไม่มี snapshot */
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-300">
            <div className="text-center max-w-2xl px-8">
              <div className="text-8xl mb-6 animate-bounce">🐸</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                ยังไม่มีเทมเพลตสำหรับโปรเจคนี้
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                กรุณาสร้างเทมเพลตผ่านทาง <span className="font-semibold text-purple-600">Chat Interface</span> ทางด้านซ้าย
                โดยพิมพ์คำสั่งเช่น "สร้างเว็บไซต์คาเฟ่" หรือ "สร้าง landing page"
              </p>
              <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-center">
                  <span className="text-2xl mr-2">💡</span>
                  ตัวอย่างคำสั่งที่คุณสามารถใช้ได้:
                </h4>
                <div className="space-y-2 text-left">
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-600">"สร้างเว็บไซต์ร้านกาแฟสไตล์โมเดิร์น"</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-600">"สร้าง landing page สำหรับร้านอาหาร"</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-600">"สร้าง portfolio สำหรับนักออกแบบ"</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-600">"สร้างเว็บไซต์ e-commerce"</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span>Midori AI พร้อมช่วยคุณสร้างเว็บไซต์แล้ว</span>
              </div>
              
              {/* ปุ่มรีเฟรชหลังสร้างเทมเพลต */}
              <button
                onClick={fetchProjectData}
                disabled={isLoadingData}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>ตรวจสอบเทมเพลตใหม่</span>
              </button>
              <p className="text-xs text-gray-500 mt-3">
                คลิกปุ่มนี้หลังจากสร้างเทมเพลตจาก Chat แล้ว
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
            
            {/* แสดง deployment status */}
            {deploymentSuccess ? (
              <a 
                href={deploymentSuccess.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Deployed: {deploymentSuccess.subdomain}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button 
                onClick={handleDeploy}
                disabled={!hasSnapshot || isDeploying}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeploying ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>กำลัง Deploy...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Deploy</span>
                  </>
                )}
              </button>
            )}
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

      {/* Toast Notifications */}
      {deploymentError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4">
            <div className="flex items-start">
              <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-800 font-semibold mb-1">
                  Deployment Failed
                </h4>
                <p className="text-red-700 text-sm">
                  {deploymentError}
                </p>
              </div>
              <button
                onClick={() => setDeploymentError(null)}
                className="text-red-400 hover:text-red-600 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPreview;