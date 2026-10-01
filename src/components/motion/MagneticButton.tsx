"use client";

import { type ReactNode, useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";

export function MagneticButton({ href, children }: { href: string; children: ReactNode }) {
  const root = useRef<HTMLAnchorElement>(null);
  useGSAP(
    (_, contextSafe) => {
      const element = root.current;
      if (!element) return;

      const onMove = contextSafe!((event: PointerEvent) => {
        if (!window.matchMedia("(pointer: fine)").matches) return;
        const rect = element.getBoundingClientRect();
        gsap.to(element, {
          x: (event.clientX - rect.left - rect.width / 2) * 0.2,
          y: (event.clientY - rect.top - rect.height / 2) * 0.2,
          duration: 0.35,
          ease: "power3.out",
        });
      });
      const onLeave = contextSafe!(() => gsap.to(element, { x: 0, y: 0, duration: 0.65, ease: "expo.out" }));
      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", onLeave);
      return () => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root },
  );

  return (
    <Link ref={root} href={href} className="magnetic-button" data-cursor="TALK">
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
