import React, { useState } from 'react';
import { GeneratedFile } from '@/types/sitegen';
import PreviewLayout from '../preview/PreviewLayout';
import AdvancedPreview from '../preview/AdvancedPreview';

interface SiteGeneratorProps {
  finalJson: any;
  canGenerateSite: boolean;
  siteGen: {
    isGenerating: boolean;
    progress: number;
    currentTask: string;
    files: GeneratedFile[];
    projectStructure: any;
    error: string | null;
    isCompleted: boolean;
    isFailed: boolean;
    totalFiles: number;
    generateSite: (finalJson: any, options?: any) => Promise<void>;
    downloadFiles: () => void;
    reset: () => void;
    emergencyStop: () => void; // เพิ่มฟังก์ชันหยุดฉุกเฉิน
  };
  onGenerate?: (options?: any) => Promise<void>; // เปลี่ยน type เพื่อรับ options
}

const SiteGenerator: React.FC<SiteGeneratorProps> = ({
  finalJson,
  canGenerateSite,
  siteGen,
  onGenerate
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    framework: 'next' as const,
    styling: 'tailwind' as const,
    typescript: true,
    includeAuth: false,
    includeDB: false,
    deployment: 'vercel' as const,
  });

  const handleGenerate = async () => {
    if (!canGenerateSite || siteGen.isGenerating) {
      console.log('⚠️ Cannot generate: canGenerateSite:', canGenerateSite, 'isGenerating:', siteGen.isGenerating);
      return;
    }
    
    console.log('🚀 Starting site generation with options:', options);
    console.log('🔍 onGenerate function available:', !!onGenerate);
    
    try {
      if (onGenerate) {
        console.log('✅ Calling onGenerate (useChat.generateWebsite)');
        await onGenerate(options);
      } else {
        console.log('⚠️ No onGenerate, using fallback');
        await siteGen.generateSite(finalJson, options);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleOptionChange = (key: string, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!canGenerateSite && !siteGen.isGenerating && !siteGen.isCompleted) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          🏗️ Site Generator
        </h3>
        
        {siteGen.isCompleted && (
          <button
            onClick={siteGen.reset}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Generation Options */}
      {canGenerateSite && !siteGen.isGenerating && !siteGen.isCompleted && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              🎉 พร้อมสร้างเว็บไซต์แล้ว! เลือกตัวเลือกการสร้าง:
            </p>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showOptions ? 'ซ่อนตัวเลือก' : 'แสดงตัวเลือก'}
            </button>
          </div>

          {showOptions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
              {/* Framework */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework
                </label>
                <select
                  value={options.framework}
                  onChange={(e) => handleOptionChange('framework', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="next">Next.js</option>
                  <option value="react">React</option>
                  <option value="vue">Vue.js</option>
                  <option value="svelte">Svelte</option>
                </select>
              </div>

              {/* Styling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Styling
                </label>
                <select
                  value={options.styling}
                  onChange={(e) => handleOptionChange('styling', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tailwind">Tailwind CSS</option>
                  <option value="css-modules">CSS Modules</option>
                  <option value="styled-components">Styled Components</option>
                  <option value="css">Plain CSS</option>
                </select>
              </div>

              {/* TypeScript */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="typescript"
                  checked={options.typescript}
                  onChange={(e) => handleOptionChange('typescript', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="typescript" className="text-sm text-gray-700">
                  ใช้ TypeScript
                </label>
              </div>

              {/* Include Auth */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeAuth"
                  checked={options.includeAuth}
                  onChange={(e) => handleOptionChange('includeAuth', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="includeAuth" className="text-sm text-gray-700">
                  รวม Authentication
                </label>
              </div>

              {/* Include DB */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeDB"
                  checked={options.includeDB}
                  onChange={(e) => handleOptionChange('includeDB', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="includeDB" className="text-sm text-gray-700">
                  รวม Database
                </label>
              </div>

              {/* Deployment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deployment
                </label>
                <select
                  value={options.deployment}
                  onChange={(e) => handleOptionChange('deployment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                  <option value="aws">AWS</option>
                  <option value="self-hosted">Self-hosted</option>
                </select>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!siteGen.isGenerating ? (
            <button
              onClick={handleGenerate}
              disabled={!canGenerateSite || siteGen.isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              🚀 สร้างเว็บไซต์
            </button>
          ) : (
            <div className="space-y-3">
              {/* Emergency Stop Button */}
              <button
                onClick={siteGen.emergencyStop}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 flex items-center justify-center"
              >
                🛑 หยุดการสร้างเว็บไซต์
              </button>
              
              {/* Progress Info */}
              <div className="text-center text-sm text-gray-600">
                กำลังสร้างเว็บไซต์... หากต้องการหยุดให้กดปุ่มด้านบน
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generation Progress */}
      {siteGen.isGenerating && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">กำลังสร้างเว็บไซต์...</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-600">{siteGen.progress}%</span>
              <button
                onClick={() => {
                  console.log('🚨 Emergency stop triggered');
                  siteGen.reset();
                }}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-300 rounded"
              >
                หยุด
              </button>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${siteGen.progress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600">{siteGen.currentTask}</p>
        </div>
      )}

      {/* Generation Error */}
      {siteGen.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">❌</span>
            <span className="text-red-700 font-medium">เกิดข้อผิดพลาด</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{siteGen.error}</p>
          
          <button
            onClick={() => handleGenerate()}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}

      {/* Generation Success */}
      {siteGen.isCompleted && siteGen.files.length > 0 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-green-700 font-medium">สร้างเว็บไซต์สำเร็จ!</span>
              </div>
              <span className="text-sm text-green-600">
                {siteGen.files.length} ไฟล์
              </span>
            </div>
            
            {siteGen.projectStructure && (
              <div className="mt-3 text-sm text-green-700">
                <p><strong>ชื่อโปรเจกต์:</strong> {siteGen.projectStructure.name}</p>
                <p><strong>Framework:</strong> {siteGen.projectStructure.framework}</p>
              </div>
            )}
          </div>

          {/* Advanced Preview System - Like Lovable.dev */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <AdvancedPreview
              files={siteGen.files}
              projectStructure={siteGen.projectStructure}
            />
          </div>

          {/* Classic Preview for Comparison */}
          <details className="bg-white border rounded-lg overflow-hidden">
            <summary className="p-4 cursor-pointer bg-gray-50 border-b hover:bg-gray-100">
              🔍 Classic File Explorer View
            </summary>
            <div style={{ height: '500px' }}>
              <PreviewLayout
                files={siteGen.files}
                projectStructure={siteGen.projectStructure}
                isGenerating={false}
              />
            </div>
          </details>

          {/* Download Button */}
          <button
            onClick={siteGen.downloadFiles}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            📥 ดาวน์โหลดไฟล์ทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
};

export default SiteGenerator;
