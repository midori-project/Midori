'use client';

import React from 'react';
import { useChat } from '@/hooks/useChat';
import SiteGenerator from '../sitegen/SiteGenerator';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

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

  // แสดงแค่แชทเมื่อ AI ถามคำถาม
  const shouldShowChat = currentStep === 'analysis' && messages && messages.length > 0;
  const shouldShowResult = currentStep === 'final' && finalJson;
  const shouldShowMessages = messages && messages.length > 0;
  const shouldShowGenerateButton = currentStep === 'questions' && !finalJson;

  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 ${className}`}>
      {/* Header and Welcome Screen */}
      <ChatHeader
        currentStep={currentStep}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onResetChat={resetChat}
        shouldShowMessages={shouldShowMessages}
        isLoading={isLoading}
      />

      {/* Chat Messages */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        error={error}
        currentStep={currentStep}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        finalJson={finalJson}
        onSendMessage={sendMessage}
      />

      {/* Chat Input */}
      <ChatInput
        isLoading={isLoading}
        isComplete={isComplete}
        currentStep={currentStep}
        currentQuestion={currentQuestion}
        onSendMessage={sendMessage}
        shouldShowGenerateButton={shouldShowGenerateButton}
      />

      {/* Site Generator */}
      {(canGenerateSite || siteGen.isGenerating || siteGen.isCompleted) && (
        <div className="px-6 pb-6">
          <SiteGenerator
            finalJson={finalJson}
            canGenerateSite={canGenerateSite}
            siteGen={siteGen}
            onGenerate={generateWebsite} 
          />
        </div>
      )}
    </div>
  );
}
