import { cookies } from "next/headers";
import { lineCallbackUrl, lineUserFromCode, publicOrigin, toolSlug } from "@/lib/line-login";
import { createSession } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const saved = cookieStore.get("lpk-line-oauth")?.value;
  cookieStore.delete({ name: "lpk-line-oauth", path: "/api/auth" });

  const { state, nonce, locale, tool } = saved
    ? (JSON.parse(saved) as { state: string; nonce: string; locale: string; tool?: string })
    : { state: "", nonce: "", locale: "en" };
  const playground = `${publicOrigin(request)}/${locale}/playground`;
  const slug = toolSlug(tool);
  const failed = `${playground}?play=${slug}&login=failed`;
  const code = url.searchParams.get("code");

  if (!code || !state || url.searchParams.get("state") !== state) {
    return Response.redirect(failed);
  }

  try {
    const user = await lineUserFromCode({ code, redirectUri: lineCallbackUrl(request), nonce });
    await createSession(user);
    return Response.redirect(slug ? `${playground}/${slug}` : playground);
  } catch (error) {
    console.error("LINE login failed", error);
    return Response.redirect(failed);
  }
}
