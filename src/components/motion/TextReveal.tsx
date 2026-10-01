"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(
        ".reveal-word",
        { opacity: reduce ? 1 : 0.18 },
        {
          opacity: 1,
          stagger: reduce ? 0 : 0.045,
          ease: "none",
          scrollTrigger: reduce
            ? undefined
            : { trigger: root.current, start: "top 78%", end: "bottom 45%", scrub: 0.8 },
        },
      );
    },
    { scope: root, dependencies: [text], revertOnUpdate: true },
  );

  return (
    <p ref={root} className={className}>
      {words.map((word, index) => (
        <span className="reveal-word" key={`${word}-${index}`}>
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
