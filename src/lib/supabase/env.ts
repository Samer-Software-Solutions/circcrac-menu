type PublicSupabaseEnv = {
  anonKey: string;
  url: URL;
};

function readPublicSupabaseEnv(): PublicSupabaseEnv {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl?.trim() || !rawAnonKey?.trim()) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  let url: URL;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.");
  }

  const isLocalHttp =
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  const isBaseUrl =
    (url.pathname === "/" || url.pathname === "") &&
    !url.search &&
    !url.hash &&
    !url.username &&
    !url.password;

  if ((url.protocol !== "https:" && !isLocalHttp) || !isBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be the base HTTPS project URL (local HTTP is also supported).",
    );
  }

  return { anonKey: rawAnonKey.trim(), url };
}

export const publicSupabaseEnv = readPublicSupabaseEnv();
