import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { publicSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const handleI18nRouting = createMiddleware(routing);

type AuthCookie = {
  name: string;
  value: string;
  options: Parameters<NextResponse["cookies"]["set"]>[2];
};

function withAuthMutations(
  response: NextResponse,
  cookiesToSet: AuthCookie[],
  authHeaders: Record<string, string>,
) {
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options);
  }

  for (const [name, value] of Object.entries(authHeaders)) {
    response.headers.set(name, value);
  }

  return response;
}

export async function proxy(request: NextRequest) {
  let cookiesToSet: AuthCookie[] = [];
  let authHeaders: Record<string, string> = {};
  const supabase = createServerClient<Database>(
    publicSupabaseEnv.url.toString(),
    publicSupabaseEnv.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(nextCookies, nextHeaders) {
          // The refreshed values must be available to routes rendered after
          // Proxy as well as written to whichever response is returned below.
          for (const cookie of nextCookies) {
            request.cookies.set(cookie.name, cookie.value);
          }

          cookiesToSet = nextCookies;
          authHeaders = nextHeaders;
        },
      },
    },
  );
  const { data: claimsData } = await supabase.auth.getClaims();
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginRoute = pathname === "/admin/login";
  const createResponse = (response: NextResponse) =>
    withAuthMutations(response, cookiesToSet, authHeaders);

  if (isAdminRoute) {
    if (isAdminLoginRoute && claimsData?.claims) {
      return createResponse(NextResponse.redirect(new URL("/admin", request.url)));
    }

    if (!isAdminLoginRoute && !claimsData?.claims) {
      return createResponse(
        NextResponse.redirect(new URL("/admin/login", request.url)),
      );
    }

    return createResponse(NextResponse.next({ request }));
  }

  const hasSupportedLocalePrefix = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathname !== "/" && !hasSupportedLocalePrefix) {
    return createResponse(NextResponse.next({ request }));
  }

  return createResponse(handleI18nRouting(request));
}

export const config = {
  matcher:
    "/((?!api(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|.*\\..*).*)",
};
