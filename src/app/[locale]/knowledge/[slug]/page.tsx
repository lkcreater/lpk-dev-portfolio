import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { getKnowledgePost, getKnowledgeSlugs } from "@/lib/knowledge";

type ArticlePageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => getKnowledgeSlugs(locale).map((slug) => ({ locale, slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getKnowledgePost(locale, slug);
  return { title: `${meta.title} — LPK`, description: meta.description };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getDictionary(locale).knowledge;
  const { Content, meta } = await getKnowledgePost(locale, slug);

  return (
    <article className="article section-pad page-grid">
      <header className="article-head">
        <Link href={`/${locale}/knowledge`} className="project-back" data-cursor="OPEN">
          ← {copy.back}
        </Link>
        <p className="knowledge-meta">
          <time dateTime={meta.date}>{meta.date.slice(0, 10)}</time>
          <span>
            {meta.readingMinutes} {copy.minutes}
          </span>
        </p>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
        <ul className="article-tags" aria-label="Tags">
          {meta.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </header>
      <div className="prose">
        <Content />
      </div>
    </article>
  );
}
