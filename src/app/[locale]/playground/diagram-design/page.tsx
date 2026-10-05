import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DiagramDesignTool } from "@/components/playground/DiagramDesignTool";
import { PlaygroundAccount } from "@/components/playground/PlaygroundAccount";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { getUsage } from "@/lib/usage-limit";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getDictionary(locale).playground.diagram;
  return { title: `${copy.title} — LPK`, description: copy.intro };
}

export default async function DiagramDesignPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await getSession();
  if (!user) redirect(`/${locale}/playground?play=diagram-design`);
  const playground = getDictionary(locale).playground;
  const usage = await getUsage("diagram-design", user.sub).catch(() => null);
  return (
    <section className="playground section-pad page-grid">
      <header className="playground-head">
        <Link href={`/${locale}/playground`} className="project-back" data-cursor="OPEN">
          ← {playground.diagram.back}
        </Link>
        <h1>{playground.diagram.title}</h1>
        <p>{playground.diagram.intro}</p>
      </header>
      <PlaygroundAccount user={user} locale={locale} copy={playground} />
      <DiagramDesignTool
        copy={playground.diagram}
        locale={locale}
        usageTemplate={playground.usage}
        initialUsage={usage}
      />
    </section>
  );
}
