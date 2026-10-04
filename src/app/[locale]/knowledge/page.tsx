import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeList } from "@/components/sections/KnowledgeList";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getKnowledgePosts } from "@/lib/knowledge";

type KnowledgePageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: KnowledgePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getDictionary(locale).knowledge;
  return { title: `${copy.kicker} — LPK`, description: copy.intro };
}

export default async function KnowledgePage({ params }: KnowledgePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getDictionary(locale).knowledge;
  const posts = await getKnowledgePosts(locale);

  return (
    <section className="knowledge section-pad page-grid">
      <header className="knowledge-head">
        <p className="section-kicker light">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      <KnowledgeList locale={locale} posts={posts} copy={copy} />
    </section>
  );
}
