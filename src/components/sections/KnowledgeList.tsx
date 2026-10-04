"use client";

import Link from "next/link";
import { useState } from "react";
import { FadeUp } from "@/components/motion/FadeUp";
import type { Locale } from "@/lib/i18n";
import type { KnowledgePost } from "@/lib/knowledge";

type KnowledgeListProps = {
  locale: Locale;
  posts: KnowledgePost[];
  copy: { minutes: string; empty: string; search: string; noResults: string };
};

export function KnowledgeList({ locale, posts, copy }: KnowledgeListProps) {
  const [query, setQuery] = useState("");
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const visible = posts.filter((post) => {
    const haystack = [post.title, post.description, ...post.tags].join(" ").toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  return (
    <>
      <input
        type="search"
        className="knowledge-search"
        placeholder={copy.search}
        aria-label={copy.search}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="knowledge-list">
        {posts.length === 0 ? <p className="knowledge-empty">{copy.empty}</p> : null}
        {posts.length > 0 && visible.length === 0 ? <p className="knowledge-empty">{copy.noResults}</p> : null}
        {visible.map((post, index) => (
          <FadeUp key={post.slug} delay={index * 0.06}>
            <Link href={`/${locale}/knowledge/${post.slug}`} className="knowledge-card" data-cursor="OPEN">
              <span className="knowledge-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="knowledge-meta">
                  <time dateTime={post.date}>{post.date.slice(0, 10)}</time>
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
    </>
  );
}
