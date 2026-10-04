import { isDevMode } from "@/lib/dev-mode";
import { isLocale } from "@/lib/i18n";
import { publicOrigin, toolSlug } from "@/lib/line-login";
import { createSession } from "@/lib/session";

// Creates a mock LINE session for local development (DEV_MODE=true, non-production only).
export async function POST(request: Request) {
  if (!isDevMode()) return new Response("Not found", { status: 404 });

  const form = await request.formData();
  const locale = String(form.get("locale") ?? "");
  const name =
    String(form.get("name") ?? "")
      .trim()
      .slice(0, 40) || "Dev User";
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "user";

  await createSession({ sub: `dev-${slug}`, name });
  const tool = toolSlug(form.get("tool"));
  const playground = `${publicOrigin(request)}/${isLocale(locale) ? locale : "en"}/playground`;
  return Response.redirect(tool ? `${playground}/${tool}` : playground, 303);
}
