"use client";

import { type CSSProperties, useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { PortfolioProfile } from "@/data/projects";
import { gsap, useGSAP } from "@/lib/gsap";

const STACK = [
  "NestJS",
  "React 19",
  "Vercel AI SDK",
  "OpenAI · Anthropic · Google",
  "Drizzle ORM",
  "Supabase",
  "Cloud Run",
];

// Three nodes on each side of the AI core, in the same order as copy.now.nodes.
const NODES = [
  { x: 96, y: 92 },
  { x: 70, y: 240 },
  { x: 96, y: 388 },
  { x: 544, y: 92 },
  { x: 570, y: 240 },
  { x: 544, y: 388 },
];

const GLYPHS = [
  // Content plan: calendar
  "M-11-8h22v18h-22ZM-11-2h22M-5-12v6M5-12v6M-5 4h2M1 4h2",
  // Image & video ads: frame with play
  "M-12-9h24v18h-24ZM-3-4v8l7-4Z",
  // Social publishing: paper plane
  "M-12 0 12-10 5 11-1 3ZM-1 3l6-6",
  // AI chatbot: speech bubble
  "M-12-9h24v14h-13l-6 5v-5h-5ZM-6-2h1M0-2h1M6-2h1",
  // Leads & orders: bag
  "M-10-4h20l-2 15h-16ZM-5-4v-3a5 5 0 0 1 10 0v3",
  // Content performance: rising bars
  "M-11 10h22M-8 10V3M-2 10V-1M4 10v-7M-9-3l6-5 5 3 7-7",
];

function linkPath({ x, y }: { x: number; y: number }) {
  const dir = x < 320 ? -1 : 1;
  return `M${320 + dir * 46} 240C${320 + dir * 120} 240 ${x - dir * 120} ${y} ${x - dir * 34} ${y}`;
}

export function IntroNow({
  copy,
  current,
}: {
  copy: Dictionary["intro"]["now"];
  current: PortfolioProfile["career"][number];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const links = gsap.utils.toArray<SVGPathElement>(".wf-link");
        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        });

        timeline
          .from(root.current, { clipPath: "inset(12% 10% 12% 10%)", duration: 1.5, ease: "expo.out" }, 0)
          .from(".intro-now-bar", { opacity: 0, duration: 0.8 }, 0.3)
          .from(".intro-now-copy > *", { y: 28, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.25)
          .from(
            ".intro-now-stats strong",
            { textContent: 0, snap: { textContent: 1 }, duration: 1.4, ease: "power2.out", stagger: 0.12 },
            0.7,
          )
          .from(
            ".wf-core",
            { scale: 0.4, opacity: 0, duration: 1, ease: "back.out(1.6)", transformOrigin: "50% 50%" },
            0.15,
          );

        links.forEach((link, index) => {
          const length = link.getTotalLength();
          timeline.fromTo(
            link,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" },
            0.55 + index * 0.08,
          );
        });

        timeline
          .from(
            ".wf-node",
            {
              scale: 0.5,
              opacity: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "back.out(1.8)",
              transformOrigin: "50% 50%",
            },
            1.15,
          )
          .from(".wf-label", { y: 8, opacity: 0, duration: 0.6, stagger: 0.08 }, 1.3)
          .from(".wf-particles", { opacity: 0, duration: 0.8 }, 1.8);
      });

      // Subtle 3D tilt that follows the pointer, desktop only.
      media.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const panel = root.current;
        if (!panel) return;
        gsap.set(".intro-workflow", { transformPerspective: 900 });
        const tiltX = gsap.quickTo(".intro-workflow", "rotationX", { duration: 0.8, ease: "power3.out" });
        const tiltY = gsap.quickTo(".intro-workflow", "rotationY", { duration: 0.8, ease: "power3.out" });
        const onMove = (event: PointerEvent) => {
          const rect = panel.getBoundingClientRect();
          tiltY(((event.clientX - rect.left) / rect.width - 0.5) * 10);
          tiltX(((event.clientY - rect.top) / rect.height - 0.5) * -8);
        };
        const onLeave = () => {
          tiltX(0);
          tiltY(0);
        };
        panel.addEventListener("pointermove", onMove);
        panel.addEventListener("pointerleave", onLeave);
        return () => {
          panel.removeEventListener("pointermove", onMove);
          panel.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="intro-now">
      <div className="intro-now-frame" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="intro-now-bar" aria-hidden="true">
        <span>mekha.ai</span>
        <span>{copy.engine}</span>
      </div>
      <div className="intro-now-copy">
        <p className="intro-now-label">{copy.label}</p>
        <h3>{copy.product}</h3>
        <p className="intro-now-tagline">{copy.tagline}</p>
        <dl className="intro-now-facts">
          <div>
            <dt>{copy.roleLabel}</dt>
            <dd>{current.role}</dd>
          </div>
          <div>
            <dt>{copy.companyLabel}</dt>
            <dd>
              <a href="https://mekha.ai" target="_blank" rel="noopener noreferrer">
                {current.company} ↗
              </a>
            </dd>
          </div>
          <div>
            <dt>{copy.periodLabel}</dt>
            <dd>{current.period}</dd>
          </div>
        </dl>
        <p className="intro-now-body">{current.description}</p>
        <dl className="intro-now-stats">
          {copy.stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>
                <strong>{stat.value}</strong>
              </dd>
            </div>
          ))}
        </dl>
        <ul aria-label={copy.stackLabel}>
          {STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <svg className="intro-workflow" viewBox="0 0 640 480" role="img" aria-label={copy.diagramLabel}>
        <defs>
          <linearGradient id="wf-link-l" gradientUnits="userSpaceOnUse" x1="274" y1="0" x2="80" y2="0">
            <stop offset="0" stopColor="#e85d2a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#eeeae1" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="wf-link-r" gradientUnits="userSpaceOnUse" x1="366" y1="0" x2="560" y2="0">
            <stop offset="0" stopColor="#e85d2a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#eeeae1" stopOpacity="0.14" />
          </linearGradient>
          <radialGradient id="wf-glow">
            <stop offset="0" stopColor="#e85d2a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#e85d2a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="wf-links">
          {NODES.map((node, index) => (
            <path
              key={index}
              id={`wf-link-${index}`}
              className="wf-link"
              d={linkPath(node)}
              stroke={`url(#wf-link-${node.x < 320 ? "l" : "r"})`}
            />
          ))}
        </g>

        <g className="wf-particles" aria-hidden="true">
          {NODES.map((_, index) => (
            <circle key={index} className="wf-particle" r="3">
              <animateMotion
                dur="3.2s"
                begin={`${index * 0.45}s`}
                repeatCount="indefinite"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1"
              >
                <mpath href={`#wf-link-${index}`} />
              </animateMotion>
            </circle>
          ))}
        </g>

        <g transform="translate(320 240)">
          <g className="wf-core">
            <circle className="wf-core-glow" r="96" fill="url(#wf-glow)" />
            <circle className="wf-core-orbit" r="62" />
            <g className="wf-core-sat" aria-hidden="true">
              <circle r="62" fill="none" />
              <circle className="wf-particle" cx="62" r="3.5" />
            </g>
            <circle className="wf-core-ring" r="46" />
            <circle className="wf-core-fill" r="36" />
            <text className="wf-core-text" textAnchor="middle" dy="7">
              {copy.core}
            </text>
          </g>
        </g>

        {NODES.map((node, index) => (
          <g
            key={index}
            transform={`translate(${node.x} ${node.y})`}
            style={{ "--i": index } as CSSProperties}
          >
            <g className="wf-node">
              <circle className="wf-node-halo" r="38" />
              <circle className="wf-node-ring" r="30" />
              <path className="wf-glyph" d={GLYPHS[index]} />
            </g>
            <g className="wf-label">
              <text className="wf-title" textAnchor="middle" y="52">
                {copy.nodes[index].title}
              </text>
              <text className="wf-sub" textAnchor="middle" y="69">
                {copy.nodes[index].sub}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
