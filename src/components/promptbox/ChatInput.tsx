'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  isLoading: boolean;
  isComplete: boolean;
  currentStep: string;
  currentQuestion?: number;
  onSendMessage: (message: string) => Promise<void>;
  shouldShowGenerateButton: boolean;
}

export default function ChatInput({
  isLoading,
  isComplete,
  currentStep,
  currentQuestion,
  onSendMessage,
  shouldShowGenerateButton,
}: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await onSendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholder = () => {
    if (isComplete) {
      return "ถามอะไรเพิ่มเติมได้เลย! 💚";
    }
    if (currentStep === 'analysis' && currentQuestion) {
      return `ตอบคำถามที่ ${currentQuestion} หรือถามกลับหากต้องการรายละเอียดเพิ่มเติม... 🌱`;
    }
    return "บอกฉันว่าเธอต้องการสร้างเว็บไซต์แบบไหน... 🐸";
  };

  // ซ่อน input form เมื่อแสดงปุ่มสร้างคำตอบ
  if (shouldShowGenerateButton) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-emerald-200 p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
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
  );
}
