import type { Locale } from "next-intl";
import Image from "next/image";

import {
  LanguageSwitch,
  type LanguageSwitchLabels,
} from "@/components/language-switch";

type MenuHeroProps = {
  bannerUrl: string | null;
  currentLocale: Locale;
  languageSwitchLabels: LanguageSwitchLabels;
  logoAlt: string;
  logoUrl: string | null;
  monogram: string;
  restaurantName: string;
  subtitle: string | null;
};

export function MenuHero({
  bannerUrl,
  currentLocale,
  languageSwitchLabels,
  logoAlt,
  logoUrl,
  monogram,
  restaurantName,
  subtitle,
}: MenuHeroProps) {
  return (
    <div className="menu-hero-wrap">
      <div className="menu-hero">
        {bannerUrl ? (
          <div className="menu-hero-collage">
            <div className="menu-hero-collage-tile">
              <Image
                src={bannerUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="menu-hero-fallback">
            <span className="menu-hero-fallback-mark" aria-hidden="true">
              {monogram}
            </span>
          </div>
        )}

        <div className="menu-hero-scrim" aria-hidden="true" />

        <div className="menu-hero-lang">
          <LanguageSwitch
            currentLocale={currentLocale}
            {...languageSwitchLabels}
          />
        </div>
      </div>

      <div className="menu-shell">
        <div className="menu-hero-card">
          {logoUrl ? (
            <div className="menu-hero-logo-frame">
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={72}
                height={72}
                sizes="72px"
                className="size-full object-contain"
                priority
              />
            </div>
          ) : (
            <span
              className="menu-hero-logo-frame menu-hero-monogram"
              aria-hidden="true"
            >
              {monogram}
            </span>
          )}

          <div className="menu-hero-card-text">
            <h1 className="menu-hero-name">{restaurantName}</h1>
            {subtitle ? (
              <p className="menu-hero-subtitle">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
