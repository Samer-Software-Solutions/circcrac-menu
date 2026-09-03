import { getLocale, getTranslations } from "next-intl/server";

import {
  arabicFontClassName,
  englishFontClassName,
} from "@/app/fonts";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const locale = await getLocale();
  const t = await getTranslations("NotFoundPage");
  const fontClassName =
    locale === "ar" ? arabicFontClassName : englishFontClassName;

  return (
    <main
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${fontClassName} flex min-h-dvh flex-1 items-center justify-center bg-background px-6 py-16`}
    >
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          {t("description")}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          {t("returnHome")}
        </Link>
      </div>
    </main>
  );
}
