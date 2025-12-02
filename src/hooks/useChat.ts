import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  resetChat: () => void;
  
  // Placeholder for new AI flow integration
  canGenerateSite: boolean;
  generateWebsite: (options?: any) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // TODO: Implement new AI flow integration here
      // Placeholder response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'ขอบคุณสำหรับข้อความของคุณ ระบบ AI ใหม่กำลังพัฒนาอยู่',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งข้อความ');
      setIsLoading(false);
    }
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const generateWebsite = useCallback(async (_options?: any) => {
    // TODO: Implement new website generation flow
    console.log('🚧 Website generation - ระบบใหม่กำลังพัฒนา');
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
    canGenerateSite: false, // ปิดไว้ก่อนจนกว่าจะมี AI flow ใหม่
    generateWebsite,
  };
}
