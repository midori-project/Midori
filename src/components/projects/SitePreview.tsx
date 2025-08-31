'use client';

import React, { useState, useEffect } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';

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

  // ฟังก์ชันดึงข้อมูลจาก localStorage
  const loadPreviewData = () => {
    try {
      const savedData = localStorage.getItem(`preview_${projectId}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setFiles(data.files || []);
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
        <button
          onClick={loadPreviewData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          🔄 ตรวจสอบพรีวิว
        </button>
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
        <button
          onClick={loadPreviewData}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
        >
          🔄 ตรวจสอบอีกครั้ง
        </button>
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
        
        <div className="h-96 md:h-[600px]">
          <Sandpack
            files={sandpackFiles}
            template="react-ts"
            theme="light"
            options={{
              showNavigator: true,
              showTabs: true,
              showLineNumbers: true,
              showInlineErrors: true,
              wrapContent: true,
              editorHeight: '100%',
              layout: 'preview',
              autorun: true,
              recompileMode: 'immediate',
            }}
            customSetup={{
              dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0',
                'react-router-dom': '^6.8.1',
              },
            }}
          />
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

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          การดำเนินการต่อ
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              // TODO: เพิ่มการดาวน์โหลดโค้ด
              alert('ฟีเจอร์ดาวน์โหลดจะพร้อมใช้งานเร็วๆ นี้');
            }}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>💾</span>
            <span>ดาวน์โหลดโค้ด</span>
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
        </div>
      </div>
    </div>
  );
}
