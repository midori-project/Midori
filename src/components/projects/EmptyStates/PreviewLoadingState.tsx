import React, { useState, useEffect } from 'react';

interface PreviewLoadingStateProps {
  loading: boolean;
  filesCount: number;
  onStartPreview: () => void;
}

const loadingMessages = [
  'กินกาแฟ...',
  'กินหมูปิ้ง 20 ไม้...',
  'กินข้าวกะเพรา...',
  'กินข้าวหมูกรอบ...',
  'กินข้าวกุ้งกะปิ...',
  'กินข้าวผัดกระเทียม...',
  'เกือบเสร็จแล้ว...',
  'กินข้าวผัดตะเข้...',
  'กินข้าวผัดหมู...',
];

/**
 * Component แสดงสถานะก่อนเริ่ม preview หรือระหว่างโหลด
 */
export function PreviewLoadingState({ 
  loading, 
  filesCount, 
  onStartPreview 
}: PreviewLoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading]);

  const currentMessage = loadingMessages[messageIndex] || 'กำลังโหลด...';

  return (
    <div className="flex items-center justify-center h-full bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        {loading ? (
          <>
            <div className="text-6xl mb-4 animate-pulse">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-pulse">
              {currentMessage}
            </h3>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
            <p className="text-gray-500 text-sm">
              กรุณารอสักครู่... เรากำลังเตรียมทุกอย่างให้คุณ
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Daytona Preview
            </h3>
            <p className="text-gray-600 mb-2 max-w-md">
              Click "Start Preview" to create a Daytona sandbox and begin editing your code with
              live updates.
            </p>
            <p className="text-gray-500 mb-6 text-sm">พบ {filesCount} ไฟล์พร้อมใช้งาน</p>
            <button
              onClick={onStartPreview}
              disabled={loading || filesCount === 0}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? currentMessage : 'Start Preview'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

