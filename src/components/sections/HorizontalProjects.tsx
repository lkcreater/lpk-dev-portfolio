"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { projectVisuals } from "@/data/projects";
import { gsap, useGSAP } from "@/lib/gsap";

export function HorizontalProjects({
  copy,
  work,
  locale,
}: {
  copy: Dictionary["showcase"];
  work: Dictionary["work"];
  locale: Locale;
}) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        if (!track.current) return;
        gsap.to(track.current, {
          x: () => -(track.current!.scrollWidth - window.innerWidth + 48),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${track.current!.scrollWidth - window.innerWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="horizontal-showcase">
      <div className="horizontal-header page-grid">
        <p className="section-kicker light">
          <span>04</span>
          {copy.kicker}
        </p>
        <span>{copy.label}</span>
      </div>
      <div ref={track} className="horizontal-track">
        {work.projects.slice(0, 3).map((project, index) => (
          <Link
            href={`/${locale}/work/${project.slug}`}
            className={`horizontal-card tone-${projectVisuals[index].tone}`}
            data-cursor="VIEW"
            key={project.slug}
          >
            <Image
              src="/images/hero-sculpture.png"
              alt=""
              fill
              sizes="(max-width: 899px) 92vw, 70vw"
              style={{ objectPosition: projectVisuals[index].position }}
            />
            <div className="horizontal-card-wash" />
            <span className="horizontal-number">0{index + 1}</span>
            <div className="horizontal-copy">
              <h3>{project.title}</h3>
              <p>
                {project.category} · {project.year}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
