"use client";

import { type ReactNode, useRef } from "react";

type Copy = { title: string; body: string; name: string; confirm: string; cancel: string; badge: string };

// Shown instead of the LINE redirect when DEV_MODE is on: confirm a mock LINE session in a modal.
export function DevLoginButton({
  copy,
  locale,
  children,
}: {
  copy: Copy;
  locale: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="line-login" onClick={() => dialog.current?.showModal()}>
        {children}
      </button>
      <span className="dev-badge">{copy.badge}</span>

      <dialog ref={dialog} className="resume-gate" aria-labelledby="dev-login-title">
        <form action="/api/auth/dev-login" method="post">
          <p className="resume-gate-kicker">{copy.badge}</p>
          <h3 id="dev-login-title">{copy.title}</h3>
          <p>{copy.body}</p>
          <input type="hidden" name="locale" value={locale} />
          <label className="dev-login-field">
            <span>{copy.name}</span>
            <input name="name" defaultValue="Dev User" maxLength={40} required autoComplete="off" />
          </label>
          <div className="resume-gate-actions">
            <button type="button" onClick={() => dialog.current?.close()}>
              {copy.cancel}
            </button>
            <button type="submit">{copy.confirm}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
