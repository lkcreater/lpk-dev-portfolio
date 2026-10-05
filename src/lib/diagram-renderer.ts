import { createHash } from "node:crypto";
import { validateDiagramPlan, type DiagramArtifacts, type DiagramPlan } from "./diagram-schema";

type Point = { x: number; y: number };
type Box = Point & { width: number; height: number; id: string };
type Label = Box & { lines: string[] };
const GRID = 16;
const key = (point: Point) => `${point.x},${point.y}`;
const xml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!,
  );
const ceil = (n: number) => Math.ceil(n / GRID) * GRID;
const overlaps = (a: Box, b: Box, gap = 0) =>
  a.x < b.x + b.width + gap &&
  a.x + a.width + gap > b.x &&
  a.y < b.y + b.height + gap &&
  a.y + a.height + gap > b.y;
const contains = (box: Box, point: Point, gap = 0) =>
  point.x > box.x - gap &&
  point.x < box.x + box.width + gap &&
  point.y > box.y - gap &&
  point.y < box.y + box.height + gap;

// Thai combining marks do not advance. Break at graphemes, not code units.
function wrap(value: string, limit: number): string[] {
  const graphemes = [...new Intl.Segmenter("th", { granularity: "grapheme" }).segment(value)].map(
    (part) => part.segment,
  );
  const lines: string[] = [];
  let line = "";
  let count = 0;
  for (const glyph of graphemes) {
    if (count >= limit && line) {
      lines.push(line.trim());
      line = "";
      count = 0;
    }
    line += glyph;
    count++;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function textLines(
  lines: string[],
  x: number,
  y: number,
  size: number,
  color: string,
  center = false,
  weight = 400,
) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}"${center ? ' text-anchor="middle"' : ""}>${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size + 6 : 0}">${xml(line)}</tspan>`).join("")}</text>`;
}

function flowRanks(plan: DiagramPlan) {
  const rank = new Map<string, number>();
  const roots = plan.nodes.filter((node) => !plan.edges.some((edge) => edge.target === node.id));
  const queue = (roots.length ? roots : [plan.nodes[0]]).map((node) => node.id);
  queue.forEach((id) => rank.set(id, 0));
  for (let i = 0; i < queue.length; i++) {
    for (const edge of plan.edges.filter((edge) => edge.source === queue[i])) {
      if (!rank.has(edge.target)) {
        rank.set(edge.target, rank.get(edge.source)! + 1);
        queue.push(edge.target);
      }
    }
  }
  for (const node of plan.nodes) if (!rank.has(node.id)) rank.set(node.id, Math.max(...rank.values()) + 1);
  return rank;
}

function layout(plan: DiagramPlan): { boxes: Box[]; width: number; height: number } {
  const vertical = plan.type === "flowchart";
  const ranks = vertical
    ? flowRanks(plan)
    : new Map(plan.nodes.map((node, i) => [node.id, plan.type === "er" ? i % 2 : node.layer]));
  const levels = [...new Set(ranks.values())].sort((a, b) => a - b);
  const groups = levels.map((level) => plan.nodes.filter((node) => ranks.get(node.id) === level));
  const degree = (id: string) => plan.edges.filter((edge) => edge.source === id || edge.target === id).length;
  const heights = new Map(
    plan.nodes.map((node) => {
      const titleHeight = wrap(node.label, node.kind === "decision" ? 12 : 20).length * 22;
      const bodyHeight =
        plan.type === "er"
          ? node.fields.reduce((sum, field) => sum + wrap(field, 28).length * 18 + 6, 0)
          : wrap(node.detail, 28).length * 17;
      return [node.id, ceil(Math.max(128, (degree(node.id) + 1) * 16, 48 + titleHeight + bodyHeight + 24))];
    }),
  );
  const rowHeight = Math.max(...heights.values());
  const boxes = groups.flatMap((group, i) =>
    group.map((node, j) => ({
      id: node.id,
      x: 80 + (vertical ? j : i) * 432,
      y: 224 + (vertical ? i : j) * (rowHeight + 144),
      width: 256,
      height: heights.get(node.id)!,
    })),
  );
  return {
    boxes,
    width: ceil(Math.max(960, ...boxes.map((box) => box.x + box.width + 128))),
    height: ceil(Math.max(600, ...boxes.map((box) => box.y + box.height + 176))),
  };
}

function segmentKey(a: Point, b: Point) {
  return [key(a), key(b)].sort().join("|");
}

