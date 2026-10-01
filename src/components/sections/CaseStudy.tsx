"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";

export function CaseStudy({ copy }: { copy: Dictionary["caseStudy"] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.utils.toArray<HTMLElement>(".case-step").forEach((step, index) => {
        gsap.fromTo(
          step,
          { opacity: 0.25, y: 40 },
          {
            opacity: 1,
            y: 0,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 70%", end: "bottom 48%", scrub: 0.7 },
          },
        );
        gsap.to(".case-visual-inner", {
          yPercent: -index * 2.5,
          scale: 1 + index * 0.012,
          ease: "none",
          scrollTrigger: { trigger: step, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });
    },
    { scope: root, dependencies: [copy], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="case-study section-pad page-grid">
      <div className="case-visual">
        <div className="case-visual-inner">
          <Image src="/images/hero-sculpture.png" alt="" fill sizes="(max-width: 899px) 100vw, 50vw" />
          <div className="case-dashboard" aria-hidden="true">
            <span>LIVE SIGNALS</span>
            <b>84.7</b>
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="case-visual-caption">
          <span>{copy.kicker}</span>
          <span>2026 / BKK</span>
        </div>
      </div>
      <div className="case-copy">
        <p className="section-kicker">
          <span>05</span>
          {copy.kicker}
        </p>
        <h2>{copy.title}</h2>
        <div className="case-steps">
          {copy.steps.map((step, index) => (
            <article className="case-step" key={step.label}>
              <span>
                0{index + 1} / {step.label}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
