export const projectVisuals = [
  { slug: "nissan-social-command", tone: "ember", position: "center" },
  { slug: "synthetic-horizons", tone: "silver", position: "70% center" },
  { slug: "minority-archive", tone: "paper", position: "25% center" },
  { slug: "future-of-care", tone: "blue", position: "center" },
  { slug: "form-of-intelligence", tone: "mono", position: "80% center" },
] as const;

export type ProjectSlug = (typeof projectVisuals)[number]["slug"];

export function getProjectVisual(slug: string) {
  return projectVisuals.find((project) => project.slug === slug);
}
