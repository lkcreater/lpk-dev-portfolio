import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { PortfolioProject } from "@/data/projects";
import { FadeUp } from "@/components/motion/FadeUp";
import { ImageReveal } from "@/components/motion/ImageReveal";

export function SelectedWork({
  copy,
  projects,
  locale,
}: {
  copy: Dictionary["work"];
  projects: PortfolioProject[];
  locale: Locale;
}) {
  return (
    <section id="work" className="selected-work section-pad page-grid">
      <div className="section-heading-row">
        <FadeUp className="section-kicker light">
          <span>03</span>
          {copy.kicker}
        </FadeUp>
        <span>{copy.count}</span>
      </div>
      <div className="project-list">
        {projects.map((project, index) => {
          return (
            <article className="project-row" key={project.slug}>
              <Link href={`/${locale}/work/${project.slug}`} className="project-link" data-cursor="VIEW">
                <div className="project-meta-line">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{project.category}</span>
                  <span>{project.year}</span>
                </div>
                <ImageReveal className={`project-art tone-${project.tone}`}>
                  <Image
                    src="/images/hero-sculpture.png"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 88vw"
                    style={{ objectPosition: project.position }}
                  />
                  <div className="project-art-mark" aria-hidden="true">
                    <span>LPK / 0{index + 1}</span>
                    <b>{project.title.slice(0, 2).toUpperCase()}</b>
                  </div>
                </ImageReveal>
                <div className="project-copy">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <span className="project-arrow" aria-label={copy.view}>
                    ↗
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