// Bounded orthogonal routing. Nodes and label masks are obstacles; used
// segments cannot be stacked. Crossings get a bridge in the SVG path.
function route(
  start: Point,
  end: Point,
  obstacles: Box[],
  width: number,
  height: number,
  used: Set<string>,
): Point[] {
  type State = { point: Point; cost: number; score: number; parent: State | null; direction: number };
  const open: State[] = [{ point: start, cost: 0, score: 0, parent: null, direction: -1 }];
  const best = new Map<string, number>();
  const moves = [
    [GRID, 0],
    [-GRID, 0],
    [0, GRID],
    [0, -GRID],
  ];
  let visited = 0;
  while (open.length && visited++ < 40000) {
    open.sort((a, b) => b.score - a.score);
    const current = open.pop()!;
    if (key(current.point) === key(end)) {
      const result: Point[] = [];
      for (let item: State | null = current; item; item = item.parent) result.push(item.point);
      return result.reverse();
    }
    for (const [direction, [dx, dy]] of moves.entries()) {
      const point = { x: current.point.x + dx, y: current.point.y + dy };
      if (point.x < 32 || point.y < 144 || point.x > width - 32 || point.y > height - 80) continue;
      if (obstacles.some((box) => contains(box, point, 8))) continue;
      if (used.has(segmentKey(current.point, point))) continue;
      const cost =
        current.cost + GRID + (current.direction !== -1 && current.direction !== direction ? 24 : 0);
      const stateKey = `${key(point)}:${direction}`;
      if ((best.get(stateKey) ?? Infinity) <= cost) continue;
      best.set(stateKey, cost);
      open.push({
        point,
        cost,
        score: cost + Math.abs(point.x - end.x) + Math.abs(point.y - end.y),
        parent: current,
        direction,
      });
    }
  }
  throw new Error("Diagram is too dense to route. Simplify the relationships.");
}

function compress(points: Point[]) {
  return points.filter(
    (point, i) =>
      !i ||
      i === points.length - 1 ||
      (points[i - 1].x !== points[i + 1].x && points[i - 1].y !== points[i + 1].y),
  );
}

function roundedPath(points: Point[], prior: Point[][]) {
  const corners = compress(points);
  let d = `M${corners[0].x},${corners[0].y}`;
  for (let i = 1; i < corners.length; i++) {
    const a = corners[i - 1],
      b = corners[i],
      c = corners[i + 1];
    const dx = Math.sign(b.x - a.x),
      dy = Math.sign(b.y - a.y);
    const approach = c ? { x: b.x - dx * 8, y: b.y - dy * 8 } : b;
    // Bridge perpendicular crossings, leaving eight pixels around bends.
    const crossings = prior
      .flatMap((path) =>
        compress(path)
          .slice(1)
          .flatMap((v, j) => {
            const u = compress(path)[j];
            if (
              !dy &&
              u.x === v.x &&
              u.x > Math.min(a.x, b.x) + 16 &&
              u.x < Math.max(a.x, b.x) - 16 &&
              a.y > Math.min(u.y, v.y) &&
              a.y < Math.max(u.y, v.y)
            )
              return [{ x: u.x, y: a.y }];
            if (
              !dx &&
              u.y === v.y &&
              u.y > Math.min(a.y, b.y) + 16 &&
              u.y < Math.max(a.y, b.y) - 16 &&
              a.x > Math.min(u.x, v.x) &&
              a.x < Math.max(u.x, v.x)
            )
              return [{ x: a.x, y: u.y }];
            return [];
          }),
      )
      .sort((p, q) => (dx ? (p.x - q.x) * dx : (p.y - q.y) * dy));
    for (const cross of crossings) {
      d += ` L${cross.x - dx * 6},${cross.y - dy * 6} Q${cross.x + dy * 12},${cross.y - dx * 12} ${cross.x + dx * 6},${cross.y + dy * 6}`;
    }
    d += ` L${approach.x},${approach.y}`;
    if (c) d += ` Q${b.x},${b.y} ${b.x + Math.sign(c.x - b.x) * 8},${b.y + Math.sign(c.y - b.y) * 8}`;
  }
  return d;
}

