"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { PortfolioProfile } from "@/data/projects";
import { gsap, useGSAP } from "@/lib/gsap";

export function Hero({ copy, profile }: { copy: Dictionary["hero"]; profile: PortfolioProfile }) {
  const root = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set([".hero-line-inner", ".hero-fade", ".hero-object"], { opacity: 1, y: 0 });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power4.out" },
        delay: sessionStorage.getItem("lpk-preloader") ? 0.05 : 1.9,
      });
      timeline
        .set(".hero-line-inner", { opacity: 1 })
        .fromTo(".hero-line-inner", { yPercent: 115 }, { yPercent: 0, duration: 0.86, stagger: 0.11 })
        .fromTo(
          ".hero-fade",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.07 },
          "-=0.45",
        )
        .fromTo(
          ".hero-object",
          { opacity: 0, y: 34, rotationX: -8 },
          { opacity: 1, y: 0, rotationX: 0, duration: 1.15, stagger: 0.09 },
          "-=0.85",
        );

      gsap.to(".hero-content", {
        scale: 0.92,
        opacity: 0.15,
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.9 },
      });
      gsap.to(visual.current, {
        yPercent: 14,
        scale: 0.94,
        rotationZ: 2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1.1 },
      });

      const rotateYTo = gsap.quickTo(visual.current, "rotationY", { duration: 1.1, ease: "power3.out" });
      const rotateXTo = gsap.quickTo(visual.current, "rotationX", { duration: 1.1, ease: "power3.out" });
      const onPointerMove = (event: PointerEvent) => {
        rotateYTo((event.clientX / window.innerWidth - 0.5) * 9);
        rotateXTo((event.clientY / window.innerHeight - 0.5) * -7);
      };
      root.current?.addEventListener("pointermove", onPointerMove, { passive: true });
      return () => root.current?.removeEventListener("pointermove", onPointerMove);
    },
    { scope: root, dependencies: [copy], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="top" className="hero">
      <div className="hero-perspective" aria-hidden="true">
        <div ref={visual} className="hero-visual">
          <div className="hero-orbit hero-object" />
          <div className="hero-visual-frame hero-object">
            <Image
              src="/images/hero-sculpture.png"
              alt=""
              fill
              priority
              sizes="(max-width: 899px) 88vw, 56vw"
            />
            <span className="hero-frame-label">FULL-STACK / 10+ YEARS</span>
          </div>
          <div className="hero-code-card hero-object">
            <span>01 / SYSTEM</span>
            <code>
              product
              <br />
              <i>→ interface</i>
              <br />
              <i>→ api</i>
              <br />
              <i>→ data</i>
            </code>
          </div>
          <div className="hero-stat-card hero-object">
            <b>{profile.experienceYears}</b>
            <span>{profile.experienceLabel}</span>
          </div>
          <div className="hero-glow" />
        </div>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content page-grid">
        <p className="hero-eyebrow hero-fade">{copy.eyebrow}</p>
        <h1 className="hero-title">
          {copy.lines.map((line) => (
            <span className="hero-line" key={line}>
              <span className="hero-line-inner">{line}</span>
            </span>
          ))}
        </h1>
        <div className="hero-bottom hero-fade">
          <span className="scroll-cue">
            <i />
            {copy.scroll}
          </span>
          <span>{copy.availability}</span>
          <span className="hero-index">01 / 08</span>
        </div>
        <div className="hero-stack hero-fade" aria-label="Primary technology stack">
          {profile.heroStack.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
