"use client";

import { type ReactNode, useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
};

export function MagneticButton({ href, onClick, children }: MagneticButtonProps) {
  const root = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  useGSAP(
    (_, contextSafe) => {
      const element = root.current;
      if (!element) return;

      const onMove = contextSafe!((event: Event) => {
        if (!window.matchMedia("(pointer: fine)").matches) return;
        const pointer = event as PointerEvent;
        const rect = element.getBoundingClientRect();
        gsap.to(element, {
          x: (pointer.clientX - rect.left - rect.width / 2) * 0.2,
          y: (pointer.clientY - rect.top - rect.height / 2) * 0.2,
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

  const content = (
    <>
      {children}
      <span aria-hidden="true">↗</span>
    </>
  );

  if (href) {
    return (
      <Link
        ref={root as React.RefObject<HTMLAnchorElement>}
        href={href}
        className="magnetic-button"
        data-cursor="TALK"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={root as React.RefObject<HTMLButtonElement>}
      type="button"
      className="magnetic-button"
      onClick={onClick}
      data-cursor="TALK"
    >
      {content}
    </button>
  );
}
