"use server";

import { cookies } from "next/headers";
import { isLocale } from "@/lib/i18n";

export async function saveLocalePreference(locale: string) {
  if (!isLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("portfolio-locale", locale, {
    path: "/",
    maxAge: 31_536_000,
    sameSite: "lax",
  });
}