function placeLabel(points: Point[], value: string, obstacles: Box[], prior: Point[][]): Label {
  const lines = wrap(value, 14);
  const width = ceil(Math.max(48, Math.max(...lines.map((line) => [...line].length)) * 9 + 16));
  const height = ceil(lines.length * 18 + 8);
  const corners = compress(points);
  const segments = corners
    .slice(1)
    .map((b, i) => ({ a: corners[i], b }))
    .sort(
      (u, v) =>
        Math.abs(v.b.x - v.a.x) +
        Math.abs(v.b.y - v.a.y) -
        (Math.abs(u.b.x - u.a.x) + Math.abs(u.b.y - u.a.y)),
    );
  for (const { a, b } of segments) {
    const horizontal = a.y === b.y;
    for (const t of [0.5, 0.3, 0.7]) {
      for (const side of [-1, 1]) {
        const mid = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        const candidate = {
          id: "label",
          lines,
          width,
          height,
          x: horizontal ? mid.x - width / 2 : mid.x + (side < 0 ? -width - 8 : 8),
          y: horizontal ? mid.y + (side < 0 ? -height - 8 : 8) : mid.y - height / 2,
        };
        if (candidate.x < 24 || candidate.y < 136) continue;
        if (
          horizontal &&
          (candidate.x < Math.min(a.x, b.x) + 8 || candidate.x + width > Math.max(a.x, b.x) - 8)
        )
          continue;
        if (
          !horizontal &&
          (candidate.y < Math.min(a.y, b.y) + 8 || candidate.y + height > Math.max(a.y, b.y) - 8)
        )
          continue;
        if (obstacles.some((box) => overlaps(candidate, box, 8))) continue;
        if (prior.some((path) => path.some((point) => contains(candidate, point, 8)))) continue;
        return candidate;
      }
    }
  }
  throw new Error(`No clear space for relationship label: ${value}`);
}

function nodeMarkup(plan: DiagramPlan, box: Box, ink: string, paper: string, muted: string) {
  const node = plan.nodes.find((item) => item.id === box.id)!;
  const stroke = node.focal ? "#e85d2a" : muted;
  let shape: string;
  if (node.kind === "decision" && plan.type === "flowchart") {
    shape = `<path d="M${box.x + box.width / 2},${box.y} L${box.x + box.width},${box.y + box.height / 2} L${box.x + box.width / 2},${box.y + box.height} L${box.x},${box.y + box.height / 2} Z" fill="${paper}" stroke="${stroke}"/>`;
  } else {
    shape = `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="${["start", "end"].includes(node.kind) ? 24 : 6}" fill="${paper}" stroke="${stroke}"/>`;
    if (node.focal)
      shape += `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="6" fill="#e85d2a" fill-opacity="0.08"/>`;
  }
  const labelLines = wrap(node.label, node.kind === "decision" ? 12 : 20);
  const decision = node.kind === "decision" && plan.type === "flowchart";
  const tag = plan.type === "er" ? "ENTITY" : node.kind.toUpperCase();
  const content = decision
    ? ""
    : `<text x="${box.x + 16}" y="${box.y + 24}" font-size="10" fill="${stroke}" letter-spacing="1">${tag}</text>`;
  const titleY = decision ? box.y + box.height / 2 - (labelLines.length - 1) * 10 + 4 : box.y + 52;
  let body = textLines(
    labelLines,
    decision ? box.x + box.width / 2 : box.x + 16,
    titleY,
    16,
    ink,
    decision,
    600,
  );
  if (plan.type === "er") {
    const divider = box.y + 60 + (labelLines.length - 1) * 22;
    body += `<line x1="${box.x}" y1="${divider}" x2="${box.x + box.width}" y2="${divider}" stroke="${muted}" stroke-opacity="0.35"/>`;
    let fieldY = divider + 24;
    body += node.fields
      .map((field) => {
        const lines = wrap(field, 28);
        const markup = textLines(lines, box.x + 16, fieldY, 12, muted);
        fieldY += lines.length * 18 + 6;
        return markup;
      })
      .join("");
  } else if (node.detail && !decision) {
    body += textLines(wrap(node.detail, 28), box.x + 16, titleY + labelLines.length * 22 + 4, 11, muted);
  }
  return `<g data-node="${xml(box.id)}">${shape}${content}${body}</g>`;
}

