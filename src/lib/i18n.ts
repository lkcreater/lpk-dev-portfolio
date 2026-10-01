import en from "@/messages/en.json";
import th from "@/messages/th.json";

export const locales = ["en", "th"] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, th };

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
