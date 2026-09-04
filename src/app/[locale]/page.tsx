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
import { MenuItemRow } from "@/components/public-menu/menu-item-row";
import { MenuSkeleton } from "@/components/public-menu/menu-skeleton";
import { MenuSpotlightItem } from "@/components/public-menu/menu-spotlight-item";
import { routing } from "@/i18n/routing";
import {
  getPublicMenu,
  type PublicMenuItem,
} from "@/lib/data/public-menu";

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

type SpotlightItem = PublicMenuItem & { imageUrl: string };

function findSpotlightItem(items: PublicMenuItem[]): SpotlightItem | null {
  return (
    items.find(
      (item): item is SpotlightItem => Boolean(item.imageUrl) && item.available,
    ) ?? null
  );
}

async function MenuContent({ locale }: { locale: "en" | "ar" }) {
  const [menuResult, t] = await Promise.all([
    getPublicMenu(),
    getTranslations({ locale, namespace: "PublicMenu" }),
  ]);

  if (menuResult.status === "error") {
    return (
      <main
        className="menu-page"
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
            <h1 className="menu-serif mt-4 text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl">
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
  const totalItemCount = categories.reduce(
    (total, category) => total + category.items.length,
    0,
  );

  return (
    <main className="menu-page" style={menuStyle}>
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

        <div className="menu-hero">
          <div className="menu-intro">
            <p className="menu-eyebrow">{t("menuLabel")}</p>
            <h1 className="menu-title">{restaurantName}</h1>
            <svg
              className="menu-title-flourish"
              viewBox="0 0 120 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M2 8C15 2 25 10 38 6C51 2 61 10 74 6C87 2 97 10 110 6" />
            </svg>
            {totalItemCount > 0 ? (
              <p className="menu-stats">
                {t("menuStats", {
                  itemCount: totalItemCount,
                  categoryCount: categories.length,
                })}
              </p>
            ) : null}
          </div>
        </div>

        {categories.length > 0 ? (
          <CategoryNavigation
            ariaLabel={t("categoryNavigationLabel")}
            categories={navigationCategories}
          />
        ) : null}

        {categories.length === 0 ? (
          <section className="menu-empty-state">
            <h2 className="menu-serif text-2xl font-semibold tracking-[-0.025em]">
              {t("emptyTitle")}
            </h2>
            <p className="mt-3 leading-7 text-stone-600">
              {t("emptyDescription")}
            </p>
          </section>
        ) : (
          <div className="menu-categories">
            {categories.map((category, categoryIndex) => {
              const categoryName = getLocalizedValue(
                locale,
                category.nameEn,
                category.nameAr,
              );
              const spotlightItem = findSpotlightItem(category.items);
              const listItems = category.items.filter(
                (item) => item.id !== spotlightItem?.id,
              );

              function itemView(item: PublicMenuItem) {
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

                return { name, description: description || null };
              }

              const spotlightView = spotlightItem
                ? itemView(spotlightItem)
                : null;

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  aria-labelledby={`category-heading-${category.id}`}
                  className="menu-section"
                >
                  <div className="menu-category-head">
                    <span className="menu-category-index" aria-hidden="true">
                      {String(categoryIndex + 1).padStart(2, "0")}
                    </span>
                    <h2
                      id={`category-heading-${category.id}`}
                      className="menu-category-name"
                    >
                      {categoryName}
                    </h2>
                    <span className="menu-category-rule" aria-hidden="true" />
                  </div>

                  {category.items.length === 0 ? (
                    <p className="menu-category-empty">
                      {t("emptyCategory")}
                    </p>
                  ) : (
                    <>
                      {spotlightItem && spotlightView ? (
                        <MenuSpotlightItem
                          name={spotlightView.name}
                          description={spotlightView.description}
                          price={priceFormatter.format(spotlightItem.price)}
                          imageUrl={spotlightItem.imageUrl}
                          imageAlt={t("itemImageAlt", {
                            itemName: spotlightView.name,
                          })}
                          available={spotlightItem.available}
                          eagerImage={categoryIndex === 0}
                          unavailableLabel={t("unavailable")}
                        />
                      ) : null}

                      {listItems.length > 0 ? (
                        <div className="menu-items-list">
                          {listItems.map((item) => {
                            const { name, description } = itemView(item);

                            return (
                              <MenuItemRow
                                key={item.id}
                                name={name}
                                description={description}
                                price={priceFormatter.format(item.price)}
                                eagerImage={false}
                                imageUrl={item.imageUrl}
                                imageAlt={t("itemImageAlt", {
                                  itemName: name,
                                })}
                                available={item.available}
                                unavailableLabel={t("unavailable")}
                              />
                            );
                          })}
                        </div>
                      ) : null}
                    </>
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
