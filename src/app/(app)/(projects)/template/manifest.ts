// manifest-utils.ts
import OpenAI from "openai";

// ---------- Types ----------
export type FileKind = "tsx" | "css" | "json";
export type Manifest = {
  id: string;
  category: string;
  version: number;
  files: { path: string; kind: FileKind }[];
  fields: Record<string, any>;
  mapping: { file: string; placeholders: Record<string, string> }[];
};

export type FillData = {
  global: {
    palette: { primary: string; secondary?: string; bgTone?: string };
    tokens?: { radius?: string; spacing?: string };
    tone?: string;
    reasoning?: string;
  };
  [k: string]: any; // per-component (Hero, Navbar, ...)
};

// ---------- 1) Loader ----------
export function loadManifest(json: any): Manifest {
  // ใส่เช็คเบื้องต้นกันพลาด
  if (!json?.files || !json?.mapping || !json?.fields) {
    throw new Error("Invalid manifest: missing files/mapping/fields");
  }
  return json as Manifest;
}

// ---------- 2) Minimal validator (ไม่ใช้ Zod) ----------
export function validateFillAgainstManifest(fill: any, manifest: Manifest) {
  const must = (cond: any, msg: string) => { if (!cond) throw new Error(msg); };

  // ตัวอย่างเช็คเฉพาะคีย์สำคัญ (เพิ่มได้ตามต้องการ)
  const primaryEnum = manifest.fields["global.palette.primary"]?.enum ?? [];
  must(fill?.global?.palette?.primary, "missing global.palette.primary");
  must(primaryEnum.includes(fill.global.palette.primary), "invalid primary color");

  // Hero
  if (manifest.fields["Hero.heading"]?.required) {
    must(typeof fill?.Hero?.heading === "string" && fill.Hero.heading.length > 0, "missing Hero.heading");
  }
  if (manifest.fields["Hero.ctaLabel"]?.required) {
    must(typeof fill?.Hero?.ctaLabel === "string" && fill.Hero.ctaLabel.length > 0, "missing Hero.ctaLabel");
  }

  // Navbar
  if (manifest.fields["Navbar.brand"]?.required) {
    must(typeof fill?.Navbar?.brand === "string" && fill.Navbar.brand.length > 0, "missing Navbar.brand");
  }
  const navMenuField = manifest.fields["Navbar.menu[].label"];
  if (navMenuField?.required) {
    must(Array.isArray(fill?.Navbar?.menu) && fill.Navbar.menu.length >= 3, "Navbar.menu must be array (>=3)");
  }
  return true;
}

// ---------- 3) Prompt Builder (single-call with keywords) ----------
export function buildPromptFromManifest(manifest: Manifest, keywords: string[]) {
  // ส่งเฉพาะส่วนจำเป็น (fields + category + กติกา)
  const minimal = { fields: manifest.fields, category: manifest.category };
  return `
You are given a website template manifest. Analyze the keywords, then:
1) Propose a theme (palette.primary/secondary, bgTone, tokens.radius/spacing, tone, short reasoning).
2) Fill all component fields according to the manifest fields.

Manifest (JSON):
${JSON.stringify(minimal, null, 2)}

Keywords: ${keywords.join(", ")}

Rules:
- Use only allowed enums for colors/tones from the manifest.
- Thai copy (locale=th), concise and brand-safe.
- Navbar.menu length 3–7.
- Return JSON only. No comments/markdown.

Return shape:
{
  "global": {
    "palette": { "primary": "...", "secondary"?: "...", "bgTone"?: "..." },
    "tokens": { "radius": "...", "spacing": "..." },
    "tone"?: "...",
    "reasoning"?: "..."
  },
  "Hero": { ... },
  "Navbar": { ... }
}
`.trim();
}

// ---------- 4) LLM helper ----------
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function callLLMJson(prompt: string) {
  const resp = await client.chat.completions.create({
    model: "gpt-5-nano",
    temperature: 1,
    response_format: { type: "json_object" } as any,
    messages: [{ role: "user", content: prompt }],
  });
  const raw = resp.choices[0]?.message?.content ?? "{}";
  console.log(raw);
  try { return JSON.parse(raw); } catch { return {}; }
}

// ---------- 5) Renderer ----------
const esc = (s: string) =>
  s.replaceAll("&","&amp;").replaceAll("<","&lt;")
   .replaceAll(">","&gt;").replaceAll('"',"&quot;")
   .replaceAll("'","&#039;");

function getByPath(obj: any, path: string): any {
  // รองรับ path เช่น "Hero.heading", "Navbar.menu"
  return path.split(".").reduce((acc, k) => acc?.[k], obj);
}

function serialize(ph: string, val: any, ctx: { primary: string; secondary: string }) {
  if (ph === "menuItems" && Array.isArray(val)) {
    return val.map((m: any) =>
      `<li><a className="text-${ctx.primary}-700 hover:text-${ctx.primary}-900" href="${esc(m.href)}">${esc(m.label)}</a></li>`
    ).join("");
  }
  if (ph === "brandFirstChar" && typeof val === "string") {
    return esc(val.charAt(0));
  }
  return esc(String(val));
}

export function renderWithManifest(
  manifest: Manifest,
  templates: Record<string, string>,
  fill: FillData
) {
  const out: Record<string, string> = {};
  const primary = fill.global.palette.primary;
  const secondary = fill.global.palette.secondary ?? primary;

  for (const m of manifest.mapping) {
    let tpl = templates[m.file];
    if (!tpl) continue;

    for (const [ph, path] of Object.entries(m.placeholders)) {
      let val = getByPath({ ...fill }, path);

      // กรณีพิเศษ: accentColor เป็น symbolic ("primary"/"secondary")
      if (ph === "accentColor" && typeof val === "string") {
        val = val === "secondary" ? secondary : primary;
      }

      const rep = Array.isArray(val) ? serialize(ph, val, { primary, secondary }) : esc(String(val ?? ""));
      tpl = tpl.replaceAll(`{${ph}}`, rep);
    }
    out[m.file] = tpl;
  }
  return out;
}

// ---------- 6) End-to-end convenience (single-call) ----------
export async function generateSiteFromKeywords(
  manifestJson: any,
  templates: Record<string, string>,
  keywords: string[]
) {
  const manifest = loadManifest(manifestJson);
  const prompt = buildPromptFromManifest(manifest, keywords);
  const fill: FillData = await callLLMJson(prompt);
  validateFillAgainstManifest(fill, manifest);
  return renderWithManifest(manifest, templates, fill);
}
