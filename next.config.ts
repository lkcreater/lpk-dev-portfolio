import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // The SVG playground reads this Agent Skill at runtime.
  outputFileTracingIncludes: {
    "/api/playground/svg-animation": ["./.agents/skills/svg-animations/SKILL.md"],
  },
};

// Knowledge posts are .mdx files imported from src/content/knowledge.
export default createMDX()(nextConfig);
