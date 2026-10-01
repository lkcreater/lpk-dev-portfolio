"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const node = root.current;
      if (!node) return;

      const seen = sessionStorage.getItem("lpk-preloader");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (seen || reduce) {
        gsap.set(node, { autoAlpha: 0, pointerEvents: "none" });
        return;
      }

      sessionStorage.setItem("lpk-preloader", "seen");
      const progress = { value: 0 };
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(progress, {
          value: 100,
          duration: 1.35,
          ease: "power2.inOut",
          onUpdate: () => {
            if (count.current)
              count.current.textContent = String(Math.round(progress.value)).padStart(3, "0");
          },
        })
        .to(".preloader-line", { scaleX: 1, duration: 1.1, ease: "expo.inOut" }, 0.15)
        .to(node, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "+=0.1")
        .set(node, { autoAlpha: 0, pointerEvents: "none" });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <div className="preloader-top">
        <span>LPK®</span>
        <span>INITIALIZING</span>
      </div>
      <div className="preloader-count">
        <span ref={count}>000</span>
        <sup>%</sup>
      </div>
      <div className="preloader-track">
        <span className="preloader-line" />
      </div>
    </div>
  );
}
