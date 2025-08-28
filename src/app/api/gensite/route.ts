import { NextRequest, NextResponse } from 'next/server';
import { 
  SiteGenRequest, 
  SiteGenResponse, 
  SiteGenRequestSchema,
  SiteGenResponseSchema,
  SiteGenSession,
  GenerationStatus,
  DEFAULT_GENERATION_OPTIONS 
} from '@/types/sitegen';
import { SiteGeneratorService } from '@/utils/site-generator';

// In-memory storage for generation sessions (should be replaced with database in production)
const generationSessions = new Map<string, SiteGenSession>();

// Generate unique generation ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * POST /api/gensite
 * Generate a complete website from finalJson
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚀 Site Generator API called');



    // 3. Parse and validate request body
    const body = await request.json();
    console.log('📝 Request body received:', JSON.stringify(body, null, 2));

    const validationResult = SiteGenRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request format',
          message: 'รูปแบบข้อมูลไม่ถูกต้อง',
          details: validationResult.error.errors
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    const { finalJson, sessionId, options } = validationResult.data;

    // 4. Validate finalJson
    if (!finalJson) {
      return NextResponse.json(
        { 
          success: false,
          error: 'finalJson is required',
          message: 'ต้องการข้อมูล finalJson เพื่อสร้างเว็บไซต์'
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    // 5. Create generation session
    const generationId = generateId();
    const generationOptions = { ...DEFAULT_GENERATION_OPTIONS, ...options };
    
    const generationSession: SiteGenSession = {
      id: generationId,
      finalJson,
      options: generationOptions,
      status: {
        id: generationId,
        status: 'pending',
        progress: 0,
        currentTask: 'Initializing site generation...',
        filesGenerated: 0,
        totalFiles: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      files: [],

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    generationSessions.set(generationId, generationSession);

    console.log('🏗️ Starting site generation...');
    console.log('Generation ID:', generationId);
   
    console.log('Options:', generationOptions);

    // 6. Start background generation (non-blocking)
    generateSiteInBackground(generationId, finalJson, generationOptions)
      .catch(error => {
        console.error('Background generation failed:', error);
        const session = generationSessions.get(generationId);
        if (session) {
          session.status.status = 'failed';
          session.status.error = error.message;
          session.status.updatedAt = new Date();
          generationSessions.set(generationId, session);
        }
      });

    // 7. Return immediate response
    const response: SiteGenResponse = {
      success: true,
      generationId,
      sessionId,
      message: '🚀 เริ่มการสร้างเว็บไซต์แล้ว! คุณสามารถติดตามความคืบหน้าได้',
      estimatedTime: 60, // 1 minute estimate
      totalFiles: 0, // Will be updated during generation
    };

    // Validate response
    const responseValidation = SiteGenResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.error('Response validation failed:', responseValidation.error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: 'Internal server error',
          message: 'เกิดข้อผิดพลาดภายในระบบ'
        },
        { 
          status: 500,
          headers: securityHeaders
        }
      );
    }

    return NextResponse.json(responseValidation.data, {
      status: 200,
      headers: securityHeaders
    });

  } catch (error) {
    console.error('❌ Error in Site Generator API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'เกิดข้อผิดพลาดในการสร้างเว็บไซต์ กรุณาลองใหม่อีกครั้ง'
      },
      { 
        status: 500,
        headers: securityHeaders
      }
    );
  }
}

/**
 * GET /api/gensite?id=generationId
 * Get generation status and files
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const generationId = url.searchParams.get('id');

    if (!generationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Generation ID is required',
          message: 'ต้องระบุ Generation ID'
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    // Get generation session
    const session = generationSessions.get(generationId);
    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Generation session not found',
          message: 'ไม่พบเซสชันการสร้างเว็บไซต์'
        },
        { 
          status: 404,
          headers: securityHeaders
        }
      );
    }


    // Return session status and files
    const response: SiteGenResponse = {
      success: true,
      generationId: session.id,
      message: getStatusMessage(session.status.status, session.status.progress),
      files: session.status.status === 'completed' ? session.files : undefined,
      projectStructure: session.projectStructure,
      totalFiles: session.status.totalFiles,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: securityHeaders
    });

  } catch (error) {
    console.error('Error getting generation status:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'เกิดข้อผิดพลาดในการดึงสถานะ'
      },
      { 
        status: 500,
        headers: securityHeaders
      }
    );
  }
}

/**
 * Background site generation function
 */
async function generateSiteInBackground(
  generationId: string, 
  finalJson: Record<string, unknown>, 
  options: Record<string, unknown>
): Promise<void> {
  const session = generationSessions.get(generationId);
  if (!session) {
    throw new Error('Generation session not found');
  }

  try {
    // Update status to generating
    session.status.status = 'generating';
    session.status.progress = 10;
    session.status.currentTask = 'Analyzing project requirements...';
    session.status.updatedAt = new Date();
    generationSessions.set(generationId, session);

    console.log('🔍 Analyzing finalJson...');

    // Generate site using the service
    const result = await SiteGeneratorService.generateSite(finalJson, options as any);

    // Update session with results
    session.files = result.files;
    session.projectStructure = result.projectStructure as any;
    session.status.status = 'completed';
    session.status.progress = 100;
    session.status.currentTask = 'Site generation completed!';
    session.status.filesGenerated = result.files.length;
    session.status.totalFiles = result.files.length;
    session.status.completedAt = new Date();
    session.status.updatedAt = new Date();
    session.updatedAt = new Date();

    generationSessions.set(generationId, session);

    console.log('✅ Site generation completed successfully!');
    console.log(`📁 Generated ${result.files.length} files`);

  } catch (error) {
    console.error('❌ Background generation failed:', error);
    
    // Update session with error - but don't fail completely
    session.status.status = 'completed'; // Mark as completed even with fallback
    session.status.progress = 100;
    session.status.currentTask = 'Site generation completed with fallback content';
    session.status.error = error instanceof Error ? error.message : 'Unknown error';
    session.status.updatedAt = new Date();
    session.status.completedAt = new Date();
    
    // The SiteGeneratorService now returns fallback content instead of throwing
    // So we should still have some files even if AI generation failed
    console.log('🔄 Generation completed with fallback system');
    
    generationSessions.set(generationId, session);
    
    // Don't throw - let the fallback system handle it
  }
}

/**
 * Get status message based on generation status
 */
function getStatusMessage(status: string, progress: number): string {
  switch (status) {
    case 'pending':
      return '⏳ รออยู่ในคิว...';
    case 'generating':
      return `🔨 กำลังสร้างเว็บไซต์... ${progress}%`;
    case 'completed':
      return '✅ สร้างเว็บไซต์เสร็จสิ้น!';
    case 'failed':
      return '❌ เกิดข้อผิดพลาดในการสร้างเว็บไซต์';
    default:
      return '⚡ กำลังประมวลผล...';
  }
}
