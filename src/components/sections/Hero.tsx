"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";

export function Hero({ copy }: { copy: Dictionary["hero"] }) {
  const root = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set([".hero-line-inner", ".hero-fade"], { opacity: 1, y: 0 });
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
        scale: 1.05,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1.1 },
      });

      const xTo = gsap.quickTo(visual.current, "x", { duration: 1.1, ease: "power3.out" });
      const yTo = gsap.quickTo(visual.current, "y", { duration: 1.1, ease: "power3.out" });
      const onPointerMove = (event: PointerEvent) => {
        xTo((event.clientX / window.innerWidth - 0.5) * 18);
        yTo((event.clientY / window.innerHeight - 0.5) * 12);
      };
      root.current?.addEventListener("pointermove", onPointerMove, { passive: true });
      return () => root.current?.removeEventListener("pointermove", onPointerMove);
    },
    { scope: root, dependencies: [copy], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="top" className="hero">
      <div ref={visual} className="hero-visual" aria-hidden="true">
        <Image src="/images/hero-sculpture.png" alt="" fill priority sizes="100vw" />
        <div className="hero-glow" />
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
      </div>
    </section>
  );
}
