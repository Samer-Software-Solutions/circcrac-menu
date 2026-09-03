import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { LanguageSwitch } from "@/components/language-switch";
import { routing } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "HomePage" });

  return (
    <main className="flex min-h-dvh flex-1 bg-background">
      <section className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-8 sm:px-10 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <span
            aria-label={t("brandLabel")}
            className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            CC
          </span>
          <LanguageSwitch
            currentLocale={locale}
            label={t("switchLanguage")}
            accessibleLabel={t("switchLanguageLabel")}
          />
        </header>

        <div className="my-auto py-16">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t("description")}
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-primary"
            />
            <p>{t("status")}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
