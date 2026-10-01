"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const element = cursor.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;

    const xTo = gsap.quickTo(element, "x", { duration: 0.34, ease: "power3.out" });
    const yTo = gsap.quickTo(element, "y", { duration: 0.34, ease: "power3.out" });
    const onMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      gsap.set(element, { autoAlpha: 1 });
    };
    const onOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      const value = target?.dataset.cursor ?? "";
      if (label.current) label.current.textContent = value;
      gsap.to(element, { scale: value ? 3.8 : 1, duration: 0.35, ease: "power3.out" });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
    };
  });

  return (
    <div ref={cursor} className="custom-cursor" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
