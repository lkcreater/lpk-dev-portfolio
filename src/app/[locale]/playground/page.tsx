import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { getUsage } from "@/lib/usage-limit";

type PlaygroundPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ login?: string }>;
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
  const loginFailed = (await searchParams).login === "failed";
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
        <>
          <div className="playground-user">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element -- LINE avatar host is dynamic
              <img src={user.picture} alt="" width={36} height={36} />
            ) : null}
            <p>
              <span>{copy.signedInAs}</span> {user.name}
            </p>
            <form action="/api/auth/logout" method="post">
              <input type="hidden" name="locale" value={locale} />
              <button type="submit">{copy.logout}</button>
            </form>
          </div>

          <p className="playground-label">{copy.toolsLabel}</p>
          <div className="playground-tools">
            {copy.tools.map((tool, index) => (
              <Link
                key={tool.slug}
                href={`/${locale}/playground/${tool.slug}`}
                className="playground-card"
                data-cursor="OPEN"
              >
                <span className="playground-card-index">{String(index + 1).padStart(2, "0")}</span>
                <svg className="playground-card-art" viewBox="0 0 120 80" aria-hidden="true">
                  {tool.slug === "hotel-chat" ? (
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
        </>
      ) : (
        <div className="playground-login">
          <h2>{copy.login.title}</h2>
          <p>{copy.login.body}</p>
          {loginFailed ? (
            <p className="playground-error" role="alert">
              {copy.login.failed}
            </p>
          ) : null}
          {/* A plain link: the route handler starts the OAuth redirect. */}
          <a className="line-login" href={`/api/auth/line?locale=${locale}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.5 5.9-3.5 8-6C21.4 14.2 22 12.7 22 11c0-4.4-4.5-8-10-8Z" />
            </svg>
            {copy.login.button}
          </a>
          <p className="playground-note">{copy.login.note}</p>
        </div>
      )}
    </section>
  );
}
