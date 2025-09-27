import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma/prisma';
import { z } from 'zod';

// Schema สำหรับ placeholder filling
const PlaceholderFillSchema = z.object({
  templateId: z.string(),
  theme: z.string(),
  projectId: z.string().optional(),
  action: z.enum(['fill_placeholders', 'preview', 'validate']).default('fill_placeholders'),
});

// Schema สำหรับ JSON template upload
const JsonTemplateUploadSchema = z.object({
  template: z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    version: z.string().min(1),
    files: z.array(z.object({
      path: z.string().min(1),
      content: z.string().min(1),
    })),
    placeholders: z.object({
      theme: z.string().optional(),
      imagery: z.string().optional(),
      tone: z.string().optional(),
    }),
  }),
});

/**
 * POST /api/template/placeholder
 * เติม placeholder ใน template ด้วย AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, theme, projectId, action } = PlaceholderFillSchema.parse(body);

    // ดึง template จาก database
    const template = await prisma.uiTemplate.findUnique({
      where: { id: templateId },
      include: {
        versions: {
          where: { status: 'published' },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            sourceFiles: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const latestVersion = template.versions[0];
    if (!latestVersion) {
      return NextResponse.json({ error: 'No published version found' }, { status: 404 });
    }

    // ตรวจสอบ placeholder ในไฟล์
    const placeholderAnalysis = analyzePlaceholders(latestVersion.sourceFiles);
    
    if (action === 'validate') {
      return NextResponse.json({
        success: true,
        analysis: placeholderAnalysis,
        template: {
          id: template.id,
          name: template.label,
          category: template.category,
        },
      });
    }

    // เติม placeholder ด้วย AI
    const filledContent = await fillPlaceholdersWithAI(
      latestVersion.sourceFiles,
      theme,
      template.placeholderConfig,
      projectId
    );

    // บันทึกผลลัพธ์
    await prisma.uiTemplateVersion.update({
      where: { id: latestVersion.id },
      data: {
        placeholderData: filledContent,
        aiGenerated: {
          theme,
          projectId,
          filledAt: new Date().toISOString(),
          placeholderCount: placeholderAnalysis.totalPlaceholders,
        },
      },
    });

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.label,
        category: template.category,
      },
      filledContent,
      analysis: placeholderAnalysis,
    });

  } catch (error) {
    console.error('Placeholder filling error:', error);
    return NextResponse.json(
      { error: 'Failed to fill placeholders' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/template/placeholder
 * อัพโหลด JSON template
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { template } = JsonTemplateUploadSchema.parse(body);

    // สร้าง template ใหม่
    const newTemplate = await prisma.uiTemplate.create({
      data: {
        key: template.name.toLowerCase().replace(/\s+/g, '-'),
        label: template.name,
        category: template.category,
        jsonSource: template,
        placeholderConfig: {
          hasPlaceholders: true,
          placeholderTypes: extractPlaceholderTypes(template.files),
          themeMapping: template.placeholders,
        },
        meta: {
          create: {
            description: `Template with placeholder support: ${template.name}`,
            engine: 'placeholder',
            status: 'draft',
            author: 'User',
          },
        },
      },
    });

    // สร้าง version แรก
    const sourceFiles = template.files.map(file => ({
      path: file.path,
      content: file.content,
      type: 'code',
      encoding: 'utf8',
      size: file.content.length,
      sha256: generateSHA256(file.content),
    }));

    const version = await prisma.uiTemplateVersion.create({
      data: {
        templateId: newTemplate.id,
        version: 1,
        semver: template.version,
        status: 'draft',
        files: {
          format: 1,
          objects: sourceFiles.map(f => ({
            path: f.path,
            type: f.type,
            size: f.size,
            sha256: f.sha256,
          })),
        },
        slots: template.placeholders,
        sourceFiles: {
          create: sourceFiles,
        },
        sourceSummary: {
          create: {
            filesCount: sourceFiles.length,
            sizeBytes: sourceFiles.reduce((sum, f) => sum + f.size, 0),
            checksum: generateSHA256(JSON.stringify(sourceFiles)),
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      template: {
        id: newTemplate.id,
        name: newTemplate.label,
        category: newTemplate.category,
        version: version.version,
        status: version.status,
      },
    });

  } catch (error) {
    console.error('Template upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload template' },
      { status: 500 }
    );
  }
}

/**
 * วิเคราะห์ placeholder ในไฟล์
 */
