'use client';
import { useState, useCallback } from 'react';
import { Question, UserAnswers } from '@/types/openaiQuestion/route';

interface UseQuestionnaireState {
  questions: Question[];
  answers: UserAnswers;
  currentQuestionIndex: number;
  isComplete: boolean;
  errors: Record<string, string>;
}

export interface UseQuestionnaireReturn extends UseQuestionnaireState {
  // Question management
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  removeQuestion: (questionId: string) => void;
  
  // Answer management
  setAnswer: (questionId: string, answer: string | string[]) => void;
  setAnswers: (answers: UserAnswers) => void;
  clearAnswers: () => void;
  
  // Navigation
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  
  // Validation
  validateAnswer: (questionId: string, answer: string | string[]) => boolean;
  validateAllAnswers: () => Record<string, string>;
  clearErrors: () => void;
  
  // Utility
  getCurrentQuestion: () => Question | null;
  getQuestionById: (questionId: string) => Question | null;
  isQuestionAnswered: (questionId: string) => boolean;
  getProgress: () => number; // 0-100
  reset: () => void;
}

export const useQuestionnaire = (): UseQuestionnaireReturn => {
  const [state, setState] = useState<UseQuestionnaireState>({
    questions: [],
    answers: {},
    currentQuestionIndex: 0,
    isComplete: false,
    errors: {},
  });

  const setQuestions = useCallback((questions: Question[]) => {
    setState(prev => ({
      ...prev,
      questions,
      currentQuestionIndex: 0,
      isComplete: false,
      errors: {},
    }));
  }, []);

  const addQuestion = useCallback((question: Question) => {
    setState(prev => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
  }, []);

  const removeQuestion = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
      answers: Object.fromEntries(
        Object.entries(prev.answers).filter(([key]) => key !== questionId)
      ),
      errors: Object.fromEntries(
        Object.entries(prev.errors).filter(([key]) => key !== questionId)
      ),
    }));
  }, []);

  const validateAnswer = useCallback((questionId: string, answer: string | string[]): boolean => {
    const question = state.questions.find(q => q.id === questionId);
    if (!question) {
      return false;
    }
    
    // Check if required
    if (question.required) {
      if (typeof answer === 'string') {
        if (!answer || answer.trim() === '') {
          setState(prev => ({
            ...prev,
            errors: { ...prev.errors, [questionId]: 'คำถามนี้จำเป็นต้องตอบ' }
          }));
          return false;
        }
      } else if (Array.isArray(answer)) {
        if (answer.length === 0) {
          setState(prev => ({
            ...prev,
            errors: { ...prev.errors, [questionId]: 'คำถามนี้จำเป็นต้องตอบ' }
          }));
          return false;
        }
      }
    }
    
    // Clear error if validation passes
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[questionId];
      return { ...prev, errors: newErrors };
    });
    
    return true;
  }, [state.questions]);

  const validateAllAnswers = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    state.questions.forEach(question => {
      if (question.required) {
        const answer = state.answers[question.id];
        if (!answer || 
            (typeof answer === 'string' && answer.trim() === '') ||
            (Array.isArray(answer) && answer.length === 0)) {
          errors[question.id] = 'คำถามนี้จำเป็นต้องตอบ';
        }
      }
    });
    
    setState(prev => ({ ...prev, errors }));
    return errors;
  }, [state.questions, state.answers]);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  const setAnswer = useCallback((questionId: string, answer: string | string[]) => {
    // Always set the answer, validation will be done separately
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer,
      },
    }));
    
    // Clear error when user starts typing
    if (answer !== undefined && answer !== null) {
      setState(prev => {
        const newErrors = { ...prev.errors };
        delete newErrors[questionId];
        return { ...prev, errors: newErrors };
      });
    }
  }, []);

  const setAnswers = useCallback((answers: UserAnswers) => {
    setState(prev => ({
      ...prev,
      answers,
    }));
  }, []);

  const clearAnswers = useCallback(() => {
    setState(prev => ({
      ...prev,
      answers: {},
      errors: {},
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    
    if (currentQuestion && currentQuestion.required) {
      const answer = state.answers[currentQuestion.id];
      if (!answer || 
          (typeof answer === 'string' && answer.trim() === '') ||
          (Array.isArray(answer) && answer.length === 0)) {
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, [currentQuestion.id]: 'กรุณาตอบคำถามนี้ก่อนไปต่อ' }
        }));
        return;
      }
    }

    setState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isComplete = nextIndex >= prev.questions.length;
      
      return {
        ...prev,
        currentQuestionIndex: isComplete ? prev.currentQuestionIndex : nextIndex,
        isComplete,
        errors: {}, // Clear errors when moving to next question
      };
    });
  }, [state.questions, state.currentQuestionIndex, state.answers]);

  const previousQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
      isComplete: false,
      errors: {}, // Clear errors when moving to previous question
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(0, Math.min(index, prev.questions.length - 1)),
      isComplete: false,
      errors: {}, // Clear errors when jumping to question
    }));
  }, []);

  const getCurrentQuestion = useCallback(() => {
    const { questions, currentQuestionIndex } = state;
    return questions[currentQuestionIndex] || null;
  }, [state.questions, state.currentQuestionIndex]);

  const getQuestionById = useCallback((questionId: string) => {
    return state.questions.find(q => q.id === questionId) || null;
  }, [state.questions]);

  const isQuestionAnswered = useCallback((questionId: string) => {
    const answer = state.answers[questionId];
    return answer !== undefined && 
           ((typeof answer === 'string' && answer.trim() !== '') ||
            (Array.isArray(answer) && answer.length > 0));
  }, [state.answers]);

  const getProgress = useCallback(() => {
    const { questions, answers } = state;
    if (questions.length === 0) return 0;
    
    const answeredCount = questions.filter(q => isQuestionAnswered(q.id)).length;
    return Math.round((answeredCount / questions.length) * 100);
  }, [state.questions, state.answers, isQuestionAnswered]);

  const reset = useCallback(() => {
    setState({
      questions: [],
      answers: {},
      currentQuestionIndex: 0,
      isComplete: false,
      errors: {},
    });
  }, []);

  return {
    ...state,
    setQuestions,
    addQuestion,
    removeQuestion,
    setAnswer,
    setAnswers,
    clearAnswers,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    validateAnswer,
    validateAllAnswers,
    clearErrors,
    getCurrentQuestion,
    getQuestionById,
    isQuestionAnswered,
    getProgress,
    reset,
  };
};
