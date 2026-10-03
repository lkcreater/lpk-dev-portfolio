import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {};

// Knowledge posts are .mdx files imported from src/content/knowledge.
export default createMDX()(nextConfig);