function graphDrawing(plan: DiagramPlan, paper: string, ink: string, muted: string) {
  const { boxes, width, height } = layout(plan);
  const paths: Point[][] = [];
  const masks: Label[] = [];
  const used = new Set<string>();
  const vertical = plan.type === "flowchart";
  const ports = new Map<string, number>();
  const allocate = (box: Box, side: string): Point => {
    const portKey = `${box.id}:${side}`;
    const n = (ports.get(portKey) ?? 0) + 1;
    ports.set(portKey, n);
    // Every endpoint uses a separate grid-aligned port.
    const total = plan.edges.filter((edge) =>
      side === "out" ? edge.source === box.id : edge.target === box.id,
    ).length;
    return vertical
      ? {
          x: box.x + box.width / 2 + (n - (total + 1) / 2) * 32,
          y: box.y + (side === "out" ? box.height : 0),
        }
      : { x: box.x + (side === "out" ? box.width : 0), y: box.y + n * 16 };
  };
  let drawing = "";
  for (const edge of plan.edges) {
    const a = boxes.find((box) => box.id === edge.source)!;
    const b = boxes.find((box) => box.id === edge.target)!;
    const start = allocate(a, "out"),
      end = allocate(b, "in");
    const from = { x: start.x + (vertical ? 0 : 16), y: start.y + (vertical ? 16 : 0) };
    const to = { x: end.x - (vertical ? 0 : 16), y: end.y - (vertical ? 16 : 0) };
    if (vertical) {
      if (plan.nodes.find((node) => node.id === a.id)?.kind === "decision")
        start.y -= (Math.abs(start.x - a.x - a.width / 2) * a.height) / a.width;
      if (plan.nodes.find((node) => node.id === b.id)?.kind === "decision")
        end.y += (Math.abs(end.x - b.x - b.width / 2) * b.height) / b.width;
    }
    const cardinalities: Label[] =
      plan.type === "er"
        ? [
            {
              id: "cardinality",
              x: start.x + 8,
              y: start.y - 24,
              width: 40,
              height: 16,
              lines: [edge.sourceCardinality],
            },
            {
              id: "cardinality",
              x: end.x - 48,
              y: end.y - 24,
              width: 40,
              height: 16,
              lines: [edge.targetCardinality],
            },
          ]
        : [];
    if (cardinalities.some((card) => [...boxes, ...masks].some((box) => overlaps(card, box))))
      throw new Error("No clear space for ER cardinality");
    const points = [
      start,
      ...route(from, to, [...boxes, ...masks, ...cardinalities], width, height, used),
      end,
    ];
    const label = placeLabel(points, edge.label, [...boxes, ...masks, ...cardinalities], paths);
    const stroke = muted;
    drawing += `<path d="${roundedPath(points, paths)}" fill="none" stroke="${stroke}" stroke-width="1.4"${edge.kind !== "flow" ? ' stroke-dasharray="5 4"' : ""}${plan.type === "er" ? "" : ` marker-end="url(#lpk-diagram-${edge.kind === "async" ? "open" : "arrow"})"`}/>`;
    drawing += `<rect x="${label.x}" y="${label.y}" width="${label.width}" height="${label.height}" rx="2" fill="${paper}"/>${textLines(label.lines, label.x + label.width / 2, label.y + 18, 12, muted, true)}`;
    drawing += cardinalities
      .map(
        (card) =>
          `<rect x="${card.x}" y="${card.y}" width="40" height="16" fill="${paper}"/>${textLines(card.lines, card.x + 20, card.y + 12, 10, muted, true)}`,
      )
      .join("");
    paths.push(points);
    masks.push(label, ...cardinalities);
    for (let i = 1; i < points.length; i++) used.add(segmentKey(points[i - 1], points[i]));
  }
  drawing += boxes.map((box) => nodeMarkup(plan, box, ink, paper, muted)).join("");
  return { drawing, width, height };
}

