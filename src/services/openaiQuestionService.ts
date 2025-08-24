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
  ValidationResponse,
  ValidationError,
} from '@/types/openaiQuestion/route';

// OpenAI Question Service - Microservice Architecture
export class OpenAIQuestionService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // Initial Analysis Phase
  async performInitialAnalysis(prompt: string): Promise<OpenAIResponse> {
    try {
      const request: OpenAIRequest = {
        prompt,
        phase: 'initial',
      };

      const response = await axios.post<OpenAIResponse>(
        `${this.baseURL}/api/openaiQusetion`,
        request
      );

      return response.data;
    } catch (error) {
      console.error('Initial analysis error:', error);
      throw new Error('Failed to perform initial analysis');
    }
  }

  // Quality Assessment Phase
  async assessQuality(
    answers: UserAnswers,
    context: ConversationContext
  ): Promise<OpenAIResponse> {
    try {
      const request: OpenAIRequest = {
        prompt: 'Quality assessment request',
        phase: 'quality',
        context,
        answers,
      };

      const response = await axios.post<OpenAIResponse>(
        `${this.baseURL}/api/openaiQusetion`,
        request
      );

      return response.data;
    } catch (error) {
      console.error('Quality assessment error:', error);
      throw new Error('Failed to assess quality');
    }
  }

  // Final Generation Phase
  async generateFinalOutput(
    context: ConversationContext,
    answers: UserAnswers
  ): Promise<OpenAIResponse> {
    try {
      const request: OpenAIRequest = {
        prompt: 'Final generation request',
        phase: 'final',
        context,
        answers,
      };

      const response = await axios.post<OpenAIResponse>(
        `${this.baseURL}/api/openaiQusetion`,
        request
      );

      return response.data;
    } catch (error) {
      console.error('Final generation error:', error);
      throw new Error('Failed to generate final output');
    }
  }

  // Validation Methods
  validatePrompt(prompt: string): ValidationResponse {
    const errors: ValidationError[] = [];

    if (!prompt || prompt.trim().length === 0) {
      errors.push({
        field: 'prompt',
        message: 'Prompt is required',
        code: 'REQUIRED',
      });
    }

    if (prompt && prompt.length > 5000) {
      errors.push({
        field: 'prompt',
        message: 'Prompt is too long (max 5000 characters)',
        code: 'MAX_LENGTH',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateAnswers(answers: UserAnswers, requiredQuestions: string[]): ValidationResponse {
    const errors: ValidationError[] = [];

    requiredQuestions.forEach(questionId => {
      if (!answers[questionId] || 
          (typeof answers[questionId] === 'string' && answers[questionId].trim().length === 0)) {
        errors.push({
          field: questionId,
          message: 'This question is required',
          code: 'REQUIRED',
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateContext(context: ConversationContext): ValidationResponse {
    const errors: ValidationError[] = [];

    if (!context.analysis) {
      errors.push({
        field: 'analysis',
        message: 'Analysis is required in context',
        code: 'REQUIRED',
      });
    }

    if (!context.previousAnswers) {
      errors.push({
        field: 'previousAnswers',
        message: 'Previous answers are required in context',
        code: 'REQUIRED',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Data Processing Methods
  processAnalysisResult(data: any): EnhancedAnalysis {
    return {
      projectType: data.projectType || 'unknown',
      complexity: data.complexity || 'simple',
      coreFeatures: data.coreFeatures || [],
      targetAudience: data.targetAudience || '',
      completeness: {
        score: data.completeness?.score || 0,
        missingElements: data.completeness?.missingElements || [],
        suggestions: data.completeness?.suggestions || [],
        confidence: data.completeness?.confidence || 0,
      },
      questionStrategy: {
        totalQuestions: data.questionStrategy?.totalQuestions || 0,
        questionTypes: data.questionStrategy?.questionTypes || [],
        adaptiveQuestions: data.questionStrategy?.adaptiveQuestions || false,
      },
    };
  }

  processQualityResult(data: any): QualityAssessment {
    return {
      completeness: data.completeness || 0,
      clarity: data.clarity || 0,
      consistency: data.consistency || 0,
      confidence: data.confidence || 0,
      overallScore: data.overallScore || 0,
      recommendations: data.recommendations || [],
      requiredFollowUps: data.requiredFollowUps || [],
    };
  }

  processFinalResult(data: any): FinalOutput {
    return {
      json: data.json || {},
      summary: {
        requirements: data.summary?.requirements || [],
        recommendations: data.summary?.recommendations || [],
        estimatedTime: data.summary?.estimatedTime || '',
        estimatedCost: data.summary?.estimatedCost || '',
        risks: data.summary?.risks || [],
      },
      quality: this.processQualityResult(data.quality),
    };
  }

  // Utility Methods
  createConversationContext(
    analysis: EnhancedAnalysis,
    answers: UserAnswers,
    phase: 'initial' | 'quality' | 'followup' | 'final' = 'initial'
  ): ConversationContext {
    return {
      previousAnswers: answers,
      analysis,
      currentPhase: phase,
    };
  }

  shouldProceedToNextPhase(quality: QualityAssessment, threshold: number = 70): boolean {
    return quality.overallScore >= threshold;
  }

  getNextPhase(currentPhase: string, quality: QualityAssessment): string {
    switch (currentPhase) {
      case 'initial':
        return quality.overallScore >= 70 ? 'final' : 'quality';
      case 'quality':
        return quality.overallScore >= 70 ? 'final' : 'followup';
      case 'followup':
        return 'final';
      case 'final':
        return 'complete';
      default:
        return 'initial';
    }
  }
}

// Export singleton instance
export const openAIQuestionService = new OpenAIQuestionService();
