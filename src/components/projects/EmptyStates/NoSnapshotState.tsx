import React from 'react';
import { RefreshCw } from 'lucide-react';

interface NoSnapshotStateProps {
  onRefresh: () => void;
  isLoading: boolean;
}

/**
 * Component แสดงสถานะเมื่อยังไม่มี snapshot
 */
export function NoSnapshotState({ onRefresh, isLoading }: NoSnapshotStateProps) {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-300">
      <div className="text-center max-w-2xl px-8">
        <div className="text-8xl mb-6 animate-bounce">🐸</div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          ยังไม่มีเทมเพลตสำหรับโปรเจคนี้
        </h3>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          กรุณาสร้างเทมเพลตผ่านทาง{' '}
          <span className="font-semibold text-purple-600">Chat Interface</span> ทางด้านซ้าย
          โดยพิมพ์คำสั่งเช่น "สร้างเว็บไซต์คาเฟ่" หรือ "สร้าง landing page"
        </p>
        
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-center">
            <span className="text-2xl mr-2">💡</span>
            ตัวอย่างคำสั่งที่คุณสามารถใช้ได้:
          </h4>
          <div className="space-y-2 text-left">
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span className="text-gray-600">"สร้างเว็บไซต์ร้านกาแฟสไตล์โมเดิร์น"</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span className="text-gray-600">"สร้าง landing page สำหรับร้านอาหาร"</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span className="text-gray-600">"สร้าง portfolio สำหรับนักออกแบบ"</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span className="text-gray-600">"สร้างเว็บไซต์ e-commerce"</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          <span>Midori AI พร้อมช่วยคุณสร้างเว็บไซต์แล้ว</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>ตรวจสอบเทมเพลตใหม่</span>
        </button>
        <p className="text-xs text-gray-500 mt-3">
          คลิกปุ่มนี้หลังจากสร้างเทมเพลตจาก Chat แล้ว
        </p>
      </div>
    </div>
  );
}

