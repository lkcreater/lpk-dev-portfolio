import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function IndexPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("portfolio-locale")?.value ?? "en";
  redirect(`/${isLocale(savedLocale) ? savedLocale : "en"}`);
}