function analyzePlaceholders(sourceFiles: any[]) {
  const analysis = {
    totalPlaceholders: 0,
    placeholderTypes: {
      tw: 0,
      text: 0,
      img: 0,
      data: 0,
    },
    files: [] as any[],
  };

  for (const file of sourceFiles) {
    const content = file.content;
    const placeholders = content.match(/<(tw|text|img|data)\/?>/g) || [];
    
    const fileAnalysis = {
      path: file.path,
      placeholderCount: placeholders.length,
      placeholders: placeholders,
    };

    analysis.files.push(fileAnalysis);
    analysis.totalPlaceholders += placeholders.length;

    // นับประเภท placeholder
    for (const placeholder of placeholders) {
      const type = placeholder.match(/<(tw|text|img|data)\/?>/)?.[1];
      if (type && analysis.placeholderTypes[type as keyof typeof analysis.placeholderTypes] !== undefined) {
        analysis.placeholderTypes[type as keyof typeof analysis.placeholderTypes]++;
      }
    }
  }

  return analysis;
}

/**
 * เติม placeholder ด้วย AI
 */
async function fillPlaceholdersWithAI(
  sourceFiles: any[],
  theme: string,
  placeholderConfig: any,
  projectId?: string
) {
  // ใช้ LLM สำหรับเติม placeholder
  const filledFiles = [];

  for (const file of sourceFiles) {
    const content = file.content;
    
    // ตรวจสอบว่ามี placeholder หรือไม่
    if (!content.includes('<tw/>') && !content.includes('<text/>') && !content.includes('<img/>')) {
      filledFiles.push({
        path: file.path,
        content: content,
        filled: false,
      });
      continue;
    }

    // สร้าง prompt สำหรับ AI
    const prompt = `
Fill the placeholders in this React component:

${content}

Theme: ${theme}
Placeholder Config: ${JSON.stringify(placeholderConfig)}

Instructions:
1. Replace <tw/> with appropriate Tailwind classes based on theme
2. Replace <text/> with Thai text appropriate for the context
3. Replace <img/> with Unsplash image URLs with Thai alt text
4. Keep the same component structure
5. Ensure valid React/JSX syntax

Return only the filled component code, no explanations.
`;

    try {
      // เรียก AI API (ใช้ QUESTION_API_KEY)
      const aiResponse = await fetch('/api/questionAi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUESTION_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          projectId: projectId || 'demo-project',
          action: 'fill_placeholders',
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI API failed');
      }

      const aiResult = await aiResponse.json();
      const filledContent = aiResult.content || content;

      filledFiles.push({
        path: file.path,
        content: filledContent,
        filled: true,
        originalContent: content,
      });

    } catch (error) {
      console.error(`Failed to fill placeholders in ${file.path}:`, error);
      filledFiles.push({
        path: file.path,
        content: content,
        filled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return filledFiles;
}

/**
 * แยกประเภท placeholder จากไฟล์
 */
function extractPlaceholderTypes(files: any[]) {
  const types = { tw: 0, text: 0, img: 0, data: 0 };
  
  for (const file of files) {
    const content = file.content;
    const placeholders = content.match(/<(tw|text|img|data)\/?>/g) || [];
    
    for (const placeholder of placeholders) {
      const type = placeholder.match(/<(tw|text|img|data)\/?>/)?.[1];
      if (type && types[type as keyof typeof types] !== undefined) {
        types[type as keyof typeof types]++;
      }
    }
  }
  
  return types;
}

/**
 * สร้าง SHA256 hash
 */
function generateSHA256(content: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}
