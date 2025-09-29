import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { generateMinimalNextJsMockFiles } from '@/midori/agents/orchestrator/tools/mock_website';

const prisma = new PrismaClient();

const RequestSchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),
  subdomain: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1) Validate request
    const body = await request.json();
    const { projectId, subdomain } = RequestSchema.parse(body);

    // 2) Ensure project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 3) Generate mock Next.js files
    const files = generateMinimalNextJsMockFiles();

    // 4) Create queued deployment record (mark meta as mock_source)
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        provider: 'vercel',
        state: 'queued',
        meta: {
          mock_source: true,
          filesSummary: files.map(f => f.path),
        },
      },
    });

    // 5) Deploy to Vercel
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;
    
    if (!vercelToken) {
      return NextResponse.json(
        { success: false, error: 'VERCEL_TOKEN is not configured' },
        { status: 500 }
      );
    }
    
    // Log configuration for debugging
    console.log('🔧 Vercel Config:', {
      hasToken: !!vercelToken,
      tokenPrefix: vercelToken?.substring(0, 10) + '...',
      teamId: vercelTeamId || 'not set',
      projectName: subdomain || `midori-mock-${deployment.id.slice(0, 8)}`
    });

    // Test Vercel connection first
    try {
      await axios.get(
        vercelTeamId 
          ? `https://api.vercel.com/v2/teams/${vercelTeamId}`
          : 'https://api.vercel.com/v2/user',
        {
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
          }
        }
      );
      console.log('✅ Vercel connection test passed');
    } catch (connectionError: any) {
      console.error('❌ Vercel connection test failed:', connectionError.response?.data || connectionError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vercel connection failed. Please check your token and team settings.',
          details: connectionError.response?.data?.error || connectionError.message,
          suggestion: 'Try testing your Vercel connection with GET /api/vercel-test'
        },
        { status: connectionError.response?.status || 500 }
      );
    }

    const filesPayload = files.reduce((acc, file) => {
      acc[file.path] = file.content;
      return acc;
    }, {} as Record<string, string>);

    // Deploy directly without creating project first
    const projectName = subdomain || `midori-mock-${deployment.id.slice(0, 8)}`;
    
    const vercelRes = await axios.post(
      'https://api.vercel.com/v13/deployments',
      {
        name: projectName,
        files: filesPayload,
        target: 'production',
        ...(vercelTeamId && { teamId: vercelTeamId }),
      },
      {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const vercelData = vercelRes.data as { id: string; url: string; state: string };

    // 6) Update deployment record
    const updated = await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        url: vercelData.url,
        state: mapVercelStateToDeployState(vercelData.state),
        meta: {
          ...(deployment.meta as any),
          vercelDeploymentId: vercelData.id,
          vercelUrl: vercelData.url,
          vercelState: vercelData.state,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        deploymentId: updated.id,
        projectId: updated.projectId,
        url: updated.url,
        state: updated.state,
        vercelDeploymentId: vercelData.id,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    console.error('❌ Mock-to-Vercel deploy error:', error);
    
    // Handle specific Vercel API errors
    if (error.response?.status === 403) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vercel API access denied. Please check your VERCEL_TOKEN and VERCEL_TEAM_ID.',
          details: 'Token may be invalid or insufficient permissions'
        },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vercel authentication failed. Please check your VERCEL_TOKEN.',
          details: 'Token is invalid or expired'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Deployment failed. Please check Vercel configuration.',
        details: error.response?.data?.error || error.message
      },
      { status: 500 }
    );
  }
}

function mapVercelStateToDeployState(vercelState: string): 'queued' | 'building' | 'ready' | 'failed' {
  switch (vercelState) {
    case 'BUILDING':
      return 'building';
    case 'READY':
      return 'ready';
    case 'ERROR':
    case 'CANCELED':
      return 'failed';
    default:
      return 'queued';
  }
}


