"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Zap, RefreshCw, Code, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  projectId?: string;
  userId?: string;
  sessionId?: string;
  userEmail?: string;
}



export default function ChatInterface({ 
  initialMessage, 
  projectId, 
  userId, 
  sessionId,
  userEmail
}: ChatInterfaceProps) {
  
  // 🔍 เพิ่ม Token context
  const { tokenInfo, refetchTokenInfo } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, [userId, projectId]);

  // อัปเดต token balance เมื่อ component mount (ใช้ cache ก่อน)
  useEffect(() => {
    if (tokenInfo) {
      refetchTokenInfo(false); // ใช้ cache ก่อน
    }
  }, []);

  // Auto focus input
  useEffect(() => {
    if (!isLoadingHistory) {
      inputRef.current?.focus();
    }
  }, [isLoadingHistory]);

  // Auto send initial message from home page (after history is loaded)
  useEffect(() => {
    if (!isLoadingHistory && projectId && messages.length > 0 && !hasSentInitialMessage) {
      // Check if there's a pending message from home page
      const pendingMessage = localStorage.getItem(`pendingMessage_${projectId}`);
      if (pendingMessage) {
        // Remove the pending message from localStorage
        localStorage.removeItem(`pendingMessage_${projectId}`);
        // Mark as sent to prevent duplicate sending
        setHasSentInitialMessage(true);
        // Send the message directly as user message after ensuring history is loaded
        setTimeout(() => {
          handleSendWithMessage(pendingMessage);
        }, 500);
      }
    }
  }, [isLoadingHistory, projectId, messages.length, hasSentInitialMessage]);

  // Load conversation history from database
  const loadConversationHistory = async () => {
    if (!userId) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      setIsLoadingHistory(true);
      
      // Get user's conversations
      const response = await fetch(`/api/conversations?userId=${userId}&projectId=${projectId || ''}&limit=1`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Get the most recent conversation with messages
          const conversation = data.data[0];
          const conversationResponse = await fetch(`/api/conversations/${conversation.id}`);
          
          if (conversationResponse.ok) {
            const conversationData = await conversationResponse.json();
            
            if (conversationData.success && conversationData.data.messages) {
              // Convert database messages to component messages
              const historyMessages: Message[] = conversationData.data.messages.map((msg: any) => ({
                id: msg.id,
                content: msg.content || '',
                sender: msg.role === 'user' ? 'user' : 'assistant',
                timestamp: new Date(msg.createdAt),
                type: msg.contentJson?.type || 'chat',
                taskResults: msg.contentJson?.taskResults
              }));
              
              setMessages(historyMessages);
              console.log(`📚 Loaded ${historyMessages.length} messages from conversation history`);
            }
          }
        } else {
          // No conversation history, show welcome message
          setMessages([{
            id: 'welcome',
            content: initialMessage || 'สวัสดีครับ! ผมคือ Midori AI ผู้ช่วยสร้างเว็บไซต์ 🎭\n\nผมสามารถช่วยคุณได้หลายอย่าง:\n• 🎨 สร้างและแก้ไข UI Components\n• ⚙️ สร้าง API และจัดการฐานข้อมูล\n• 🚀 Deploy และจัดการ Infrastructure\n• 💬 ตอบคำถามเกี่ยวกับการพัฒนาเว็บ\n\nลองถามหรือสั่งงานผมดูสิครับ!',
            sender: 'assistant',
            timestamp: new Date(),
            type: 'chat'
          }]);
        }
      } else {
        console.error('Failed to load conversation history');
        // Fallback to welcome message
        setMessages([{
          id: 'welcome',
          content: initialMessage || 'สวัสดีครับ! ผมคือ Midori AI ผู้ช่วยสร้างเว็บไซต์ 🎭\n\nผมสามารถช่วยคุณได้หลายอย่าง:\n• 🎨 สร้างและแก้ไข UI Components\n• ⚙️ สร้าง API และจัดการฐานข้อมูล\n• 🚀 Deploy และจัดการ Infrastructure\n• 💬 ตอบคำถามเกี่ยวกับการพัฒนาเว็บ\n\nลองถามหรือสั่งงานผมดูสิครับ!',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'chat'
        }]);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      // Fallback to welcome message
      setMessages([{
        id: 'welcome',
        content: initialMessage || 'สวัสดีครับ! ผมคือ Midori AI ผู้ช่วยสร้างเว็บไซต์ 🎭\n\nผมสามารถช่วยคุณได้หลายอย่าง:\n• 🎨 สร้างและแก้ไข UI Components\n• ⚙️ สร้าง API และจัดการฐานข้อมูล\n• 🚀 Deploy และจัดการ Infrastructure\n• 💬 ตอบคำถามเกี่ยวกับการพัฒนาเว็บ\n\nลองถามหรือสั่งงานผมดูสิครับ!',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'chat'
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendWithMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    
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

      // Call API endpoint with real data
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent.trim(),
          userId: userId || 'anonymous',
          sessionId: sessionId || `session-${Date.now()}`,
          context: { 
            currentProject: projectId || null,
            userEmail: userEmail || null,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chat API');
      }

      const result = await response.json();

      // 🔄 อัปเดต Token balance หลัง Chat
      if (result.tokenInfo) {
        console.log(`💸 Token deducted: ${result.tokenInfo.deducted}, remaining: ${result.tokenInfo.remaining}`);
      }
      
      // อัปเดต token info ใน context เสมอ (เพื่อให้ได้ข้อมูลล่าสุด)
      await refetchTokenInfo(true); // forceRefresh = true เพื่อให้ได้ข้อมูลล่าสุด

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
          content: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
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

      // Call API endpoint with real data
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          userId: userId || 'anonymous',
          sessionId: sessionId || `session-${Date.now()}`,
          context: { 
            currentProject: projectId || null,
            userEmail: userEmail || null,
            timestamp: new Date().toISOString()
          }
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
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Midori AI</h2>
              <p className="text-sm text-gray-500">AI Assistant for Web Development</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 💰 Token Display */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-medium">
                {tokenInfo?.balance || 0} Tokens
              </span>
            </div>
            
            <button 
              onClick={loadConversationHistory}
              disabled={isLoadingHistory}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              <span>{isLoadingHistory ? 'Loading...' : 'Restore'}</span>
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1">
              <Code className="w-4 h-4" />
              <span>Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading conversation history...</span>
            </div>
          </div>
        ) : (
          messages.map((message) => (
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
        )))}
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
                placeholder="Ask Midori AI..."
                disabled={isLoading || isLoadingHistory}
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
                disabled={!input.trim() || isLoading || isLoadingHistory}
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
          
        </div>
      </div>
    </div>
  );
}