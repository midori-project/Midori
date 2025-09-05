'use client';

import React, { useState } from 'react';

interface GenerateSiteButtonProps {
  projectId: string;
  promptJson: Record<string, unknown>;
}

export default function GenerateSiteButton({ projectId, promptJson }: GenerateSiteButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  console.log(result)
  const handleGenerateSite = async () => {
    if (!promptJson) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      setResult(null);
      
      console.log('🚀 Starting site generation...');
      console.log('📋 Sending promptJson:', promptJson);
      
      // ส่ง promptJson ไปยัง API gensite
      const response = await fetch('/api/gensite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          finalJson: promptJson,  // ส่ง promptJson เป็น finalJson
          projectId: projectId,   // ส่ง projectId ด้วย
          options: {
            framework: 'react',
            styling: 'tailwind',
            typescript: true,
            features: (promptJson as any).features || [],
            pages: (promptJson as any).content?.pages || []
          }
        })
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Site generation successful:', data);
        setResult(data.data);
        
        // เก็บข้อมูลใน localStorage สำหรับ SitePreview
        const previewData = {
          files: data.data.files,
          projectStructure: data.data.projectStructure,
          fileCount: data.data.fileCount,
          generatedAt: new Date().toISOString()
        };
        localStorage.setItem(`preview_${projectId}`, JSON.stringify(previewData));
        
        // แสดงผลสำเร็จ
        alert(`🎉 สร้างเว็บไซต์สำเร็จ!\n📁 สร้างไฟล์ทั้งหมด: ${data.data.fileCount} ไฟล์\n🏗️ โครงสร้าง: ${data.data.projectStructure.name}\n\n✨ พรีวิวจะแสดงด้านล่างอัตโนมัติ`);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการสร้างเว็บไซต์');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ปุ่มสร้างเว็บไซต์ */}
      <button
        onClick={handleGenerateSite}
        disabled={isGenerating || !promptJson}
        className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isGenerating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg'
          }
        `}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            กำลังสร้างเว็บไซต์...
          </>
        ) : (
          <>
            🚀 สร้างเว็บไซต์และดูพรีวิว
          </>
        )}
      </button>

      {/* แสดงข้อผิดพลาด */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-500">❌</span>
            <span className="text-red-700 font-medium">เกิดข้อผิดพลาด</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-sm mt-2"
          >
            ปิด
          </button>
        </div>
      )}

      {/* แสดงผลลัพธ์ */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-500">✅</span>
            <span className="text-green-700 font-medium">สร้างเว็บไซต์สำเร็จ!</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">จำนวนไฟล์:</span>
              <span className="font-medium">{result.fileCount} ไฟล์</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ชื่อโปรเจค:</span>
              <span className="font-medium">{result.projectStructure.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Framework:</span>
              <span className="font-medium">{result.projectStructure.framework}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                // TODO: เพิ่มการนำทางไปหน้าพรีวิว
                console.log('Navigate to preview page');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              📱 ดูพรีวิว
            </button>
            <button
              onClick={() => {
                // TODO: เพิ่มการดาวน์โหลดไฟล์
                console.log('Download files');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              💾 ดาวน์โหลด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
