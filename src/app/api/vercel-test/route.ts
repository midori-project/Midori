import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * GET /api/vercel-test
 * Test Vercel API connection and permissions
 */
export async function GET(request: NextRequest) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;

    // Basic environment check
    const envCheck = {
      VERCEL_TOKEN: vercelToken ? `${vercelToken.substring(0, 10)}...` : 'NOT SET',
      VERCEL_TEAM_ID: vercelTeamId || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };

    if (!vercelToken) {
      return NextResponse.json({
        success: false,
        error: 'VERCEL_TOKEN is not configured',
        details: 'Please set VERCEL_TOKEN environment variable',
        environment: envCheck
      }, { status: 500 });
    }

    // Simple connection test first
    let userTest = null;
    let projectsTest = null;

    try {
      // Test 1: Check user/team info
      const userResponse = await axios.get(
        vercelTeamId 
          ? `https://api.vercel.com/v2/teams/${vercelTeamId}`
          : 'https://api.vercel.com/v2/user',
        {
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
          },
          timeout: 10000 // 10 second timeout
        }
      );
      userTest = {
        success: true,
        status: userResponse.status,
        data: {
          name: userResponse.data.name || userResponse.data.username,
          slug: userResponse.data.slug,
          id: userResponse.data.id
        }
      };
    } catch (userError: any) {
      userTest = {
        success: false,
        status: userError.response?.status || 'unknown',
        error: userError.response?.data?.error || userError.message
      };
    }

    try {
      // Test 2: Check projects access
      const projectsResponse = await axios.get(
        'https://api.vercel.com/v9/projects',
        {
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
          },
          params: vercelTeamId ? { teamId: vercelTeamId } : {},
          timeout: 10000 // 10 second timeout
        }
      );
      projectsTest = {
        success: true,
        status: projectsResponse.status,
        count: projectsResponse.data.projects?.length || 0
      };
    } catch (projectsError: any) {
      projectsTest = {
        success: false,
        status: projectsError.response?.status || 'unknown',
        error: projectsError.response?.data?.error || projectsError.message
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        environment: envCheck,
        tests: {
          user: userTest,
          projects: projectsTest
        },
        overall: {
          tokenConfigured: !!vercelToken,
          teamConfigured: !!vercelTeamId,
          canAccessUser: userTest?.success || false,
          canAccessProjects: projectsTest?.success || false
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Vercel test error:', error);

    if (error.response?.status === 401) {
      return NextResponse.json({
        success: false,
        error: 'Vercel authentication failed',
        details: 'Token is invalid or expired',
        status: 401
      }, { status: 401 });
    }

    if (error.response?.status === 403) {
      return NextResponse.json({
        success: false,
        error: 'Vercel access denied',
        details: error.response.data?.error || 'Insufficient permissions',
        status: 403,
        suggestion: vercelTeamId 
          ? 'Check if your token has access to the specified team'
          : 'Check if your token has the required permissions'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: false,
      error: 'Vercel connection failed',
      details: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    }, { status: 500 });
  }
}
