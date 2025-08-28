'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentStep: string;
  currentQuestion?: number;
  totalQuestions?: number;
  finalJson?: any;
  onSendMessage: (message: string) => Promise<void>;
}

export default function ChatMessages({
  messages,
  isLoading,
  error,
  currentStep,
  currentQuestion,
  totalQuestions,
  finalJson,
  onSendMessage,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getProgressIndicator = () => {
    if (currentStep === 'analysis' && currentQuestion && totalQuestions) {
      return (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-emerald-800">
              🌱 ความคืบหน้า: คำถามที่ {currentQuestion} จาก {totalQuestions}
            </span>
            <span className="text-sm text-emerald-600 font-bold">
              {Math.round((currentQuestion / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-green-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      );
    }
    return null;
  };

  // แสดงแค่แชทเมื่อ AI ถามคำถาม
  const shouldShowChat = currentStep === 'analysis' && messages && messages.length > 0;
  const shouldShowResult = currentStep === 'final' && finalJson;
  const shouldShowMessages = messages && messages.length > 0;
  const shouldShowGenerateButton = currentStep === 'questions' && !finalJson;

  return (
    <>
      {getProgressIndicator()}
      
      {/* Messages - แสดงข้อความแชท */}
      {shouldShowMessages && (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages?.map((message, index) => (
            <div
              key={index}
              className={`flex animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                    : 'bg-white text-emerald-800 border border-emerald-200'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {formatMessage(message.content)}
                </div>
                <div className={`text-xs mt-3 ${
                  message.role === 'user' ? 'text-emerald-100' : 'text-emerald-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('th-TH')}
                </div>
              </div>
            </div>
          ))}

          {/* แสดงผลลัพธ์ JSON เมื่อเสร็จสิ้น */}
          {shouldShowResult && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white text-emerald-800 rounded-2xl px-5 py-4 border border-emerald-200 shadow-sm max-w-[80%]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">🎉 ผลลัพธ์จาก Midori</div>
                  <button
                    onClick={() => {
                      const jsonString = typeof finalJson === 'object' 
                        ? JSON.stringify(finalJson, null, 2)
                        : finalJson || '';
                      navigator.clipboard.writeText(jsonString);
                      alert('คัดลอก JSON แล้ว! 📋');
                    }}
                    className="px-3 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all duration-300 hover:shadow-md"
                  >
                    📋 คัดลอก
                  </button>
                </div>
                <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
                  <pre className="whitespace-pre-wrap text-xs">
                    {typeof finalJson === 'object' 
                      ? JSON.stringify(finalJson, null, 2)
                      : finalJson || 'ไม่มีข้อมูล JSON'
                    }
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* แสดงปุ่มสร้างคำตอบเมื่ออยู่ใน step questions */}
          {shouldShowGenerateButton && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white text-emerald-800 rounded-2xl px-5 py-4 border border-emerald-200 shadow-sm max-w-[80%]">
                <div className="text-sm font-medium mb-3">🎯 พร้อมสร้างไฟล์ JSON</div>
                <p className="text-sm text-emerald-600 mb-4">
                  ข้อมูลของคุณครบถ้วนแล้ว! คลิกปุ่มด้านล่างเพื่อสร้างไฟล์ JSON ที่สมบูรณ์
                </p>
                <button
                  onClick={() => onSendMessage('สร้างไฟล์ JSON')}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-emerald-300 disabled:to-green-300 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>กำลังสร้าง...</span>
                    </div>
                  ) : (
                    '🚀 สร้างไฟล์ JSON'
                  )}
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white text-emerald-800 rounded-2xl px-5 py-4 border border-emerald-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm font-medium">Midori กำลังคิด...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-red-50 text-red-800 rounded-2xl px-5 py-4 border border-red-200">
                <div className="text-sm">❌ {error}</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </>
  );
}
