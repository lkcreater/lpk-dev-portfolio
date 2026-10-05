import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import ts from "typescript";

const require = createRequire(import.meta.url);
const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const compiled = { exports: {} };
  const source = readFileSync(join(process.cwd(), "src/lib", `${name}.ts`), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  new Function("require", "module", "exports", outputText)(
    (path) => (path.startsWith("./") ? load(path.slice(2)) : require(path)),
    compiled,
    compiled.exports,
  );
  cache.set(name, compiled.exports);
  return compiled.exports;
}
const { validateDiagramPlan, mermaidKind } = load("diagram-schema");
const { renderDiagram } = load("diagram-renderer");
const node = (id, layer = 0, extra = {}) => ({
  id,
  label: id,
  kind: "component",
  detail: "",
  fields: [],
  layer,
  focal: false,
  ...extra,
});
const edge = (source, target, label = "request", extra = {}) => ({
  source,
  target,
  label,
  kind: "flow",
  sourceCardinality: "",
  targetCardinality: "",
  ...extra,
});
const plan = (type, nodes, edges, extra = {}) => ({
  type,
  title: "Booking system",
  summary: "A customer's booking moves through the system.",
  nodes,
  edges,
  assumptions: [],
  changes: [],
  ...extra,
});
export const fixtures = [
  plan(
    "architecture",
    [
      node("Client", 0, { kind: "input" }),
      node("API", 1, { focal: true }),
      node("Database", 3, { kind: "store" }),
      node("Queue", 2, { kind: "store" }),
      node("Worker", 2),
      node("LINE", 3, { kind: "external" }),
    ],
    [
      edge("Client", "API"),
      edge("API", "Database", "save"),
      edge("API", "Queue", "enqueue", { kind: "async" }),
      edge("Queue", "Worker", "consume"),
      edge("Worker", "LINE", "notify"),
    ],
  ),
  plan(
    "flowchart",
    [
      node("Start", 0, { kind: "start" }),
      node("Check", 0, { kind: "decision", label: "Available?" }),
      node("Confirm"),
      node("Retry"),
      node("End", 0, { kind: "end" }),
    ],
    [
      edge("Start", "Check", "select time"),
      edge("Check", "Confirm", "yes"),
      edge("Check", "Retry", "no"),
      edge("Retry", "Start", "try again"),
      edge("Confirm", "End", "notify"),
    ],
  ),
  plan(
    "sequence",
    [
      node("Customer", 0, { kind: "actor" }),
      node("API", 0, { kind: "actor" }),
      node("DB", 0, { kind: "actor" }),
    ],
    [
      edge("Customer", "API", "book"),
      edge("API", "DB", "save"),
      edge("DB", "API", "confirmed", { kind: "return" }),
      edge("API", "API", "prepare reminder"),
      edge("API", "Customer", "notify", { kind: "async" }),
    ],
  ),
  plan(
    "er",
    [
      node("Customer", 0, { kind: "entity", fields: ["#id", "name"] }),
      node("Booking", 1, {
        kind: "entity",
        fields: ["#id", "→customer_id", "→staff_id", "→service_id"],
        focal: true,
      }),
      node("Staff", 0, { kind: "entity", fields: ["#id", "→branch_id", "name"] }),
      node("Service", 0, { kind: "entity", fields: ["#id", "name"] }),
      node("Branch", 0, { kind: "entity", fields: ["#id", "name"] }),
    ],
    [
      edge("Customer", "Booking", "makes", { sourceCardinality: "1", targetCardinality: "N" }),
      edge("Staff", "Booking", "handles", { sourceCardinality: "1", targetCardinality: "N" }),
      edge("Service", "Booking", "chosen", { sourceCardinality: "1", targetCardinality: "N" }),
      edge("Branch", "Staff", "employs", { sourceCardinality: "1", targetCardinality: "N" }),
    ],
  ),
  plan(
    "architecture",
    [
      node("Customer", 0, { label: "ลูกค้าจองคิวผ่านไลน์", detail: "ข้อความภาษาไทยที่มีสระและวรรณยุกต์" }),
      node("API", 1, { label: "ระบบตรวจสอบการจอง" }),
      node("Database", 3, { label: "ฐานข้อมูลของร้านเสริมสวย" }),
    ],
    [edge("Customer", "API", "ส่งคำขอจอง"), edge("API", "Database", "บันทึกข้อมูล")],
    { title: "ระบบจองคิวร้านเสริมสวย" },
  ),
];

for (const fixture of fixtures) {
  for (const theme of ["dark", "light"]) {
    const result = renderDiagram(fixture, theme, "th");
    assert.ok(result.html.includes(result.svg));
    assert.ok(result.svg.includes('role="img"'));
    assert.match(
      result.svg,
      /aria-labelledby="lpk-diagram-[a-f0-9]{12}-title lpk-diagram-[a-f0-9]{12}-desc"/,
    );
    assert.ok(!/<script|onload=|foreignObject/i.test(result.html));
    assert.ok(result.width % 4 === 0 && result.height % 4 === 0);
    assert.ok(result.html.includes(`min-width:${result.width}px`));
    assert.equal((result.svg.match(/data-node=/g) ?? []).length, fixture.nodes.length);
  }
  console.log(`PASS ${fixture.type}: ${fixture.title} (both themes)`);
}

const hostile = plan(
  "architecture",
  [
    node("Input", 0, { label: '</text><script>alert("x")</script>', detail: "<img src=x onerror=alert(1)>" }),
    node("API", 1),
  ],
  [edge("Input", "API", "<script>x</script>")],
);
const safe = renderDiagram(hostile, "dark", "en");
assert.ok(!safe.html.includes("<script>"));
assert.ok(safe.html.includes("&lt;"));
assert.throws(() =>
  validateDiagramPlan({ ...fixtures[0], nodes: [fixtures[0].nodes[0], fixtures[0].nodes[0]] }),
);
assert.throws(() => validateDiagramPlan({ ...fixtures[0], edges: [edge("Client", "missing")] }));
assert.throws(() => validateDiagramPlan({ ...fixtures[3], edges: [edge("Customer", "Booking")] }));
assert.throws(() =>
  validateDiagramPlan(
    plan(
      "sequence",
      Array.from({ length: 6 }, (_, i) => node(`Actor${i}`)),
      [edge("Actor0", "Actor1")],
    ),
  ),
);
assert.equal(mermaidKind("flowchart LR\nA-->B"), "flowchart");
assert.equal(mermaidKind("%% comment\nsequenceDiagram\nA->>B: Hi"), "sequence");
assert.equal(mermaidKind("```mermaid\nerDiagram\nA ||--o{ B : has\n```"), "er");
assert.equal(mermaidKind("mindmap\nroot"), null);
console.log("PASS escaping, graph validation and Mermaid grammar detection");
