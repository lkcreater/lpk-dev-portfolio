import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { HotelChat } from "@/components/playground/HotelChat";
import { HotelPromptPanel } from "@/components/playground/HotelPromptPanel";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { getUsage } from "@/lib/usage-limit";

type HotelChatPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: HotelChatPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getDictionary(locale).playground.hotel;
  return { title: `${copy.title} — LPK`, description: copy.intro };
}

export default async function HotelChatPage({ params }: HotelChatPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await getSession();
  if (!user) redirect(`/${locale}/playground?play=hotel-chat`);
  const playground = getDictionary(locale).playground;
  const copy = playground.hotel;
  const usage = await getUsage("hotel-chat", user.sub).catch(() => null);

  return (
    <section className="playground section-pad page-grid">
      <header className="playground-head">
        <Link href={`/${locale}/playground`} className="project-back" data-cursor="OPEN">
          ← {copy.back}
        </Link>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>
      <div className="hotel-tool">
        <HotelPromptPanel copy={copy} />
        <HotelChat copy={copy} locale={locale} usageTemplate={playground.usage} initialUsage={usage} />
      </div>
    </section>
  );
}
