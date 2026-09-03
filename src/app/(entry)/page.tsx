import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import { getPublicMenu } from "@/lib/data/public-menu";

type SupportedLocale = "en" | "ar";

function validLocale(value: string | undefined): value is SupportedLocale {
  return value === "en" || value === "ar";
}

/**
 * This is the same cookie → Accept-Language → default priority used by
 * next-intl's locale detection. Root is intentionally a server route because
 * the final fallback comes from the singleton settings row rather than static
 * routing configuration.
 */
function localeFromAcceptLanguage(value: string | null): SupportedLocale | null {
  if (!value) {
    return null;
  }

  const requested = value
    .split(",")
    .map((part, index) => {
      const [tag, ...parameters] = part.trim().split(";");
      const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const parsedQuality = quality ? Number(quality.trim().slice(2)) : 1;
      return { index, quality: Number.isFinite(parsedQuality) ? parsedQuality : 0, tag };
    })
    .filter((entry) => entry.quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index);

  for (const { tag } of requested) {
    const language = tag.toLowerCase().split("-")[0];
    if (validLocale(language)) {
      return language;
    }
  }
  return null;
}

export default async function PermanentMenuEntryPage() {
  const [cookieStore, headerStore, menuResult] = await Promise.all([
    cookies(),
    headers(),
    getPublicMenu(),
  ]);
  const localeCookieName =
    typeof routing.localeCookie === "object"
      ? (routing.localeCookie.name ?? "NEXT_LOCALE")
      : "NEXT_LOCALE";
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const detectedLocale = localeFromAcceptLanguage(
    headerStore.get("accept-language"),
  );
  const defaultLocale =
    menuResult.status === "ready" ? menuResult.data.settings.defaultLanguage : "en";
  const locale = validLocale(cookieLocale)
    ? cookieLocale
    : detectedLocale ?? defaultLocale;

  redirect(`/${locale}`);
}
