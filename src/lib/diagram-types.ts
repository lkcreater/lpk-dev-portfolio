export const diagramTypes = ["architecture", "flowchart", "sequence", "er"] as const;
export type DiagramType = (typeof diagramTypes)[number];
export const MAX_DIAGRAM_BRIEF = 6000;
export const MAX_DIAGRAM_REVISION = 1000;
