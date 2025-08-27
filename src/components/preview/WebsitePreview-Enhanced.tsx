'use client';

import React, { useState, useEffect } from 'react';
import { GeneratedFile } from '@/types/sitegen';

interface WebsitePreviewProps {
  files: GeneratedFile[];
  projectStructure: any;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  files,
  projectStructure
}) => {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Device viewport sizes
  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  // Generate enhanced fallback HTML with realistic content
  const generateEnhancedFallbackHTML = (projectStructure: any, files: GeneratedFile[]): string => {
    const componentName = projectStructure?.name || 'Generated Website';
    const hasThaiContent = files.some(f => f.content.includes('ไทย') || f.content.includes('Thailand'));
    
    return `
      <div style="min-height: 100vh; background: ${hasThaiContent ? 
        'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' : 
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };">
        <header style="background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 24px 0;">
          <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
            <h1 style="font-size: 48px; font-weight: bold; color: #1f2937; margin-bottom: 16px; text-align: center;">
              ${hasThaiContent ? '🇹🇭 ' : '🚀 '}${componentName}
            </h1>
            <nav style="text-align: center;">
              <ul style="display: flex; gap: 32px; list-style: none; margin: 0; padding: 0; justify-content: center;">
                <li><a href="#" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 18px;">Home</a></li>
                <li><a href="#" style="color: #6b7280; text-decoration: none; font-weight: 600; font-size: 18px;">About</a></li>
                <li><a href="#" style="color: #6b7280; text-decoration: none; font-weight: 600; font-size: 18px;">Services</a></li>
                <li><a href="#" style="color: #6b7280; text-decoration: none; font-weight: 600; font-size: 18px;">Contact</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main style="max-width: 1200px; margin: 0 auto; padding: 80px 16px;">
          <section style="text-align: center; margin-bottom: 80px;">
            <h2 style="font-size: 64px; font-weight: bold; color: white; margin-bottom: 32px; line-height: 1.1; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ${hasThaiContent ? 'สวัสดี' : 'Welcome'}<br>
              <span style="color: #fbbf24;">
                ${hasThaiContent ? 'ยินดีต้อนรับ' : 'to the Future'}
              </span>
            </h2>
            <p style="font-size: 24px; color: rgba(255,255,255,0.9); max-width: 800px; margin: 0 auto 48px; line-height: 1.6;">
              ${hasThaiContent ? 
                'เว็บไซต์ที่สร้างด้วยเทคโนโลยี AI ล้ำสมัย พร้อมการออกแบบที่สวยงามและทันสมัย' :
                'Experience the power of AI-generated websites with beautiful design and modern functionality.'
              }
            </p>
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
              <button style="background: linear-gradient(45deg, #2563eb, #3b82f6); color: white; padding: 16px 32px; border-radius: 12px; font-size: 18px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); transition: all 0.3s;">
                ${hasThaiContent ? '🚀 เริ่มต้นใช้งาน' : '🚀 Get Started'}
              </button>
              <button style="background: rgba(255,255,255,0.2); color: white; padding: 16px 32px; border-radius: 12px; font-size: 18px; font-weight: 600; border: 2px solid rgba(255,255,255,0.3); cursor: pointer; backdrop-filter: blur(10px); transition: all 0.3s;">
                ${hasThaiContent ? '📖 เรียนรู้เพิ่มเติม' : '📖 Learn More'}
              </button>
            </div>
          </section>
          
          <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 32px; margin-bottom: 80px;">
            ${generateSampleFeatureCards(hasThaiContent)}
          </section>
          
          <section style="background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 24px; padding: 64px 32px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);">
            <h3 style="font-size: 36px; font-weight: bold; color: #111827; margin-bottom: 24px;">
              ${hasThaiContent ? '🎨 ออกแบบด้วย AI' : '🎨 AI-Powered Design'}
            </h3>
            <p style="font-size: 18px; color: #6b7280; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto;">
              ${hasThaiContent ? 
                'สร้างสรรค์เว็บไซต์ที่สวยงามด้วยปัญญาประดิษฐ์ ไม่ต้องเขียนโค้ด' :
                'Create beautiful websites with artificial intelligence. No coding required.'
              }
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; max-width: 800px; margin: 0 auto;">
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚡</div>
                <h4 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">
                  ${hasThaiContent ? 'รวดเร็ว' : 'Lightning Fast'}
                </h4>
                <p style="font-size: 14px; color: #6b7280;">
                  ${hasThaiContent ? 'สร้างเว็บใน 5 วินาที' : 'Build in 5 seconds'}
                </p>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎨</div>
                <h4 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">
                  ${hasThaiContent ? 'สวยงาม' : 'Beautiful'}
                </h4>
                <p style="font-size: 14px; color: #6b7280;">
                  ${hasThaiContent ? 'ดีไซน์ทันสมัย' : 'Modern design'}
                </p>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
                <h4 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">
                  ${hasThaiContent ? 'ปรับแต่งได้' : 'Customizable'}
                </h4>
                <p style="font-size: 14px; color: #6b7280;">
                  ${hasThaiContent ? 'แก้ไขง่าย' : 'Easy to modify'}
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <footer style="background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); color: white; padding: 64px 0 32px;">
          <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px; text-align: center;">
            <h3 style="font-size: 28px; font-weight: bold; margin-bottom: 16px;">✨ ${componentName}</h3>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 32px; font-size: 16px;">
              ${hasThaiContent ? 
                'สร้างด้วยเทคโนโลยี AI จาก Midori Winter' :
                'Created with AI technology by Midori Winter'
              }
            </p>
            <div style="display: flex; justify-content: center; gap: 32px; margin-bottom: 24px;">
              <a href="#" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 16px; transition: color 0.3s;">${hasThaiContent ? 'เกี่ยวกับเรา' : 'About'}</a>
              <a href="#" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 16px; transition: color 0.3s;">${hasThaiContent ? 'ความเป็นส่วนตัว' : 'Privacy'}</a>
              <a href="#" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 16px; transition: color 0.3s;">${hasThaiContent ? 'เงื่อนไข' : 'Terms'}</a>
              <a href="#" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 16px; transition: color 0.3s;">${hasThaiContent ? 'ติดต่อ' : 'Contact'}</a>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 24px; color: rgba(255,255,255,0.6); font-size: 14px;">
              © 2025 ${componentName}. ${hasThaiContent ? 'สงวนลิขสิทธิ์' : 'All rights reserved.'} | Powered by 🤖 Midori AI
            </div>
          </div>
        </footer>
      </div>
    `;
  };

  // Generate sample feature cards
  const generateSampleFeatureCards = (hasThaiContent: boolean): string => {
    const features = hasThaiContent ? [
      { icon: '🚀', title: 'เทคโนโลยีล้ำสมัย', desc: 'ใช้เทคโนโลยี AI และ Machine Learning ล่าสุด' },
      { icon: '🎨', title: 'ดีไซน์สวยงาม', desc: 'การออกแบบที่ทันสมัยและใช้งานง่าย' },
      { icon: '⚡', title: 'ประสิทธิภาพสูง', desc: 'โหลดเร็ว ทำงานเสถียร รองรับผู้ใช้จำนวนมาก' },
    ] : [
      { icon: '🚀', title: 'Advanced Technology', desc: 'Built with cutting-edge AI and Machine Learning' },
      { icon: '🎨', title: 'Beautiful Design', desc: 'Modern, intuitive, and user-friendly interface' },
      { icon: '⚡', title: 'High Performance', desc: 'Fast loading, stable, and scalable architecture' },
    ];

    return features.map(feature => `
      <div style="background: rgba(255,255,255,0.95); padding: 40px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.5);">
        <div style="width: 64px; height: 64px; background: linear-gradient(45deg, #dbeafe, #bfdbfe); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-size: 28px;">
          ${feature.icon}
        </div>
        <h3 style="font-size: 22px; font-weight: bold; color: #111827; margin-bottom: 16px; line-height: 1.3;">${feature.title}</h3>
        <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">${feature.desc}</p>
      </div>
    `).join('');
  };

  // Simple JSX to HTML conversion
  const convertJSXToHTML = (jsxContent: string): string => {
    try {
      // Try to extract JSX content from React component
      const jsxMatch = jsxContent.match(/return\s*\(\s*([\s\S]*?)\s*\);?/);
      if (jsxMatch) {
        let jsx = jsxMatch[1];
        
        // Basic JSX to HTML conversion
        jsx = jsx
          .replace(/className=/g, 'class=')
          .replace(/\{[^}]*\}/g, (match) => {
            if (match.includes('map(')) return '[List Items]';
            if (match.includes('?')) return 'Sample Content';
            return 'Dynamic Content';
          });
        
        return jsx;
      }
      
      return generateEnhancedFallbackHTML(projectStructure, files);
    } catch (error) {
      console.error('JSX conversion error:', error);
      return generateEnhancedFallbackHTML(projectStructure, files);
    }
  };

  // Generate preview HTML from files
  useEffect(() => {
    const generatePreview = async () => {
      if (files.length === 0) return;
      
      setLoading(true);
      setError(null);

      try {
        console.log('🚀 Generating preview for', files.length, 'files');
        
        // Find main page file
        let mainPage = files.find(f => 
          f.path.includes('page.tsx') && !f.path.includes('layout')
        ) || files.find(f => f.type === 'page') || files[0];

        // Basic HTML structure
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectStructure?.name || 'Generated Website'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body>`;

        // Generate main content
        if (mainPage && mainPage.content.includes('return') && mainPage.content.includes('<')) {
          const convertedContent = convertJSXToHTML(mainPage.content);
          html += `\n<div>${convertedContent}</div>`;
        } else {
          html += generateEnhancedFallbackHTML(projectStructure, files);
        }

        html += `\n</body>\n</html>`;

        setPreviewHtml(html);
      } catch (err) {
        console.error('Preview generation error:', err);
        setError('เกิดข้อผิดพลาดในการสร้าง preview');
      } finally {
        setLoading(false);
      }
    };

    generatePreview();
  }, [files, projectStructure]);

  const devices = [
    { id: 'desktop' as const, label: '🖥️ Desktop', icon: '💻' },
    { id: 'tablet' as const, label: '📱 Tablet', icon: '📱' },
    { id: 'mobile' as const, label: '📱 Mobile', icon: '📱' }
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังสร้าง preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ไม่สามารถแสดง Preview ได้
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Device Selector */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">🌐 Website Preview</h3>
            <span className="text-sm text-gray-500">
              • {projectStructure?.name || 'Generated Website'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => setActiveDevice(device.id)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all
                  flex items-center space-x-2
                  ${activeDevice === device.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <span>{device.icon}</span>
                <span className="hidden sm:inline">{device.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="h-full flex items-center justify-center">
          <div 
            className="bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300"
            style={{
              width: deviceSizes[activeDevice].width,
              height: activeDevice === 'desktop' ? '600px' : deviceSizes[activeDevice].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            {/* Browser-like Header */}
            <div className="bg-gray-200 px-4 py-2 flex items-center space-x-2 border-b">
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                🌐 localhost:3000
              </div>
              <div className="text-xs text-gray-500">
                {activeDevice}
              </div>
            </div>

            {/* Website Content */}
            <div className="h-full overflow-auto">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-none"
                title="Website Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>📊 {files.length} files generated</span>
            <span>⚡ Framework: {projectStructure?.framework || 'Next.js'}</span>
            <span>🎨 Styling: Tailwind CSS</span>
          </div>
          <div>
            💡 Enhanced AI-powered preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsitePreview;
