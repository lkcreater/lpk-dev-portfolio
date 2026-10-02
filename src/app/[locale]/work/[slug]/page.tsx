import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeUp } from "@/components/motion/FadeUp";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { getProjects, projectVisuals } from "@/data/projects";
import { getDictionary, isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((locale) => projectVisuals.map(({ slug }) => ({ locale, slug })));
}

type ProjectPageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = getProjects(locale).find((item) => item.slug === slug);
  return project ? { title: `${project.title} — LPK`, description: project.description } : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const projects = getProjects(locale);
  const projectIndex = projects.findIndex((item) => item.slug === slug);
  if (projectIndex < 0) notFound();

  const project = projects[projectIndex];
  const nextProject = projects[(projectIndex + 1) % projects.length];
  const detail = dictionary.projectDetail;
  const labels = [detail.overview, detail.problem, detail.process, detail.design, detail.result];
  const narrative = project.details.length === labels.length ? project.details : detail.copy;

  return (
    <article className="project-detail">
      <header className="project-detail-hero page-grid">
        <Link href={`/${locale}#work`} className="project-back" data-cursor="OPEN">
          ← {detail.back}
        </Link>
        <div className="project-detail-meta">
          <span>0{projectIndex + 1}</span>
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        {project.technologies.length ? (
          <ul className="project-stack" aria-label="Technology stack">
            {project.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        ) : null}
        {project.url ? (
          <a
            className="project-site-link"
            href={project.url}
            target="_blank"
            rel="noreferrer"
            data-cursor="OPEN"
          >
            Visit live site ↗
          </a>
        ) : null}
      </header>
      <ImageReveal className={`project-detail-image tone-${project.tone}`}>
        <Image
          src="/images/hero-sculpture.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectPosition: project.position }}
        />
        <div className="project-detail-sigil" aria-hidden="true">
          0{projectIndex + 1}
        </div>
      </ImageReveal>
      <div className="project-narrative page-grid">
        {labels.map((label, index) => (
          <FadeUp className="narrative-row" key={label}>
            <span>
              0{index + 1} / {label}
            </span>
            <h2>{index === 0 ? project.title : label}</h2>
            <p>{narrative[index]}</p>
          </FadeUp>
        ))}
      </div>
      <Link href={`/${locale}/work/${nextProject.slug}`} className="next-project" data-cursor="VIEW">
        <span>{detail.next}</span>
        <strong>{nextProject.title}</strong>
        <i>↗</i>
      </Link>
    </article>
  );
}
