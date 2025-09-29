"use client"

import React, { useState, useEffect } from 'react';

interface TestResult {
  testName: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

export default function TemplateTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'found' | 'missing'>('checking');
  const [processedTemplateJson, setProcessedTemplateJson] = useState<any>(null);
  const [finalJson, setFinalJson] = useState<any>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonModalType, setJsonModalType] = useState<'processed' | 'final'>('processed');

  // ตรวจสอบ API Key
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/check-api-key');
        if (response.ok) {
          setApiKeyStatus('found');
        } else {
          setApiKeyStatus('missing');
        }
      } catch {
        setApiKeyStatus('missing');
      }
    };
    checkApiKey();
  }, []);

  // ฟังก์ชันแสดง JSON Modal
  const showJsonModalHandler = (type: 'processed' | 'final') => {
    setJsonModalType(type);
    setShowJsonModal(true);
  };

  // ฟังก์ชันดาวน์โหลด JSON
  const downloadJson = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ข้อมูลทดสอบถูกย้ายไปที่ API route แล้ว

  // ฟังก์ชัน runTest ถูกย้ายไปที่ API route แล้ว

  // ฟังก์ชันทดสอบถูกย้ายไปที่ API route แล้ว

  // รันการทดสอบทั้งหมดผ่าน API
  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('/api/template-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'all' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        
        // หา processed template และ finalJson จากผลลัพธ์
        const serverEngineResult = data.results.find((r: TestResult) => 
          r.testName === 'ServerTemplateEngine' && r.success
        );
        
        if (serverEngineResult?.result) {
          if (serverEngineResult.result.processedTemplate) {
            setProcessedTemplateJson(serverEngineResult.result.processedTemplate);
          }
          if (serverEngineResult.result.finalJson) {
            setFinalJson(serverEngineResult.result.finalJson);
          }
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error running tests:', error);
      setResults([{
        testName: 'API Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0
      }]);
    } finally {
      setLoading(false);
    }
  };

  // รันการทดสอบเฉพาะผ่าน API
  const runSingleTest = async (testName: string, testType: string) => {
    setLoading(true);
    setCurrentTest(testName);

    try {
      const response = await fetch('/api/template-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error running single test:', error);
      setResults([{
        testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0
      }]);
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Template System Test Suite
          </h1>
          <p className="text-gray-600 mb-8">
            ทดสอบระบบ Template System ครบทุกส่วน
          </p>

          {/* API Key Status */}
          <div className="mb-8 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">API Key Status</h2>
            <div className="flex items-center gap-2">
              {apiKeyStatus === 'checking' && (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-600">กำลังตรวจสอบ...</span>
                </>
              )}
              {apiKeyStatus === 'found' && (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">✅ QUESTION_API_KEY พบแล้ว</span>
                </>
              )}
              {apiKeyStatus === 'missing' && (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-600">❌ QUESTION_API_KEY ไม่พบ</span>
                </>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">การทดสอบ</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={runAllTests}
                disabled={loading || apiKeyStatus === 'missing'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังทดสอบ...' : '🧪 รันการทดสอบทั้งหมด'}
              </button>
              
              {/* ปุ่มแสดง JSON */}
              {processedTemplateJson && (
                <button
                  onClick={() => showJsonModalHandler('processed')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  📄 แสดง Processed Template JSON
                </button>
              )}
              
              {finalJson && (
                <button
                  onClick={() => showJsonModalHandler('final')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  🎯 แสดง Final JSON
                </button>
              )}
              
              <button
                onClick={() => runSingleTest('AI Content Generator', 'ai-content')}
                disabled={loading || apiKeyStatus === 'missing'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                🤖 ทดสอบ AI Content
              </button>
              
              <button
                onClick={() => runSingleTest('Tailwind AI', 'tailwind-ai')}
                disabled={loading || apiKeyStatus === 'missing'}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                🎨 ทดสอบ Tailwind AI
              </button>
              
              <button
                onClick={() => runSingleTest('PlaceholderReplacer', 'placeholder-replacer')}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                🔄 ทดสอบ PlaceholderReplacer
              </button>
            </div>
          </div>

          {/* Current Test */}
          {currentTest && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 font-medium">กำลังทดสอบ: {currentTest}</span>
              </div>
            </div>
          )}

          {/* Test Results */}
          {results.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">ผลการทดสอบ</h2>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {result.success ? '✅' : '❌'} {result.testName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {result.duration}ms
                      </span>
                    </div>
                    
                    {result.success && result.result && (
                      <div className="mt-2">
                        <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {!result.success && result.error && (
                      <div className="mt-2 text-red-600 text-sm">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Summary */}
          {results.length > 0 && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">สรุปผลการทดสอบ</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">
                    ✅ ผ่าน: {results.filter(r => r.success).length}
                  </span>
                </div>
                <div>
                  <span className="text-red-600 font-medium">
                    ❌ ล้มเหลว: {results.filter(r => !r.success).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    ⏱️ เวลาเฉลี่ย: {Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    📊 อัตราความสำเร็จ: {Math.round((results.filter(r => r.success).length / results.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Test Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">ข้อมูลการทดสอบ</h3>
            <div className="text-sm text-gray-600">
              <p>• การทดสอบทั้งหมดจะรันผ่าน API route ที่ server-side</p>
              <p>• ใช้ข้อมูลทดสอบร้านกาแฟ (Coffee Shop Template)</p>
              <p>• ทดสอบ AI Content Generation, Placeholder Replacement, และ Template Processing</p>
              <p>• รองรับทั้ง server-side และ client-side operations</p>
              <p>• สามารถดูและดาวน์โหลด JSON ที่ถูกประมวลผลแล้วได้</p>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {jsonModalType === 'processed' ? '📄 Processed Template JSON' : '🎯 Final JSON'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadJson(
                    jsonModalType === 'processed' ? processedTemplateJson : finalJson,
                    jsonModalType === 'processed' ? 'processed-template.json' : 'final-json.json'
                  )}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  💾 ดาวน์โหลด
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  ✕ ปิด
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-sm bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(
                  jsonModalType === 'processed' ? processedTemplateJson : finalJson,
                  null,
                  2
                )}
              </pre>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <p><strong>ข้อมูล:</strong> {jsonModalType === 'processed' ? 'Template ที่ถูกประมวลผลแล้ว' : 'Final JSON ที่รวม options เข้าด้วยกัน'}</p>
                <p><strong>ขนาด:</strong> {JSON.stringify(jsonModalType === 'processed' ? processedTemplateJson : finalJson).length} ตัวอักษร</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
