import type { NextConfig } from "next";

import { publicSupabaseEnv } from "./src/lib/supabase/env";

const supabaseProtocol = publicSupabaseEnv.url.protocol.slice(0, -1) as
  | "http"
  | "https";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: supabaseProtocol,
        hostname: publicSupabaseEnv.url.hostname,
        port: publicSupabaseEnv.url.port,
        pathname: "/storage/v1/object/public/menu-images/**",
        search: "",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
