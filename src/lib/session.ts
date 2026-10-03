import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export type SessionUser = { sub: string; name: string; picture?: string };

const COOKIE = "lpk-session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be set (at least 32 characters).");
  return new TextEncoder().encode(value);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

// Returns the signed-in user, or null. Memoised per request.
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionUser>(token, secret(), { algorithms: ["HS256"] });
    return { sub: payload.sub, name: payload.name, picture: payload.picture };
  } catch {
    return null;
  }
});

export async function deleteSession() {
  (await cookies()).delete(COOKIE);
}
