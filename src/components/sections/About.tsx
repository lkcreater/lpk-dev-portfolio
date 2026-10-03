"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { gsap, useGSAP } from "@/lib/gsap";

export function About({ copy }: { copy: Dictionary["about"] }) {
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
      gsap.from(".about-copy > *, .about-copy dl > div", {
        y: 32,
        opacity: 0,
        duration: 0.9,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-copy", start: "top 78%", once: true },
      });
      gsap.from(".about-principle", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-principles", start: "top 82%", once: true },
      });
      gsap.from(".about-principle i", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1.1,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".about-principles", start: "top 82%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="about section-pad page-grid">
      <div className="about-visual">
        <ImageReveal className="about-image">
          <Image src="/images/portrait.jpg" alt={copy.caption} fill sizes="(max-width: 899px) 100vw, 45vw" />
        </ImageReveal>
        <div className="about-frame" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <p className="about-caption">{copy.caption}</p>
      </div>
      <div className="about-copy">
        <p className="section-kicker light">
          <span>05</span>
          {copy.kicker}
        </p>
        <h2>{copy.title}</h2>
        <div className="about-body">
          {copy.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl>
          {copy.facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <a className="about-resume" href="/resume-ponlawat.pdf" download data-cursor="OPEN">
          <span>{copy.resume}</span>
          <small>{copy.resumeMeta}</small>
          <b aria-hidden="true">↓</b>
        </a>
      </div>
      <div className="about-principles">
        <p className="section-kicker light">{copy.principlesLabel}</p>
        <ol>
          {copy.principles.map((principle, index) => (
            <li className="about-principle" key={principle.title}>
              <i aria-hidden="true" />
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
