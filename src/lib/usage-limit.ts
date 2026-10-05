import "server-only";
import { createClient } from "redis";

// Daily quota per LINE user per playground tool, reset at midnight Bangkok time.
// svg-animation counts generations; hotel-chat counts guest messages.
const DAILY_LIMITS: Record<string, number> = {
  "svg-animation": 2,
  "hotel-chat": 20,
  "sale-campaign": 2,
  "diagram-design": 2,
};
const limitFor = (tool: string) => DAILY_LIMITS[tool] ?? 2;
const TTL_SECONDS = 60 * 60 * 48;

// Redis over TCP (Redis Cloud / Vercel Marketplace Redis set REDIS_URL).
const REDIS_URL = process.env.REDIS_URL;

// ponytail: in-memory fallback for local dev only; resets on server restart.
// Kept on globalThis because Next bundles this module separately into each page and route
// handler; a module-level Map would give the page and the API different counters.
const connectRedis = () =>
  createClient({ url: REDIS_URL })
    .on("error", (error) => console.error("Redis error", error))
    .connect();

const shared = globalThis as {
  __lpkUsage?: Map<string, number>;
  __lpkRedis?: ReturnType<typeof connectRedis>;
};
const memory = (shared.__lpkUsage ??= new Map());

export type Usage = { used: number; limit: number; remaining: number };

// One connection per server instance, opened on first use and reused across requests.
function redisClient() {
  return (shared.__lpkRedis ??= connectRedis().catch((error) => {
    // Drop the failed attempt so the next request retries the connection.
    shared.__lpkRedis = undefined;
    throw error;
  }));
}

type Op = "GET" | "INCR" | "DECR";

async function redis(op: Op, key: string): Promise<number> {
  if (!REDIS_URL) {
    // Fail closed in production so a missing store can never mean unlimited AI calls.
    if (process.env.NODE_ENV === "production") throw new Error("Usage limit store is not configured.");
    const value = (memory.get(key) ?? 0) + (op === "INCR" ? 1 : op === "DECR" ? -1 : 0);
    if (op !== "GET") memory.set(key, value);
    return value;
  }

  const client = await redisClient();
  if (op === "GET") return Number((await client.get(key)) ?? 0);
  if (op === "DECR") return client.decr(key);
  const value = await client.incr(key);
  if (value === 1) await client.expire(key, TTL_SECONDS);
  return value;
}

function key(tool: string, userId: string) {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
  return `playground:${tool}:${userId}:${day}`;
}

const toUsage = (tool: string, used: number): Usage => ({
  used,
  limit: limitFor(tool),
  remaining: Math.max(0, limitFor(tool) - used),
});

export async function getUsage(tool: string, userId: string) {
  return toUsage(tool, await redis("GET", key(tool, userId)));
}

// Reserves one run. Returns null when today's quota is already used up.
export async function consumeUsage(tool: string, userId: string) {
  const usageKey = key(tool, userId);
  const used = await redis("INCR", usageKey);
  if (used > limitFor(tool)) {
    await redis("DECR", usageKey);
    return null;
  }
  return toUsage(tool, used);
}

// Gives a run back when generation fails, so errors don't cost the user their quota.
export async function refundUsage(tool: string, userId: string) {
  await redis("DECR", key(tool, userId));
}
