/* app/api/v0/templates/route.ts */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma/prisma';
import { z } from 'zod';
import { createHash } from 'crypto';

/* =========================
 * Schemas
 * =======================*/
const TemplateStatusEnum = z.enum(['draft', 'published', 'deprecated']);

const SourceFileSchema = z.object({
  path: z.string().min(1),
  type: z.enum(['code', 'text', 'config', 'asset']).optional(),
  encoding: z.enum(['utf8', 'base64']).or(z.literal('gzip+base64')).default('utf8'),
  content: z.string().min(1),
});

const CreateTemplateSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  category: z.string().optional(),
  meta: z.object({
    description: z.string().optional(),
    engine: z.string().optional(),
    status: TemplateStatusEnum.optional().default('draft'),
    versioningPolicy: z.string().optional(),
    previewScreenshot: z.string().url().optional(),
    compat: z.record(z.any()).optional(),
    postProcess: z.array(z.string()).optional(),
    author: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).optional().default([]),
  initialVersion: z.object({
    version: z.number().int().positive().optional(),
    semver: z.string().optional(),
    files: z.record(z.any()).optional(),        // จะถูกแทน/ผสานด้วย manifest cache
    slots: z.record(z.any()).optional(),
    constraints: z.record(z.any()).optional(),
    checksum: z.string().optional(),
    sizeBytes: z.number().int().positive().optional(),
    status: TemplateStatusEnum.optional(),
    compat: z.record(z.any()).optional(),
    publishedAt: z.string().datetime().optional(),
    deprecatedAt: z.string().datetime().optional(),
    sourceFiles: z.array(SourceFileSchema).optional().default([]),
  }).optional(),
});

const CreateVersionSchema = z.object({
  templateId: z.string().uuid(),
  version: z.number().int().positive().optional(),
  semver: z.string().optional(),
  files: z.record(z.any()).optional(),
  slots: z.record(z.any()).optional(),
  constraints: z.record(z.any()).optional(),
  checksum: z.string().optional(),
  sizeBytes: z.number().int().positive().optional(),
  status: TemplateStatusEnum.optional(),
  compat: z.record(z.any()).optional(),
  publishedAt: z.string().datetime().optional(),
  deprecatedAt: z.string().datetime().optional(),
  sourceFiles: z.array(SourceFileSchema).optional().default([]),
});

/* =========================
 * Helpers
 * =======================*/
function guessContentType(path: string): string {
  if (path.endsWith('.tsx')) return 'text/tsx';
  if (path.endsWith('.ts')) return 'text/ts';
  if (path.endsWith('.js')) return 'text/javascript';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.mjs')) return 'text/javascript';
  if (/\.(jpg|jpeg)$/i.test(path)) return 'image/jpeg';
  if (/\.png$/i.test(path)) return 'image/png';
  if (/\.webp$/i.test(path)) return 'image/webp';
  if (/\.svg$/i.test(path)) return 'image/svg+xml';
  return 'application/octet-stream';
}

function isAllowedPath(path: string): boolean {
  // กัน path traversal และจำกัดโฟลเดอร์ที่อนุญาต
  return /^(package\.json|next\.config\.mjs|src\/.*|public\/.*|styles\/.*)$/.test(path);
}

type SourceInput = z.infer<typeof SourceFileSchema>;
type EnrichedFile = SourceInput & { size: number; sha256: string; contentType: string };

function enrichFiles(files: SourceInput[]): EnrichedFile[] {
  return files.map((f) => {
    if (!isAllowedPath(f.path)) throw new Error(`Disallowed path: ${f.path}`);
    const buf =
      f.encoding === 'base64' || f.encoding === 'gzip+base64'
        ? Buffer.from(f.content, 'base64')
        : Buffer.from(f.content, 'utf8');
    const sha256 = createHash('sha256').update(buf).digest('hex');
    return { ...f, size: buf.byteLength, sha256, contentType: guessContentType(f.path) };
  });
}

function calcBundleChecksum(enriched: EnrichedFile[]) {
  const sizeBytes = enriched.reduce((s, x) => s + x.size, 0);
  const checksum = createHash('sha256').update(enriched.map((x) => x.sha256).join('')).digest('hex');
  return { sizeBytes, checksum };
}

