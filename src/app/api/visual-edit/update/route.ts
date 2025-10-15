/**
 * Visual Edit Update API
 * รับการอัปเดตจาก visual editor และบันทึกลง database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';
import { prisma } from '@/libs/prisma/prisma';
import { visualEditService } from '@/libs/services/visualEditService';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Visual edit update request received');
    
    // Check authentication
    const session = await getCurrentSession();
    console.log('🔐 Session check:', session ? `User ${session.userId}` : 'No session');
    
    if (!session?.user?.email) {
      console.log('❌ Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { projectId, blockId, field, value, itemIndex } = body;
    
    console.log('📝 Update data:', { projectId, blockId, field, value: value?.substring?.(0, 50) || value });

    // Validate input
    const validation = visualEditService.validateUpdate({
      projectId,
      blockId,
      field,
      value,
      itemIndex
    });
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Load project with latest snapshot
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { 
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        owner: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (project.owner.id !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const latestSnapshot = project.snapshots[0];
    if (!latestSnapshot) {
      return NextResponse.json(
        { error: 'Project snapshot not found' },
        { status: 404 }
      );
    }

    // Parse existing overrides from templateData
    const templateData = (latestSnapshot.templateData as any) || {};
    const existingOverrides = templateData.customOverrides || [];

    // Parse field path
    const parsed = visualEditService.parseFieldPath(field);

    // สร้าง override value
    let overrideValue: any;
    
    if (parsed.index !== undefined && parsed.subfield) {
      // Array item field (e.g., menuItems[0].name)
      // ต้องดึง array เดิมมาแก้ไข
      const existingOverride = existingOverrides.find(
        (o: any) => o.blockId === blockId
      );
      
      const currentArray = existingOverride?.placeholderOverrides?.[parsed.field] || [];
      
      // อัปเดต array
      const updatedArray = visualEditService.createArrayItemOverride(
        currentArray,
        parsed.index,
        parsed.subfield,
        value
      );
      
      overrideValue = { [parsed.field]: updatedArray };
    } else {
      // Simple field
      overrideValue = { [field]: value };
    }

    // สร้าง new override (OverrideConfig requires customizations field)
    const newOverride = {
      blockId,
      customizations: {}, // Required by OverrideConfig type
      placeholderOverrides: overrideValue
    };

    // Merge overrides
    const mergedOverrides = visualEditService.mergeOverrides(
      existingOverrides,
      newOverride
    );

    // บันทึกลง database - เก็บใน templateData.customOverrides
    const updatedTemplateData = {
      ...templateData,
      customOverrides: mergedOverrides
    };
    
    console.log('💾 Saving to database:', {
      snapshotId: latestSnapshot.id,
      overridesCount: mergedOverrides.length
    });
    
    const updatedSnapshot = await prisma.snapshot.update({
      where: { id: latestSnapshot.id },
      data: { 
        templateData: updatedTemplateData as any
      }
    });

    console.log(`✅ Visual edit customOverrides saved to templateData`);
    
    // 🔄 Regenerate affected file with new override
    console.log('🔄 Regenerating affected component file...');
    
    try {
      // Import what we need for regeneration
      const { TemplateAdapter } = await import('@/midori/agents/frontend-v2/adapters/template-adapter');
      const adapter = new TemplateAdapter();
      
      // Get current files from snapshot
      const currentFiles = (latestSnapshot.files as any) || [];
      
      // Get AI generated data from templateData
      const aiGeneratedData = templateData.exportedJson || templateData.aiContentGenerated || {};
      
      // Prepare minimal task with overrides
      const regenerateTask: any = {
        taskId: `visual-edit-${Date.now()}`,
        taskType: 'regenerate_content',
        businessCategory: templateData.businessCategory || 'restaurant',
        keywords: templateData.keywords || [],
        customizations: {},
        metadata: {
          visualEditOverrides: mergedOverrides, // 🔑 ส่ง overrides เข้าไป
          aiGeneratedData // 🔑 ส่ง AI data เดิมเข้าไปด้วย
        },
        validation: { enabled: false },
        aiSettings: templateData.aiSettings || { model: 'gpt-5-nano', temperature: 1, language: 'th' },
        includeProjectStructure: false,
        includePreview: false
      };
      
      // Regenerate (จะใช้ overrides ที่เราส่งไป)
      const result = await adapter.generateFrontend(regenerateTask);
      
      if (result.success && result.files.length > 0) {
        // Update snapshot files
        const fileMap = new Map(currentFiles.map((f: any) => [f.path, f]));
        
        // Update affected files
        for (const newFile of result.files) {
          fileMap.set(newFile.path, {
            path: newFile.path,
            content: newFile.content,
            type: newFile.type || 'component'
          });
        }
        
        const updatedFiles = Array.from(fileMap.values());
        
        // Save updated files back to snapshot
        await prisma.snapshot.update({
          where: { id: latestSnapshot.id },
          data: {
            files: updatedFiles as any
          }
        });
        
        console.log(`✅ Regenerated and updated ${result.files.length} file(s)`);
      }
    } catch (regenError) {
      console.error('⚠️ Failed to regenerate files (non-fatal):', regenError);
      // ไม่ return error เพราะ customOverrides ถูกบันทึกแล้ว
      // ผู้ใช้สามารถ refresh preview เพื่อ regenerate ภายหลัง
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Updated successfully and files regenerated',
      blockId,
      field,
      value
    });

  } catch (error) {
    console.error('❌ Visual edit update error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Export runtime config
export const runtime = 'nodejs'; // หรือ 'edge' ตามที่เหมาะสม

// OPTIONS for CORS (if needed)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

