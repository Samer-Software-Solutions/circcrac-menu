import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSupportedLocalePrefix = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathname !== "/" && !hasSupportedLocalePrefix) {
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher:
    "/((?!admin(?:/|$)|api(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|.*\\..*).*)",
};
