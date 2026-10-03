import { openai } from "@ai-sdk/openai";
import { generateImage, generateText, Output } from "ai";
import {
  analysisSchema,
  ANALYSIS_INSTRUCTIONS,
  buildPlanInstructions,
  buildPlanPrompt,
  buildRenderPrompt,
  label,
  planSchema,
} from "@/agent-skill/sale-campaign";
import { findGoal, findTheme } from "@/data/campaign-options";
import { isLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { consumeUsage, refundUsage } from "@/lib/usage-limit";

// Image rendering alone can take a minute or more.
export const maxDuration = 300;

const TOOL = "sale-campaign";
const TEXT_MODEL = openai("gpt-5.6-luna");
const IMAGE_MODEL = openai.image("gpt-image-2.5-sunburst");
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png"];

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData();
  const image = form.get("image");
  const goal = findGoal(String(form.get("goal") ?? ""));
  const theme = findTheme(String(form.get("theme") ?? ""));
  const locale = String(form.get("locale") ?? "");
  const name = label(String(form.get("name") ?? ""), 80);
  const description = label(String(form.get("description") ?? ""), 500);
  const price = String(form.get("price") ?? "").replace(/[,\s฿]/g, "");

  if (!(image instanceof File) || !IMAGE_TYPES.includes(image.type)) {
    return Response.json({ error: "invalid_image" }, { status: 400 });
  }
  if (image.size > MAX_IMAGE_BYTES) return Response.json({ error: "image_too_large" }, { status: 413 });
  if (!goal || !theme || !isLocale(locale) || !name || (price && !/^\d{1,9}(\.\d{1,2})?$/.test(price))) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  let usage;
  try {
    usage = await consumeUsage(TOOL, user.sub);
  } catch (error) {
    console.error("Usage limit check failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
  if (!usage) return Response.json({ error: "limit_reached" }, { status: 429 });

  const photo = new Uint8Array(await image.arrayBuffer());
  const encoder = new TextEncoder();

  // NDJSON: one event per line so the client can show which step is running.
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        send({ step: "analyze" });
        const { output: analysis } = await generateText({
          model: TEXT_MODEL,
          instructions: ANALYSIS_INSTRUCTIONS,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Product name given by the seller: "${name}"` },
                { type: "file", data: photo, mediaType: image.type },
              ],
            },
          ],
          output: Output.object({ schema: analysisSchema }),
        });

        send({ step: "plan" });
        const { output: plan } = await generateText({
          model: TEXT_MODEL,
          instructions: buildPlanInstructions(locale),
          prompt: buildPlanPrompt({ goal: goal.en, theme, locale, name, description, price, analysis }),
          output: Output.object({ schema: planSchema }),
        });

        send({ step: "render" });
        const { image: artwork } = await generateImage({
          model: IMAGE_MODEL,
          prompt: { images: [photo], text: buildRenderPrompt(plan, { name, price, theme, locale }) },
          size: "1024x1536",
          providerOptions: { openai: { quality: "high" } },
        });

        send({
          result: {
            image: `data:${artwork.mediaType};base64,${artwork.base64}`,
            caption: plan.caption,
            hashtags: plan.hashtags.map((tag) => `#${tag.replace(/^#/, "")}`),
            headline: plan.headline,
            usage,
          },
        });
      } catch (error) {
        console.error("Sale campaign generation failed", error);
        await refundUsage(TOOL, user.sub);
        send({ error: "generation_failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
}
