import { Suspense } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

// Server Component - โหลดข้อมูลเริ่มต้นได้
export default async function ChatPage() {
  // สามารถโหลดข้อมูล initial state จาก database, config files ได้ที่นี่
  // เช่น: user preferences, recent conversations, etc.
  
  const initialMessage = `สวัสดีครับ! ผมคือ Midori AI ผู้ช่วยสร้างเว็บไซต์ 🎭

ผมสามารถช่วยคุณได้หลายอย่าง:
• 🎨 สร้างและแก้ไข UI Components
• ⚙️ สร้าง API และจัดการฐานข้อมูล  
• 🚀 Deploy และจัดการ Infrastructure
• 💬 ตอบคำถามเกี่ยวกับการพัฒนาเว็บ

ลองถามหรือสั่งงานผมดูสิครับ!`;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด Midori AI...</p>
        </div>
      </div>
    }>
      <ChatInterface initialMessage={initialMessage} />
    </Suspense>
  );
}
