"use client";

import { type ReactNode, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function ImageReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        root.current,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.15,
          ease: "expo.inOut",
          scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
        },
      );
      const child = root.current?.firstElementChild;
      if (!child) return;
      gsap.fromTo(
        child,
        { scale: 1.1 },
        {
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
