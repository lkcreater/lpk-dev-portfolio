import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { isLocale } from "@/lib/i18n";
import { lineAuthorizeUrl, lineCallbackUrl } from "@/lib/line-login";

// Starts LINE Login. State and nonce live in a short-lived httpOnly cookie for the callback to check.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "";
  const state = randomBytes(16).toString("hex");
  const nonce = randomBytes(16).toString("hex");

  (await cookies()).set(
    "lpk-line-oauth",
    JSON.stringify({ state, nonce, locale: isLocale(locale) ? locale : "en" }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 600,
    },
  );

  return Response.redirect(lineAuthorizeUrl({ redirectUri: lineCallbackUrl(request), state, nonce }));
}
