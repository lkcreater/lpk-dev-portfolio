import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // The SVG playground reads this Agent Skill at runtime.
  outputFileTracingIncludes: {
    "/api/playground/svg-animation": ["./.agents/skills/svg-animations/SKILL.md"],
    "/api/playground/diagram-design": [
      "./.agents/skills/diagram-design/SKILL.md",
      "./.agents/skills/diagram-design/references/type-architecture.md",
      "./.agents/skills/diagram-design/references/type-flowchart.md",
      "./.agents/skills/diagram-design/references/type-sequence.md",
      "./.agents/skills/diagram-design/references/type-er.md",
      "./.agents/skills/diagram-design/references/import-mermaid.md",
      "./src/assets/fonts/*.woff2",
    ],
  },
};

// Knowledge posts are .mdx files imported from src/content/knowledge.
export default createMDX()(nextConfig);
