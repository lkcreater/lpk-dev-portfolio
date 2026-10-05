import assert from "node:assert/strict";
import { fixtures } from "./check-diagrams.mjs";

const origin = process.env.DIAGRAM_TEST_ORIGIN ?? "http://127.0.0.1:3100";
assert.ok(
  new URL(origin).hostname === "127.0.0.1" || new URL(origin).hostname === "localhost",
  "Run smoke checks against localhost only",
);
const endpoint = `${origin}/api/playground/diagram-design`;
const post = (body, cookie = "") =>
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(body),
  });
const unauthorized = await post({ action: "render", plan: fixtures[0], theme: "dark", locale: "en" });
assert.equal(unauthorized.status, 401);
console.log("PASS API refuses anonymous requests");
const login = await fetch(`${origin}/api/auth/dev-login`, {
  method: "POST",
  body: new URLSearchParams({ name: "Diagram Smoke", locale: "th", tool: "diagram-design" }),
  redirect: "manual",
});
assert.equal(login.status, 303, "Start next dev with DEV_MODE=true");
assert.ok(login.headers.get("location").endsWith("/th/playground/diagram-design"));
const cookie = login.headers.get("set-cookie").split(";")[0];
for (const fixture of fixtures) {
  const response = await post({ action: "render", plan: fixture, theme: "dark", locale: "th" }, cookie);
  const data = await response.json();
  assert.equal(response.status, 200, JSON.stringify(data));
  assert.ok(data.svg.includes("data:font/woff2;base64,"));
  assert.ok(data.html.includes(data.svg));
  assert.ok(!data.usage, "Rendering must not consume an AI run");
}
console.log("PASS API renders all types with embedded fonts, without consuming quota");
const unsupported = await post(
  {
    action: "analyze",
    locale: "en",
    source: "mermaid",
    type: "auto",
    brief: "mindmap\n root",
    revision: "",
    previousPlan: null,
  },
  cookie,
);
assert.equal(unsupported.status, 400);
assert.equal((await unsupported.json()).error, "unsupported_mermaid");
const invalid = await post(
  {
    action: "render",
    plan: { ...fixtures[0], edges: [{ ...fixtures[0].edges[0], target: "missing" }] },
    theme: "dark",
    locale: "en",
  },
  cookie,
);
assert.equal(invalid.status, 400);
console.log("PASS unsupported Mermaid and invalid endpoints are rejected");
for (const locale of ["en", "th"]) {
  const response = await fetch(`${origin}/${locale}/playground/diagram-design`, {
    headers: { Cookie: cookie },
  });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(html.includes("AI Diagram Designer"));
}
console.log("PASS signed-in tool pages in both languages");
if (process.argv.includes("--ai")) {
  const response = await post(
    {
      action: "analyze",
      locale: "th",
      source: "text",
      type: "architecture",
      brief: "วาดระบบสามส่วน ลูกค้าเรียก Booking API และ API บันทึกข้อมูลใน PostgreSQL ไม่มีระบบอื่น",
      revision: "",
      previousPlan: null,
    },
    cookie,
  );
  const data = await response.json();
  assert.equal(response.status, 200, JSON.stringify(data));
  assert.equal(data.plan.type, "architecture");
  assert.ok(data.usage.remaining >= 0);
  const drawn = await post({ action: "render", plan: data.plan, locale: "th", theme: "light" }, cookie);
  assert.equal(drawn.status, 200);
  console.log(
    `PASS live AI → validated plan → rendered diagram (${data.plan.nodes.length} nodes, ${data.plan.edges.length} connections)`,
  );
}
