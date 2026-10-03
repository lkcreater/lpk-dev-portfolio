"use client";

import { type FormEvent, useRef, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

// The owner's birthday, accepted in either the Gregorian or Thai Buddhist year.
// ponytail: client-side gate only; the PDFs are still public files under /resume.
const isBirthday = (day: number, month: number, year: number) =>
  day === 21 && month === 11 && (year === 1990 || year === 2533);

export function ResumeDownload({ copy, locale }: { copy: Dictionary["about"]; locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState(false);
  const gate = copy.resumeGate;

  const close = () => {
    dialog.current?.close();
    setError(false);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const [day, month, year] = ["day", "month", "year"].map((key) => Number(form.get(key)));
    if (!isBirthday(day, month, year)) {
      setError(true);
      return;
    }
    const link = document.createElement("a");
    link.href = `/resume/Ponlawat_Koeisuwan_Resume_${locale.toUpperCase()}.pdf`;
    link.download = `Ponlawat_Koeisuwan_Resume_${locale.toUpperCase()}.pdf`;
    link.click();
    event.currentTarget.reset();
    close();
  };

  return (
    <div>
      <button
        type="button"
        className="about-resume"
        onClick={() => dialog.current?.showModal()}
        data-cursor="OPEN"
      >
        <span>{copy.resume}</span>
        <small>{copy.resumeMeta}</small>
        <b aria-hidden="true">↓</b>
      </button>

      <dialog
        ref={dialog}
        className="resume-gate"
        aria-labelledby="resume-gate-title"
        onClose={() => setError(false)}
      >
        <form onSubmit={onSubmit}>
          <p className="resume-gate-kicker">{copy.resumeMeta}</p>
          <h3 id="resume-gate-title">{gate.title}</h3>
          <p>{gate.body}</p>
          <div className="resume-gate-fields">
            <label>
              <span>{gate.day}</span>
              <input
                name="day"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="DD"
                required
                autoComplete="off"
              />
            </label>
            <label>
              <span>{gate.month}</span>
              <input
                name="month"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="MM"
                required
                autoComplete="off"
              />
            </label>
            <label>
              <span>{gate.year}</span>
              <input
                name="year"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="YYYY"
                required
                autoComplete="off"
              />
            </label>
          </div>
          <p className="resume-gate-error" role="alert">
            {error ? gate.error : ""}
          </p>
          <div className="resume-gate-actions">
            <button type="button" onClick={close}>
              {gate.cancel}
            </button>
            <button type="submit">{gate.confirm} ↓</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
