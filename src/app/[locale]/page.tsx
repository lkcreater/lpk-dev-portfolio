import { notFound } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { HorizontalProjects } from "@/components/sections/HorizontalProjects";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Marquee } from "@/components/sections/Marquee";
import { Contact } from "@/components/sections/Contact";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getProfile, getProjects } from "@/data/projects";

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const profile = getProfile(locale);
  const projects = getProjects(locale);

  return (
    <>
      <Hero copy={dictionary.hero} profile={profile} />
      <Intro copy={dictionary.intro} />
      <SelectedWork copy={dictionary.work} projects={projects} locale={locale} />
      <HorizontalProjects copy={dictionary.showcase} projects={projects} locale={locale} />
      <Services copy={dictionary.services} />
      <About copy={dictionary.about} profile={profile} />
      <Marquee text={dictionary.marquee} />
      <Contact copy={dictionary.contact} />
    </>
  );
}
