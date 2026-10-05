"use client";

import { type FormEvent, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { diagramTypes, MAX_DIAGRAM_BRIEF, MAX_DIAGRAM_REVISION, type DiagramType } from "@/lib/diagram-types";
import type { DiagramArtifacts, DiagramPlan } from "@/lib/diagram-schema";
import type { Usage } from "@/lib/usage-limit";

type Copy = Dictionary["playground"]["diagram"];
type Step = "brief" | "analyzing" | "review" | "rendering" | "result";

export function DiagramDesignTool({
  copy,
  locale,
  usageTemplate,
  initialUsage,
}: {
  copy: Copy;
  locale: Locale;
  usageTemplate: string;
  initialUsage: Usage | null;
}) {
  const [brief, setBrief] = useState("");
  const [source, setSource] = useState<"text" | "mermaid">("text");
  const [type, setType] = useState<DiagramType | "auto">("auto");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [step, setStep] = useState<Step>("brief");
  const [usage, setUsage] = useState(initialUsage);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<DiagramPlan | null>(null);
  const [artifacts, setArtifacts] = useState<DiagramArtifacts | null>(null);
  const [revision, setRevision] = useState("");
  const busy = step === "analyzing" || step === "rendering";
  const outOfRuns = usage !== null && usage.remaining === 0;
  const stage =
    step === "brief" ? 0 : step === "analyzing" ? 1 : step === "review" ? 2 : step === "rendering" ? 3 : 4;
  const limitMessage = copy.errors.limit.replace("{limit}", String(usage?.limit ?? 2));

  function responseError(code: string) {
    if (code === "limit_reached") {
      setUsage((current) => ({ used: current?.limit ?? 2, limit: current?.limit ?? 2, remaining: 0 }));
      return limitMessage;
    }
    if (code === "unauthorized") return copy.errors.unauthorized;
    if (code === "unavailable") return copy.errors.unavailable;
    if (code === "unsupported_mermaid") return copy.errors.mermaid;
    if (code === "type_mismatch") return copy.errors.typeMismatch;
    if (code === "layout_failed") return copy.errors.layout;
    if (code === "invalid_input") return copy.errors.input;
    return copy.errors.failed;
  }

  async function analyze(event: FormEvent<HTMLFormElement>, revising = false) {
    event.preventDefault();
    if (!brief.trim() || (revising && !revision.trim())) {
      setError(copy.errors.input);
      return;
    }
    const previousStep = step;
    setStep("analyzing");
    setError(null);
    try {
      const response = await fetch("/api/playground/diagram-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          locale,
          source,
          type,
          brief,
          revision: revising ? revision : "",
          previousPlan: revising ? plan : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(responseError(data.error));
      setPlan(data.plan);
      setUsage(data.usage);
      setArtifacts(null);
      setRevision("");
      setStep("review");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : copy.errors.failed);
      setStep(previousStep);
    }
  }

  async function renderPlan() {
    if (!plan) return;
    const previousStep = step;
    setStep("rendering");
    setError(null);
    try {
      const response = await fetch("/api/playground/diagram-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "render", locale, theme, plan }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(responseError(data.error));
      setArtifacts(data);
      setStep("result");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : copy.errors.failed);
      setStep(previousStep);
    }
  }

  function editNode(index: number, label: string) {
    if (!plan) return;
    setPlan({ ...plan, nodes: plan.nodes.map((node, i) => (i === index ? { ...node, label } : node)) });
    setArtifacts(null);
    setStep("review");
  }

  function download(format: "html" | "svg") {
    if (!artifacts || !plan) return;
    const name =
      plan.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "lpk-diagram";
    const url = URL.createObjectURL(
      new Blob([artifacts[format]], {
        type: format === "svg" ? "image/svg+xml;charset=utf-8" : "text/html;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.${format}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="diagram-tool">
      <ol className="diagram-progress" aria-label={copy.workflowLabel}>
        {[copy.steps.brief, copy.steps.analyze, copy.steps.review, copy.steps.render, copy.steps.result].map(
          (label, index) => (
            <li
              key={label}
              className={index === stage ? "is-active" : index < stage ? "is-done" : ""}
              aria-current={index === stage ? "step" : undefined}
            >
              <span aria-hidden="true">{index < stage ? "✓" : String(index + 1).padStart(2, "0")}</span>
              {label}
            </li>
          ),
        )}
      </ol>
      <div className="diagram-tool-grid">
        <div className="diagram-controls">
          <form className="svg-tool-form" onSubmit={(event) => analyze(event)}>
            <fieldset disabled={busy || plan !== null} className="diagram-fieldset">
              <div className="diagram-selects">
                <label>
                  <span className="svg-tool-label">{copy.sourceLabel}</span>
                  <select
                    value={source}
                    onChange={(event) => setSource(event.target.value as "text" | "mermaid")}
                  >
                    <option value="text">{copy.sourceText}</option>
                    <option value="mermaid">Mermaid</option>
                  </select>
                </label>
                <label>
                  <span className="svg-tool-label">{copy.typeLabel}</span>
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value as DiagramType | "auto")}
                  >
                    <option value="auto">{copy.auto}</option>
                    {diagramTypes.map((value) => (
                      <option key={value} value={value}>
                        {copy.types[value]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="svg-tool-brief">
                <span className="svg-tool-label">{copy.briefLabel}</span>
                <textarea
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                  maxLength={MAX_DIAGRAM_BRIEF}
                  placeholder={source === "mermaid" ? copy.mermaidPlaceholder : copy.briefPlaceholder}
                  rows={7}
                  required
                />
                <small>
                  {brief.length.toLocaleString(locale)} / {MAX_DIAGRAM_BRIEF.toLocaleString(locale)}
                </small>
              </label>
              <p className="playground-note">{source === "mermaid" ? copy.mermaidHint : copy.briefHint}</p>
              <div className="diagram-samples">
                <span className="svg-tool-label">{copy.examplesLabel}</span>
                {diagramTypes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSource("text");
                      setType(value);
                      setBrief(copy.examples[value]);
                    }}
                  >
                    {copy.types[value]}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="svg-tool-actions">
              {plan ? (
                <button
                  type="button"
                  className="diagram-secondary"
                  disabled={busy}
                  onClick={() => {
                    setPlan(null);
                    setArtifacts(null);
                    setStep("brief");
                    setError(null);
                  }}
                >
                  {copy.editBrief}
                </button>
              ) : (
                <button type="submit" className="svg-tool-submit" disabled={busy || outOfRuns}>
                  {busy ? copy.analyzing : copy.analyze}
                </button>
              )}
              {usage ? (
                <span className={`playground-usage${outOfRuns ? " is-empty" : ""}`}>
                  {usageTemplate
                    .replace("{remaining}", String(usage.remaining))
                    .replace("{limit}", String(usage.limit))}
                </span>
              ) : null}
            </div>
            <p className="playground-note">{copy.quotaNote}</p>
            <p className="playground-note">{copy.privacy}</p>
          </form>
          {plan ? (
            <form className="diagram-revision" onSubmit={(event) => analyze(event, true)}>
              <label className="svg-tool-brief">
                <span className="svg-tool-label">{copy.revisionLabel}</span>
                <textarea
                  value={revision}
                  onChange={(event) => setRevision(event.target.value)}
                  rows={3}
                  maxLength={MAX_DIAGRAM_REVISION}
                  placeholder={copy.revisionPlaceholder}
                  disabled={busy}
                  required
                />
              </label>
              <button
                type="submit"
                className="diagram-secondary"
                disabled={busy || outOfRuns || !revision.trim()}
              >
                {copy.revise}
              </button>
            </form>
          ) : null}
          {error ? (
            <p className="playground-error" role="alert">
              {error}
            </p>
          ) : null}
          {outOfRuns ? <p className="playground-note">{limitMessage}</p> : null}
        </div>
        <div className="diagram-output" aria-busy={busy}>
          <p className="diagram-status" role="status" aria-live="polite">
            {step === "analyzing"
              ? copy.analyzing
              : step === "rendering"
                ? copy.rendering
                : plan
                  ? copy.reviewHint
                  : copy.empty}
          </p>
          {plan ? (
            <>
              <div className="diagram-plan-head">
                <span className="svg-tool-label">
                  {copy.types[plan.type]} · {plan.nodes.length} {copy.nodesLabel} · {plan.edges.length}{" "}
                  {copy.edgesLabel}
                </span>
                <h2>{plan.title}</h2>
                <p>{plan.summary}</p>
              </div>
              <details className="diagram-review" open={!artifacts}>
                <summary>{copy.structureLabel}</summary>
                <div className="diagram-nodes">
                  {plan.nodes.map((node, index) => (
                    <label key={node.id}>
                      <span>
                        {String(index + 1).padStart(2, "0")} · {node.id}
                      </span>
                      <input
                        aria-label={`${copy.nodeName} ${index + 1}`}
                        value={node.label}
                        maxLength={48}
                        disabled={busy}
                        onChange={(event) => editNode(index, event.target.value)}
                      />
                      {node.fields.length ? (
                        <small>{node.fields.join(" · ")}</small>
                      ) : node.detail ? (
                        <small>{node.detail}</small>
                      ) : null}
                    </label>
                  ))}
                </div>
                <ol className="diagram-relationships">
                  {plan.edges.map((edge, index) => (
                    <li key={index}>
                      <span>
                        {plan.nodes.find((node) => node.id === edge.source)?.label} →{" "}
                        {plan.nodes.find((node) => node.id === edge.target)?.label}
                      </span>
                      <small>
                        {edge.label}
                        {plan.type === "er" ? ` · ${edge.sourceCardinality} : ${edge.targetCardinality}` : ""}
                      </small>
                    </li>
                  ))}
                </ol>
              </details>
              {plan.assumptions.length ? (
                <div className="diagram-notes">
                  <h3>{copy.assumptionsLabel}</h3>
                  <ul>
                    {plan.assumptions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {plan.changes.length ? (
                <div className="diagram-notes">
                  <h3>{copy.changesLabel}</h3>
                  <ul>
                    {plan.changes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="diagram-render-actions">
                <label>
                  <span className="svg-tool-label">{copy.themeLabel}</span>
                  <select
                    value={theme}
                    disabled={busy}
                    onChange={(event) => {
                      setTheme(event.target.value as "dark" | "light");
                      setArtifacts(null);
                      setStep("review");
                    }}
                  >
                    <option value="dark">{copy.dark}</option>
                    <option value="light">{copy.light}</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="svg-tool-submit"
                  onClick={renderPlan}
                  disabled={busy || plan.nodes.some((node) => !node.label.trim())}
                >
                  {step === "rendering" ? copy.rendering : copy.confirm}
                </button>
              </div>
            </>
          ) : null}
          {artifacts && plan ? (
            <div className="diagram-preview">
              <p className="svg-tool-label">
                {copy.previewLabel} · {artifacts.width} × {artifacts.height}
              </p>
              <iframe
                title={plan.title}
                srcDoc={artifacts.html}
                sandbox=""
                style={{ height: Math.min(artifacts.height + 4, 720) }}
              />
              <p className="playground-note">{copy.previewHint}</p>
              <div className="svg-tool-actions">
                <button type="button" className="svg-tool-download" onClick={() => download("html")}>
                  {copy.downloadHtml} ↓
                </button>
                <button type="button" className="diagram-secondary" onClick={() => download("svg")}>
                  {copy.downloadSvg} ↓
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
