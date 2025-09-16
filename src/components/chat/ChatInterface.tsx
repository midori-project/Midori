"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Zap } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'chat' | 'task' | 'mixed';
  taskResults?: any;
  loading?: boolean;
}

interface ChatInterfaceProps {
  initialMessage?: string;
}

export default function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: initialMessage || 'สวัสดีครับ! ผมคือ Midori AI ผู้ช่วยสร้างเว็บไซต์ 🎭\n\nผมสามารถช่วยคุณได้หลายอย่าง:\n• 🎨 สร้างและแก้ไข UI Components\n• ⚙️ สร้าง API และจัดการฐานข้อมูล\n• 🚀 Deploy และจัดการ Infrastructure\n• 💬 ตอบคำถามเกี่ยวกับการพัฒนาเว็บ\n\nลองถามหรือสั่งงานผมดูสิครับ!',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'chat'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Add loading message
      const loadingMessage: Message = {
        id: `loading-${Date.now()}`,
        content: 'กำลังคิด...',
        sender: 'assistant',
        timestamp: new Date(),
        loading: true
      };
      setMessages(prev => [...prev, loadingMessage]);

      // Call API endpoint instead of direct orchestrator
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          userId: 'user-123', // TODO: get real user ID
          sessionId: 'session-456' // TODO: get real session ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chat API');
      }

      const result = await response.json();

      // Remove loading message and add real response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.loading);
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: result.content,
          sender: 'assistant',
          timestamp: new Date(),
          type: result.type,
          taskResults: result.taskResults
        };
        return [...withoutLoading, assistantMessage];
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.loading);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: '❌ ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'chat'
        };
        return [...withoutLoading, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.sender === 'user') {
      return <User className="w-5 h-5 text-blue-600" />;
    }
    
    if (message.loading) {
      return <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />;
    }
    
    switch (message.type) {
      case 'task':
      case 'mixed':
        return <Zap className="w-5 h-5 text-orange-600" />;
      default:
        return <Bot className="w-5 h-5 text-purple-600" />;
    }
  };

  const getMessageStyles = (message: Message) => {
    if (message.sender === 'user') {
      return 'bg-blue-500 text-white ml-auto';
    }
    
    switch (message.type) {
      case 'task':
        return 'bg-orange-50 text-orange-900 border border-orange-200';
      case 'mixed':
        return 'bg-gradient-to-r from-purple-50 to-orange-50 text-gray-900 border border-purple-200';
      default:
        return 'bg-gray-50 text-gray-900';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-600">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Midori AI Chat</h1>
            <p className="text-sm text-gray-500">Orchestrator AI Testing Interface</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              {getMessageIcon(message)}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl ${getMessageStyles(message)} ${
                message.sender === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {/* Task Results (if any) */}
              {message.taskResults && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-white/30">
                  <p className="text-xs font-medium text-gray-600 mb-2">📋 Task Results:</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(message.taskResults, null, 2)}
                  </pre>
                </div>
              )}
              
              {/* Timestamp */}
              <div className="mt-2 text-xs opacity-60">
                {message.timestamp.toLocaleTimeString('th-TH', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {message.type && message.type !== 'chat' && (
                  <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-xs font-medium">
                    {message.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="พิมพ์ข้อความหรือสั่งงาน Midori AI..."
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              'สวัสดีครับ',
              'สร้าง button component',
              'แก้สี navbar เป็นสีน้ำเงิน',
              'สร้างเว็บไซต์ร้านกาแฟ',
              'ช่วยอธิบาย React hooks'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}