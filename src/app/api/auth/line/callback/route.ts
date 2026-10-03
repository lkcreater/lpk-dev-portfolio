import { cookies } from "next/headers";
import { lineCallbackUrl, lineUserFromCode, publicOrigin } from "@/lib/line-login";
import { createSession } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const saved = cookieStore.get("lpk-line-oauth")?.value;
  cookieStore.delete({ name: "lpk-line-oauth", path: "/api/auth" });

  const { state, nonce, locale } = saved
    ? (JSON.parse(saved) as { state: string; nonce: string; locale: string })
    : { state: "", nonce: "", locale: "en" };
  const playground = `${publicOrigin(request)}/${locale}/playground`;
  const code = url.searchParams.get("code");

  if (!code || !state || url.searchParams.get("state") !== state) {
    return Response.redirect(`${playground}?login=failed`);
  }

  try {
    const user = await lineUserFromCode({ code, redirectUri: lineCallbackUrl(request), nonce });
    await createSession(user);
    return Response.redirect(playground);
  } catch (error) {
    console.error("LINE login failed", error);
    return Response.redirect(`${playground}?login=failed`);
  }
}
