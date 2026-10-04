import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { isLocale } from "@/lib/i18n";
import { lineAuthorizeUrl, lineCallbackUrl, publicOrigin, toolSlug } from "@/lib/line-login";

// Starts LINE Login. State and nonce live in a short-lived httpOnly cookie for the callback to check.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "";
  const safeLocale = isLocale(locale) ? locale : "en";
  const tool = toolSlug(url.searchParams.get("tool"));
  const state = randomBytes(16).toString("hex");
  const nonce = randomBytes(16).toString("hex");

  let authorizeUrl: string;
  try {
    authorizeUrl = lineAuthorizeUrl({ redirectUri: lineCallbackUrl(request), state, nonce });
  } catch (error) {
    // Missing LINE env vars: send the visitor back with a message instead of a 500 page.
    console.error("LINE login is not configured", error);
    return Response.redirect(`${publicOrigin(request)}/${safeLocale}/playground?play=${tool}&login=failed`);
  }

  (await cookies()).set("lpk-line-oauth", JSON.stringify({ state, nonce, locale: safeLocale, tool }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });

  return Response.redirect(authorizeUrl);
}
