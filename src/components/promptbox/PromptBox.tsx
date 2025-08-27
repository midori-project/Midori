'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/types/chat';
import SiteGenerator from '../sitegen/SiteGenerator';

interface PromptBoxProps {
  className?: string;
}

export default function PromptBox({ className = '' }: PromptBoxProps) {
  const {
    messages,
    currentStep,
    isComplete,
    isLoading,
    error,
    sendMessage,
    resetChat,
    currentQuestion,
    totalQuestions,
    showQuestion,
    finalJson,
    siteGen,
    canGenerateSite,
    generateWebsite,
  } = useChat();
  console.log(finalJson);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'initial', label: 'เริ่มต้น', icon: '🌱' },
      { key: 'analysis', label: 'วิเคราะห์', icon: '🔍' },
      { key: 'questions', label: 'ถาม-ตอบ', icon: '❓' },
      { key: 'final', label: 'เสร็จสิ้น', icon: '🎉' },
    ];

    return (
      <div className="flex items-center justify-center mb-6 space-x-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-medium transition-all duration-500 transform hover:scale-110 ${
                currentStep === step.key
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                  : index < steps.findIndex(s => s.key === currentStep)
                  ? 'bg-emerald-400 text-white shadow-md'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {step.icon}
            </div>
            <span className={`ml-2 text-sm font-medium transition-colors duration-300 ${
              currentStep === step.key
                ? 'text-emerald-700'
                : index < steps.findIndex(s => s.key === currentStep)
                ? 'text-emerald-600'
                : 'text-emerald-400'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-3 transition-all duration-500 ${
                index < steps.findIndex(s => s.key === currentStep)
                  ? 'bg-emerald-400'
                  : 'bg-emerald-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
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
    <div className={`flex flex-col h-full max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 ${className}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl animate-bounce">🐸</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Midori AI Assistant
            </h1>
          </div>
          <button
            onClick={resetChat}
            className="px-4 py-2 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-105"
          >
            🌱 เริ่มใหม่
          </button>
        </div>
        {getStepIndicator()}
        {getProgressIndicator()}
      </div>

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
                   onClick={() => sendMessage('สร้างไฟล์ JSON')}
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

      {/* Welcome Screen - แสดงเมื่อยังไม่เริ่มแชท */}
      {!shouldShowMessages && !isLoading && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-6 animate-bounce">🐸</div>
            <h2 className="text-3xl font-bold text-emerald-700 mb-4">สวัสดี! ฉันคือ Midori</h2>
            <p className="text-lg text-emerald-600 mb-6 max-w-md">
              บอกฉันว่าเธอต้องการสร้างเว็บไซต์แบบไหน แล้วฉันจะช่วยเธอสร้างไฟล์ JSON ที่สมบูรณ์แบบ!
            </p>
            <div className="flex justify-center space-x-4 text-emerald-500">
              <div className="text-2xl animate-pulse">🌱</div>
              <div className="text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>💚</div>
              <div className="text-2xl animate-pulse" style={{ animationDelay: '1s' }}>✨</div>
            </div>
          </div>
        </div>
      )}


             {/* Input Form - ซ่อนเมื่อแสดงปุ่มสร้างคำตอบ */}
       {!shouldShowGenerateButton && (
         <div className="bg-white/80 backdrop-blur-sm border-t border-emerald-200 p-6 shadow-sm">
           <form onSubmit={handleSubmit} className="flex space-x-3">
             <textarea
               ref={inputRef}
               value={inputMessage}
               onChange={(e) => setInputMessage(e.target.value)}
               onKeyPress={handleKeyPress}
               placeholder={
                 isComplete
                   ? "ถามอะไรเพิ่มเติมได้เลย! 💚"
                   : currentStep === 'analysis' && currentQuestion
                   ? `ตอบคำถามที่ ${currentQuestion} หรือถามกลับหากต้องการรายละเอียดเพิ่มเติม... 🌱`
                   : "บอกฉันว่าเธอต้องการสร้างเว็บไซต์แบบไหน... 🐸"
               }
               className="flex-1 resize-none border border-emerald-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
               rows={1}
               disabled={isLoading}
             />
             <button
               type="submit"
               disabled={!inputMessage.trim() || isLoading}
               className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-emerald-300 disabled:to-green-300 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
             >
               {isLoading ? (
                 <div className="flex space-x-1">
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               ) : (
                 'ส่ง 💚'
               )}
             </button>
           </form>
         </div>
       )}

        {/* Site Generator */}
        {(canGenerateSite || siteGen.isGenerating || siteGen.isCompleted) && (
          <div className="px-6 pb-6">
            <SiteGenerator
              finalJson={finalJson}
              canGenerateSite={canGenerateSite}
              siteGen={siteGen}
              onGenerate={generateWebsite} // ส่ง generateWebsite จาก useChat ตรงๆ
            />
          </div>
        )}
    </div>
  );
}