async function persistNormalizedFiles(
  tx: any,
  versionId: string,
  files: SourceInput[],
  guard: { maxFiles: number; maxBytes: number } = { maxFiles: 500, maxBytes: 20 * 1024 * 1024 }
) {
  if (!files?.length) return { manifestObjects: [], sizeBytes: 0, checksum: '' };

  const enriched = enrichFiles(files);
  const { sizeBytes, checksum } = calcBundleChecksum(enriched);

  if (enriched.length > guard.maxFiles) throw new Error(`Too many files: ${enriched.length} > ${guard.maxFiles}`);
  if (sizeBytes > guard.maxBytes) throw new Error(`Bundle too large: ${sizeBytes} > ${guard.maxBytes}`);

  // 1) insert rows (normalized)
  await tx.templateSourceFile.createMany({
    data: enriched.map((e) => ({
      versionId,
      path: e.path,
      type: e.type,
      content: e.content,      // เก็บตาม encoding ที่ส่งมา
      encoding: e.encoding,
      contentType: e.contentType,
      size: e.size,
      sha256: e.sha256,
    })),
    skipDuplicates: true,
  });

  // 2) summary
  await tx.templateSourceSummary.create({
    data: { versionId, filesCount: enriched.length, sizeBytes, checksum },
  });

  // 3) manifest cache → UiTemplateVersion.files
  const manifest = {
    format: 1,
    objects: enriched.map((e) => ({
      path: e.path,
      type: e.type,
      size: e.size,
      sha256: e.sha256,
      contentType: e.contentType,
      encoding: e.encoding,
    })),
    meta: { generator: 'midori-uploader@1' },
  };

  await tx.uiTemplateVersion.update({
    where: { id: versionId },
    data: { files: manifest as any, sizeBytes, checksum },
  });

  return { manifestObjects: manifest.objects, sizeBytes, checksum };
}

