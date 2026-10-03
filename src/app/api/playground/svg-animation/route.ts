import { openai } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { z } from "zod";
import { svgAnimationsSkill } from "@/agent-skill/svg-animations";
import { getSession } from "@/lib/session";
import { consumeUsage, refundUsage } from "@/lib/usage-limit";

export const maxDuration = 120;

const TOOL = "svg-animation";

// Direct OpenAI provider; reads OPENAI_API_KEY.
const MODEL = openai("gpt-6.1-sol");
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_BRIEF = 2000;

const INSTRUCTIONS = `You are an expert motion designer who builds handcrafted, production-ready SVG animations.

Follow this skill guide exactly:
<skill name="svg-animations">
${svgAnimationsSkill}
</skill>

Task:
1. Study the reference image: subject, shapes, composition, palette and mood.
2. Read the user's brief and plan the animation (what moves, timing, easing, loop).
3. Call the createSvgAnimation tool once with the finished file.

Output rules for the HTML file:
- One self-contained HTML document with an inline <svg> using a viewBox, plus a <style> block. No external assets, fonts, scripts or <script> tags.
- Animate with CSS keyframes and/or SMIL. Keep it smooth and loop seamlessly unless the brief says otherwise.
- Use colours taken from the reference image. Centre the SVG and make it responsive.
- Respect prefers-reduced-motion. Add role="img" and a <title> to the SVG.`;

const createSvgAnimation = tool({
  description: "Return the finished animated SVG as a complete, self-contained HTML document.",
  inputSchema: z.object({
    title: z.string().describe("Short name for the animation"),
    analysis: z.string().describe("2-4 sentences: what you saw in the image and how you animated it"),
    html: z.string().describe("Complete HTML document containing the inline animated SVG"),
  }),
  // No external side effects: strip anything executable before it reaches the user.
  execute: async ({ title, analysis, html }) => ({
    title,
    analysis,
    html: html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, ""),
  }),
});

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData();
  const image = form.get("image");
  const brief = String(form.get("brief") ?? "").trim();

  if (!(image instanceof File) || !IMAGE_TYPES.includes(image.type)) {
    return Response.json({ error: "invalid_image" }, { status: 400 });
  }
  if (image.size > MAX_IMAGE_BYTES) return Response.json({ error: "image_too_large" }, { status: 413 });
  if (!brief || brief.length > MAX_BRIEF) return Response.json({ error: "invalid_brief" }, { status: 400 });

  let usage;
  try {
    usage = await consumeUsage(TOOL, user.sub);
  } catch (error) {
    console.error("Usage limit check failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
  if (!usage) return Response.json({ error: "limit_reached" }, { status: 429 });

  try {
    const result = await generateText({
      model: MODEL,
      instructions: INSTRUCTIONS,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Brief:\n${brief}` },
            { type: "file", data: new Uint8Array(await image.arrayBuffer()), mediaType: image.type },
          ],
        },
      ],
      tools: { createSvgAnimation },
      toolChoice: { type: "tool", toolName: "createSvgAnimation" },
    });

    const output = result.toolResults.find((item) => item.toolName === "createSvgAnimation")?.output;
    if (!output) {
      await refundUsage(TOOL, user.sub);
      return Response.json({ error: "no_output" }, { status: 502 });
    }
    return Response.json({ ...output, usage });
  } catch (error) {
    console.error("SVG animation generation failed", error);
    await refundUsage(TOOL, user.sub);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
