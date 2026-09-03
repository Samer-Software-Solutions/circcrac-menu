import type { Locale } from "next-intl";

import { Link } from "@/i18n/navigation";

type LanguageSwitchProps = {
  currentLocale: Locale;
  label: string;
  accessibleLabel: string;
};

export function LanguageSwitch({
  currentLocale,
  label,
  accessibleLabel,
}: LanguageSwitchProps) {
  const targetLocale: Locale = currentLocale === "en" ? "ar" : "en";

  return (
    <Link
      href="/"
      locale={targetLocale}
      lang={targetLocale}
      dir={targetLocale === "ar" ? "rtl" : "ltr"}
      aria-label={accessibleLabel}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-900/10 bg-white/80 px-4 text-sm font-semibold text-stone-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
    >
      {label}
    </Link>
  );
}
