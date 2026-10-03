import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The svg-animations Agent Skill installed with `npx skills` (.claude/skills/svg-animations links here).
// Read from disk so `npx skills update` keeps the playground in sync; next.config traces the file.
const SKILL_PATH = join(process.cwd(), ".agents/skills/svg-animations/SKILL.md");

// Drop the YAML frontmatter; the model only needs the guidance body.
export const svgAnimationsSkill = readFileSync(SKILL_PATH, "utf8").replace(/^---[\s\S]*?---\s*/, "");
