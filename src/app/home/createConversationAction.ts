"use server";
import { prisma } from '@/libs/prisma/prisma';
import { getCurrentSession } from '@/libs/auth/session';
import { z } from 'zod';

const CreateConversationSchema = z.object({
  projectId: z.string().uuid().optional(),
  title: z.string().max(120).optional(),
  content: z.string().min(1, 'Content is required'),
  visibility: z.enum(['private', 'unlisted', 'public']).optional(),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;

/**
 * Server action: createConversationWithFirstMessage
 * - Validates input
 * - Resolves user from server session
 * - Creates Conversation and initial Message atomically
 */
export async function createConversationWithFirstMessage(data: CreateConversationInput | FormData) {
  // normalize payload
  const payload: Record<string, unknown> = {};
  if (data instanceof FormData) {
    for (const [k, v] of data.entries()) {
      payload[k] = typeof v === 'string' ? v : v;
    }
  } else {
    Object.assign(payload, data);
  }

  const parsed = CreateConversationSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() };
  }

  const { projectId, title, content, visibility = 'private' } = parsed.data;

  const session = await getCurrentSession();
  if (!session || !session.user || !session.user.id) {
    return { ok: false, error: 'Unauthenticated' };
  }

  try {
    const userId = session.user!.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conv = await (prisma as any).conversation.create({
      data: {
        projectId: projectId ?? undefined,
        userId,
        title: title ?? content.slice(0, 120),
        visibility,
        messages: {
          create: {
            userId,
            role: 'user',
            content,
            messageIndex: 0,
          },
        },
      },
      include: { messages: true },
    });

    const firstMessage = conv.messages?.[0];
    return { ok: true, conversationId: conv.id, messageId: firstMessage?.id };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export default createConversationWithFirstMessage;
