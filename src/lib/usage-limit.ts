import "server-only";

// Daily quota per LINE user per playground tool, reset at midnight Bangkok time.
export const DAILY_LIMIT = 2;
const TTL_SECONDS = 60 * 60 * 48;

// Upstash Redis REST (Vercel Marketplace sets the KV_* names, Upstash sets the UPSTASH_* names).
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

// ponytail: in-memory fallback for local dev only; resets on restart and is per-instance.
const memory = new Map<string, number>();

export type Usage = { used: number; limit: number; remaining: number };

async function redis(command: (string | number)[]): Promise<number> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    // Fail closed in production so a missing store can never mean unlimited AI calls.
    if (process.env.NODE_ENV === "production") throw new Error("Usage limit store is not configured.");
    const [op, key] = command as [string, string];
    const value = (memory.get(key) ?? 0) + (op === "INCR" ? 1 : op === "DECR" ? -1 : 0);
    if (op !== "GET") memory.set(key, value);
    return value;
  }

  const response = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Usage limit store failed (${response.status})`);
  const { result } = (await response.json()) as { result: string | number | null };
  return Number(result ?? 0);
}

function key(tool: string, userId: string) {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
  return `playground:${tool}:${userId}:${day}`;
}

const toUsage = (used: number): Usage => ({
  used,
  limit: DAILY_LIMIT,
  remaining: Math.max(0, DAILY_LIMIT - used),
});

export async function getUsage(tool: string, userId: string) {
  return toUsage(await redis(["GET", key(tool, userId)]));
}

// Reserves one run. Returns null when today's quota is already used up.
export async function consumeUsage(tool: string, userId: string) {
  const usageKey = key(tool, userId);
  const used = await redis(["INCR", usageKey]);
  if (used === 1 && REDIS_URL) await redis(["EXPIRE", usageKey, TTL_SECONDS]);
  if (used > DAILY_LIMIT) {
    await redis(["DECR", usageKey]);
    return null;
  }
  return toUsage(used);
}

// Gives a run back when generation fails, so errors don't cost the user their quota.
export async function refundUsage(tool: string, userId: string) {
  await redis(["DECR", key(tool, userId)]);
}
