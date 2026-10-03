"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";

// Line-art scene per expertise, on a 240×200 grid. `sv-flow` paths get a moving dash.
const SCENES = [
  // Frontend: browser window with layout blocks and a cursor
  <g key="fe">
    <rect className="sv-surface" x="30" y="30" width="180" height="140" rx="10" />
    <path className="sv-line" d="M30 54h180M44 42h1M54 42h1M64 42h1" />
    <rect className="sv-accent-fill" x="46" y="68" width="68" height="40" rx="4" />
    <path className="sv-line" d="M126 72h68M126 86h52M126 100h60M46 124h148M46 138h110M46 152h80" />
    <path className="sv-accent sv-float" d="m168 120 22 10-10 4-4 10Z" />
  </g>,
  // Backend: request → service stack → response
  <g key="be">
    <path className="sv-flow" d="M24 70h56M160 70h56M216 130h-56M80 130H24" />
    <rect className="sv-surface" x="80" y="40" width="80" height="34" rx="6" />
    <rect className="sv-surface" x="80" y="83" width="80" height="34" rx="6" />
    <rect className="sv-surface" x="80" y="126" width="80" height="34" rx="6" />
    <path className="sv-line" d="M94 57h30M94 100h22M94 143h36" />
    <circle className="sv-dot sv-blink" cx="146" cy="57" r="4" />
    <circle className="sv-dot sv-blink d1" cx="146" cy="100" r="4" />
    <circle className="sv-dot sv-blink d2" cx="146" cy="143" r="4" />
  </g>,
  // Architecture: connected service nodes
  <g key="ar">
    <path className="sv-flow" d="M120 100 60 52M120 100l60-48M120 100l-60 52M120 100l60 52" />
    <circle className="sv-surface" cx="120" cy="100" r="26" />
    <circle className="sv-accent-fill" cx="120" cy="100" r="10" />
    <rect className="sv-surface" x="36" y="34" width="48" height="36" rx="6" />
    <rect className="sv-surface" x="156" y="34" width="48" height="36" rx="6" />
    <rect className="sv-surface" x="36" y="134" width="48" height="36" rx="6" />
    <rect className="sv-surface" x="156" y="134" width="48" height="36" rx="6" />
  </g>,
  // Database: cylinder beside a table
  <g key="db">
    <path className="sv-surface" d="M30 52c0-10 60-10 60 0v96c0 10-60 10-60 0Z" />
    <path className="sv-line" d="M30 52c0 10 60 10 60 0M30 84c0 10 60 10 60 0M30 116c0 10 60 10 60 0" />
    <path className="sv-flow" d="M94 100h22" />
    <rect className="sv-surface" x="120" y="44" width="96" height="112" rx="6" />
    <path className="sv-line" d="M120 70h96M120 98h96M120 126h96M152 44v112" />
    <rect className="sv-accent-fill sv-blink" x="153" y="71" width="62" height="26" />
  </g>,
  // AI & integrations: spark core with channel satellites
  <g key="ai">
    <circle className="sv-orbit" cx="120" cy="100" r="66" />
    <path className="sv-flow" d="M120 100 60 60M120 100l66-34M120 100l-58 52M120 100l64 50" />
    <circle className="sv-surface" cx="120" cy="100" r="30" />
    <path className="sv-accent-fill sv-pulse" d="m120 80 5 15 15 5-15 5-5 15-5-15-15-5 15-5Z" />
    <circle className="sv-surface" cx="60" cy="60" r="12" />
    <circle className="sv-surface" cx="186" cy="66" r="12" />
    <circle className="sv-surface" cx="62" cy="152" r="12" />
    <circle className="sv-surface" cx="184" cy="150" r="12" />
  </g>,
  // CI/CD: pipeline of stages ending in a check
  <g key="ci">
    <path className="sv-flow" d="M44 100h152" />
    <circle className="sv-surface" cx="44" cy="100" r="18" />
    <circle className="sv-surface" cx="102" cy="100" r="18" />
    <circle className="sv-surface" cx="160" cy="100" r="18" />
    <circle className="sv-accent-fill" cx="206" cy="100" r="18" />
    <path className="sv-line" d="m37 100 5 5 9-10M95 100l5 5 9-10M153 100l5 5 9-10" />
    <path className="sv-check" d="m198 100 6 6 10-12" />
    <path className="sv-line" d="M44 150c40 20 122 20 162 0M196 144l10 6-8 8" />
  </g>,
];

export function Services({ copy }: { copy: Dictionary["services"] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const item = copy.items[active];

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".service-item", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: ".service-list", start: "top 80%", once: true },
      });
      gsap.from(".service-visual", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".service-visual", start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="services" className={`services section-pad service-tone-${active}`}>
      <div className="page-grid">
        <div className="services-intro">
          <p className="section-kicker light">
            <span>04</span>
            {copy.kicker}
          </p>
          <p>{copy.intro}</p>

          <div className="service-visual" aria-live="polite">
            <div className="service-visual-head">
              <span>{String(active + 1).padStart(2, "0")}</span>
              <span>/ {String(copy.items.length).padStart(2, "0")}</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 0.75, 0.25, 1] }}
              >
                <svg className="service-svg" viewBox="0 0 240 200" aria-hidden="true">
                  {SCENES[active]}
                </svg>
                <p className="service-visual-label">{copy.stackLabel}</p>
                <ul className="service-stack">
                  {item.stack.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="service-list">
          {copy.items.map((service, index) => (
            <div key={service.title} className={`service-item${active === index ? " active" : ""}`}>
              <button
                type="button"
                aria-expanded={active === index}
                aria-controls={`service-detail-${index}`}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                data-cursor="OPEN"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{service.title}</strong>
                <i aria-hidden="true">↗</i>
              </button>
              <AnimatePresence initial={false}>
                {active === index ? (
                  <motion.div
                    id={`service-detail-${index}`}
                    className="service-detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 0.75, 0.25, 1] }}
                  >
                    <p>{service.summary}</p>
                    <ul>
                      {service.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
