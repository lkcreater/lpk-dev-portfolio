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
    </section>
  );
}
