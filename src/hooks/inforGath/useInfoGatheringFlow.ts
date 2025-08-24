"use client";
import { useState, useCallback, useEffect } from "react";
import { useOpenAIInfoGathering } from "./useOpenAIInfoGathering";
import { useQuestionnaire } from "./useQuestionnaire";
import {
  EnhancedAnalysis,
  Question,
  QualityAssessment,
  FinalOutput,
  ConversationContext,
  UserAnswers,
} from "@/types/openaiQuestion/route";

interface UseInfoGatheringFlowState {
  // Flow state
  currentPhase: "initial" | "questions" | "quality" | "final" | "complete";
  analysis: EnhancedAnalysis | null;
  quality: QualityAssessment | null;
  finalOutput: FinalOutput | null;

  // Loading states
  isAnalyzing: boolean;
  isAssessingQuality: boolean;
  isGeneratingFinal: boolean;
  isLoading: boolean;

  // Error states
  error: string | null;
}

export interface UseInfoGatheringFlowReturn extends UseInfoGatheringFlowState {
  // Flow control
  startAnalysis: (prompt: string) => Promise<void>;
  continueToQuestions: () => void;
  assessQuality: () => Promise<void>;
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
    quality: null,
    finalOutput: null,
    isAnalyzing: false,
    isAssessingQuality: false,
    isGeneratingFinal: false,
    isLoading: false,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      currentPhase: "initial",
      analysis: null,
      quality: null,
      finalOutput: null,
      isAnalyzing: false,
      isAssessingQuality: false,
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
          if (
            analysis.questionStrategy &&
            analysis.questionStrategy.totalQuestions > 0
          ) {
            try {
              // ใช้ analysis.questionStrategy ในการสร้างคำถาม
              const questions = await generateQuestionsFromAnalysis(analysis);
              questionnaire.setQuestions(questions);
            } catch (error) {
              // Fallback to basic questions if generation fails
              const fallbackQuestions = generateFallbackQuestions(analysis);
              questionnaire.setQuestions(fallbackQuestions);
            }
          } else {
            // Fallback if no question strategy
            const fallbackQuestions = generateFallbackQuestions(analysis);
            questionnaire.setQuestions(fallbackQuestions);
          }
        } else {
          setState((prev) => ({
            ...prev,
            isAnalyzing: false,
            isLoading: false,
            error: "ไม่สามารถวิเคราะห์พรอมท์ได้ กรุณาลองใหม่อีกครั้ง",
          }));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการวิเคราะห์";
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

  // Helper function to generate questions from analysis
  const generateQuestionsFromAnalysis = async (
    analysis: EnhancedAnalysis
  ): Promise<Question[]> => {
    // สร้างคำถามตาม analysis.questionStrategy
    const questions: Question[] = [];

    // Basic questions based on project type
    questions.push({
      id: "project_name",
      type: "basic",
      category: "general",
      question: "ชื่อโปรเจ็คของคุณคืออะไร?",
      required: true,
    });

    questions.push({
      id: "project_purpose",
      type: "basic",
      category: "general",
      question: "วัตถุประสงค์ของเว็บไซต์คืออะไร?",
      required: true,
    });

    // Add questions based on project type
    if (analysis.projectType === "e-commerce") {
      questions.push({
        id: "product_categories",
        type: "contextual",
        category: "e-commerce",
        question: "คุณต้องการขายสินค้าประเภทไหน?",
        required: true,
        options: [
          "เสื้อผ้า",
          "อิเล็กทรอนิกส์",
          "อาหาร",
          "เครื่องสำอาง",
          "อื่นๆ",
        ],
      });

      questions.push({
        id: "payment_methods",
        type: "contextual",
        category: "e-commerce",
        question: "คุณต้องการระบบชำระเงินแบบไหน?",
        required: true,
        options: ["บัตรเครดิต", "โอนเงิน", "COD", "e-wallet", "ทั้งหมด"],
      });
    }

    if (analysis.projectType === "business") {
      questions.push({
        id: "business_type",
        type: "contextual",
        category: "business",
        question: "ประเภทธุรกิจของคุณคืออะไร?",
        required: true,
        options: ["บริการ", "ผลิตภัณฑ์", "การศึกษา", "สุขภาพ", "อื่นๆ"],
      });
    }

    // Add questions based on complexity
    if (
      analysis.complexity === "complex" ||
      analysis.complexity === "enterprise"
    ) {
      questions.push({
        id: "user_management",
        type: "contextual",
        category: "features",
        question: "คุณต้องการระบบจัดการผู้ใช้หรือไม่?",
        required: true,
        options: ["ใช่", "ไม่"],
      });

      questions.push({
        id: "analytics",
        type: "contextual",
        category: "features",
        question: "คุณต้องการระบบวิเคราะห์ข้อมูลหรือไม่?",
        required: true,
        options: ["ใช่", "ไม่"],
      });
    }

    // Add target audience question
    questions.push({
      id: "target_audience",
      type: "contextual",
      category: "audience",
      question: "กลุ่มเป้าหมายหลักของคุณคือใคร?",
      required: true,
      options: ["วัยรุ่น", "วัยทำงาน", "ผู้สูงอายุ", "ทุกวัย", "เฉพาะกลุ่ม"],
    });

    return questions;
  };

  // Fallback questions if generation fails
  const generateFallbackQuestions = (
    analysis: EnhancedAnalysis
  ): Question[] => {
    return [
      {
        id: "project_name",
        type: "basic",
        category: "general",
        question: "ชื่อโปรเจ็คของคุณคืออะไร?",
        required: true,
      },
      {
        id: "project_purpose",
        type: "basic",
        category: "general",
        question: "วัตถุประสงค์ของเว็บไซต์คืออะไร?",
        required: true,
      },
      {
        id: "target_audience",
        type: "contextual",
        category: "audience",
        question: "กลุ่มเป้าหมายหลักของคุณคือใคร?",
        required: true,
        options: ["วัยรุ่น", "วัยทำงาน", "ผู้สูงอายุ", "ทุกวัย"],
      },
    ];
  };

  const continueToQuestions = useCallback(() => {
    setState((prev) => ({ ...prev, currentPhase: "questions" }));
  }, []);

  const assessQuality = useCallback(async () => {
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
        error: "กรุณาตอบคำถามก่อนประเมินคุณภาพ",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isAssessingQuality: true,
      isLoading: true,
      error: null,
    }));

    try {
      const context: ConversationContext = {
        analysis: state.analysis,
        previousAnswers: questionnaire.answers,
        currentPhase: "quality",
      };

      const quality = await openAI.assessQuality(
        questionnaire.answers,
        context
      );

      if (quality) {
        setState((prev) => ({
          ...prev,
          quality,
          currentPhase: quality.overallScore >= 70 ? "final" : "quality",
          isAssessingQuality: false,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isAssessingQuality: false,
          isLoading: false,
          error: "ไม่สามารถประเมินคุณภาพได้ กรุณาลองใหม่อีกครั้ง",
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการประเมินคุณภาพ";
      setState((prev) => ({
        ...prev,
        isAssessingQuality: false,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [state.analysis, openAI, questionnaire.answers]);

  const generateFinalOutput = useCallback(async () => {
    if (!state.analysis) {
      setState((prev) => ({
        ...prev,
        error: "ไม่พบข้อมูลการวิเคราะห์ กรุณาเริ่มต้นใหม่",
      }));
      return;
    }

    if (!state.quality) {
      setState((prev) => ({
        ...prev,
        error: "ไม่พบข้อมูลการประเมินคุณภาพ กรุณาประเมินคุณภาพก่อน",
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
        questionnaire.answers,
        state.quality
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
  }, [state.analysis, state.quality, openAI, questionnaire.answers]);

  // Sync error state from OpenAI hook
  useEffect(() => {
    if (openAI.error && openAI.error !== state.error) {
      setState((prev) => ({ ...prev, error: openAI.error }));
    }
  }, [openAI.error, state.error]);

  return {
    ...state,
    startAnalysis,
    continueToQuestions,
    assessQuality,
    generateFinalOutput,
    reset,
    clearError,
    questionnaire,
    openAI,
  };
};
