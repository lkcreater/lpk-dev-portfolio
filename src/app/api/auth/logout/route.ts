import { isLocale } from "@/lib/i18n";
import { publicOrigin } from "@/lib/line-login";
import { deleteSession } from "@/lib/session";

export async function POST(request: Request) {
  const form = await request.formData();
  const locale = String(form.get("locale") ?? "");
  await deleteSession();
  return Response.redirect(`${publicOrigin(request)}/${isLocale(locale) ? locale : "en"}/playground`, 303);
}
