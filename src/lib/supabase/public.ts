import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const uncachedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

export function createPublicClient() {
  return createClient<Database>(
    publicSupabaseEnv.url.toString(),
    publicSupabaseEnv.anonKey,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      // The tagged data cache owns freshness. Keeping the underlying REST calls
      // uncached avoids a second cache layer surviving a CMS tag invalidation.
      global: { fetch: uncachedFetch },
    },
  );
}
