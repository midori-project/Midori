import type { Prisma } from '@prisma/client';
import type { FrontendTaskV2, ComponentResultV2 } from '../schemas/types';

type PersistOptions = {
  projectId: string;
  userId?: string | undefined;
};

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
  const filesToPersist = (result as any).projectStructure?.files ?? result.files;
  const generationFilesPayload: Array<Promise<unknown>> = [];
  for (const file of filesToPersist) {
    const path = file.path;
    const type = mapFileType(file.type);
    const content = file.content;

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

    // Record GenerationFile
    generationFilesPayload.push(
      prisma.generationFile.create({
        data: {
          generationId: generation.id,
          filePath: path,
          fileContent: content,
          changeType: 'create',
        },
      })
    );
  }

  await Promise.all(generationFilesPayload);

  // 3) Create Snapshot from current result
  const snapshotFiles = filesToPersist.map((f: any) => ({ path: f.path, type: f.type, content: f.content }));
  const snapshot = await prisma.snapshot.create({
    data: {
      projectId,
      label: `frontend-v2-${new Date().toISOString()}`,
      files: snapshotFiles as unknown as Prisma.InputJsonValue,
      fromGenerationId: generation.id,
      templateData: {
        businessCategory: result.result.businessCategory,
        blocksGenerated: result.result.blocksGenerated,
        aiContentGenerated: result.result.aiContentGenerated,
        projectStructure: (result as any).projectStructure?.projectStructure ?? null,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  // 4) Create PreviewSession if present
  if (result.preview?.url) {
    await prisma.previewSession.create({
      data: {
        projectId,
        snapshotId: snapshot.id,
        url: result.preview.url,
        state: 'ready',
        buildTimeMs: result.performance?.generationTime ?? null,
        meta: {
          sandboxId: result.preview.sandboxId,
          status: result.preview.status,
          createdAt: result.preview.createdAt,
        },
      },
    });
  }

  // 5) Update ProjectContext.frontendV2Data summary
  try {
    await prisma.projectContext.upsert({
      where: { projectId },
      update: {
        frontendV2Data: buildFrontendV2Data(result) as unknown as Prisma.InputJsonValue,
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
        frontendV2Data: buildFrontendV2Data(result) as unknown as Prisma.InputJsonValue,
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
  };
  return (map[category] as any) || 'e_commerce';
}

function buildFrontendV2Data(result: ComponentResultV2) {
  return {
    result: result.result,
    performance: result.performance,
    validation: result.validation,
    metadata: result.metadata,
    files: result.files.map(f => ({ path: f.path, type: f.type })),
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


