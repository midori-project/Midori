'use client';
import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  OpenAIRequest,
  OpenAIResponse,
  EnhancedAnalysis,
  Question,
  FinalOutput,
  ConversationContext,
  UserAnswers,
} from '@/types/openaiQuestion/route';

interface UseOpenAIInfoGatheringState {
  loading: boolean;
  error: string | null;
  data: OpenAIResponse['data'] | null;
  phase: 'initial' | 'questions' | 'final' | 'complete';
}

export interface UseOpenAIInfoGatheringReturn extends UseOpenAIInfoGatheringState {
  // Initial Analysis
  analyzeInitialPrompt: (prompt: string) => Promise<EnhancedAnalysis | null>;
  
  // Question Generation
  generateQuestions: (analysis: EnhancedAnalysis) => Promise<Question[] | null>;
  
  // Final Generation
  generateFinalOutput: (
    analysis: EnhancedAnalysis,
    answers: UserAnswers
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
    
    if (requestData.phase === 'questions' && !requestData.context) {
      return 'ไม่พบข้อมูลการวิเคราะห์';
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

      if (response.data.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          data: response.data.data,
          phase: (response.data.phase as 'initial' | 'questions' | 'final' | 'complete') || prev.phase,
        }));
        return response.data.data as T;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.data.error || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [validateRequest]);

  const analyzeInitialPrompt = useCallback(async (prompt: string): Promise<EnhancedAnalysis | null> => {
    return makeRequest<EnhancedAnalysis>('/api/openaiInfoGath', {
      prompt,
      phase: 'initial',
    });
  }, [makeRequest]);

  const generateQuestions = useCallback(async (analysis: EnhancedAnalysis): Promise<Question[] | null> => {
    const context: ConversationContext = {
      previousAnswers: {},
      analysis,
      currentPhase: 'questions',
    };

    return makeRequest<Question[]>('/api/openaiInfoGath', {
      prompt: 'Generate questions',
      phase: 'questions',
      context,
    });
  }, [makeRequest]);

  const generateFinalOutput = useCallback(async (
    analysis: EnhancedAnalysis,
    answers: UserAnswers
  ): Promise<FinalOutput | null> => {
    const context: ConversationContext = {
      previousAnswers: answers,
      analysis,
      currentPhase: 'final',
    };

    return makeRequest<FinalOutput>('/api/openaiInfoGath', {
      prompt: 'Generate final output',
      phase: 'final',
      context,
      answers,
    });
  }, [makeRequest]);

  return {
    ...state,
    analyzeInitialPrompt,
    generateQuestions,
    generateFinalOutput,
    reset,
    clearError,
  };
};
