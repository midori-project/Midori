import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatSession, ChatResponse } from '@/types/chat';
import { useSiteGen } from '@/hooks/useSiteGen';
import axios from 'axios';

interface UseChatReturn {
  messages: ChatMessage[];
  currentStep: ChatSession['currentStep'];
  analysis?: ChatSession['analysis'];
  finalJson?: any;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  resetChat: () => void;
  sessionId: string | null;
  currentQuestion?: number;
  totalQuestions?: number;
  showQuestion?: string;
  explanation?: string;
  
  // Site generation functionality
  siteGen: ReturnType<typeof useSiteGen>;
  canGenerateSite: boolean;
  generateWebsite: (options?: any) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatSession['currentStep']>('initial');
  const [analysis, setAnalysis] = useState<ChatSession['analysis']>();
  const [finalJson, setFinalJson] = useState<any>();
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>();
  const [totalQuestions, setTotalQuestions] = useState<number>();
  const [showQuestion, setShowQuestion] = useState<string>();
  const [explanation, setExplanation] = useState<string>();
  
  // Initialize site generation hook
  const siteGen = useSiteGen();
  
  // Get user from auth context
 
  
  console.log(currentStep);
  
  
  // Helper function to create project if not exists (ไม่พึ่งพา user)
  const ensureProject = async () => {
    if (projectId) return projectId;
    // [MOCK] ไม่เรียก API สร้างโปรเจกต์
    const newProjectId = 'dev-project';
    setProjectId(newProjectId);
    console.log('✅ [MOCK] Project created:', newProjectId);
    return newProjectId;
  };

  // Helper function to save chat message to database
  const saveChatMessage = async (_projectId: string, role: 'user' | 'assistant', content: string) => {
    // [MOCK] ไม่เรียก API บันทึกแชท
    console.log('💾 [MOCK] Chat message:', { role, contentLength: content.length });
  };

  // Helper function to save final JSON to database
  const saveFinalJson = async (_projectId: string, _finalJson: any, description?: string) => {
    // [MOCK] ไม่เรียก API บันทึก final JSON
    console.log('💾 [MOCK] Final JSON prepared:', description || 'Final JSON from AI conversation');
  };

  // Helper function to save generated files to database
  const saveGeneratedFiles = async (_projectId: string, files: any) => {
    // [MOCK] ไม่เรียก API บันทึกไฟล์ที่สร้าง
    console.log('💾 [MOCK] Generated files ready:', Array.isArray(files) ? files.length : Object.keys(files || {}).length);
  };

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    console.log('=== Sending Message ===');
    console.log('Message:', message);
    console.log('Session ID:', sessionId);
    console.log('Project ID:', projectId);
    console.log('Current Step:', currentStep);
    console.log('========================');

    // Ensure we have a project before proceeding
    const currentProjectId = await ensureProject();
    if (!currentProjectId) {
      setError('ไม่สามารถสร้างโปรเจกต์ได้ กรุณาเข้าสู่ระบบ');
      return;
    }

    // เพิ่มข้อความของผู้ใช้เข้าไปใน messages
    const userMessage = {
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Save user message to database
    await saveChatMessage(currentProjectId, 'user', message.trim());

    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        sessionId: sessionId || null,
        message: message.trim(),
      };
      
      console.log('=== Request Data ===');
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      console.log('===================');
      
      const response = await axios.post('/api/openai', requestData);

      const data: ChatResponse = response.data;

      // เพิ่ม console.log เพื่อแสดงข้อมูลที่ได้จาก API
      console.log('=== API Response Data ===');
      console.log('Session ID:', data.sessionId);
      console.log('Current Step:', data.currentStep);
      console.log('Analysis:', data.analysis);
      console.log('Final JSON:', data.finalJson);
      console.log('Is Complete:', data.isComplete);
      console.log('Message:', data.message);
      console.log('Current Question:', data.currentQuestion);
      console.log('Total Questions:', data.totalQuestions);
      console.log('Full Response Data:', data);
      console.log('Explanation:', data.explanation);
      console.log('========================');

