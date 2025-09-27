import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RequestSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  description: z.string().optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).optional().default('public'),
});

async function ensureDefaultUserExists() {
  const id = 'default-user';
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id,
        email: 'default@midori.ai',
        displayName: 'Default User',
        isActive: true,
        locale: 'th',
      },
    });
  }
  return id;
}

export async function POST(request: NextRequest) {
  try {
    // 1) Validate with Zod
    const body = await request.json();
    const { name, description, visibility } = RequestSchema.parse(body);

    // 2) Use session user if available; otherwise fallback to default-user
    // Note: If you have a session helper, you can import and use it here.
    // To keep this endpoint standalone and robust, we fallback to default-user.
    const ownerId = await ensureDefaultUserExists();

    // 3) Create mock project
    const project = await prisma.project.create({
      data: {
        ownerId,
        name: name || `Mock Project ${new Date().toISOString()}`,
        description: description || 'Mock project created via /api/projects/mock',
        visibility: (visibility as any) || 'public',
        options: {},
        likeCount: 0,
      },
      select: {
        id: true,
        name: true,
        visibility: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('❌ Mock project creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}



