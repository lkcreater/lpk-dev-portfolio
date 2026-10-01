"use client";

import { type ReactNode, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(
        root.current,
        { y: reduce ? 0 : 42, opacity: reduce ? 1 : 0 },
        {
          y: 0,
          opacity: 1,
          duration: reduce ? 0 : 0.9,
          delay,
          ease: "power4.out",
          scrollTrigger: reduce ? undefined : { trigger: root.current, start: "top 88%", once: true },
        },
      );
    },
    { scope: root, dependencies: [delay] },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
