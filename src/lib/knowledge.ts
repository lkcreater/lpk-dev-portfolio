import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";
import type { Locale } from "@/lib/i18n";

export type KnowledgeMeta = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingMinutes: number;
};

export type KnowledgePost = KnowledgeMeta & { slug: string };

// Posts live in src/content/knowledge as `<slug>.<locale>.mdx`, each exporting `metadata`.
const CONTENT_DIR = join(process.cwd(), "src/content/knowledge");

export function getKnowledgeSlugs(locale: Locale): string[] {
  const suffix = `.${locale}.mdx`;
  return readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(suffix))
    .map((file) => file.slice(0, -suffix.length));
}

export async function getKnowledgePost(locale: Locale, slug: string) {
  const mod: { default: ComponentType; metadata: KnowledgeMeta } = await import(
    `@/content/knowledge/${slug}.${locale}.mdx`
  );
  return { Content: mod.default, meta: { ...mod.metadata, slug } satisfies KnowledgePost };
}

export async function getKnowledgePosts(locale: Locale): Promise<KnowledgePost[]> {
  const posts = await Promise.all(
    getKnowledgeSlugs(locale).map(async (slug) => (await getKnowledgePost(locale, slug)).meta),
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}
