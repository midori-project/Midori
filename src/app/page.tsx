'use client';
import { useState } from 'react';
import { InfoGatheringForm } from '@/components/InfoGatheringForm/InfoGatheringForm';
import { FinalOutput } from '@/types/openaiQuestion/route';

export default function Home() {
  const [result, setResult] = useState<FinalOutput | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleComplete = (result: FinalOutput) => {
    console.log('ผลลัพธ์สุดท้าย:', result);
    setResult(result);
    setShowResult(true);
  };

  const handleReset = () => {
    setResult(null);
    setShowResult(false);
  };

  const downloadResult = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'midori-website-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Midori - สร้างเว็บไซต์ด้วย AI
            </h1>
            <p className="text-lg text-gray-600">
              บอกความต้องการของคุณ แล้วให้ AI ช่วยสร้างเว็บไซต์ที่สมบูรณ์แบบ
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">สร้างเว็บไซต์</h2>
                {showResult && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    เริ่มใหม่
                  </button>
                )}
              </div>
              <InfoGatheringForm onComplete={handleComplete} />
            </div>

            {/* Result Section */}
            {showResult && result && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">ผลลัพธ์จาก AI</h2>
                  <button
                    onClick={downloadResult}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ดาวน์โหลด JSON
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Website Configuration */}
                  {result.json && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-3">การตั้งค่าเว็บไซต์</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>ชื่อ:</strong> {result.json.name}</div>
                        <div><strong>ประเภท:</strong> {result.json.type}</div>
                        <div><strong>ฟีเจอร์:</strong> {result.json.features?.join(', ')}</div>
                        {result.json.design && (
                          <div>
                            <strong>การออกแบบ:</strong> {result.json.design.theme} - {result.json.design.colorScheme}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {result.summary && (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-3">สรุปความต้องการ</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {result.summary.requirements?.map((req, index) => (
                            <li key={index} className="text-green-700">{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-3">ข้อเสนอแนะ</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {result.summary.recommendations?.map((rec, index) => (
                            <li key={index} className="text-yellow-700">{rec}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">เวลาที่ประมาณการ</h4>
                          <p className="text-purple-700 text-sm">{result.summary.estimatedTime}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">ต้นทุนที่ประมาณการ</h4>
                          <p className="text-red-700 text-sm">{result.summary.estimatedCost}</p>
                        </div>
                      </div>

                      {result.summary.risks && result.summary.risks.length > 0 && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-orange-800 mb-3">ความเสี่ยงที่อาจเกิดขึ้น</h3>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {result.summary.risks.map((risk, index) => (
                              <li key={index} className="text-orange-700">{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quality Assessment */}
                  {result.quality && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">การประเมินคุณภาพ</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>ความครบถ้วน:</strong> {result.quality.completeness}%
                        </div>
                        <div>
                          <strong>ความชัดเจน:</strong> {result.quality.clarity}%
                        </div>
                        <div>
                          <strong>ความสอดคล้อง:</strong> {result.quality.consistency}%
                        </div>
                        <div>
                          <strong>คะแนนรวม:</strong> {result.quality.overallScore}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw JSON View */}
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">Raw JSON Data</h3>
                    <pre className="text-xs text-green-400 overflow-auto max-h-64">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no result */}
            {!showResult && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold mb-2">รอผลลัพธ์จาก AI</h3>
                  <p className="text-sm">
                    กรุณากรอกข้อมูลความต้องการของคุณในช่องด้านซ้าย<br />
                    แล้วรอผลลัพธ์จาก AI ที่จะแสดงที่นี่
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

