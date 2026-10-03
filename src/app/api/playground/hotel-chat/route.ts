import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { buildHotelInstructions } from "@/agent-skill/hotel-roleplay";
import { lpkHotel } from "@/data/lpk-hotel";
import { getSession } from "@/lib/session";
import { consumeUsage, refundUsage } from "@/lib/usage-limit";

export const maxDuration = 60;

const TOOL = "hotel-chat";
const MODEL = openai("gpt-5.6-luna");
// The model sees the recent conversation; older turns add cost without changing the sale.
const HISTORY_WINDOW = 30;
const MAX_MESSAGE_CHARS = 1000;

const roomIds = lpkHotel.rooms.map((room) => room.id) as [string, ...string[]];

const openBookingForm = tool({
  description:
    "Show the booking form card in the chat once the guest agrees to book. Prefill what you already know.",
  inputSchema: z.object({
    roomType: z.enum(roomIds),
    checkIn: z.string().optional().describe("Check-in date as YYYY-MM-DD if known"),
    nights: z.number().int().min(1).max(30).optional(),
    guests: z.number().int().min(1).max(6).optional(),
    offer: z.string().optional().describe("The offer applied, copied from the offers list"),
  }),
  execute: async (input) => input,
});

const lastUserText = (messages: UIMessage[]) => {
  const last = messages.at(-1);
  if (last?.role !== "user") return null;
  return last.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
};

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { messages } = (await request.json()) as { messages?: UIMessage[] };
  const text = Array.isArray(messages) ? lastUserText(messages) : null;
  if (!messages || !text?.trim() || text.length > MAX_MESSAGE_CHARS) {
    return Response.json({ error: "invalid_message" }, { status: 400 });
  }

  let usage;
  try {
    usage = await consumeUsage(TOOL, user.sub);
  } catch (error) {
    console.error("Usage limit check failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
  if (!usage) return Response.json({ error: "limit_reached" }, { status: 429 });

  const result = streamText({
    model: MODEL,
    instructions: buildHotelInstructions(),
    messages: await convertToModelMessages(messages.slice(-HISTORY_WINDOW)),
    tools: { openBookingForm },
    stopWhen: isStepCount(2),
    onError: async ({ error }) => {
      console.error("Hotel chat failed", error);
      await refundUsage(TOOL, user.sub);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      // Timestamp for the LINE-style bubble.
      messageMetadata: ({ part }) => (part.type === "start" ? { at: Date.now() } : undefined),
    }),
    headers: { "x-usage-remaining": String(usage.remaining), "x-usage-limit": String(usage.limit) },
  });
}
