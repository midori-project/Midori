'use client';

import React, { useState, useEffect } from 'react';
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview 
} from '@codesandbox/sandpack-react';

interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'page' | 'api' | 'config' | 'style' | 'util';
  language: 'typescript' | 'javascript' | 'css' | 'html' | 'json' | 'markdown';
}

interface SitePreviewProps {
  projectId: string;
}

export default function SitePreview({ projectId }: SitePreviewProps) {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadingFromAPI, setLoadingFromAPI] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const [showJsonViewer, setShowJsonViewer] = useState(false);

  // ฟังก์ชันดึงข้อมูลจาก localStorage
  const loadPreviewData = () => {
    try {
      const savedData = localStorage.getItem(`preview_${projectId}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setFiles(data.files || []);
        setJsonData(data.fullResponse || data); // โหลด JSON data ด้วย
        setShowPreview(true);
        setError(null);
      } else {
        setError('ยังไม่มีข้อมูลพรีวิว กรุณาสร้างเว็บไซต์ก่อน');
        setShowPreview(false);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลพรีวิว');
      setShowPreview(false);
    }
  };

  // ฟังก์ชันโหลดโค้ดจาก API
  const loadFromAPI = async () => {
    try {
      setLoadingFromAPI(true);
      setError(null);
      
      // เรียก API เพื่อสร้างโค้ดใหม่ (ถ้าจำเป็น)
      const response = await fetch(`/api/projects/${projectId}/code`);
      
      if (!response.ok) {
        throw new Error('ไม่สามารถโหลดโค้ดได้');
      }
      
      const data = await response.json();
      
      if (data.success && data.files) {
        setFiles(data.files);
        setJsonData(data); // เก็บ JSON response ทั้งหมด
        setShowPreview(true);
        
        // เก็บใน localStorage สำหรับครั้งต่อไป
        const previewData = {
          files: data.files,
          projectStructure: data.projectStructure,
          fileCount: data.files.length,
          generatedAt: new Date().toISOString(),
          fullResponse: data // เก็บ response เต็ม
        };
        localStorage.setItem(`preview_${projectId}`, JSON.stringify(previewData));
      } else {
        throw new Error(data.error || 'ไม่พบข้อมูลโค้ด');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดโค้ด');
    } finally {
      setLoadingFromAPI(false);
    }
  };

  // ฟังก์ชันดาวน์โหลดไฟล์เป็น ZIP
  const downloadFiles = async () => {
    if (files.length === 0) {
      alert('ไม่มีไฟล์ให้ดาวน์โหลด');
      return;
    }
    
    try {
      setDownloading(true);
      
      // สร้าง ZIP file
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // เพิ่มไฟล์ทั้งหมดลงใน ZIP
      files.forEach((file) => {
        zip.file(file.path, file.content);
      });
      
      // เพิ่ม JSON response ลงใน ZIP ด้วย
      if (jsonData) {
        zip.file('api-response.json', JSON.stringify(jsonData, null, 2));
      }
      
      // สร้าง ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // สร้าง download link
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}-code.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('ดาวน์โหลดโค้ดสำเร็จ! 🎉');
    } catch (err) {
      console.error('Download error:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด');
    } finally {
      setDownloading(false);
    }
  };

  // ฟังก์ชันดาวน์โหลด JSON อย่างเดียว
  const downloadJSON = () => {
    if (!jsonData) {
      alert('ไม่มีข้อมูล JSON ให้ดาวน์โหลด');
      return;
    }

    try {
      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}-api-response.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('ดาวน์โหลด JSON สำเร็จ! 📄');
    } catch (err) {
      console.error('JSON download error:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด JSON');
    }
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadPreviewData();
    
    // ฟังการเปลี่ยนแปลงใน localStorage
    const handleStorageChange = () => {
      loadPreviewData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // ฟังการเปลี่ยนแปลงแบบ manual (จากหน้าเดียวกัน)
    const interval = setInterval(() => {
      const savedData = localStorage.getItem(`preview_${projectId}`);
      if (savedData && files.length === 0) {
        loadPreviewData();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [projectId, files.length]);

  // แปลงไฟล์เป็น format ที่ SandPack ต้องการ
  const sandpackFiles: Record<string, string> = {};
  files.forEach((file) => {
    sandpackFiles[file.path] = file.content;
  });

  if (!showPreview && !error) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          พร้อมดูพรีวิวเว็บไซต์แล้วหรือยัง?
        </h3>
        <p className="text-blue-600 mb-4">
          สร้างเว็บไซต์ก่อน แล้วพรีวิวจะปรากฏที่นี่อัตโนมัติ
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={loadPreviewData}
            disabled={loadingFromAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            🔄 ตรวจสอบพรีวิว
          </button>
          <button
            onClick={loadFromAPI}
            disabled={loadingFromAPI}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loadingFromAPI ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>โหลด...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>โหลดโค้ด</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ยังไม่มีพรีวิว
        </h3>
        <p className="text-yellow-600 mb-4">{error}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={loadPreviewData}
            disabled={loadingFromAPI}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            🔄 ตรวจสอบอีกครั้ง
          </button>
          <button
            onClick={loadFromAPI}
            disabled={loadingFromAPI}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loadingFromAPI ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>โหลด...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>โหลดโค้ด</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-emerald-800 mb-2">
              🎨 พรีวิวเว็บไซต์สด
            </h3>
            <p className="text-emerald-600">
              เว็บไซต์ที่สร้างขึ้นพร้อมใช้งาน - ทดสอบและโต้ตอบได้เลย!
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-700">{files.length}</div>
            <div className="text-sm text-emerald-600">ไฟล์</div>
          </div>
        </div>
      </div>

      {/* SandPack Preview */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800">
              🖥️ Live Preview
            </h4>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
          </div>
        </div>
        
        <div className="h-[1000px] w-full flex flex-col">
          <div className="flex-1 min-h-0">
            <SandpackProvider
              files={sandpackFiles}
              template="react-ts"
              theme="light"
              options={{
                autorun: true,
                recompileMode: 'immediate',
                externalResources: ["https://cdn.tailwindcss.com"]
              }}
              customSetup={{
                dependencies: {
                  'react': '^18.2.0',
                  'react-dom': '^18.2.0',
                  'react-router-dom': '^6.8.1',
                },
              }}
            >
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <SandpackLayout style={{ height: '100%', width: '100%', flex: 1 }}>
                  <SandpackCodeEditor 
                    showTabs
                    showLineNumbers
                    showInlineErrors
                    wrapContent
                    closableTabs
                    style={{ height: '100%', minHeight: '100%', flex: 1 }}
                  />
                  <SandpackPreview 
                    showNavigator
                    showOpenInCodeSandbox
                    showRefreshButton
                    showSandpackErrorOverlay
                    showOpenNewtab
                    style={{ height: "80vh", minHeight: '100%', flex: 1 }}
                  />
                </SandpackLayout>
              </div>
            </SandpackProvider>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">📂</span>
          ไฟล์ที่สร้าง ({files.length} ไฟล์)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {file.type === 'component' ? '🧩' :
                   file.type === 'page' ? '📄' :
                   file.type === 'config' ? '⚙️' :
                   file.type === 'style' ? '🎨' :
                   file.type === 'util' ? '🔧' : '📁'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {file.path}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.language} • {file.type}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Viewer */}
      {jsonData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center">
              <span className="mr-2">📄</span>
              API Response JSON
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowJsonViewer(!showJsonViewer)}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                {showJsonViewer ? '🙈 ซ่อน' : '👁️ แสดง'}
              </button>
              <button
                onClick={downloadJSON}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <span>📥</span>
                <span>ดาวน์โหลด JSON</span>
              </button>
            </div>
          </div>
          
          {showJsonViewer && (
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            </div>
          )}
          
          {!showJsonViewer && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
              📊 มีข้อมูล JSON จาก API พร้อมแสดง (กดปุ่ม "👁️ แสดง" เพื่อดู)
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          การดำเนินการต่อ
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={downloadFiles}
            disabled={downloading || files.length === 0}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>กำลังดาวน์โหลด...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>ดาวน์โหลดโค้ด</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              // TODO: เพิ่มการสร้าง GitHub repo
              alert('ฟีเจอร์ส่งไปยัง GitHub จะพร้อมใช้งานเร็วๆ นี้');
            }}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🐙</span>
            <span>ส่งไป GitHub</span>
          </button>
          
          <button
            onClick={() => {
              // TODO: เพิ่มการ deploy
              alert('ฟีเจอร์ deploy จะพร้อมใช้งานเร็วๆ นี้');
            }}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🚀</span>
            <span>Deploy เลย</span>
          </button>
          
          <button
            onClick={loadFromAPI}
            disabled={loadingFromAPI}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loadingFromAPI ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>กำลังโหลด...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>รีเฟรชโค้ด</span>
              </>
            )}
          </button>
          
          <button
            onClick={downloadJSON}
            disabled={!jsonData}
            className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>📄</span>
            <span>ดาวน์โหลด JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