      // อัปเดต state
      setCurrentStep(data.currentStep);
      setAnalysis(data.analysis);
      setFinalJson(data.finalJson);
      setIsComplete(data.isComplete);
      setSessionId(data.sessionId);
      setCurrentQuestion(data.currentQuestion || undefined);
      setTotalQuestions(data.totalQuestions || undefined);
      setShowQuestion(data.currentquestion || undefined);
      setExplanation(data.explanation || undefined);
      // เพิ่มข้อความใหม่เข้าไปใน messages - แสดงเฉพาะ showQuestion ถ้ามี
      let assistantMessage = '';
      if (data.explanation && data.explanation.trim()) {
        // แสดง explanation เมื่อผู้ใช้ถามเพิ่มเติมเกี่ยวกับคำถาม
        assistantMessage = data.explanation as string;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date()
        }]);
      } else if (data.currentquestion && data.currentquestion.trim()) {
        // แสดง currentquestion เมื่อเป็นคำถามปกติ
        assistantMessage = data.currentquestion as string;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date()
        }]);
      } else if(data.message && data.message.trim()){
        // แสดง message ปกติ
        assistantMessage = data.message;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date()
        }]);
      }

      // Save assistant message to database if there's content
      if (assistantMessage && currentProjectId) {
        await saveChatMessage(currentProjectId, 'assistant', assistantMessage);
      }

      // Save final JSON when chat is complete
      if (data.isComplete && data.finalJson && currentProjectId) {
        console.log('💾 Saving final JSON...');
        
        // Save the final JSON to prompts table
        await saveFinalJson(currentProjectId, data.finalJson, 'Complete conversation for website generation');
      }

    } catch (err) {
      let errorMessage = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      
      if (axios.isAxiosError(err)) {
        // จัดการ error จาก axios
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.status) {
          errorMessage = `เกิดข้อผิดพลาด HTTP ${err.response.status}`;
        } else if (err.request) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentStep,  projectId]);

  const resetChat = useCallback(() => {
    console.log('=== Resetting Chat ===');
    setMessages([]);
    setCurrentStep('initial');
    setAnalysis(undefined);
    setFinalJson(undefined);
    setIsComplete(false);
    setError(null);
    setSessionId(null);
    setProjectId(null);
    setCurrentQuestion(undefined);
    setTotalQuestions(undefined);
    
    // Reset site generation as well
    siteGen.reset();
    
    console.log('Chat reset completed');
  }, [siteGen]);

  /**
   * Generate website from finalJson
   */
  const generateWebsite = useCallback(async (options = {}) => {
    if (!finalJson) {
      setError('ไม่มีข้อมูล finalJson สำหรับการสร้างเว็บไซต์');
      return;
    }

    console.log('🚀 Starting website generation from chat...');
    console.log('📊 Final JSON available:', !!finalJson);
    console.log('🔑 Project ID:', projectId);
    console.log('🔑 Session ID:', sessionId);
    console.log('⚙️ Options:', options);

    if (!projectId) {
      console.error('❌ No projectId available for file saving!');
      setError('ไม่มี projectId สำหรับบันทึกไฟล์');
      return;
    }

    try {
      await siteGen.generateSite(finalJson, {
        sessionId,
        projectId,
        ...options
      });
    } catch (error) {
      console.error('Website generation error:', error);
      setError('เกิดข้อผิดพลาดในการสร้างเว็บไซต์');
    }
  }, [finalJson, sessionId, projectId, siteGen]);

  // Check if site generation is available
  const canGenerateSite = isComplete && !!finalJson && currentStep === 'final';

  return {
    messages,
    currentStep,
    analysis,
    finalJson,
    isComplete,
    isLoading,
    error,
    sendMessage,
    resetChat,
    sessionId,
    currentQuestion,
    totalQuestions,
    showQuestion,
    explanation,
    
    // Site generation
    siteGen,
    canGenerateSite,
    generateWebsite,
  };
}
