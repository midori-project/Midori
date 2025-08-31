"use server";
import { getCurrentSession } from '@/libs/auth/session';
import { createProjectWithCategories } from '@/libs/services/projectService';
import { z } from 'zod';

// Input schema for creating a project
const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(256),
  description: z.string().optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).optional(),
  categories: z.array(z.string()).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

/**
 * ✅ Server Action ที่ถูกต้อง - เป็นแค่ wrapper
 * จัดการ HTTP layer, validation, authentication
 * Business logic อยู่ใน projectService
 */
export async function createProjectAction(data: FormData | CreateProjectInput) {
  try {
    // 1. Normalize input data
    const payload: Record<string, unknown> = {};
    if (data instanceof FormData) {
      for (const [k, v] of data.entries()) {
        payload[k] = typeof v === 'string' ? v : v;
      }
    } else {
      Object.assign(payload, data);
    }

    // 2. Validate input
    const parseResult = CreateProjectSchema.safeParse(payload);
    if (!parseResult.success) {
      return { ok: false, error: parseResult.error.flatten() };
    }

    // 3. Check authentication
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { ok: false, error: 'Unauthenticated' };
    }

    // 4. เรียก Business Service (business logic อยู่ที่นี่)
    const { name, description, visibility = 'public', categories } = parseResult.data;
    
    const result = await createProjectWithCategories({
      name,
      description,
      visibility,
      categories,
      userId: session.user.id,
    });

    return { ok: true, projectId: result.projectId };

  } catch (error) {
    console.error('Error in createProjectAction:', error);
    return { ok: false, error: (error as Error).message };
  }
}

export default createProjectAction;
