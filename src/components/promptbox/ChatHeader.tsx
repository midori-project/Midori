'use client';

import React from 'react';

interface ChatHeaderProps {
  currentStep: string;
  currentQuestion?: number;
  totalQuestions?: number;
  onResetChat: () => void;
  shouldShowMessages: boolean;
  isLoading: boolean;
}

export default function ChatHeader({
  currentStep,
  currentQuestion,
  totalQuestions,
  onResetChat,
  shouldShowMessages,
  isLoading,
}: ChatHeaderProps) {
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

  return (
    <>
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
            onClick={onResetChat}
            className="px-4 py-2 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-105"
          >
            🌱 เริ่มใหม่
          </button>
        </div>
        {getStepIndicator()}
        {getProgressIndicator()}
      </div>

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
    </>
  );
}
