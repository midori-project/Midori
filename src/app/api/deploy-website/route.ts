import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { 
  DeployWebsiteRequestSchema, 
  DeployWebsiteResponseSchema,
  type DeployWebsiteRequest,
  type VercelDeploymentResponse 
} from './schemas';

const prisma = new PrismaClient();

/**
 * POST /api/deploy-website
 * Deploy a website to Vercel with automatic subdomain assignment
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate request with Zod schema
    const body = await request.json();
    const validatedData = DeployWebsiteRequestSchema.parse(body);
    
    console.log('🚀 Deployment request received:', {
      projectId: validatedData.projectId,
      fileCount: validatedData.files.length,
      subdomain: validatedData.subdomain
    });

    // 2. Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      include: { owner: true }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 3. Create deployment record in database
    const deployment = await prisma.deployment.create({
      data: {
        projectId: validatedData.projectId,
        provider: 'vercel',
        state: 'queued',
        meta: {
          files: validatedData.files,
          buildCommand: validatedData.buildCommand,
          outputDirectory: validatedData.outputDirectory,
          environmentVariables: validatedData.environmentVariables
        }
      }
    });

    // 4. Deploy to Vercel
    const vercelResponse = await deployToVercel(validatedData, deployment.id);
    
    // 5. Update deployment with Vercel response
    const updatedDeployment = await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        url: vercelResponse.url,
        state: mapVercelStateToDeployState(vercelResponse.state),
        meta: {
          ...deployment.meta as any,
          vercelDeploymentId: vercelResponse.id,
          vercelUrl: vercelResponse.url,
          vercelState: vercelResponse.state
        }
      }
    });

    console.log('✅ Deployment successful:', {
      deploymentId: updatedDeployment.id,
      url: updatedDeployment.url,
      state: updatedDeployment.state
    });

    // 6. Return standardized response
    return NextResponse.json({
      success: true,
      data: {
        deploymentId: updatedDeployment.id,
        projectId: updatedDeployment.projectId,
        url: updatedDeployment.url,
        state: updatedDeployment.state,
        vercelDeploymentId: vercelResponse.id,
        createdAt: updatedDeployment.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Deployment error:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'Deployment failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}

/**
 * Deploy project files to Vercel
 */
async function deployToVercel(
  data: DeployWebsiteRequest, 
  deploymentId: string
): Promise<VercelDeploymentResponse> {
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelTeamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken) {
    throw new Error('VERCEL_TOKEN environment variable is required');
  }

  try {
    // Prepare files for Vercel deployment
    const files = data.files.reduce((acc, file) => {
      acc[file.path] = file.content;
      return acc;
    }, {} as Record<string, string>);

    // Create Vercel deployment
    const vercelResponse = await axios.post(
      'https://api.vercel.com/v13/deployments',
      {
        name: data.subdomain || `midori-${deploymentId.slice(0, 8)}`,
        files,
        projectSettings: {
          buildCommand: data.buildCommand,
          outputDirectory: data.outputDirectory,
          framework: 'nextjs'
        },
        target: 'production',
        ...(vercelTeamId && { teamId: vercelTeamId })
      },
      {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return vercelResponse.data;
  } catch (error: any) {
    console.error('Vercel deployment failed:', error.response?.data || error.message);
    throw new Error(`Vercel deployment failed: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Map Vercel deployment state to our DeployState enum
 */
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

/**
 * GET /api/deploy-website
 * Get deployment status
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const deploymentId = url.searchParams.get('deploymentId');
    const projectId = url.searchParams.get('projectId');

    if (!deploymentId && !projectId) {
      return NextResponse.json(
        { success: false, error: 'deploymentId or projectId is required' },
        { status: 400 }
      );
    }

    const where = deploymentId 
      ? { id: deploymentId }
      : { projectId: projectId! };

    const deployment = await prisma.deployment.findFirst({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!deployment) {
      return NextResponse.json(
        { success: false, error: 'Deployment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        deploymentId: deployment.id,
        projectId: deployment.projectId,
        url: deployment.url,
        state: deployment.state,
        provider: deployment.provider,
        createdAt: deployment.createdAt.toISOString(),
        project: deployment.project
      }
    });

  } catch (error) {
    console.error('❌ Get deployment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deployment' },
      { status: 500 }
    );
  }
}
