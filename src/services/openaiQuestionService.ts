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



  // Data Processing Methods
  processAnalysisResult(data: any): EnhancedAnalysis {
    return {
      projectName: data.projectName || null,
      projectType: data.projectType || 'unknown',
      complexity: data.complexity || 'simple',
      coreFeatures: data.coreFeatures || [],
      targetAudience: data.targetAudience || '',
      designPreferences: {
        designStyle: data.designPreferences?.designStyle || undefined,
      },
      missingElements: data.missingElements || [],
      questionStrategy: {
        totalQuestions: data.questionStrategy?.totalQuestions || 0,
        questionTypes: data.questionStrategy?.questionTypes || [],
        adaptiveQuestions: data.questionStrategy?.adaptiveQuestions || false,
        priorityQuestions: data.questionStrategy?.priorityQuestions || [],
      },
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
    };
  }

  // Utility Methods
  createConversationContext(
    analysis: EnhancedAnalysis,
    answers: UserAnswers,
    phase: 'initial' | 'questions' | 'final' = 'initial'
  ): ConversationContext {
    return {
      previousAnswers: answers,
      analysis,
      currentPhase: phase,
    };
  }
}

// Export singleton instance
export const openAIQuestionService = new OpenAIQuestionService();
