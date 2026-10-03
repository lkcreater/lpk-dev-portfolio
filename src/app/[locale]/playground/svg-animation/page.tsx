import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SvgAnimationTool } from "@/components/playground/SvgAnimationTool";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { getUsage } from "@/lib/usage-limit";

type ToolPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getDictionary(locale).playground.svg;
  return { title: `${copy.title} — LPK`, description: copy.intro };
}

export default async function SvgAnimationPage({ params }: ToolPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await getSession();
  if (!user) redirect(`/${locale}/playground`);
  const playground = getDictionary(locale).playground;
  const copy = playground.svg;
  const usage = await getUsage("svg-animation", user.sub).catch(() => null);

  return (
    <section className="playground section-pad page-grid">
      <header className="playground-head">
        <Link href={`/${locale}/playground`} className="project-back" data-cursor="OPEN">
          ← {copy.back}
        </Link>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>
      <SvgAnimationTool copy={copy} locale={locale} usageTemplate={playground.usage} initialUsage={usage} />
    </section>
  );
}
