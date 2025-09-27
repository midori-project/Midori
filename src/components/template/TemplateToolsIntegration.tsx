'use client';

import React, { useState } from 'react';
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
      console.log('🚀 [STEP 1] เริ่มประมวลผล template...');
      console.log('📋 [STEP 1] Template type:', templateType);
      console.log('📋 [STEP 1] Sample data:', sampleData);

      // กำหนด template key ตามประเภท
      const templateKey = templateType === 'cafe' ? 'cafe-modern' : 'restaurant-basic';
      console.log('🔑 [STEP 1] Template key:', templateKey);
      
      // สร้าง requirements จาก sample data
      const requirements = {
        businessName: sampleData?.projectStructure?.name || sampleData?.name || 'Café Delight',
        primaryColor: '#8B4513',
        title: 'กาแฟสดใหม่ทุกวัน',
        description: 'สัมผัสรสชาติกาแฟคุณภาพสูงจากเมล็ดคั่วสดใหม่'
      };
      console.log('📝 [STEP 1] Requirements:', requirements);

      console.log('🔄 [STEP 2] เรียกใช้ Chat API สำหรับ template processing...');
      
      // เรียกใช้ Chat API แทน template_slots_tool
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `สร้างเว็บไซต์ ${templateType} โดยใช้ template ${templateKey} ตามข้อมูลนี้: ${JSON.stringify(requirements)}`,
          userId: 'template-user',
          sessionId: `template-session-${Date.now()}`,
          context: {
            templateType,
            templateKey,
            requirements,
            sampleData
          }
        })
      });

      console.log('📡 [STEP 2] Chat API response status:', chatResponse.status);

      if (!chatResponse.ok) {
        throw new Error(`Chat API failed: ${chatResponse.status} ${chatResponse.statusText}`);
      }

      const chatResult = await chatResponse.json();
      console.log('📄 [STEP 2] Chat API result:', chatResult);

      // ตรวจสอบว่ามีไฟล์ที่สร้างขึ้นหรือไม่
      if (chatResult.taskResults && chatResult.taskResults.length > 0) {
        console.log('📁 [STEP 3] พบไฟล์ที่สร้างขึ้น:', chatResult.taskResults.length, 'files');
        
        // รวบรวมไฟล์ทั้งหมดจาก taskResults
        const allFiles = [];
        for (const taskResult of chatResult.taskResults) {
          if (taskResult.files && Array.isArray(taskResult.files)) {
            allFiles.push(...taskResult.files);
            console.log('📁 [STEP 3] เพิ่มไฟล์จาก task:', taskResult.files.length, 'files');
          }
        }

        console.log('📁 [STEP 3] ไฟล์ทั้งหมด:', allFiles.length, 'files');
        console.log('📁 [STEP 3] รายละเอียดไฟล์:', allFiles.map(f => ({ path: f.path, contentLength: f.content?.length || 0 })));

        if (allFiles.length > 0) {
          console.log('🚀 [STEP 4] ส่งไฟล์ไปยัง Daytona Preview API...');
          
          // ส่งไฟล์ไปยัง Daytona Preview API
          const previewResponse = await fetch('/api/preview/daytona', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              files: allFiles,
              projectId: `template-${templateType}-${Date.now()}`
            })
          });

          console.log('📡 [STEP 4] Daytona API response status:', previewResponse.status);

          if (!previewResponse.ok) {
            const errorData = await previewResponse.json();
            console.error('❌ [STEP 4] Daytona API error:', errorData);
            throw new Error(`Daytona API failed: ${errorData.error || previewResponse.statusText}`);
          }

          const previewResult = await previewResponse.json();
          console.log('✅ [STEP 4] Daytona API result:', previewResult);

          // ตั้งค่า preview URL และ token
          if (previewResult.url && previewResult.token) {
            setPreviewUrl(previewResult.url);
            setPreviewToken(previewResult.token);
            console.log('🌐 [STEP 4] Preview URL set:', previewResult.url);
            console.log('🔑 [STEP 4] Preview token set:', previewResult.token ? 'YES' : 'NO');
          } else {
            console.warn('⚠️ [STEP 4] ไม่พบ preview URL หรือ token');
          }

          setResult({
            templateKey,
            requirements,
            files: allFiles,
            previewUrl: previewResult.url,
            previewToken: previewResult.token,
            message: 'Template processing สำเร็จและสร้าง preview แล้ว'
          });

          console.log('✅ [COMPLETE] Template processing สำเร็จทั้งหมด!');
        } else {
          throw new Error('ไม่พบไฟล์ที่สร้างขึ้น');
        }
      } else {
        console.log('📄 [STEP 2] ไม่พบ taskResults, ใช้ข้อมูลจาก chat response');
        setResult({
          templateKey,
          requirements,
          chatResponse: chatResult,
          message: 'Template processing สำเร็จ (ไม่มีไฟล์)'
        });
      }

    } catch (err) {
      console.error('❌ [ERROR] Template processing error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
      console.log('🏁 [FINISH] Template processing เสร็จสิ้น');
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
