import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "./routing";

const messageLoaders = {
  en: () => import("../../messages/en.json").then((module) => module.default),
  ar: () => import("../../messages/ar.json").then((module) => module.default),
};

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const routeLocale = await rootParams.locale();

    if (!hasLocale(routing.locales, routeLocale)) {
      notFound();
    }

    locale = routeLocale;
  }

  return {
    locale,
    messages: await messageLoaders[locale](),
  };
});
