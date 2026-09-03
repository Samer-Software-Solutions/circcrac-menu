import { createBrowserClient } from "@supabase/ssr";

import { publicSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    publicSupabaseEnv.url.toString(),
    publicSupabaseEnv.anonKey,
  );
}
