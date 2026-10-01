import { notFound } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { HorizontalProjects } from "@/components/sections/HorizontalProjects";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { Services } from "@/components/sections/Services";
import { Lab } from "@/components/sections/Lab";
import { About } from "@/components/sections/About";
import { Marquee } from "@/components/sections/Marquee";
import { Contact } from "@/components/sections/Contact";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  return (
    <>
      <Hero copy={dictionary.hero} />
      <Intro copy={dictionary.intro} />
      <SelectedWork copy={dictionary.work} locale={locale} />
      <HorizontalProjects copy={dictionary.showcase} work={dictionary.work} locale={locale} />
      <CaseStudy copy={dictionary.caseStudy} />
      <Services copy={dictionary.services} />
      <Lab copy={dictionary.lab} />
      <About copy={dictionary.about} />
      <Marquee text={dictionary.marquee} />
      <Contact copy={dictionary.contact} />
    </>
  );
}
