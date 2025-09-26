import { z } from 'zod';

/**
 * Zod schemas for deployment API validation
 */

export const DeployWebsiteRequestSchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),
  files: z.array(z.object({
    path: z.string().min(1, 'File path is required'),
    content: z.string(),
    type: z.enum(['code', 'text', 'asset']).default('code')
  })).min(1, 'At least one file is required'),
  subdomain: z.string().optional(),
  buildCommand: z.string().optional().default('npm run build'),
  outputDirectory: z.string().optional().default('.next'),
  environmentVariables: z.record(z.string()).optional().default({})
});

export const DeployWebsiteResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    deploymentId: z.string(),
    projectId: z.string(),
    url: z.string().optional(),
    state: z.enum(['queued', 'building', 'ready', 'failed']),
    vercelDeploymentId: z.string().optional(),
    createdAt: z.string()
  }).optional(),
  error: z.string().optional()
});

export const VercelDeploymentResponseSchema = z.object({
  id: z.string(),
  url: z.string(),
  state: z.enum(['BUILDING', 'READY', 'ERROR', 'CANCELED']),
  readyState: z.enum(['BUILDING', 'READY', 'ERROR', 'CANCELED']).optional(),
  createdAt: z.number(),
  buildingAt: z.number().optional(),
  readyAt: z.number().optional()
});

export type DeployWebsiteRequest = z.infer<typeof DeployWebsiteRequestSchema>;
export type DeployWebsiteResponse = z.infer<typeof DeployWebsiteResponseSchema>;
export type VercelDeploymentResponse = z.infer<typeof VercelDeploymentResponseSchema>;
