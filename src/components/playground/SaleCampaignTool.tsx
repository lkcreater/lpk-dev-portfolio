"use client";

import { type FormEvent, useState } from "react";
import { campaignGoals, campaignThemeGroups } from "@/data/campaign-options";
import type { Dictionary, Locale } from "@/lib/i18n";

type Copy = Dictionary["playground"]["campaign"];
type Usage = { used: number; limit: number; remaining: number };
type Step = "analyze" | "plan" | "render";
type Result = { image: string; caption: string; hashtags: string[]; headline: string; usage?: Usage };

const STEPS: Step[] = ["analyze", "plan", "render"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png"];

export function SaleCampaignTool({
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
  const [goal, setGoal] = useState(campaignGoals[0].id);
  const [theme, setTheme] = useState(campaignThemeGroups[0].themes[0].id);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState(initialUsage);

  const loading = step !== null;
  const outOfRuns = usage !== null && usage.remaining === 0;
  const limitMessage = copy.errors.limit.replace("{limit}", String(usage?.limit ?? 2));

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
    const body = new FormData(event.currentTarget);
    body.set("image", image);
    body.set("goal", goal);
    body.set("theme", theme);
    body.set("locale", locale);

    setError(null);
    setResult(null);
    setCopied(false);
    setStep("analyze");

    try {
      const response = await fetch("/api/playground/sale-campaign", { method: "POST", body });
      if (!response.ok || !response.body) {
        const code = ((await response.json().catch(() => ({}))) as { error?: string }).error;
        if (response.status === 429) {
          setUsage((current) => (current ? { ...current, used: current.limit, remaining: 0 } : current));
          return setError(limitMessage);
        }
        return setError(
          response.status === 401
            ? copy.errors.unauthorized
            : response.status === 503
              ? copy.errors.unavailable
              : code === "invalid_image"
                ? copy.errors.type
                : code === "image_too_large"
                  ? copy.errors.size
                  : code === "invalid_input"
                    ? copy.errors.input
                    : copy.errors.failed,
        );
      }

      // NDJSON stream: {step} events, then {result} or {error}.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines.filter(Boolean)) {
          const event = JSON.parse(line) as { step?: Step; result?: Result; error?: string };
          if (event.step) setStep(event.step);
          if (event.error) setError(copy.errors.failed);
          if (event.result) {
            setResult(event.result);
            if (event.result.usage) setUsage(event.result.usage);
          }
        }
      }
    } catch {
      setError(copy.errors.failed);
    } finally {
      setStep(null);
    }
  };

  const fullCaption = result ? `${result.caption}\n\n${result.hashtags.join(" ")}` : "";

  const copyCaption = async () => {
    await navigator.clipboard.writeText(fullCaption);
    setCopied(true);
  };

  const download = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.image;
    link.download = `sale-campaign-${theme}.png`;
    link.click();
  };

  return (
    <div className="svg-tool campaign-tool">
      <form className="svg-tool-form" onSubmit={onSubmit}>
        <fieldset className="campaign-field">
          <legend className="svg-tool-label">{copy.goalLabel}</legend>
          <div className="campaign-chips">
            {campaignGoals.map((item) => (
              <label key={item.id} className={goal === item.id ? "is-active" : ""}>
                <input
                  type="radio"
                  name="goal-choice"
                  value={item.id}
                  checked={goal === item.id}
                  onChange={() => setGoal(item.id)}
                />
                {item[locale]}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="campaign-field">
          <span className="svg-tool-label">{copy.themeLabel}</span>
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            {campaignThemeGroups.map((group) => (
              <optgroup key={group.en} label={group[locale]}>
                {group.themes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item[locale]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

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

        {image ? (
          <div className="campaign-product">
            <label className="campaign-field">
              <span className="svg-tool-label">{copy.nameLabel}</span>
              <input name="name" required maxLength={80} placeholder={copy.namePlaceholder} />
            </label>
            <label className="campaign-field">
              <span className="svg-tool-label">{copy.descriptionLabel}</span>
              <textarea
                name="description"
                rows={3}
                maxLength={500}
                placeholder={copy.descriptionPlaceholder}
              />
            </label>
            <label className="campaign-field">
              <span className="svg-tool-label">{copy.priceLabel}</span>
              <input
                name="price"
                inputMode="decimal"
                pattern="[0-9.,]*"
                placeholder={copy.pricePlaceholder}
              />
            </label>
          </div>
        ) : null}

        {error ? (
          <p className="playground-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="svg-tool-actions">
          <button type="submit" className="svg-tool-submit" disabled={loading || outOfRuns || !image}>
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
        {loading ? (
          <ol className="campaign-steps">
            {STEPS.map((item, index) => {
              const current = step ? STEPS.indexOf(step) : -1;
              return (
                <li key={item} className={index < current ? "is-done" : index === current ? "is-active" : ""}>
                  <span>{index < current ? "✓" : String(index + 1).padStart(2, "0")}</span>
                  {copy.steps[item]}
                </li>
              );
            })}
          </ol>
        ) : null}
        <div className={`svg-tool-stage campaign-stage${loading ? " is-loading" : ""}`}>
          {result ? (
            // eslint-disable-next-line @next/next/no-img-element -- generated data URL
            <img src={result.image} alt={result.headline} />
          ) : (
            <span className="svg-tool-empty" aria-hidden="true" />
          )}
        </div>
        {result ? (
          <>
            <div className="campaign-caption">
              <p className="svg-tool-label">{copy.captionLabel}</p>
              <p>{result.caption}</p>
              <p className="campaign-hashtags">{result.hashtags.join(" ")}</p>
            </div>
            <div className="svg-tool-actions">
              <button type="button" className="svg-tool-download" onClick={download}>
                {copy.download} ↓
              </button>
              <button type="button" className="campaign-copy" onClick={copyCaption}>
                {copied ? copy.copied : copy.copy}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
