import "server-only";
import type { SessionUser } from "@/lib/session";

// LINE Login v2.1 (OpenID Connect). https://developers.line.biz/en/docs/line-login/integrate-line-login/
const AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize";
const TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";

// The public origin the browser used. Behind a proxy or dev tunnel, request.url still reports
// localhost, so prefer the forwarded headers; LINE requires redirect_uri to match exactly.
export function publicOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  if (!forwardedHost) return new URL(request.url).origin;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? "https";
  return `${proto}://${forwardedHost}`;
}

export const lineCallbackUrl = (request: Request) => `${publicOrigin(request)}/api/auth/line/callback`;

function credentials() {
  const channelId = process.env.LINE_CHANNEL_ID;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelId || !channelSecret) throw new Error("LINE_CHANNEL_ID and LINE_CHANNEL_SECRET must be set.");
  return { channelId, channelSecret };
}

export function lineAuthorizeUrl({
  redirectUri,
  state,
  nonce,
}: {
  redirectUri: string;
  state: string;
  nonce: string;
}) {
  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: credentials().channelId,
    redirect_uri: redirectUri,
    state,
    nonce,
    scope: "openid profile",
  }).toString();
  return url.toString();
}

export async function lineUserFromCode({
  code,
  redirectUri,
  nonce,
}: {
  code: string;
  redirectUri: string;
  nonce: string;
}) {
  const { channelId, channelSecret } = credentials();

  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: channelId,
      client_secret: channelSecret,
    }),
  });
  if (!tokenResponse.ok) throw new Error(`LINE token exchange failed (${tokenResponse.status})`);
  const { id_token: idToken } = (await tokenResponse.json()) as { id_token?: string };
  if (!idToken) throw new Error("LINE did not return an ID token");

  // LINE verifies the ID token signature, audience, expiry and nonce for us.
  const verifyResponse = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: channelId, nonce }),
  });
  if (!verifyResponse.ok) throw new Error(`LINE ID token verification failed (${verifyResponse.status})`);
  const claims = (await verifyResponse.json()) as { sub: string; name?: string; picture?: string };

  return { sub: claims.sub, name: claims.name ?? "LINE user", picture: claims.picture } satisfies SessionUser;
}
