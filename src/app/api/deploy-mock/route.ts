import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Zod schema for request validation
const MockDeployRequestSchema = z.object({
  projectId: z.string().min(1),
  subdomain: z.string().optional(),
});

// Standardized response shape
const success = (data: any) => NextResponse.json({ success: true, data });
const failure = (message: string, status = 400, details?: any) =>
  NextResponse.json({ success: false, error: message, details }, { status });

// POST /api/deploy-mock
// Creates a mock deployment record without running real provider flow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = MockDeployRequestSchema.parse(body);

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: validated.projectId } });
    if (!project) {
      return failure('Project not found', 404);
    }

    // Create a mock URL (does not actually deploy)
    const base = validated.subdomain?.trim() || `mock-${validated.projectId.slice(0, 8)}`;
    const mockUrl = `https://${base}.mock.midori.local`;

    // Create deployment record marked as ready immediately
    const deployment = await prisma.deployment.create({
      data: {
        projectId: validated.projectId,
        provider: 'vercel', // keep enum valid; flag mock in meta
        state: 'ready',
        url: mockUrl,
        meta: {
          mock: true,
          reason: 'Mock deployment shortcut',
        },
      },
    });

    return success({
      deploymentId: deployment.id,
      projectId: deployment.projectId,
      url: deployment.url,
      state: deployment.state,
      createdAt: deployment.createdAt.toISOString(),
      mock: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return failure('Invalid request data', 400, error.flatten().fieldErrors);
    }
    return failure('Internal server error', 500);
  }
}



