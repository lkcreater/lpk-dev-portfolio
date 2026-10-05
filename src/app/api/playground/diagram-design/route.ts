import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { diagramInstructions } from "@/agent-skill/diagram-design";
import {
  diagramPlanSchema,
  diagramRequestSchema,
  mermaidKind,
  validateDiagramPlan,
} from "@/lib/diagram-schema";
import { renderDiagram } from "@/lib/diagram-renderer";
import { getSession } from "@/lib/session";
import { consumeUsage, refundUsage } from "@/lib/usage-limit";

export const runtime = "nodejs";
export const maxDuration = 120;
const TOOL = "diagram-design";
let fontCSS: string | undefined;

function embeddedFonts() {
  // Read only on render, then cache immutable font data. Export never needs a network request.
  return (fontCSS ??= [
    ["Diagram Geist", "geist-variable.woff2"],
    ["Diagram Thai", "noto-sans-thai-variable.woff2"],
  ]
    .map(
      ([name, file]) =>
        `@font-face{font-family:'${name}';src:url(data:font/woff2;base64,${readFileSync(join(process.cwd(), "src/assets/fonts", file)).toString("base64")}) format('woff2');font-weight:100 900}`,
    )
    .join(""));
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 32000) return Response.json({ error: "invalid_input" }, { status: 413 });
    input = diagramRequestSchema.parse(JSON.parse(raw));
    if (input.action === "render") validateDiagramPlan(input.plan);
    else if (input.previousPlan) validateDiagramPlan(input.previousPlan);
  } catch {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  // Re-rendering the same confirmed structure (including theme changes) costs no AI quota.
  if (input.action === "render") {
    try {
      return Response.json(renderDiagram(input.plan, input.theme, input.locale, embeddedFonts()));
    } catch (error) {
      console.error("Diagram rendering failed", error);
      return Response.json({ error: "layout_failed" }, { status: 422 });
    }
  }
  if (input.source === "mermaid") {
    if ((input.brief.match(/```mermaid/gi) ?? []).length > 1)
      return Response.json({ error: "unsupported_mermaid" }, { status: 400 });
    const kind = mermaidKind(input.brief);
    if (!kind || kind === "state") return Response.json({ error: "unsupported_mermaid" }, { status: 400 });
    // The MVP must not silently change a source grammar into a different visual type.
    if (
      input.type !== "auto" &&
      input.type !== kind &&
      !(kind === "flowchart" && input.type === "architecture")
    ) {
      return Response.json({ error: "type_mismatch" }, { status: 400 });
    }
  }
  let usage;
  try {
    usage = await consumeUsage(TOOL, user.sub);
  } catch (error) {
    console.error("Diagram usage check failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
  if (!usage) return Response.json({ error: "limit_reached" }, { status: 429 });

  try {
    const { output } = await generateText({
      model: openai("gpt-6.1-sol"),
      instructions: diagramInstructions(input.type, input.locale, input.source === "mermaid"),
      prompt: JSON.stringify({
        source: input.source,
        brief: input.brief,
        revision: input.revision,
        previousPlan: input.previousPlan,
      }),
      output: Output.object({ schema: diagramPlanSchema }),
      maxOutputTokens: 5000,
      maxRetries: 1,
      abortSignal: AbortSignal.any([request.signal, AbortSignal.timeout(95000)]),
    });
    const plan = validateDiagramPlan(output);
    if (input.type !== "auto" && plan.type !== input.type) throw new Error("Requested diagram type changed");
    if (
      input.source === "mermaid" &&
      ["sequence", "er"].includes(mermaidKind(input.brief) ?? "") &&
      plan.type !== mermaidKind(input.brief)
    )
      throw new Error("Imported grammar changed");
    // Validate that the plan can actually be laid out before returning a successful AI run.
    renderDiagram(plan, "dark", input.locale);
    return Response.json({ plan, usage });
  } catch (error) {
    console.error("Diagram analysis failed", error);
    await refundUsage(TOOL, user.sub);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
