"use client";

import { usePathname, useRouter } from "next/navigation";
import { startTransition } from "react";
import type { Locale } from "@/lib/i18n";
import { saveLocalePreference } from "@/app/actions";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const changeLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    const nextPath = pathname.replace(/^\/(en|th)(?=\/|$)/, `/${nextLocale}`);
    localStorage.setItem("portfolio-locale", nextLocale);
    startTransition(() => {
      void saveLocalePreference(nextLocale);
      router.push(nextPath);
    });
  };

  return (
    <div className="language-switcher" aria-label="Language">
      {(["en", "th"] as const).map((item, index) => (
        <span key={item}>
          {index > 0 ? <i aria-hidden="true">/</i> : null}
          <button
            type="button"
            className={locale === item ? "active" : ""}
            onClick={() => changeLanguage(item)}
          >
            {item.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
