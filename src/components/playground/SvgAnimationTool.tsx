"use client";

import { type FormEvent, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

type Copy = Dictionary["playground"]["svg"];
type Usage = { used: number; limit: number; remaining: number };
type Result = { title: string; analysis: string; html: string; usage?: Usage };

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_BRIEF = 2000;

export function SvgAnimationTool({
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
  const [usage, setUsage] = useState(initialUsage);
  const outOfRuns = usage !== null && usage.remaining === 0;
  const limitMessage = copy.errors.limit.replace("{limit}", String(usage?.limit ?? 2));
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const pickImage = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return setError(copy.errors.type);
    if (file.size > MAX_IMAGE_BYTES) return setError(copy.errors.size);
    setImage(file);
    setPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image) return setError(copy.errors.type);
    if (!brief.trim() || brief.length > MAX_BRIEF) return setError(copy.errors.brief);

    setLoading(true);
    setError(null);
    const body = new FormData();
    body.set("image", image);
    body.set("brief", brief.trim());

    try {
      const response = await fetch("/api/playground/svg-animation", { method: "POST", body });
      if (response.status === 401) return setError(copy.errors.unauthorized);
      if (response.status === 429) {
        setUsage((current) => (current ? { ...current, used: current.limit, remaining: 0 } : current));
        return setError(limitMessage);
      }
      if (response.status === 503) return setError(copy.errors.unavailable);
      if (!response.ok) return setError(copy.errors.failed);
      const data = (await response.json()) as Result;
      setResult(data);
      if (data.usage) setUsage(data.usage);
    } catch {
      setError(copy.errors.failed);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const name =
      result.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "svg-animation";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([result.html], { type: "text/html" }));
    link.download = `${name}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="svg-tool">
      <form className="svg-tool-form" onSubmit={onSubmit}>
        <label className="svg-tool-drop">
          <span className="svg-tool-label">{copy.imageLabel}</span>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img src={preview} alt="" />
          ) : (
            <span className="svg-tool-placeholder">{copy.chooseImage}</span>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(event) => pickImage(event.target.files?.[0])}
          />
          <small>{copy.imageHint}</small>
        </label>

        <label className="svg-tool-brief">
          <span className="svg-tool-label">{copy.briefLabel}</span>
          <textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder={copy.briefPlaceholder}
            maxLength={MAX_BRIEF}
            rows={6}
          />
          <small>
            {brief.length.toLocaleString(locale)} / {MAX_BRIEF.toLocaleString(locale)}
          </small>
        </label>

        {error ? (
          <p className="playground-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="svg-tool-actions">
          <button type="submit" className="svg-tool-submit" disabled={loading || outOfRuns}>
            {loading ? copy.generating : copy.generate}
          </button>
          {usage ? (
            <span className={`playground-usage${outOfRuns ? " is-empty" : ""}`}>
              {usageTemplate
                .replace("{remaining}", String(usage.remaining))
                .replace("{limit}", String(usage.limit))}
            </span>
          ) : null}
        </div>
        {outOfRuns && !error ? <p className="playground-note">{limitMessage}</p> : null}
        <p className="playground-note">{copy.privacy}</p>
      </form>

      <div className="svg-tool-result" aria-live="polite" aria-busy={loading}>
        <p className="svg-tool-label">{copy.resultLabel}</p>
        <div className={`svg-tool-stage${loading ? " is-loading" : ""}`}>
          {result ? (
            // Sandboxed without scripts: the generated file is shown, never executed with page privileges.
            <iframe title={result.title} srcDoc={result.html} sandbox="" />
          ) : (
            <span className="svg-tool-empty" aria-hidden="true" />
          )}
        </div>
        {result ? (
          <>
            <h2>{result.title}</h2>
            <p className="svg-tool-analysis">
              <span>{copy.analysisLabel}</span>
              {result.analysis}
            </p>
            <button type="button" className="svg-tool-download" onClick={download}>
              {copy.download} ↓
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
