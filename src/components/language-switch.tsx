"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Check, Globe } from "lucide-react";
import type { Locale } from "next-intl";

import { Link } from "@/i18n/navigation";

const SCROLL_RESTORE_KEY = "menu-scroll-category";
const STICKY_NAV_OFFSET = 130;

export type LanguageSwitchLabels = {
  languageMenuLabel: string;
  englishLanguageName: string;
  arabicLanguageName: string;
  viewMenuInEnglishLabel: string;
  viewMenuInArabicLabel: string;
};

type LanguageSwitchProps = LanguageSwitchLabels & {
  currentLocale: Locale;
};

function getCurrentCategoryId(): string | null {
  const sections = document.querySelectorAll<HTMLElement>('[id^="category-"]');
  let activeId: string | null = null;

  for (const section of sections) {
    if (section.getBoundingClientRect().top - STICKY_NAV_OFFSET <= 0) {
      activeId = section.id;
    } else {
      break;
    }
  }

  return activeId ?? sections[0]?.id ?? null;
}

function rememberScrollPosition() {
  try {
    const activeCategoryId = getCurrentCategoryId();
    if (activeCategoryId) {
      sessionStorage.setItem(SCROLL_RESTORE_KEY, activeCategoryId);
    } else {
      sessionStorage.removeItem(SCROLL_RESTORE_KEY);
    }
  } catch {
    // Storage can be unavailable (private browsing); losing the
    // scroll position on switch is an acceptable fallback.
  }
}

export function LanguageSwitch({
  currentLocale,
  languageMenuLabel,
  englishLanguageName,
  arabicLanguageName,
  viewMenuInEnglishLabel,
  viewMenuInArabicLabel,
}: LanguageSwitchProps) {
  const languages: Array<{
    locale: Locale;
    flag: string;
    name: string;
    ariaLabel: string;
  }> = [
    {
      locale: "en",
      flag: "🇬🇧",
      name: englishLanguageName,
      ariaLabel: viewMenuInEnglishLabel,
    },
    {
      locale: "ar",
      flag: "🇶🇦",
      name: arabicLanguageName,
      ariaLabel: viewMenuInArabicLabel,
    },
  ];

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        aria-label={languageMenuLabel}
        className="inline-flex size-11 flex-none items-center justify-center rounded-full border border-stone-900/10 bg-white/85 text-stone-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 data-[popup-open]:bg-white data-[popup-open]:text-stone-900"
      >
        <Globe className="size-5" aria-hidden="true" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 outline-none"
        >
          <PopoverPrimitive.Popup className="w-48 overflow-hidden rounded-2xl border border-stone-900/10 bg-white p-1.5 shadow-xl shadow-stone-950/15 outline-none transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
            {languages.map((language) => {
              const isActive = language.locale === currentLocale;

              return (
                <Link
                  key={language.locale}
                  href="/"
                  locale={language.locale}
                  lang={language.locale}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={language.ariaLabel}
                  onClick={rememberScrollPosition}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-start text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-stone-100 text-stone-900"
                      : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">
                    {language.flag}
                  </span>
                  <span className="flex-1">{language.name}</span>
                  {isActive ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : null}
                </Link>
              );
            })}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
