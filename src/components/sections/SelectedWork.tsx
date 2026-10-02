"use client";

import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { PortfolioProject } from "@/data/projects";
import { gsap, useGSAP } from "@/lib/gsap";
import { ExperienceModel } from "@/components/sections/ExperienceModel";

export function SelectedWork({ copy, projects }: { copy: Dictionary["work"]; projects: PortfolioProject[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".experience-card");

        cards.forEach((card) => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              once: true,
            },
          });

          timeline.fromTo(
            card,
            { y: 72, rotationX: 8 },
            { y: 0, rotationX: 0, duration: 0.9, ease: "power4.out" },
          );

          timeline.fromTo(
            card.querySelector(".experience-svg"),
            { scale: 0.9, rotation: -2, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 1.05, ease: "power3.out" },
            0.08,
          );
        });

        gsap.to(".experience-orbit", {
          y: -64,
          rotation: 28,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className="selected-work section-pad page-grid">
      <header className="experience-heading">
        <div>
          <p className="section-kicker light">
            <span>03</span>
            {copy.kicker}
          </p>
          <h2>{copy.title}</h2>
        </div>
        <div className="experience-heading-copy">
          <p>{copy.intro}</p>
          <div className="experience-count" aria-label={`${projects.length} ${copy.systemsLabel}`}>
            <strong>{String(projects.length).padStart(2, "0")}</strong>
            <span>{copy.systemsLabel}</span>
          </div>
        </div>
        <div className="experience-orbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </header>

      <div className="experience-grid">
        {projects.map((project, index) => (
          <article className={`experience-card experience-tone-${project.tone}`} key={project.slug}>
            <div className="experience-card-top">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{copy.itemLabel}</span>
            </div>

            <ExperienceModel id={project.slug} label={project.category} type={project.visual} />

            <div className="experience-card-copy">
              <p className="experience-card-label">{copy.builtLabel}</p>
              <h3>{project.category}</h3>
              <p>{project.description}</p>
              {project.technologies.length > 0 ? (
                <ul aria-label={copy.stackLabel}>
                  {project.technologies.slice(0, 7).map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <footer className="experience-footer">
        <span>{copy.footer}</span>
        <span>Architecture / Product / Engineering</span>
      </footer>
    </section>
  );
}
