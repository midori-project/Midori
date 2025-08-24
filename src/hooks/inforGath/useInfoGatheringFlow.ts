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
    try {
      // ใช้ OpenAI API เพื่อสร้างคำถามตามข้อมูลที่ขาดหายไป
      const response = await openAI.generateQuestions(analysis);
      return response || generateFallbackQuestions(analysis);
    } catch (error) {
      console.error("Error generating questions from analysis:", error);
      // Fallback to basic questions if API fails
      return generateFallbackQuestions(analysis);
    }
  };

     // Helper function to generate additional features options for mockup
   const generateAdditionalFeaturesOptions = (projectType: string): string[] => {
     // สำหรับ mockup ให้มีแค่ 2 ตัวเลือกเท่านั้น
     return [
       'ระบบ Authentication (เข้าสู่ระบบ/สมัครสมาชิก)',
       'ระบบจัดการไฟล์ (อัปโหลด/ดาวน์โหลด/จัดการไฟล์)'
     ];
   };

   // Fallback questions if generation fails
   const generateFallbackQuestions = (
     analysis: EnhancedAnalysis
   ): Question[] => {
    const questions: Question[] = [];

    // คำถามที่ 1: ชื่อโปรเจ็คและธีมการออกแบบ (เสมอ)
    questions.push({
      id: "project_name_and_theme",
      type: "basic",
      category: "project_info",
      question: "กรุณาระบุชื่อโปรเจ็คและธีมการออกแบบที่ต้องการ (เช่น: ร้านค้าออนไลน์สไตล์มินิมอล)",
      required: true,
      priority: "high",
    });

         // คำถามที่ 2: ฟีเจอร์หลัก (เสมอ)
     questions.push({
       id: "core_features",
       type: "basic",
       category: "features",
       question: "กรุณาระบุฟีเจอร์หลักที่ต้องการในเว็บไซต์ (เช่น: ระบบชำระเงิน, ระบบสมาชิก, ระบบค้นหา)",
       required: true,
       priority: "high",
     });

     // คำถามที่ 3: กลุ่มเป้าหมาย (เสมอ)
     questions.push({
       id: "target_audience",
       type: "basic",
       category: "audience",
       question: "กรุณาระบุกลุ่มเป้าหมายหลักของเว็บไซต์ (เช่น: วัยรุ่น 18-25 ปี, ผู้ประกอบการ SMEs, นักเรียนนักศึกษา)",
       required: true,
       priority: "high",
     });

     // คำถามที่ 4: ฟีเจอร์เสริม (เสมอ) - สร้าง options ตามประเภทโปรเจ็ค
     const additionalFeaturesOptions = generateAdditionalFeaturesOptions(analysis.projectType);
     questions.push({
       id: "additional_features",
       type: "basic",
       category: "features",
       question: "กรุณาเลือกฟีเจอร์เสริมที่ต้องการ (เลือกได้หลายข้อ):",
       options: additionalFeaturesOptions,
       required: true,
       priority: "high",
     });

     // กำหนดจำนวนคำถามตามระดับความซับซ้อน
     const getMaxQuestionsByComplexity = (complexity: string): number => {
       switch (complexity) {
         case 'simple': return 6;
         case 'medium': return 8;
         case 'complex': return 10;
         case 'enterprise': return 12;
         default: return 8;
       }
     };

     const maxQuestions = getMaxQuestionsByComplexity(analysis.complexity);
     let additionalQuestionsCount = 0;

     // ถามข้อมูลที่ขาดหายไปจาก missingElements (ยกเว้นคำถามที่ถามไปแล้ว)
     if (analysis.missingElements && analysis.missingElements.length > 0) {
       analysis.missingElements.forEach((element, index) => {
         // ตรวจสอบจำนวนคำถามไม่ให้เกิน limit
         if (questions.length >= maxQuestions) return;
         
         // ข้ามถ้าเป็นคำถามที่ถามไปแล้ว
         if (!element.includes("ชื่อโปรเจ็ค") && 
             !element.includes("ธีมการออกแบบ") && 
             !element.includes("ฟีเจอร์หลัก") &&
             !element.includes("สไตล์การออกแบบ") &&
             !element.includes("กลุ่มเป้าหมาย") &&
             !element.includes("ฟีเจอร์เสริม")) {
           questions.push({
             id: `missing_${index}`,
             type: "contextual",
             category: "missing_info",
             question: `กรุณาระบุรายละเอียดเกี่ยวกับ: ${element}`,
             required: true,
             priority: "medium",
           });
           additionalQuestionsCount++;
         }
       });
     }

     // เพิ่มคำถามทั่วไปถ้าจำนวนยังไม่ถึง limit
     const generalQuestions = [
       "มีข้อกำหนดพิเศษเกี่ยวกับการออกแบบหรือไม่?",
       "ต้องการระบบการจัดการเนื้อหาหรือไม่?",
       "มีข้อกำหนดเกี่ยวกับ SEO หรือไม่?",
       "ต้องการระบบการวิเคราะห์ข้อมูลหรือไม่?",
       "มีข้อกำหนดเกี่ยวกับความปลอดภัยหรือไม่?",
       "ต้องการระบบการสำรองข้อมูลหรือไม่?"
     ];

     for (let i = 0; i < generalQuestions.length && questions.length < maxQuestions; i++) {
       questions.push({
         id: `general_${i}`,
         type: "contextual",
         category: "general",
         question: generalQuestions[i],
         required: false,
         priority: "low",
       });
     }

    return questions;
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