function sequenceDrawing(plan: DiagramPlan, paper: string, ink: string, muted: string) {
  const width = ceil(Math.max(960, plan.nodes.length * 320 + 96));
  const actorHeight = ceil(
    Math.max(
      128,
      ...plan.nodes.map(
        (node) => 48 + wrap(node.label, 20).length * 22 + wrap(node.detail, 28).length * 17 + 24,
      ),
    ),
  );
  const firstMessageY = 144 + actorHeight + 64;
  const height = ceil(Math.max(600, firstMessageY + plan.edges.length * 80 + 64));
  const centers = new Map(plan.nodes.map((node, i) => [node.id, 176 + i * 320]));
  let drawing = plan.nodes
    .map(
      (node) =>
        `<line x1="${centers.get(node.id)}" y1="${144 + actorHeight}" x2="${centers.get(node.id)}" y2="${height - 80}" stroke="${muted}" stroke-opacity="0.45" stroke-dasharray="4 5"/>`,
    )
    .join("");
  for (const [i, edge] of plan.edges.entries()) {
    const x1 = centers.get(edge.source)!,
      x2 = centers.get(edge.target)!,
      y = firstMessageY + i * 80;
    const lines = wrap(edge.label, 22);
    const dashed = edge.kind !== "flow" ? ' stroke-dasharray="5 4"' : "";
    const marker = `marker-end="url(#lpk-diagram-${edge.kind === "async" ? "open" : "arrow"})"`;
    if (x1 === x2) {
      drawing += `<path d="M${x1},${y} h112 q8,0 8,8 v16 q0,8 -8,8 h-112" fill="none" stroke="${muted}"${dashed} ${marker}/>`;
      drawing += `<rect x="${x1 + 16}" y="${y - 48}" width="220" height="40" fill="${paper}"/>${textLines(lines, x1 + 20, y - 28, 12, muted)}`;
    } else {
      const mid = x1 + Math.sign(x2 - x1) * 160,
        maskWidth = Math.max(...lines.map((line) => [...line].length)) * 9 + 16;
      drawing += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${muted}"${dashed} ${marker}/>`;
      drawing += `<rect x="${mid - maskWidth / 2}" y="${y - 48}" width="${maskWidth}" height="40" fill="${paper}"/>${textLines(lines, mid, y - 28, 12, muted, true)}`;
    }
  }
  drawing += plan.nodes
    .map((node) =>
      nodeMarkup(
        plan,
        { id: node.id, x: centers.get(node.id)! - 120, y: 144, width: 240, height: actorHeight },
        ink,
        paper,
        muted,
      ),
    )
    .join("");
  return { drawing, width, height };
}

export function renderDiagram(
  input: unknown,
  theme: "dark" | "light",
  locale: "en" | "th",
  fontCSS = "",
): DiagramArtifacts {
  const plan = validateDiagramPlan(input);
  const paper = theme === "dark" ? "#121210" : "#f0eee8";
  const ink = theme === "dark" ? "#eeeae1" : "#121210";
  const muted = theme === "dark" ? "#b5b0a6" : "#625f57";
  const { drawing, width, height } =
    plan.type === "sequence"
      ? sequenceDrawing(plan, paper, ink, muted)
      : graphDrawing(plan, paper, ink, muted);
  const legend =
    locale === "th"
      ? "สีส้ม: จุดสำคัญ · เส้นประ: การตอบกลับ / async"
      : "Orange: focal component · Dashed: return / async";
  const heading = textLines(wrap(plan.title, 44), 48, 48, 24, ink, false, 600);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="lpk-diagram-title lpk-diagram-desc"><title id="lpk-diagram-title">${xml(plan.title)}</title><desc id="lpk-diagram-desc">${xml(plan.summary)}</desc><defs><style>${fontCSS}text{font-family:'Diagram Geist','Diagram Thai',sans-serif}</style><marker id="lpk-diagram-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="${muted}"/></marker><marker id="lpk-diagram-open" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="${muted}"/></marker></defs><rect width="${width}" height="${height}" fill="${paper}"/>${heading}<text x="48" y="108" fill="#e85d2a" font-size="10" letter-spacing="1.6">${plan.type.toUpperCase()} · LPK DIAGRAM DESIGNER</text>${drawing}<line x1="48" x2="${width - 48}" y1="${height - 60}" y2="${height - 60}" stroke="${muted}" stroke-opacity="0.25"/><text x="48" y="${height - 32}" fill="${muted}" font-size="12">${xml(legend)}</text></svg>`;
  const prefix = `lpk-diagram-${createHash("sha256")
    .update(JSON.stringify([plan, theme]))
    .digest("hex")
    .slice(0, 12)}-`;
  const namespacedSVG = svg
    .replace("<svg ", '<svg id="lpk-diagram-root" ')
    .replace("text{font-family", "#lpk-diagram-root text{font-family")
    .replaceAll("lpk-diagram-", prefix);
  const html = `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:"><title>${xml(plan.title)}</title><style>*{box-sizing:border-box}body{margin:0;background:${paper};color:${ink}}.diagram-container{width:100%;overflow:auto}svg{display:block;width:100%;min-width:${width}px}@media print{.diagram-container{overflow:visible}svg{min-width:0}}</style></head><body><div class="diagram-container">${namespacedSVG}</div></body></html>`;
  return { html, svg: namespacedSVG, width, height };
}
