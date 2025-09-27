'use client';

import React, { useState } from 'react';
// import { template_slots_tool } from '@/midori/agents/frontend/tools/template-slots-tool';
import PreviewWindow from '../preview/PreviewWindow';

interface TemplateToolsIntegrationProps {
  sampleData?: any; // ข้อมูลจาก test.json หรือ test-cafe-complete.json
}

export default function TemplateToolsIntegration({ sampleData }: TemplateToolsIntegrationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewToken, setPreviewToken] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ฟังก์ชันประมวลผล template
  const processTemplate = async (templateType: 'cafe' | 'restaurant' = 'cafe') => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 เริ่มประมวลผล template...');

      // กำหนด template key ตามประเภท
      const templateKey = templateType === 'cafe' ? 'cafe-modern' : 'restaurant-basic';
      
      // สร้าง requirements จาก sample data
      const requirements = {
        businessName: sampleData?.projectStructure?.name || sampleData?.name || 'Café Delight',
        primaryColor: '#8B4513',
        title: 'กาแฟสดใหม่ทุกวัน',
        description: 'สัมผัสรสชาติกาแฟคุณภาพสูงจากเมล็ดคั่วสดใหม่'
      };

      // เรียกใช้ template_slots_tool (temporarily disabled)
      // const toolResult = await template_slots_tool({
      //   action: 'complete_flow',
      //   params: {
      //     templateKey,
      //     requirements,
      //     mockProfile: 'th-local-basic',
      //     exportFormat: 'json',
      //     fileName: `${templateType}-website`
      //   }
      // });

      // Temporarily mock the result
      const mockResult = {
        success: true,
        data: {
          templateKey,
          requirements,
          message: 'Template processing temporarily disabled'
        }
      };

      if (mockResult.success) {
        console.log('✅ Template processing สำเร็จ:', mockResult.data);
        setResult(mockResult.data);
        
        // สร้าง preview URL (จำลอง)
        const mockPreviewUrl = `https://preview.daytona.works/sandbox/${Date.now()}`;
        const mockToken = `token_${Math.random().toString(36).substr(2, 9)}`;
        
        setPreviewUrl(mockPreviewUrl);
        setPreviewToken(mockToken);
        
      } else {
        throw new Error('Template processing failed');
      }

    } catch (err) {
      console.error('❌ Template processing error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ฟังก์ชันเปิด preview
  const openPreview = () => {
    if (previewUrl && previewToken) {
      setIsPreviewOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🛠️ Template Tools + Preview System
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⚙️ Template Processing</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => processTemplate('cafe')}
              disabled={isProcessing}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? '⏳ กำลังประมวลผล...' : '☕ สร้าง Cafe Template'}
            </button>
            
            <button
              onClick={() => processTemplate('restaurant')}
              disabled={isProcessing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? '⏳ กำลังประมวลผล...' : '🍽️ สร้าง Restaurant Template'}
            </button>
          </div>

          {previewUrl && previewToken && (
            <button
              onClick={openPreview}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🖥️ เปิด Preview Window
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold">❌ เกิดข้อผิดพลาด:</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 ผลลัพธ์</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Info */}
              <div>
                <h3 className="font-semibold mb-2">🎯 Template Information</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>Template:</strong> {result.template?.key}</p>
                  <p><strong>Version:</strong> {result.template?.version}</p>
                  <p><strong>Status:</strong> {result.template?.status}</p>
                </div>
              </div>

              {/* Slots Summary */}
              <div>
                <h3 className="font-semibold mb-2">🔧 Slots Summary</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>Total Slots:</strong> {result.fillResult?.summary?.totalSlots}</p>
                  <p><strong>Filled Slots:</strong> {result.fillResult?.summary?.filledSlots}</p>
                  <p><strong>Mock Data Used:</strong> {result.fillResult?.summary?.mockedSlots}</p>
                </div>
              </div>
            </div>

            {/* Filled Slots Data */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">📝 Filled Slots Data</h3>
              <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
                <pre className="text-xs">
                  {JSON.stringify(result.fillResult?.filledSlots || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Export Info */}
            {result.exportResult && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">📦 Export Information</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>Download URL:</strong> {result.exportResult.downloadUrl}</p>
                  <p><strong>Files Generated:</strong> {result.exportResult.summary?.filesIncluded}</p>
                  <p><strong>Format:</strong> {result.exportResult.summary?.format}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sample Data Display */}
        {sampleData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📄 Sample Data</h2>
            <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
              <pre className="text-xs">
                {JSON.stringify(sampleData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Preview Window */}
      <PreviewWindow
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewUrl={previewUrl}
        previewToken={previewToken}
        sandboxId={`template-${Date.now()}`}
      />
    </div>
  );
}
