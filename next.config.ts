import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { publicSupabaseEnv } from "./src/lib/supabase/env";

const supabaseProtocol = publicSupabaseEnv.url.protocol.slice(0, -1) as
  | "http"
  | "https";

const nextConfig: NextConfig = {
  experimental: {
    // The storage policy accepts images up to 5 MiB. Server Actions otherwise
    // reject multipart form bodies at 1 MiB before application validation runs.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
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

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
