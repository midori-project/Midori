"use client";

import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, RefreshCw, Code, Eye, Settings } from 'lucide-react';

interface ProjectPreviewProps {
  projectId: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const ProjectPreview: React.FC<ProjectPreviewProps> = ({ projectId }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');

  // Mock preview content - ในอนาคตจะดึงจาก API
  useEffect(() => {
    const mockContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project ${projectId}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 1.2rem;
            opacity: 0.9;
          }
          .content {
            padding: 40px;
          }
          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-top: 30px;
          }
          .feature-card {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            transition: transform 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-5px);
          }
          .feature-icon {
            font-size: 3rem;
            margin-bottom: 20px;
          }
          .feature-card h3 {
            margin: 0 0 15px 0;
            color: #333;
          }
          .feature-card p {
            margin: 0;
            color: #666;
            line-height: 1.6;
          }
          .cta-section {
            background: #f8f9fa;
            padding: 40px;
            text-align: center;
            margin-top: 40px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.3s ease;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎭 Midori AI Project</h1>
            <p>สร้างด้วย AI Assistant อย่าง Midori</p>
          </div>
          <div class="content">
            <h2>ยินดีต้อนรับสู่โปรเจค ${projectId}</h2>
            <p>นี่คือตัวอย่างการแสดงผลของเว็บไซต์ที่สร้างขึ้นด้วย Midori AI</p>
            
            <div class="feature-grid">
              <div class="feature-card">
                <div class="feature-icon">🚀</div>
                <h3>Fast Development</h3>
                <p>พัฒนาเว็บไซต์ได้อย่างรวดเร็วด้วย AI Assistant</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🎨</div>
                <h3>Beautiful Design</h3>
                <p>ออกแบบที่สวยงามและทันสมัย</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3>High Performance</h3>
                <p>ประสิทธิภาพสูงและโหลดเร็ว</p>
              </div>
            </div>
            
            <div class="cta-section">
              <h3>พร้อมเริ่มต้นแล้วหรือยัง?</h3>
              <p>ลองแชทกับ Midori AI เพื่อสร้างเว็บไซต์ของคุณ</p>
              <a href="#" class="btn">เริ่มสร้างเลย</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    setPreviewContent(mockContent);
  }, [projectId]);

  const getDeviceWidth = () => {
    switch (deviceType) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
              <p className="text-sm text-gray-500">Previewing last saved version</p>
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
              <span>Code</span>
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
                <p className="text-gray-600">กำลังโหลด...</p>
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
                  srcDoc={previewContent}
                  className="w-full h-full border-0"
                  title="Project Preview"
                  sandbox="allow-scripts allow-same-origin"
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
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Live
            </span>
            <span>Last updated: {new Date().toLocaleTimeString('th-TH')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;
