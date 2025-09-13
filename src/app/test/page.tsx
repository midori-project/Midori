'use client';

import React, { useState } from 'react';
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview';
import testCafeData from '@/components/preview/test/test-cafe.json';
import PreviewWindow from '@/components/preview/PreviewWindow';

export default function DaytonaTestPage() {
  const [testProjectId] = useState('test-cafe-project');
  const [testUserId] = useState('test-user-123');
  const [isPreviewWindowOpen, setIsPreviewWindowOpen] = useState(false);
  
  const {
    sandboxState,
    isStarting,
    isStopping,
    startPreview,
    stopPreview,
  } = useDaytonaPreview(testProjectId, testUserId);

  const handleStartTest = async () => {
    console.log('เริ่มทดสอบ Daytona ด้วยข้อมูล:', testCafeData);
    await startPreview(testCafeData);
  };

  const handleStopTest = async () => {
    await stopPreview();
  };

  const handleOpenPreviewWindow = () => {
    setIsPreviewWindowOpen(true);
  };

  const handleClosePreviewWindow = () => {
    setIsPreviewWindowOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-gray-500';
      case 'creating': return 'text-blue-500';
      case 'building': return 'text-yellow-500';
      case 'running': return 'text-green-500';
      case 'stopping': return 'text-orange-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'พร้อมใช้งาน';
      case 'creating': return 'กำลังสร้าง Sandbox...';
      case 'building': return 'กำลัง Build โปรเจ็ค...';
      case 'running': return 'กำลังรัน';
      case 'stopping': return 'กำลังหยุด...';
      case 'error': return 'เกิดข้อผิดพลาด';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🧪 ทดสอบ Daytona Preview
          </h1>
          <p className="text-gray-600 mb-6">
            หน้านี้ใช้สำหรับทดสอบการสร้างโปรเจ็คบน Daytona โดยใช้ข้อมูลจาก test-cafe.json
          </p>
          
          {/* ข้อมูลโปรเจ็คทดสอบ */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              📋 ข้อมูลโปรเจ็คทดสอบ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Project ID:</span> {testProjectId}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {testUserId}
              </div>
              <div>
                <span className="font-medium">จำนวนไฟล์:</span> {testCafeData.files.length} ไฟล์
              </div>
              <div>
                <span className="font-medium">ประเภท:</span> Food Delivery & Table Reservation
              </div>
            </div>
          </div>

          {/* สถานะปัจจุบัน */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              📊 สถานะปัจจุบัน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">สถานะ:</span>
                <span className={`ml-2 ${getStatusColor(sandboxState.status)}`}>
                  {getStatusText(sandboxState.status)}
                </span>
              </div>
              {sandboxState.sandboxId && (
                <div>
                  <span className="font-medium">Sandbox ID:</span>
                  <span className="ml-2 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {sandboxState.sandboxId}
                  </span>
                </div>
              )}
              {sandboxState.previewUrl && (
                <div>
                  <span className="font-medium">Preview URL:</span>
                  <a 
                    href={sandboxState.previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:underline"
                    onClick={(e) => {
                      // ตรวจสอบว่า URL สามารถเข้าถึงได้หรือไม่
                      console.log('Opening preview URL:', sandboxState.previewUrl);
                      console.log('Preview Token:', sandboxState.previewToken);
                    }}
                  >
                    เปิดในแท็บใหม่
                  </a>
                </div>
              )}
              {sandboxState.previewToken && (
                <div>
                  <span className="font-medium">Preview Token:</span>
                  <span className="ml-2 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {sandboxState.previewToken}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ปุ่มควบคุม */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleStartTest}
              disabled={isStarting || sandboxState.status !== 'idle'}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isStarting || sandboxState.status !== 'idle'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isStarting ? 'กำลังเริ่ม...' : '🚀 เริ่มทดสอบ'}
            </button>

            <button
              onClick={handleStopTest}
              disabled={isStopping || sandboxState.status === 'idle'}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isStopping || sandboxState.status === 'idle'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isStopping ? 'กำลังหยุด...' : '⏹️ หยุดทดสอบ'}
            </button>

            <button
              onClick={handleOpenPreviewWindow}
              disabled={!sandboxState.previewUrl || sandboxState.status !== 'running'}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !sandboxState.previewUrl || sandboxState.status !== 'running'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              🖥️ เปิด Preview
            </button>
          </div>

          {/* แสดงข้อผิดพลาด */}
          {sandboxState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ❌ ข้อผิดพลาด
              </h3>
              <p className="text-red-700">{sandboxState.error}</p>
            </div>
          )}

          {/* แสดงข้อมูลการเข้าถึง Preview */}
          {sandboxState.previewUrl && sandboxState.previewToken && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                🔗 การเข้าถึง Preview
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-green-700">URL:</span>
                  <div className="mt-1 p-2 bg-white border rounded font-mono text-sm">
                    {sandboxState.previewUrl}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-green-700">Token:</span>
                  <div className="mt-1 p-2 bg-white border rounded font-mono text-sm">
                    {sandboxState.previewToken}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-medium text-blue-800 mb-2">วิธีเข้าถึงด้วย curl:</h4>
                  <div className="font-mono text-sm text-blue-700">
                    <div>curl -H "x-daytona-preview-token: {sandboxState.previewToken}" \</div>
                    <div className="ml-4">{sandboxState.previewUrl}</div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <h4 className="font-medium text-yellow-800 mb-2">หมายเหตุ:</h4>
                  <div className="text-sm text-yellow-700">
                    <p>• หากได้ HTTP 502 Error แสดงว่า dev server ยังไม่พร้อม</p>
                    <p>• รอให้สถานะเป็น "running" ก่อนคลิกลิงค์</p>
                    <p>• ครั้งแรกอาจจะแสดง warning page</p>
                    <p>• การสร้าง sandbox อาจใช้เวลาถึง 2-3 นาที</p>
                    <p>• ตรวจสอบ console logs สำหรับข้อมูลการ debug</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* แสดง Logs */}
          {sandboxState.logs && sandboxState.logs.length > 0 && (
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                📝 Logs
              </h3>
              <div className="font-mono text-sm space-y-1">
                {sandboxState.logs.map((log, index) => (
                  <div key={index} className="flex">
                    <span className="text-gray-500 mr-2">
                      [{new Date().toLocaleTimeString()}]
                    </span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* แสดงสถานะการทำงาน */}
          {sandboxState.status === 'building' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⏳ กำลังสร้าง Sandbox
              </h3>
              <div className="text-sm text-yellow-700">
                <p>• กำลังสร้างไฟล์โปรเจ็ค...</p>
                <p>• กำลังติดตั้ง dependencies...</p>
                <p>• กำลัง build โปรเจ็ค...</p>
                <p>• กำลังเริ่ม dev server...</p>
                <p>• กำลังตรวจสอบ port 3000...</p>
                <p>• กำลังดึง preview URL...</p>
                <p className="mt-2 font-medium">กรุณารอสักครู่... (อาจใช้เวลาถึง 2-3 นาที)</p>
              </div>
            </div>
          )}

          {sandboxState.status === 'running' && sandboxState.previewUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Sandbox พร้อมใช้งาน
              </h3>
              <div className="text-sm text-green-700">
                <p>• Dev server กำลังรันอยู่</p>
                <p>• Preview URL พร้อมใช้งาน</p>
                <p>• สามารถคลิกลิงค์เพื่อเข้าถึงแอปได้</p>
              </div>
            </div>
          )}

          {/* ข้อมูลการใช้งาน */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ⏱️ การใช้งานวันนี้
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ใช้ไปแล้ว:</span>
                <span className="ml-2">
                  {Math.floor((sandboxState.usageToday || 0) / 60)} นาที
                </span>
              </div>
              <div>
                <span className="font-medium">โควตาสูงสุด:</span>
                <span className="ml-2">
                  {Math.floor((sandboxState.maxUsagePerDay || 3600) / 60)} นาที/วัน
                </span>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      ((sandboxState.usageToday || 0) / (sandboxState.maxUsagePerDay || 3600)) * 100,
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ข้อมูลไฟล์ในโปรเจ็ค */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📁 ไฟล์ในโปรเจ็คทดสอบ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testCafeData.files.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {file.type}
                  </span>
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    {file.language}
                  </span>
                </div>
                <div className="font-mono text-sm text-gray-800 mb-2">
                  {file.path}
                </div>
                <div className="text-xs text-gray-500">
                  {file.content.length} ตัวอักษร
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Window */}
      <PreviewWindow
        isOpen={isPreviewWindowOpen}
        onClose={handleClosePreviewWindow}
        previewUrl={sandboxState.previewUrl}
        previewToken={sandboxState.previewToken}
        sandboxId={sandboxState.sandboxId}
      />
    </div>
  );
}
