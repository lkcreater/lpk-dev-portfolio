"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "@/lib/gsap";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);
    return () => lenis.destroy();
  }, []);

  return null;
}
