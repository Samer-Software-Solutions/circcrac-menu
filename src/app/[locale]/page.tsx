import type { CSSProperties } from "react";
import { Suspense } from "react";

import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";

import { LanguageSwitch } from "@/components/language-switch";
import {
  CategoryNavigation,
  type CategoryNavigationItem,
} from "@/components/public-menu/category-navigation";
import { MenuItemCard } from "@/components/public-menu/menu-item-card";
import { MenuSkeleton } from "@/components/public-menu/menu-skeleton";
import { routing } from "@/i18n/routing";
import { getPublicMenu } from "@/lib/data/public-menu";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

type MenuBrandStyle = CSSProperties & {
  "--menu-brand": string;
};

const DEFAULT_MENU_BRAND_COLOR = "#8B1E2D";

// The tagged data read has the same fallback lifetime. Later CMS mutations can
// invalidate the public-menu tag without coupling mutations to these routes.
export const revalidate = 300;

function getLocalizedValue(
  locale: "en" | "ar",
  englishValue: string,
  arabicValue: string,
) {
  return locale === "ar" ? arabicValue : englishValue;
}

function getMonogram(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toLocaleUpperCase();
}

function createPriceFormatter(locale: "en" | "ar", currency: string) {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-QA" : "en-QA", {
      currency,
      style: "currency",
    });
  } catch {
    return new Intl.NumberFormat(locale === "ar" ? "ar-QA" : "en-QA", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }
}

async function MenuContent({ locale }: { locale: "en" | "ar" }) {
  const [menuResult, t] = await Promise.all([
    getPublicMenu(),
    getTranslations({ locale, namespace: "PublicMenu" }),
  ]);

  if (menuResult.status === "error") {
    return (
      <main
        className="min-h-dvh bg-[#f7f4ee] text-stone-900"
        style={{ "--menu-brand": DEFAULT_MENU_BRAND_COLOR } as MenuBrandStyle}
      >
        <div className="menu-shell flex min-h-dvh flex-col">
          <header className="menu-loading-header">
            <span className="menu-monogram" aria-hidden="true">
              CC
            </span>
            <LanguageSwitch
              currentLocale={locale}
              label={t("switchLanguage")}
              accessibleLabel={t("switchLanguageLabel")}
            />
          </header>
          <section className="my-auto max-w-lg py-20">
            <p className="menu-eyebrow">{t("menuLabel")}</p>
            <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl">
              {t("errorTitle")}
            </h1>
            <p className="mt-4 leading-7 text-stone-600">
              {t("errorDescription")}
            </p>
          </section>
        </div>
      </main>
    );
  }

  const { categories, settings } = menuResult.data;
  const restaurantName = getLocalizedValue(
    locale,
    settings.restaurantNameEn,
    settings.restaurantNameAr,
  );
  const priceFormatter = createPriceFormatter(locale, settings.currency);
  const navigationCategories: CategoryNavigationItem[] = categories.map(
    (category) => ({
      id: category.id,
      label: getLocalizedValue(locale, category.nameEn, category.nameAr),
    }),
  );
  const menuStyle: MenuBrandStyle = {
    "--menu-brand": settings.primaryColor ?? DEFAULT_MENU_BRAND_COLOR,
  };

  return (
    <main
      className="min-h-dvh bg-[#f7f4ee] text-stone-900"
      style={menuStyle}
    >
      <div className="menu-shell">
        <header className="menu-header">
          <div className="flex min-w-0 items-center gap-3.5">
            {settings.logoUrl ? (
              <div className="menu-logo-frame">
                <Image
                  src={settings.logoUrl}
                  alt={t("logoAlt", { restaurantName })}
                  width={64}
                  height={64}
                  sizes="64px"
                  className="size-full object-contain"
                  priority
                />
              </div>
            ) : (
              <span className="menu-monogram" aria-hidden="true">
                {getMonogram(restaurantName)}
              </span>
            )}
          </div>

          <LanguageSwitch
            currentLocale={locale}
            label={t("switchLanguage")}
            accessibleLabel={t("switchLanguageLabel")}
          />
        </header>

        <div className="menu-intro">
          <p className="menu-eyebrow">{t("menuLabel")}</p>
          <h1 className="mt-4 max-w-3xl text-[2.65rem] leading-[1.07] font-semibold tracking-[-0.045em] text-balance sm:text-6xl sm:leading-[1.04]">
            {restaurantName}
          </h1>
          <span className="menu-brand-rule mt-7 block h-1 w-14 rounded-full" />
        </div>

        {categories.length > 0 ? (
          <CategoryNavigation
            ariaLabel={t("categoryNavigationLabel")}
            categories={navigationCategories}
          />
        ) : null}

        {categories.length === 0 ? (
          <section className="menu-empty-state">
            <h2 className="text-2xl font-semibold tracking-[-0.025em]">
              {t("emptyTitle")}
            </h2>
            <p className="mt-3 leading-7 text-stone-600">
              {t("emptyDescription")}
            </p>
          </section>
        ) : (
          <div className="pb-20 sm:pb-28">
            {categories.map((category, categoryIndex) => {
              const categoryName = getLocalizedValue(
                locale,
                category.nameEn,
                category.nameAr,
              );
              const eagerImageItemId =
                categoryIndex === 0
                  ? category.items.find((item) => item.imageUrl)?.id
                  : undefined;

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  aria-labelledby={`category-heading-${category.id}`}
                  className="menu-section"
                >
                  <div className="mb-7 flex items-center gap-4 sm:mb-9">
                    <h2
                      id={`category-heading-${category.id}`}
                      className="text-[1.65rem] leading-tight font-semibold tracking-[-0.035em] sm:text-3xl"
                    >
                      {categoryName}
                    </h2>
                    <span className="h-px flex-1 bg-stone-300/75" />
                  </div>

                  {category.items.length === 0 ? (
                    <p className="py-5 text-sm leading-6 text-stone-500">
                      {t("emptyCategory")}
                    </p>
                  ) : (
                    <div className="menu-items-grid">
                      {category.items.map((item) => {
                        const name = getLocalizedValue(
                          locale,
                          item.nameEn,
                          item.nameAr,
                        );
                        const description = getLocalizedValue(
                          locale,
                          item.descriptionEn ?? "",
                          item.descriptionAr ?? "",
                        );

                        return (
                          <MenuItemCard
                            key={item.id}
                            name={name}
                            description={description || null}
                            price={priceFormatter.format(item.price)}
                            eagerImage={item.id === eagerImageItemId}
                            imageUrl={item.imageUrl}
                            imageAlt={t("itemImageAlt", { itemName: name })}
                            available={item.available}
                            unavailableLabel={t("unavailable")}
                          />
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "PublicMenu" });

  return (
    <Suspense fallback={<MenuSkeleton loadingLabel={t("loadingLabel")} />}>
      <MenuContent locale={locale} />
    </Suspense>
  );
}
