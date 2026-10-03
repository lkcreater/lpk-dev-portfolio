"use client";

import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";

const PLATFORMS = ["Meta", "WhatsApp", "TikTok", "YouTube"];
const PLATFORM_Y = [50, 110, 170, 230];

// One continuous route per platform: app → review → consent → platform.
const route = (y: number) => `M180 140H560C690 140 700 ${y} 795 ${y}`;

export function ReviewFlow({ copy }: { copy: Dictionary["intro"]["review"]["flow"] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });

        timeline.from(".rf-node", {
          scale: 0.6,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "back.out(1.7)",
          transformOrigin: "50% 50%",
        });

        gsap.utils.toArray<SVGPathElement>(".rf-route").forEach((path, index) => {
          const length = path.getTotalLength();
          timeline.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" },
            0.3 + index * 0.1,
          );
        });

        timeline
          .from(".rf-pill", { x: 24, opacity: 0, duration: 0.6, stagger: 0.08 }, 1.1)
          .from(".rf-packets", { opacity: 0, duration: 0.6 }, 1.6)
          .from(".rf-step", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.8)
          .from(".rf-step i", { scaleX: 0, duration: 0.9, stagger: 0.1, transformOrigin: "left" }, 1);
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="review-flow">
      <svg
        className="rf-svg"
        viewBox="0 0 960 280"
        role="img"
        aria-label={`${copy.app} → ${copy.review} → ${copy.consent} → ${PLATFORMS.join(", ")}`}
      >
        <g>
          {PLATFORM_Y.map((y, index) => (
            <path key={y} id={`rf-route-${index}`} className="rf-route" d={route(y)} />
          ))}
        </g>

        <g className="rf-packets" aria-hidden="true">
          {PLATFORM_Y.map((y, index) => (
            <g key={y}>
              <circle className="rf-request" r="4">
                <animateMotion dur="3.6s" begin={`${index * 0.9}s`} repeatCount="indefinite">
                  <mpath href={`#rf-route-${index}`} />
                </animateMotion>
              </circle>
              <rect className="rf-token" x="-4" y="-4" width="8" height="8" transform="rotate(45)">
                <animateMotion
                  dur="3.6s"
                  begin={`${index * 0.9 + 1.8}s`}
                  repeatCount="indefinite"
                  keyPoints="1;0"
                  keyTimes="0;1"
                  calcMode="linear"
                >
                  <mpath href={`#rf-route-${index}`} />
                </animateMotion>
              </rect>
            </g>
          ))}
        </g>

        {/* Our platform */}
        <g transform="translate(120 140)">
          <g className="rf-node">
            <rect className="rf-surface" x="-60" y="-45" width="120" height="90" rx="10" />
            <path className="rf-line" d="M-60-25H60M-46-35h1M-38-35h1M-30-35h1M-42-8h50M-42 6h70M-42 20h36" />
          </g>
          <text className="rf-label" textAnchor="middle" y="90">
            {copy.app}
          </text>
        </g>

        {/* Platform review */}
        <g transform="translate(390 140)">
          <circle className="rf-orbit" r="62" />
          <g className="rf-node">
            <path className="rf-surface accent" d="M0-46 38-31v27c0 27-17 45-38 54-21-9-38-27-38-54v-27Z" />
            <path className="rf-check" d="M-14 2l9 10 19-21" />
          </g>
          <text className="rf-label" textAnchor="middle" y="90">
            {copy.review}
          </text>
        </g>

        {/* Business consent */}
        <g transform="translate(610 140)">
          <g className="rf-node">
            <circle className="rf-surface" r="36" />
            <circle className="rf-line" cy="-8" r="10" />
            <path className="rf-line" d="M-18 22c3-14 33-14 36 0" />
            <circle className="rf-badge" cx="26" cy="-26" r="11" />
            <path className="rf-badge-check" d="m20-26 4 4 8-9" />
          </g>
          <text className="rf-label" textAnchor="middle" y="90">
            {copy.consent}
          </text>
        </g>

        {PLATFORM_Y.map((y, index) => (
          <g key={y} transform={`translate(860 ${y})`}>
            <g className="rf-pill">
              <rect className="rf-surface" x="-65" y="-18" width="130" height="36" rx="18" />
              <circle className="rf-dot" cx="-46" r="4" />
              <text className="rf-pill-text" x="-34" dy="5">
                {PLATFORMS[index]}
              </text>
            </g>
          </g>
        ))}
      </svg>

      <ol className="rf-steps">
        {copy.steps.map((step, index) => (
          <li className="rf-step" key={step}>
            <i aria-hidden="true" />
            <span>{String(index + 1).padStart(2, "0")}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
