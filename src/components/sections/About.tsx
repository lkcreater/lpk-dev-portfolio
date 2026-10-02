"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { gsap, useGSAP } from "@/lib/gsap";
import type { PortfolioProfile } from "@/data/projects";

export function About({ copy, profile }: { copy: Dictionary["about"]; profile: PortfolioProfile }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ".about-image img",
        { yPercent: -6, scale: 1.06 },
        {
          yPercent: 6,
          scale: 1.02,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="about section-pad page-grid">
      <ImageReveal className="about-image">
        <Image src="/images/portrait.png" alt="Portrait of LPK" fill sizes="(max-width: 899px) 100vw, 45vw" />
      </ImageReveal>
      <div className="about-copy">
        <p className="section-kicker">
          <span>08</span>
          {copy.kicker}
        </p>
        <h2>{copy.title}</h2>
        <p className="about-body">{copy.body}</p>
        <dl>
          {copy.facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="career-heading">
        <p className="section-kicker">
          <span>07</span>
          Experience
        </p>
        <h3>{profile.role}</h3>
      </div>
      <div className="career-list">
        {profile.career.map((item, index) => (
          <article key={`${item.company}-${item.period}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <time>{item.period}</time>
            <div>
              <h4>{item.role}</h4>
              <p className="career-company">{item.company}</p>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="skills-heading">
        <p className="section-kicker">
          <span>08</span>
          Stack &amp; education
        </p>
      </div>
      <div className="skills-content">
        {profile.skillGroups.map((group) => (
          <div className="skill-group" key={group.label}>
            <h4>{group.label}</h4>
            <p>{group.items.join(" · ")}</p>
          </div>
        ))}
        <div className="education-card">
          <time>{profile.education.period}</time>
          <h4>{profile.education.degree}</h4>
          <p>{profile.education.school}</p>
          <span>{profile.education.detail}</span>
        </div>
        <div className="profile-links">
          <a href={profile.linkedin} target="_blank" rel="noreferrer" data-cursor="OPEN">
            LinkedIn ↗
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" data-cursor="OPEN">
            GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}
