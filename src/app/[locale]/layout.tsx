import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { fontVariables } from "@/app/fonts";
import { routing } from "@/i18n/routing";
import { getPublicMenu } from "@/lib/data/public-menu";

import "../globals.css";
import { menuFontVariables } from "./menu-fonts";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

type LocaleMetadataProps = Pick<LocaleLayoutProps, "params">;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleMetadataProps): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const [t, menuResult] = await Promise.all([
    getTranslations({ locale, namespace: "Metadata" }),
    getPublicMenu(),
  ]);
  const restaurantName =
    menuResult.status === "ready"
      ? locale === "ar"
        ? menuResult.data.settings.restaurantNameAr
        : menuResult.data.settings.restaurantNameEn
      : t("applicationName");

  return {
    applicationName: restaurantName,
    title: t("title", { restaurantName }),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${fontVariables} ${menuFontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={null}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
