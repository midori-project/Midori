import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { resolve } from "path";
import manifest from "@/app/(app)/(projects)/template/manifest.json";
import { generateSiteFromKeywords } from "@/app/(app)/(projects)/template/manifest";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keywords = searchParams.get('keywords')?.split(',').map(k => k.trim()) || ["fresh","organic","homemade"];
  
  const root = process.cwd();
  const TEMPLATES = {
    "Hero.tsx": await readFile(resolve(root, "src/app/(app)/(projects)/template/Hero.tsx"), "utf8"),
    "Navbar.tsx": await readFile(resolve(root, "src/app/(app)/(projects)/template/Navbar.tsx"), "utf8"),
    "theme.css": await readFile(resolve(root, "src/app/(app)/(projects)/template/theme.css"), "utf8"),
  };

  const files = await generateSiteFromKeywords(manifest as any, TEMPLATES, keywords);
  return NextResponse.json({ files });
}
