import type { Prisma } from '@prisma/client';
import type { FrontendTaskV2, ComponentResultV2 } from '../schemas/types';

type PersistOptions = {
  projectId: string;
  userId?: string | undefined;
};

// ---- Helpers: วางไว้ด้านบนไฟล์ ----
function parseJsonMaybe<T>(raw: unknown): T | undefined {
  try {
    if (typeof raw === 'string') return JSON.parse(raw) as T;
    return raw as T;
  } catch {
    return undefined;
  }
}

/** แตก bundle ที่ path === "files" (content = array ของไฟล์จริง) แล้วคืนรายการไฟล์ทั้งหมดเป็นอาเรย์แบน */
function flattenFilesBundle(files: Array<any>): Array<any> {
  const out: any[] = [];
  for (const f of files) {
    if (f?.path === 'files') {
      const inner = parseJsonMaybe<any[]>(f.content);
      if (Array.isArray(inner)) {
        for (const it of inner) {
          if (it?.path && it?.content != null) out.push(it);
        }
      }
      // ข้ามไม่ push ตัวห่อเอง
      continue;
    }
    if (f?.path && f?.content != null) out.push(f);
  }
  return out;
}

/** ลบไฟล์ซ้ำ โดยใช้ key = path (ตัวท้ายสุดเป็นตัวจริง) และกัน placeholder แปลก ๆ ออก */
function dedupeAndNormalizeFiles(files: Array<any>): Array<any> {
  const byPath = new Map<string, any>();
  for (const f of files) {
    // กันเอกสารเมตาบางอย่าง
    if (f.path === 'metadata') continue;
    // กันโฟลเดอร์เปล่า/ออบเจ็กต์ไม่ครบ
    if (!f.path || f.content == null) continue;
    byPath.set(f.path, f);
  }
  return Array.from(byPath.values());
}