/* =========================
 * Handlers
 * =======================*/
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const body = await req.json();
    if (action === 'version') return await createTemplateVersion(body);
    return await createTemplate(body);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: e.errors }, { status: 400 });
    }
    console.error('Template API error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createTemplate(raw: unknown) {
  const data = CreateTemplateSchema.parse(raw);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) template
      const template = await tx.uiTemplate.create({
        data: { key: data.key, label: data.label, category: data.category },
      });

      // 2) meta
      const meta = await tx.uiTemplateMeta.create({
        data: {
          templateId: template.id,
          description: data.meta?.description,
          engine: data.meta?.engine,
          status: data.meta?.status ?? 'draft',
          versioningPolicy: data.meta?.versioningPolicy,
          previewScreenshot: data.meta?.previewScreenshot,
          compat: data.meta?.compat,
          postProcess: data.meta?.postProcess,
          author: data.meta?.author,
        },
      });

      // 3) tags
      if (data.tags?.length) {
        for (const tagKey of data.tags) {
          const tag = await tx.tag.upsert({
            where: { key: tagKey },
            update: {},
            create: { key: tagKey, label: tagKey.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) },
          });
          await tx.uiTemplateMetaTag.create({ data: { metaId: meta.id, tagId: tag.id } });
        }
      }

      // 4) initial version (optional)
      let version: number | null = null;
      if (data.initialVersion) {
        const latest = await tx.uiTemplateVersion.findFirst({
          where: { templateId: template.id },
          orderBy: { version: 'desc' },
          select: { version: true },
        });
        const nextVersion = data.initialVersion.version ?? (latest?.version ?? 0) + 1;

        const v = await tx.uiTemplateVersion.create({
          data: {
            templateId: template.id,
            version: nextVersion,
            semver: data.initialVersion.semver,
            files: data.initialVersion.files ?? {}, // จะถูกแทนด้วย manifest cache ถ้ามี sourceFiles
            slots: data.initialVersion.slots ?? {},
            constraints: data.initialVersion.constraints ?? {},
            checksum: data.initialVersion.checksum ?? null,
            sizeBytes: data.initialVersion.sizeBytes ?? null,
            status: data.initialVersion.status,
            compat: data.initialVersion.compat,
            publishedAt: data.initialVersion.publishedAt ? new Date(data.initialVersion.publishedAt) : null,
            deprecatedAt: data.initialVersion.deprecatedAt ? new Date(data.initialVersion.deprecatedAt) : null,
          },
        });

        const src = data.initialVersion.sourceFiles ?? [];
        let initialSummary: { filesCount: number; sizeBytes: number; checksum: string } | null = null;
        if (src.length) {
          const pf = await persistNormalizedFiles(tx as any, v.id, src);
          initialSummary = { filesCount: pf.manifestObjects.length, sizeBytes: pf.sizeBytes, checksum: pf.checksum };
        }

        version = v.version;
        // attach summary via closure scope by returning it along with version
        return { template, meta, version, initialSummary } as any;
      }
      return { template, meta, version };
    });

    return NextResponse.json({
      success: true,
      data: {
        template: {
          id: result.template.id,
          key: result.template.key,
          label: result.template.label,
          category: result.template.category,
        },
        meta: { id: result.meta.id, status: result.meta.status },
        initialVersion: result.version,
        initialSourceSummary: (result as any).initialSummary ?? null,
      },
    });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Template key already exists' }, { status: 409 });
    }
    console.error('createTemplate error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createTemplateVersion(raw: unknown) {
  const data = CreateVersionSchema.parse(raw);

  const tpl = await prisma.uiTemplate.findUnique({ where: { id: data.templateId } });
  if (!tpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  try {
    const created = await prisma.$transaction(async (tx) => {
      const latest = await tx.uiTemplateVersion.findFirst({
        where: { templateId: data.templateId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const nextVersion = data.version ?? (latest?.version ?? 0) + 1;

      const v = await tx.uiTemplateVersion.create({
        data: {
          templateId: data.templateId,
          version: nextVersion,
          semver: data.semver,
          files: data.files ?? {},
          slots: data.slots ?? {},
          constraints: data.constraints ?? {},
          checksum: data.checksum ?? null,
          sizeBytes: data.sizeBytes ?? null,
          status: data.status,
          compat: data.compat,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
          deprecatedAt: data.deprecatedAt ? new Date(data.deprecatedAt) : null,
        },
      });

      const src = data.sourceFiles ?? [];
      let summary: { filesCount: number; sizeBytes: number; checksum: string } | null = null;
      if (src.length) {
        const pf = await persistNormalizedFiles(tx as any, v.id, src);
        summary = { filesCount: pf.manifestObjects.length, sizeBytes: pf.sizeBytes, checksum: pf.checksum };
      }

      return { v, summary };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.v.id,
        templateId: created.v.templateId,
        version: created.v.version,
        status: created.v.status,
        createdAt: created.v.createdAt,
        sourceSummary: created.summary,
      },
    });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'This version already exists for the template' }, { status: 409 });
    }
    console.error('createTemplateVersion error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') ?? undefined;
    const type = url.searchParams.get('type') ?? undefined;
    const status = url.searchParams.get('status') as z.infer<typeof TemplateStatusEnum> | null;
    const statusScope = (url.searchParams.get('statusScope') ?? 'meta') as 'meta' | 'version';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const whereTemplate: any = {};
    if (category) whereTemplate.category = category;

    const items = await prisma.uiTemplate.findMany({
      where: whereTemplate,
      include: {
        meta: { include: { tags: { include: { tag: true } } } },
        versions: {
          where: status && statusScope === 'version' ? { status } : undefined,
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const filtered = status && statusScope === 'meta'
      ? items.filter((t) => t.meta?.status === status)
      : items;

    // Optional filter by `type` against category or tag key/label (case-insensitive)
    const filteredByType = type
      ? filtered.filter((t) => {
          const typeLc = type.toLowerCase();
          const inCategory = t.category ? t.category.toLowerCase() === typeLc : false;
          const inTags = (t.meta?.tags ?? []).some((mt: any) => {
            const keyLc = mt?.tag?.key ? String(mt.tag.key).toLowerCase() : '';
            const labelLc = mt?.tag?.label ? String(mt.tag.label).toLowerCase() : '';
            return keyLc === typeLc || labelLc === typeLc;
          });
          return inCategory || inTags;
        })
      : filtered;

    return NextResponse.json({
      success: true,
      data: filteredByType,
      pagination: { limit, offset, count: filteredByType.length },
    });
  } catch (e: any) {
    console.error('Template GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
