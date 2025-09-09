import { SITE_GEN_CONFIG } from '../../../utils/site-generator/config';
import { prisma } from '../../../libs/prisma/prisma';
import { getCurrentSession } from '../../../libs/auth/session';

// API Route Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { finalJson, projectId, options, userId } = body;
    
    if (!finalJson) {
      return Response.json(
        { error: 'finalJson is required' },
        { status: 400 }
      );
    }
    
    if (!projectId) {
      return Response.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }
    
    console.log('🚀 Starting site generation for project:', projectId);
    console.log('📋 Final JSON:', finalJson);
    
    // เรียกใช้ SiteGeneratorService
    const { SiteGeneratorService } = await import('../../../utils/site-generator');
    const result = await SiteGeneratorService.generateSite(finalJson, options);
    
    console.log('✅ Site generation completed');
    console.log('📁 Generated files:', result.files.length);
    
    // บันทึกข้อมูลลงตาราง Generation และ GenerationFile
    let generationId: string | null = null;
    try {
      console.log('💾 Saving generation data to database...');
      
      // สร้าง Generation record
      const generation = await prisma.generation.create({
        data: {
          projectId: projectId,
          userId: userId || (await getCurrentSession())?.userId ,
          prompt: JSON.stringify(finalJson),
          promptJson: finalJson,
          options: options || {},
          model: SITE_GEN_CONFIG.currentModel,
          tokensInput: 0, // จะอัปเดตในภายหลังถ้าต้องการ
          tokensOutput: 0, // จะอัปเดตในภายหลังถ้าต้องการ
          costUsd: 0 // จะอัปเดตในภายหลังถ้าต้องการ
        }
      });
      
      generationId = generation.id;
      console.log('✅ Generation record created:', generationId);
      
      // สร้าง GenerationFile records สำหรับแต่ละไฟล์
      if (generationId) {
        const generationFiles = await prisma.generationFile.createMany({
          data: result.files.map(file => ({
            generationId: generationId as string,
            filePath: file.path,
            fileContent: file.content,
            changeType: 'create' as const
          }))
        });
        
        console.log('✅ GenerationFile records created:', generationFiles.count);
      } else {
        console.warn('⚠️ Cannot create GenerationFile records: generationId is null');
      }
      
    } catch (dbError) {
      console.error('❌ Failed to save generation data to database:', dbError);
      // ไม่ throw error เพื่อไม่ให้กระทบการทำงานหลัก
      // แต่จะ log error เพื่อ debug
    }
    
    return Response.json({
      success: true,
      message: 'Site generated successfully',
      data: {
        files: result.files,
        projectStructure: result.projectStructure,
        fileCount: result.files.length,
        generationId: generationId // ส่ง generationId กลับไปด้วย
      }
    });
    
  } catch (error) {
    console.error('❌ Site generation failed:', error);
    
    return Response.json(
      { 
        success: false,
        error: 'Site generation failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}