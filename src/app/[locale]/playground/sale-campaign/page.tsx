import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SaleCampaignTool } from "@/components/playground/SaleCampaignTool";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { getUsage } from "@/lib/usage-limit";

type CampaignPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getDictionary(locale).playground.campaign;
  return { title: `${copy.title} — LPK`, description: copy.intro };
}

export default async function SaleCampaignPage({ params }: CampaignPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await getSession();
  if (!user) redirect(`/${locale}/playground?play=sale-campaign`);
  const playground = getDictionary(locale).playground;
  const copy = playground.campaign;
  const usage = await getUsage("sale-campaign", user.sub).catch(() => null);

  return (
    <section className="playground section-pad page-grid">
      <header className="playground-head">
        <Link href={`/${locale}/playground`} className="project-back" data-cursor="OPEN">
          ← {copy.back}
        </Link>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>
      <SaleCampaignTool copy={copy} locale={locale} usageTemplate={playground.usage} initialUsage={usage} />
    </section>
  );
}
