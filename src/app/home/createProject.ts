"use server";
import { prisma } from '@/libs/prisma/prisma';
import { getCurrentSession } from '@/libs/auth/session';
import { z } from 'zod';

// Input schema for creating a project
const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(256),
  description: z.string().optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).optional(),
  // optional list of category keys/labels
  categories: z.array(z.string()).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

/**
 * Server action: createProject
 * Accepts either a plain object or FormData from a client action.
 * Resolves user from server session, creates a Project, and returns { ok, projectId }
 */
export async function createProjectAction(data: FormData | CreateProjectInput) {
  // normalize
  const payload: Record<string, unknown> = {};
  if (data instanceof FormData) {
    for (const [k, v] of data.entries()) {
      payload[k] = typeof v === 'string' ? v : v;
    }
  } else {
    Object.assign(payload, data);
  }

  // validate
  const parseResult = CreateProjectSchema.safeParse(payload);
  if (!parseResult.success) {
    return { ok: false, error: parseResult.error.flatten() };
  }

  const { name, description, visibility = 'public' } = parseResult.data;

  // Resolve user from server session
  const session = await getCurrentSession();
  if (!session || !session.user || !session.user.id) {
    return { ok: false, error: 'Unauthenticated' };
  }

  try {
    // Use validated categories from parse result
    const categoriesInput = parseResult.data.categories ?? [];

    // 1) create project
    const project = await prisma.project.create({
      data: {
        name,
        description: description ?? undefined,
        visibility,
        user: { connect: { id: session.user.id } },
      },
      select: { id: true },
    });

    // 2) if categories provided, upsert them and create join rows
    if (categoriesInput.length > 0) {
      const upserted = await Promise.all(
        categoriesInput.map(async (cat: string) => {
          const key = cat.trim().toLowerCase().replace(/\s+/g, '-');
          return (prisma as any).category.upsert({
            where: { key },
            create: { key, label: cat },
            update: { label: cat },
          });
        })
      );

      // create join rows (ignore duplicates by using createMany with skipDuplicates)
  const joinData = upserted.map((c: any) => ({ projectId: project.id, categoryId: c.id }));
  await (prisma as any).projectCategory.createMany({ data: joinData, skipDuplicates: true });
    }

    return { ok: true, projectId: project.id };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export default createProjectAction;