export async function persistFrontendV2Result(
  result: ComponentResultV2,
  task: FrontendTaskV2,
  options: PersistOptions
) {
  const { projectId, userId } = options;
  const prisma: any = (globalThis as any).prisma;
  if (!prisma) {
    throw new Error('Prisma client is not initialized on globalThis.prisma');
  }

  // Resolve a valid user id: provided -> project.ownerId -> first active user
  const validUserId = await resolveValidUserId(userId, projectId);
  if (!validUserId) {
    // eslint-disable-next-line no-console
    console.warn('persistFrontendV2Result: no valid user could be resolved; skipping persistence');
    return;
  }

  // 0) Ensure Project exists (create if not found)
  await ensureProjectExists(projectId, validUserId, task);

  // 1) Create Generation (one per run)
  let generation = await createGenerationSafe({
    projectId,
    userId: validUserId,
    model: result.metadata?.aiModelUsed || 'gpt-5-nano',
    prompt: task,
    options: {
      taskType: task.taskType,
      businessCategory: task.businessCategory,
      keywords: task.keywords,
      customizations: task.customizations,
      validation: task.validation,
      aiSettings: task.aiSettings,
      includePreview: task.includePreview,
    },
  });

  // 2) Upsert Files to Project Files and record GenerationFile entries
  // รวมแหล่งไฟล์ให้ครบ → แตกไฟล์ที่ถูก "ห่อ" ใน path === "files" → ลบซ้ำตาม path
  const rawA = (result as any).projectStructure?.files ?? [];
  const rawB = Array.isArray(result.files) ? result.files : [];
  const merged = [...rawA, ...rawB];
  const flattened = flattenFilesBundle(merged);
  const filesToPersist = dedupeAndNormalizeFiles(flattened);
  
  // ✅ Validation: ตรวจสอบ component files ที่จำเป็น
  const componentFiles = filesToPersist.filter(f => f.path?.startsWith('src/components/'));
  const componentNames = componentFiles.map(f => f.path?.split('/').pop()?.replace('.tsx', ''));
  
  // ตรวจสอบ App.tsx imports
  const appFile = filesToPersist.find(f => f.path === 'src/App.tsx');
  if (appFile) {
    const appContent = appFile.content || '';
    const importMatches = appContent.match(/import\s+(\w+)\s+from\s+['"]\.\/components\/(\w+)['"]/g) || [];
    const importedComponents = importMatches.map((match: string) => {
      const [, componentName] = match.match(/import\s+(\w+)\s+from\s+['"]\.\/components\/(\w+)['"]/) || [];
      return componentName;
    });
    
    const missingComponents = importedComponents.filter((name: string) => 
      name && !componentNames.includes(name)
    );
    
    if (missingComponents.length > 0) {
      console.warn(`⚠️ Missing component files: ${missingComponents.join(', ')}`);
    }
  }
  
  // Build exported JSON compatible with test-cafe-complete.json
  const exportedJson = buildExportedJson(result, filesToPersist);
  const generationFilesPayload: Array<Promise<unknown>> = [];
  for (const file of filesToPersist) {
    const path = file.path;
    const type = mapFileType(file.type);
    const content = typeof file.content === 'string' ? file.content : JSON.stringify(file.content);

    // Upsert Project File
    generationFilesPayload.push(
      prisma.file.upsert({
        where: { projectId_path: { projectId, path } },
        update: {
          type,
          isBinary: false,
          content,
        },
        create: {
          projectId,
          path,
          type,
          isBinary: false,
          content,
        },
      })
    );

    // Skip GenerationFile creation for Component System (causes errors)
    // generationFilesPayload.push(
    //   prisma.generationFile.create({
    //     data: {
    //       generationId: generation.id,
    //       filePath: path,
    //       fileContent: content,
    //       changeType: 'create',
    //     },
    //   })
    // );
  }

  // ✅ ต้อง await ให้เสร็จก่อน
  await Promise.all(generationFilesPayload);

  // 3) Create Snapshot and related data in transaction
  const snapshotFiles = filesToPersist.map((f: any) => ({ path: f.path, type: f.type, content: f.content }));
  
  const snapshot = await prisma.$transaction(async (tx: any) => {
    // Create snapshot
    const snapshot = await tx.snapshot.create({
      data: {
        projectId,
        label: `frontend-v2-${new Date().toISOString()}`,
        files: snapshotFiles as unknown as Prisma.InputJsonValue,
        fromGenerationId: generation.id,
        templateData: {
          businessCategory: result.result.businessCategory,
          blocksGenerated: result.result.blocksGenerated,
          aiContentGenerated: result.result.aiContentGenerated,
          projectStructure: exportedJson.projectStructure,
          // Exported payload matching test-cafe-complete.json
          exportedJson,
          exportFormatVersion: 'v1',
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // Create preview session if present
    if (result.preview?.url) {
      await tx.previewSession.create({
        data: {
          projectId,
          snapshotId: snapshot.id,
          url: result.preview.url,
          state: 'ready',
          buildTimeMs: result.performance?.generationTime ? Math.round(result.performance.generationTime * 1000) : null,
          meta: {
            sandboxId: result.preview.sandboxId,
            status: result.preview.status,
            createdAt: result.preview.createdAt,
          },
        },
      });
    }

    return snapshot;
  });

  // 4) PreviewSession already created in transaction above

  // 5) Update ProjectContext.frontendV2Data summary
  try {
    await prisma.projectContext.upsert({
      where: { projectId },
      update: {
        frontendV2Data: {
          ...(buildFrontendV2Data(result, filesToPersist) as any),
          exportedJson,
          exportFormatVersion: 'v1',
        } as unknown as Prisma.InputJsonValue,
        preview: (result.preview ? (result.preview as unknown as Prisma.InputJsonValue) : undefined),
        lastModified: new Date(),
      },
      create: {
        projectId,
        specBundleId: 'unknown',
        projectType: mapProjectType(result.result.businessCategory),
        status: 'template_selected',
        components: {} as unknown as Prisma.InputJsonValue,
        pages: {} as unknown as Prisma.InputJsonValue,
        styling: {} as unknown as Prisma.InputJsonValue,
        conversationHistory: {} as unknown as Prisma.InputJsonValue,
        userPreferences: {} as unknown as Prisma.InputJsonValue,
        frontendV2Data: {
          ...(buildFrontendV2Data(result, filesToPersist) as any),
          exportedJson,
          exportFormatVersion: 'v1',
        } as unknown as Prisma.InputJsonValue,
        preview: (result.preview ? (result.preview as unknown as Prisma.InputJsonValue) : undefined),
      },
    });
  } catch (err) {
    // Non-fatal
    // eslint-disable-next-line no-console
    console.warn('Failed to upsert ProjectContext for frontend-v2:', err);
  }
}

function mapFileType(type: string): 'code' | 'text' | 'config' | 'asset' {
  if (type === 'style') return 'text';
  if (type === 'config') return 'config';
  if (type === 'documentation') return 'text';
  return 'code';
}

function mapProjectType(category: string): any {
  const map: Record<string, string> = {
    restaurant: 'restaurant',
    ecommerce: 'e_commerce',
    portfolio: 'portfolio',
    healthcare: 'healthcare',
    pharmacy: 'healthcare',
    coffee_shop: 'coffee_shop',
    blog: 'blog',
    landing_page: 'landing_page',
    business: 'business',
    personal: 'personal',
    hotel: 'hotel'
  };
  return (map[category] as any) || 'unknown'; // Default to 'unknown' for unmapped categories
}

function buildFrontendV2Data(result: ComponentResultV2, filesToPersist: Array<any>) {
  return {
    result: result.result,
    performance: result.performance,
    validation: result.validation,
    metadata: result.metadata,
    files: filesToPersist.map(f => ({ path: f.path, type: f.type })),
  };
}

/**
 * Build exported JSON compatible with test-cafe-complete.json format
 * Format: { projectStructure, files }
 */
function buildExportedJson(result: ComponentResultV2, filesToPersist: Array<any>) {
  const projectStructure = (result as any).projectStructure?.projectStructure || {
    name: (result as any).metadata?.projectName || (result as any).result?.brandName || 'project',
    type: (result as any).projectStructure?.type || 'vite-react-typescript',
    description: (result as any).result?.description || 'Generated by frontend-v2',
  };

  const mapLanguage = (file: any): string | undefined => {
    // Infer language from path or type
    const p: string = file.path || '';
    if (p.endsWith('.tsx')) return 'typescript';
    if (p.endsWith('.ts')) return 'typescript';
    if (p.endsWith('.js')) return 'javascript';
    if (p.endsWith('.cjs')) return 'javascript';
    if (p.endsWith('.jsx')) return 'javascript';
    if (p.endsWith('.css')) return 'css';
    if (p.endsWith('.html')) return 'html';
    if (p.endsWith('.json')) return 'json';
    if (p.endsWith('.md')) return 'markdown';
    return undefined;
  };

  const mapType = (file: any): string => {
    // Align with test-cafe format expectations
    const p: string = file.path || '';
    
    // Config files
    if (p === 'package.json') return 'config';
    if (p === 'tsconfig.json') return 'config';
    if (p === 'index.html') return 'config';
    if (p === 'vite.config.ts') return 'config';
    if (p === 'tailwind.config.js') return 'config';
    if (p === 'postcss.config.js') return 'config';
    if (p === 'eslint.config.js') return 'config';
    if (p === 'prettier.config.js') return 'config';
    if (p === 'public/index.html') return 'config';
    if (p.endsWith('.config.js') || p.endsWith('.config.ts')) return 'config';
    if (p.endsWith('.json') && !p.includes('src/')) return 'config';
    
    // Page files
    if (p === 'src/main.tsx') return 'page';
    if (p === 'src/App.tsx') return 'page';
    if (p.startsWith('src/pages/')) return 'page';
    
    // Component files
    if (p.startsWith('src/components/')) return 'component';
    
    // Style files
    if (p.endsWith('.css') || p.endsWith('index.css')) return 'style';
    
    // Fallback to original type or default
    return file.type || 'component';
  };

  const files = filesToPersist.map((f: any) => ({
    path: f.path,
    content: typeof f.content === 'string' ? f.content : JSON.stringify(f.content, null, 2),
    type: mapType(f),
    language: mapLanguage(f),
  }));

  // Return format matching test-cafe-complete.json (no wrapper)
  return { 
    projectStructure, 
    files 
  };
}

async function resolveValidUserId(userId: string | undefined, projectId: string) {
  const prisma: any = (globalThis as any).prisma;
  // 1) Provided userId
  if (userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) return user.id;
      // eslint-disable-next-line no-console
      console.warn('persistFrontendV2Result: provided userId not found, will try project owner');
    } catch {}
  }

  // 2) Project ownerId
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
    if (project?.ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: project.ownerId } });
      if (owner) return owner.id;
    }
  } catch {}

  // 3) Fallback: any active user
  try {
    const anyUser = await prisma.user.findFirst({ where: { isActive: true }, select: { id: true } });
    if (anyUser?.id) return anyUser.id;
  } catch {}

  return undefined;
}

async function ensureProjectExists(projectId: string, userId: string, task: FrontendTaskV2) {
  const prisma: any = (globalThis as any).prisma;
  try {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!existingProject) {
      // Create project if it doesn't exist
      console.log('📝 Creating project:', projectId);
      await prisma.project.create({
        data: {
          id: projectId,
          name: `Project ${projectId}`,
          description: `Generated by Component System - ${task.businessCategory}`,
          ownerId: userId,
          options: {
            componentSystem: {
              version: 'v1.0.0',
              businessCategory: task.businessCategory,
              keywords: task.keywords,
              lastUpdated: new Date().toISOString()
            }
          }
        }
      });
      console.log('✅ Project created successfully');
    } else {
      console.log('✅ Project already exists');
    }
  } catch (error) {
    console.error('❌ Error ensuring project exists:', error);
    throw error;
  }
}

async function createGenerationSafe(args: {
  projectId: string;
  userId?: string | undefined;
  model: string;
  prompt: FrontendTaskV2;
  options: Record<string, unknown>;
}) {
  const prisma: any = (globalThis as any).prisma;
  try {
    return await prisma.generation.create({
      data: {
        project: { connect: { id: args.projectId } },
        ...(args.userId ? { user: { connect: { id: args.userId } } } : {}),
        model: args.model,
        promptJson: args.prompt as unknown as Prisma.InputJsonValue,
        options: args.options as unknown as Prisma.InputJsonValue,
        tokensInput: 0,
        tokensOutput: 0,
        costUsd: 0,
      },
    });
  } catch (err: any) {
    // Retry without userId on FK constraint
    const code = err?.code;
    if (code === 'P2003' && args.userId) {
      // eslint-disable-next-line no-console
      console.warn('persistFrontendV2Result: FK error on userId, retrying without userId');
      return await prisma.generation.create({
        data: {
          project: { connect: { id: args.projectId } },
          model: args.model,
          promptJson: args.prompt as unknown as Prisma.InputJsonValue,
          options: args.options as unknown as Prisma.InputJsonValue,
          tokensInput: 0,
          tokensOutput: 0,
          costUsd: 0,
        },
      });
    }
    throw err;
  }
}


