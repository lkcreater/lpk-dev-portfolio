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
```

## Structure

- `src/app/[locale]` — localized portfolio and project routes
- `src/components/sections` — editorial page sections
- `src/components/motion` — reusable GSAP and interaction primitives
- `src/messages` — English and Thai dictionaries
- `src/data/projects.ts` — project visual configuration

Fonts and visual assets are stored locally so production builds do not depend on external font requests.
