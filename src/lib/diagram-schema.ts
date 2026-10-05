import { z } from "zod";
import { diagramTypes, MAX_DIAGRAM_BRIEF, MAX_DIAGRAM_REVISION } from "./diagram-types";
export type { DiagramType } from "./diagram-types";

const id = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/);
const text = (max: number) => z.string().trim().min(1).max(max);

// The model proposes meaning; trusted code owns all markup and geometry.
export const diagramPlanSchema = z.object({
  type: z.enum(diagramTypes),
  title: text(60),
  summary: text(500),
  nodes: z
    .array(
      z.object({
        id,
        label: text(48),
        kind: z.enum([
          "component",
          "store",
          "external",
          "input",
          "decision",
          "start",
          "end",
          "entity",
          "actor",
        ]),
        detail: z.string().trim().max(64),
        fields: z.array(text(48)).max(6),
        layer: z.number().int().min(0).max(3),
        focal: z.boolean(),
      }),
    )
    .min(2)
    .max(9),
  edges: z
    .array(
      z.object({
        source: id,
        target: id,
        label: text(32),
        kind: z.enum(["flow", "return", "async"]),
        sourceCardinality: z.enum(["", "1", "N", "0..1", "0..*", "1..*"]),
        targetCardinality: z.enum(["", "1", "N", "0..1", "0..*", "1..*"]),
      }),
    )
    .min(1)
    .max(12),
  assumptions: z.array(text(240)).max(5),
  changes: z.array(text(240)).max(8),
});
export type DiagramPlan = z.infer<typeof diagramPlanSchema>;
export type DiagramArtifacts = { html: string; svg: string; width: number; height: number };

export function validateDiagramPlan(input: unknown): DiagramPlan {
  const plan = diagramPlanSchema.parse(input);
  const ids = new Set(plan.nodes.map((node) => node.id));
  if (ids.size !== plan.nodes.length) throw new Error("Duplicate node IDs");
  if (plan.nodes.filter((node) => node.focal).length > 2) throw new Error("Too many focal nodes");
  if (plan.type === "sequence" && plan.nodes.length > 5) throw new Error("Maximum five actors");
  if (plan.type === "er" && plan.nodes.length > 8) throw new Error("Maximum eight entities");
  for (const node of plan.nodes) {
    if (!plan.edges.some((edge) => edge.source === node.id || edge.target === node.id))
      throw new Error("Disconnected node");
  }
  for (const edge of plan.edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) throw new Error("Missing edge endpoint");
    if (edge.source === edge.target && plan.type !== "sequence")
      throw new Error("Self relationships require a sequence diagram");
    if (plan.type === "er" && (!edge.sourceCardinality || !edge.targetCardinality))
      throw new Error("ER relationships need cardinality");
  }
  if (plan.type === "flowchart") {
    for (const node of plan.nodes) {
      if (node.kind === "decision" && plan.edges.filter((edge) => edge.source === node.id).length > 3)
        throw new Error("Maximum three decision branches");
    }
  }
  return plan;
}

export const diagramAnalyzeSchema = z.object({
  action: z.literal("analyze"),
  locale: z.enum(["en", "th"]),
  source: z.enum(["text", "mermaid"]),
  type: z.enum(["auto", ...diagramTypes]),
  brief: text(MAX_DIAGRAM_BRIEF),
  revision: z.string().trim().max(MAX_DIAGRAM_REVISION),
  previousPlan: diagramPlanSchema.nullable(),
});
export const diagramRenderSchema = z.object({
  action: z.literal("render"),
  locale: z.enum(["en", "th"]),
  theme: z.enum(["dark", "light"]),
  plan: diagramPlanSchema,
});
export const diagramRequestSchema = z.discriminatedUnion("action", [
  diagramAnalyzeSchema,
  diagramRenderSchema,
]);

export function mermaidKind(source: string): "flowchart" | "sequence" | "er" | "state" | null {
  const fenced = /```mermaid\s*\n([\s\S]*?)```/i.exec(source);
  const body = (fenced?.[1] ?? source).replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
  const first = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("%%"));
  if (/^(flowchart|graph)\b/i.test(first ?? "")) return "flowchart";
  if (/^sequenceDiagram\b/i.test(first ?? "")) return "sequence";
  if (/^erDiagram\b/i.test(first ?? "")) return "er";
  if (/^stateDiagram-v2\b/i.test(first ?? "")) return "state";
  return null;
}
