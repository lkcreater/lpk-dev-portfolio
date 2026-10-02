import portfolioData from "@/data/portfolio.json";
import projectsData from "@/data/projects.json";
import type { Locale } from "@/lib/i18n";

export type PortfolioProfile = typeof portfolioData.identity &
  (typeof portfolioData.locales)[Locale] & {
    heroStack: string[];
    skillGroups: typeof portfolioData.skillGroups;
  };

export type PortfolioProject = {
  slug: string;
  title: string;
  category: string;
  year: string;
  url: string | null;
  tone: string;
  position: string;
  description: string;
  details: string[];
  technologies: string[];
};

export const projectVisuals = projectsData.map(({ slug, tone, position }) => ({ slug, tone, position }));

export function getProfile(locale: Locale): PortfolioProfile {
  return {
    ...portfolioData.identity,
    ...portfolioData.locales[locale],
    heroStack: portfolioData.heroStack,
    skillGroups: portfolioData.skillGroups,
  };
}

export function getProjects(locale: Locale): PortfolioProject[] {
  return projectsData.map((project) => ({
    slug: project.slug,
    title: project.title,
    category: project.category,
    year: project.year,
    url: project.url,
    tone: project.tone,
    position: project.position,
    description: project.description[locale],
    details: "details" in project && project.details ? project.details[locale] : [],
    technologies:
      "technologies" in project && Array.isArray(project.technologies) ? project.technologies : [],
  }));
}

export function getProjectVisual(slug: string) {
  return projectVisuals.find((project) => project.slug === slug);
}
