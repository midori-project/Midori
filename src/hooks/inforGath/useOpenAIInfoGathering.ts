'use client';
import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  OpenAIRequest,
  OpenAIResponse,
  EnhancedAnalysis,
  Question,
  QualityAssessment,
  FinalOutput,
  ConversationContext,
  UserAnswers,
} from '@/types/openaiQuestion/route';

interface UseOpenAIInfoGatheringState {
  loading: boolean;
  error: string | null;
  data: OpenAIResponse['data'] | null;
  phase: 'initial' | 'quality' | 'final' | 'complete';
}

export interface UseOpenAIInfoGatheringReturn extends UseOpenAIInfoGatheringState {
  // Initial Analysis
  analyzeInitialPrompt: (prompt: string) => Promise<EnhancedAnalysis | null>;
  
  // Quality Assessment
  assessQuality: (answers: UserAnswers, context: ConversationContext) => Promise<QualityAssessment | null>;
  
  // Final Generation
  generateFinalOutput: (
    analysis: EnhancedAnalysis,
    answers: UserAnswers,
    quality: QualityAssessment
  ) => Promise<FinalOutput | null>;
  
  // Utility functions
  reset: () => void;
  clearError: () => void;
}

export const useOpenAIInfoGathering = (): UseOpenAIInfoGatheringReturn => {
  const [state, setState] = useState<UseOpenAIInfoGatheringState>({
    loading: false,
    error: null,
    data: null,
    phase: 'initial',
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null,
      phase: 'initial',
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const validateRequest = useCallback((requestData: Partial<OpenAIRequest>): string | null => {
    if (!requestData.prompt && requestData.phase === 'initial') {
      return 'กรุณากรอกข้อมูลความต้องการ';
    }
    
    if (requestData.phase === 'quality' && (!requestData.answers || Object.keys(requestData.answers).length === 0)) {
      return 'ไม่พบข้อมูลคำตอบ';
    }
    
    if (requestData.phase === 'final' && (!requestData.context || !requestData.answers)) {
      return 'ข้อมูลไม่ครบถ้วน';
    }
    
    return null;
  }, []);

  const makeRequest = useCallback(async <T>(
    endpoint: string,
    requestData: Partial<OpenAIRequest>
  ): Promise<T | null> => {
    // Validate request data
    const validationError = validateRequest(requestData);
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.post<OpenAIResponse>(endpoint, requestData, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('🚀 [useOpenAIInfoGathering] Response received:', response.data);
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          data: response.data.data,
          phase: response.data.phase as 'initial' | 'quality' | 'final' | 'complete' || prev.phase,
        }));
        return response.data.data as T;
      } else {
        throw new Error(response.data.error || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
      }
    } catch (error) {
      let errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
        } else if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          if (status === 400) {
            errorMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง';
          } else if (status === 401) {
            errorMessage = 'ไม่ได้รับอนุญาตให้เข้าถึง';
          } else if (status === 403) {
            errorMessage = 'ไม่มีสิทธิ์เข้าถึง';
          } else if (status === 404) {
            errorMessage = 'ไม่พบ API endpoint';
          } else if (status === 500) {
            errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์';
          } else {
            errorMessage = `เกิดข้อผิดพลาด (${status})`;
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [validateRequest]);

  const analyzeInitialPrompt = useCallback(async (prompt: string): Promise<EnhancedAnalysis | null> => {
    if (!prompt.trim()) {
      setState(prev => ({ ...prev, error: 'กรุณากรอกข้อมูลความต้องการ' }));
      return null;
    }

    return makeRequest<EnhancedAnalysis>('/api/openaiInfoGath', {
      prompt: prompt.trim(),
      phase: 'initial',
    });
  }, [makeRequest]);

  const assessQuality = useCallback(async (
    answers: UserAnswers,
    context: ConversationContext
  ): Promise<QualityAssessment | null> => {
    if (!answers || Object.keys(answers).length === 0) {
      setState(prev => ({ ...prev, error: 'ไม่พบข้อมูลคำตอบ' }));
      return null;
    }

    if (!context || !context.analysis) {
      setState(prev => ({ ...prev, error: 'ไม่พบข้อมูลการวิเคราะห์' }));
      return null;
    }

    return makeRequest<QualityAssessment>('/api/openaiInfoGath', {
      prompt: '', // Not needed for quality assessment
      phase: 'quality',
      context,
      answers,
    });
  }, [makeRequest]);

  const generateFinalOutput = useCallback(async (
    analysis: EnhancedAnalysis,
    answers: UserAnswers,
    quality: QualityAssessment
  ): Promise<FinalOutput | null> => {
    if (!analysis) {
      setState(prev => ({ ...prev, error: 'ไม่พบข้อมูลการวิเคราะห์' }));
      return null;
    }

    if (!answers || Object.keys(answers).length === 0) {
      setState(prev => ({ ...prev, error: 'ไม่พบข้อมูลคำตอบ' }));
      return null;
    }

    if (!quality) {
      setState(prev => ({ ...prev, error: 'ไม่พบข้อมูลการประเมินคุณภาพ' }));
      return null;
    }

    return makeRequest<FinalOutput>('/api/openaiInfoGath', {
      prompt: '', // Not needed for final generation
      phase: 'final',
      context: { 
        analysis,
        previousAnswers: answers,
        currentPhase: 'final'
      },
      answers,
    });
  }, [makeRequest]);

  return {
    ...state,
    analyzeInitialPrompt,
    assessQuality,
    generateFinalOutput,
    reset,
    clearError,
  };
};
