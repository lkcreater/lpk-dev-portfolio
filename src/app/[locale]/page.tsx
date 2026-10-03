import { notFound } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { SelectedWork } from "@/components/sections/SelectedWork";
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
      <Intro copy={dictionary.intro} profile={profile} />
      <SelectedWork copy={dictionary.work} projects={projects} />
      <Services copy={dictionary.services} />
      <About copy={dictionary.about} locale={locale} />
      <Marquee text={dictionary.marquee} />
      <Contact copy={dictionary.contact} profile={profile} />
    </>
  );
}
