import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { LoginGate } from "@/components/playground/LoginGate";
import { PlaygroundAccount } from "@/components/playground/PlaygroundAccount";
import { isDevMode } from "@/lib/dev-mode";
import { getSession } from "@/lib/session";
import { getUsage } from "@/lib/usage-limit";

type PlaygroundPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ login?: string; play?: string }>;
};

export async function generateMetadata({ params }: PlaygroundPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getDictionary(locale).playground;
  return { title: `${copy.kicker} — LPK`, description: copy.intro };
}

export default async function PlaygroundPage({ params, searchParams }: PlaygroundPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getDictionary(locale).playground;
  const user = await getSession();
  const { login, play } = await searchParams;
  const usages = user
    ? await Promise.all(copy.tools.map((tool) => getUsage(tool.slug, user.sub).catch(() => null)))
    : [];

  return (
    <section className="playground section-pad page-grid">
      <header className="playground-head">
        <p className="section-kicker light">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      {user ? (
        <PlaygroundAccount user={user} locale={locale} copy={copy} />
      ) : (
        <LoginGate
          copy={copy.login}
          locale={locale}
          tools={copy.tools.map(({ slug, title }) => ({ slug, title }))}
          initialTool={play}
          failed={login === "failed"}
          devMode={isDevMode()}
        />
      )}

      <p className="playground-label">{copy.toolsLabel}</p>
      <div className="playground-tools">
        {copy.tools.map((tool, index) => (
          <Link
            key={tool.slug}
            href={user ? `/${locale}/playground/${tool.slug}` : `/${locale}/playground?play=${tool.slug}`}
            data-play={user ? undefined : tool.slug}
            className="playground-card"
            data-cursor="OPEN"
          >
            <span className="playground-card-index">{String(index + 1).padStart(2, "0")}</span>
            <svg className="playground-card-art" viewBox="0 0 120 80" aria-hidden="true">
              {tool.slug === "sale-campaign" ? (
                <>
                  <rect x="8" y="12" width="34" height="56" rx="4" />
                  <path className="draw" d="M48 40h14m-5-5 5 5-5 5" />
                  <rect x="68" y="8" width="44" height="64" rx="4" />
                  <rect className="pulse" x="76" y="18" width="28" height="10" rx="5" />
                  <path className="draw" d="M76 40h28M76 50h20M76 60h24" />
                </>
              ) : tool.slug === "hotel-chat" ? (
                <>
                  <rect x="10" y="10" width="62" height="22" rx="11" />
                  <rect className="pulse" x="48" y="40" width="62" height="22" rx="11" />
                  <path className="draw" d="M20 21h40M58 51h40" />
                </>
              ) : (
                <>
                  <rect x="8" y="10" width="44" height="60" rx="4" />
                  <path className="draw" d="M62 40h18m-6-6 6 6-6 6" />
                  <circle className="pulse" cx="100" cy="40" r="14" />
                  <path className="draw" d="M18 56 30 38l9 11 7-8" />
                </>
              )}
            </svg>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <ul>
              {tool.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            {usages[index] ? (
              <p className="playground-usage">
                {copy.usage
                  .replace("{remaining}", String(usages[index].remaining))
                  .replace("{limit}", String(usages[index].limit))}
              </p>
            ) : null}
            <span className="playground-card-cta">{copy.open} ↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
