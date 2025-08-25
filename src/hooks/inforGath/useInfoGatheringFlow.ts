'use client';
import { useState, useCallback } from 'react';
import {
  EnhancedAnalysis,
  Question,
  FinalOutput,
  ConversationContext,
  UserAnswers,
} from "@/types/openaiQuestion/route";
import { useOpenAIInfoGathering } from './useOpenAIInfoGathering';
import { useQuestionnaire } from './useQuestionnaire';

interface UseInfoGatheringFlowState {
  // Flow state
  currentPhase: "initial" | "questions" | "final" | "complete";
  analysis: EnhancedAnalysis | null;
  finalOutput: FinalOutput | null;

  // Loading states
  isAnalyzing: boolean;
  isGeneratingFinal: boolean;
  isLoading: boolean;

  // Error states
  error: string | null;
}

export interface UseInfoGatheringFlowReturn extends UseInfoGatheringFlowState {
  // Flow control
  startAnalysis: (prompt: string) => Promise<void>;
  continueToQuestions: () => void;
  generateFinalOutput: () => Promise<void>;

  // Utility
  reset: () => void;
  clearError: () => void;

  // Expose underlying hooks
  questionnaire: ReturnType<typeof useQuestionnaire>;
  openAI: ReturnType<typeof useOpenAIInfoGathering>;
}

export const useInfoGatheringFlow = (): UseInfoGatheringFlowReturn => {
  const openAI = useOpenAIInfoGathering();
  const questionnaire = useQuestionnaire();

  const [state, setState] = useState<UseInfoGatheringFlowState>({
    currentPhase: "initial",
    analysis: null,
    finalOutput: null,
    isAnalyzing: false,
    isGeneratingFinal: false,
    isLoading: false,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      currentPhase: "initial",
      analysis: null,
      finalOutput: null,
      isAnalyzing: false,
      isGeneratingFinal: false,
      isLoading: false,
      error: null,
    });
    openAI.reset();
    questionnaire.reset();
  }, [openAI, questionnaire]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
    openAI.clearError();
  }, [openAI]);

  const startAnalysis = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) {
        setState((prev) => ({ ...prev, error: "กรุณากรอกข้อมูลความต้องการ" }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        isLoading: true,
        error: null,
      }));

      try {
        const analysis = await openAI.analyzeInitialPrompt(prompt);

        if (analysis) {
          setState((prev) => ({
            ...prev,
            analysis,
            currentPhase: "questions",
            isAnalyzing: false,
            isLoading: false,
          }));

          // Generate questions based on analysis
          try {
            const questions = await openAI.generateQuestions(analysis);
            if (questions) {
              questionnaire.setQuestions(questions);
            }
          } catch (error) {
            console.error('Failed to generate questions:', error);
            setState((prev) => ({
              ...prev,
              error: "ไม่สามารถสร้างคำถามได้ กรุณาลองใหม่อีกครั้ง",
            }));
          }
        } else {
          setState((prev) => ({
            ...prev,
            isAnalyzing: false,
            isLoading: false,
            error: "ไม่สามารถวิเคราะห์ข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          }));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล";
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [openAI, questionnaire]
  );

  const continueToQuestions = useCallback(() => {
    setState((prev) => ({ ...prev, currentPhase: "questions" }));
  }, []);

  const generateFinalOutput = useCallback(async () => {
    if (!state.analysis) {
      setState((prev) => ({
        ...prev,
        error: "ไม่พบข้อมูลการวิเคราะห์ กรุณาเริ่มต้นใหม่",
      }));
      return;
    }

    if (Object.keys(questionnaire.answers).length === 0) {
      setState((prev) => ({
        ...prev,
        error: "ไม่พบข้อมูลคำตอบ กรุณาตอบคำถามก่อน",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isGeneratingFinal: true,
      isLoading: true,
      error: null,
    }));

    try {
      const finalOutput = await openAI.generateFinalOutput(
        state.analysis,
        questionnaire.answers
      );

      if (finalOutput) {
        setState((prev) => ({
          ...prev,
          finalOutput,
          currentPhase: "complete",
          isGeneratingFinal: false,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isGeneratingFinal: false,
          isLoading: false,
          error: "ไม่สามารถสร้างผลลัพธ์สุดท้ายได้ กรุณาลองใหม่อีกครั้ง",
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการสร้างผลลัพธ์สุดท้าย";
      setState((prev) => ({
        ...prev,
        isGeneratingFinal: false,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [state.analysis, openAI, questionnaire.answers]);

  return {
    ...state,
    startAnalysis,
    continueToQuestions,
    generateFinalOutput,
    reset,
    clearError,
    questionnaire,
    openAI,
  };
};
