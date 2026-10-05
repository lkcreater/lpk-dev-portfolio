# LPK — Creative Technologist Portfolio

A bilingual editorial portfolio built with Next.js 16, TypeScript, GSAP, Lenis and Motion. The experience includes cinematic scroll choreography, localized project pages, reduced-motion fallbacks and responsive mobile layouts.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to the saved locale, with English and Thai available at `/en` and `/th`.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run test:diagrams
```

## Structure

- `src/app/[locale]` — localized portfolio and project routes
- `src/components/sections` — editorial page sections
- `src/components/motion` — reusable GSAP and interaction primitives
- `src/messages` — English and Thai dictionaries
- `src/data/projects.ts` — project visual configuration

Fonts and visual assets are stored locally so production builds do not depend on external font requests.

## AI Diagram Designer

Available at `/en/playground/diagram-design` and `/th/playground/diagram-design` after LINE login. It supports Architecture, Flowchart, linear Sequence, and logical ER diagrams.

The workflow analyses a description or one Mermaid block, shows a structure for review, then renders the confirmed plan as static HTML and SVG. Node labels can be edited directly; a text revision requests a new AI plan. Both exports embed the local Geist and Noto Sans Thai fonts and use the site's light/dark palette.

The planner uses the installed [diagram-design skill](https://github.com/cathrynlavery/diagram-design) and the reference for the selected type. It returns a bounded graph validated with Zod. The application owns SVG markup, orthogonal routing, label placement and exports; preview runs in a script-free sandbox. Installed skill files are traced into the API deployment by `next.config.ts`.

`OPENAI_API_KEY`, `SESSION_SECRET`, LINE Login settings and production `REDIS_URL` are required, as with the existing playground. Each analysis/revision consumes one of two daily AI runs. Rendering, theme changes and downloads do not consume quota; failed analyses are refunded.

MVP limits: 9 nodes and 12 connections (Sequence: 5 actors, ER: 8 entities). Mermaid input supports flowchart/graph, sequenceDiagram and erDiagram; it is interpreted by the model and must be reviewed, rather than validated by the skill's Python extractor. Sequence fragments, PNG, file imports and drag-and-drop editing are outside this version. Dense graphs that cannot be routed clearly are rejected before returning a successful AI analysis.

Renderer checks: `npm run test:diagrams`. With a local dev server started using `DEV_MODE=true`, run `DIAGRAM_TEST_ORIGIN=http://127.0.0.1:3000 node scripts/check-diagram-api.mjs` for auth/render/page checks. Add `--ai` to also run one real model request against a mock test user (uses its daily quota).
