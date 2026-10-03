import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeUp } from "@/components/motion/FadeUp";
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

      <div className="knowledge-list">
        {posts.length === 0 ? <p className="knowledge-empty">{copy.empty}</p> : null}
        {posts.map((post, index) => (
          <FadeUp key={post.slug} delay={index * 0.06}>
            <Link href={`/${locale}/knowledge/${post.slug}`} className="knowledge-card" data-cursor="OPEN">
              <span className="knowledge-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="knowledge-meta">
                  <time dateTime={post.date}>{post.date}</time>
                  <span>
                    {post.readingMinutes} {copy.minutes}
                  </span>
                </p>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <ul aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <span className="knowledge-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
