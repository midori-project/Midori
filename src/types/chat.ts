import { z } from 'zod';

// Zod schemas
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

export const TechStackSchema = z.object({
  frontend: z.array(z.string()),
  backend: z.array(z.string()),
  database: z.array(z.string()),
  deployment: z.array(z.string()),
});

export const CompletenessSchema = z.object({
  score: z.number().min(0).max(100),
  missingElements: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const AnalysisSchema = z.object({
  projectType: z.string(),
  coreFeatures: z.array(z.string()),
  targetAudience: z.string(),
  complexity: z.enum(["simple", "medium", "complex"]),
  estimatedTokens: z.number(),
  techStack: TechStackSchema,
  completeness: CompletenessSchema,
  refinementQuestions: z.array(z.string()),
});

export const ChatSessionSchema = z.object({
  id: z.string(),
  messages: z.array(ChatMessageSchema),
  currentStep: z.enum(["initial", "analysis", "questions", "final"]),
  originalPrompt: z.string().optional(),
  analysis: AnalysisSchema.optional(),
  userResponses: z.record(z.string()),
  finalJson: z.any().optional(),
  currentData: z.object({
    Name: z.string().optional(),
    Type: z.string().optional(),
    Goal: z.string().optional(),
    Features: z.string().optional(),
    Design: z.object({
      Theme: z.string().optional(),
      PrimaryColor: z.string().optional(),
      SecondaryColor: z.string().optional(),
      Typography: z.string().optional(),
    }).optional(),
    Background: z.union([z.string(), z.null()]).optional(),
  }).default({}),
  askedFields: z.array(z.string()).default([]),
  createdAt: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  updatedAt: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional().nullable(),
});

export const ChatResponseSchema = z.object({
  success: z.boolean(),
  sessionId: z.string(),
  message: z.string(),
  currentStep: z.enum(["initial", "analysis", "questions", "final"]),
  analysis: AnalysisSchema.optional(),
  finalJson: z.any().optional(),
  isComplete: z.boolean(),
  error: z.string().optional(),
  currentQuestion: z.number().optional().nullable(),
  totalQuestions: z.number().optional().nullable(),
  currentquestion: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
});

// TypeScript types derived from Zod schemas
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatSession = z.infer<typeof ChatSessionSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type TechStack = z.infer<typeof TechStackSchema>;
export type Completeness = z.infer<typeof CompletenessSchema>;
