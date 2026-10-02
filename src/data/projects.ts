import portfolioData from "@/data/portfolio.json";
import projectsData from "@/data/projects.json";
import type { Locale } from "@/lib/i18n";

export type PortfolioProfile = typeof portfolioData.identity &
  (typeof portfolioData.locales)[Locale] & {
    heroStack: string[];
    skillGroups: typeof portfolioData.skillGroups;
  };

export type PortfolioProject = Omit<(typeof projectsData)[number], "description"> & {
  description: string;
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
    ...project,
    description: project.description[locale],
  }));
}

export function getProjectVisual(slug: string) {
  return projectVisuals.find((project) => project.slug === slug);
}
