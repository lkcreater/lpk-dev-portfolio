"use client";

import { useEffect, useRef, useState } from "react";

type Copy = {
  title: string;
  body: string;
  button: string;
  failed: string;
  note: string;
  cancel: string;
  dev: { title: string; body: string; name: string; confirm: string; badge: string };
};

// Opens when a guest clicks a [data-play] tool card, or on load from ?play=<tool> / a failed login.
// Signing in from here lands the visitor on that tool.
export function LoginGate({
  copy,
  locale,
  tools,
  initialTool,
  failed,
  devMode,
}: {
  copy: Copy;
  locale: string;
  tools: { slug: string; title: string }[];
  initialTool: string | undefined;
  failed: boolean;
  devMode: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [slug, setSlug] = useState(initialTool);
  const tool = tools.find((t) => t.slug === slug) ?? null;

  useEffect(() => {
    if (tool || failed) dialog.current?.showModal();
    const onClick = (event: MouseEvent) => {
      const card = (event.target as Element).closest<HTMLElement>("[data-play]");
      if (!card) return;
      // Capture phase + stopPropagation keeps next/link from navigating to ?play= behind the modal.
      event.preventDefault();
      event.stopPropagation();
      setSlug(card.dataset.play);
      dialog.current?.showModal();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // Mount only: later opens come from card clicks, not props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lineIcon = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.5 5.9-3.5 8-6C21.4 14.2 22 12.7 22 11c0-4.4-4.5-8-10-8Z" />
    </svg>
  );

  return (
    <dialog
      ref={dialog}
      className="resume-gate"
      aria-labelledby="login-gate-title"
      onClose={() => window.history.replaceState(null, "", `/${locale}/playground`)}
    >
      <form action="/api/auth/dev-login" method="post">
        <p className="resume-gate-kicker">{devMode ? copy.dev.badge : tool?.title}</p>
        <h3 id="login-gate-title">{devMode ? copy.dev.title : copy.title}</h3>
        <p>{devMode ? copy.dev.body : copy.body}</p>
        {failed ? (
          <p className="playground-error" role="alert">
            {copy.failed}
          </p>
        ) : null}
        {devMode ? (
          <>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="tool" value={tool?.slug ?? ""} />
            <label className="dev-login-field">
              <span>{copy.dev.name}</span>
              <input name="name" defaultValue="Dev User" maxLength={40} required autoComplete="off" />
            </label>
            <button type="submit" className="line-login">
              {lineIcon}
              {copy.dev.confirm}
            </button>
          </>
        ) : (
          // A plain link: the route handler starts the OAuth redirect.
          <a
            className="line-login"
            href={`/api/auth/line?locale=${locale}${tool ? `&tool=${tool.slug}` : ""}`}
          >
            {lineIcon}
            {copy.button}
          </a>
        )}
        <p className="playground-note">{copy.note}</p>
        <div className="resume-gate-actions">
          <button type="button" onClick={() => dialog.current?.close()}>
            {copy.cancel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
