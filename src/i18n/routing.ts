import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
  },
});
