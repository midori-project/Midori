import { z } from 'zod';

// File structure for generated website
export const GeneratedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  type: z.enum(['component', 'page', 'api', 'config', 'style', 'util']),
  language: z.enum(['typescript', 'javascript', 'css', 'html', 'json', 'markdown']),
});

// Site generation request schema
export const SiteGenRequestSchema = z.object({
  finalJson: z.any(), // The finalJson from chat session
  sessionId: z.string().optional(),
  options: z.object({
    framework: z.enum(['next', 'react', 'vue', 'svelte']).default('next'),
    styling: z.enum(['tailwind', 'css-modules', 'styled-components', 'css']).default('tailwind'),
    typescript: z.boolean().default(true),
    includeAuth: z.boolean().default(false),
    includeDB: z.boolean().default(false),
    deployment: z.enum(['vercel', 'netlify', 'aws', 'self-hosted']).default('vercel'),
  }).optional(),
});

// Site generation response schema
export const SiteGenResponseSchema = z.object({
  success: z.boolean(),
  generationId: z.string(),
  sessionId: z.string().optional(),
  message: z.string(),
  files: z.array(GeneratedFileSchema).optional(),
  projectStructure: z.object({
    name: z.string(),
    description: z.string(),
    framework: z.string(),
    dependencies: z.record(z.string()),
    devDependencies: z.record(z.string()),
    scripts: z.record(z.string()),
  }).optional(),
  downloadUrl: z.string().optional(),
  error: z.string().optional(),
  estimatedTime: z.number().optional(), // in seconds
  totalFiles: z.number().optional(),
});

// Generation status schema
export const GenerationStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'generating', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  currentTask: z.string().optional(),
  filesGenerated: z.number().default(0),
  totalFiles: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
});

// Site generation session schema
export const SiteGenSessionSchema = z.object({
  id: z.string(),
  finalJson: z.any(),
  options: SiteGenRequestSchema.shape.options,
  status: GenerationStatusSchema,
  files: z.array(GeneratedFileSchema).default([]),
  projectStructure: SiteGenResponseSchema.shape.projectStructure.optional(),
  userId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// TypeScript types
export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;
export type SiteGenRequest = z.infer<typeof SiteGenRequestSchema>;
export type SiteGenResponse = z.infer<typeof SiteGenResponseSchema>;
export type GenerationStatus = z.infer<typeof GenerationStatusSchema>;
export type SiteGenSession = z.infer<typeof SiteGenSessionSchema>;

// Template types for different project structures
export interface ProjectTemplate {
  name: string;
  description: string;
  framework: string;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

// Generation options with defaults - เน้น Frontend-only
export const DEFAULT_GENERATION_OPTIONS = {
  framework: 'next' as const,
  styling: 'tailwind' as const,
  typescript: true,
  includeAuth: false,  // ปิด - ใช้ Supabase แทน
  includeDB: false,    // ปิด - ใช้ Supabase แทน
  deployment: 'vercel' as const,
  frontendOnly: true,  // เพิ่ม flag สำหรับ frontend-only
};
