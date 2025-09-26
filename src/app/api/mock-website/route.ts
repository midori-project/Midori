import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateMinimalNextJsMockFiles } from '@/midori/agents/orchestrator/tools/mock_website';

const QuerySchema = z.object({
  type: z.enum(['minimal-nextjs']).default('minimal-nextjs')
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parsed = QuerySchema.safeParse({ type: url.searchParams.get('type') || 'minimal-nextjs' });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const files = generateMinimalNextJsMockFiles();
    return NextResponse.json({ success: true, data: { files } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate mock files' },
      { status: 500 }
    );
  }
}



