import "server-only";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export type AdminSettings = {
  bannerPath: string | null;
  bannerUrl: string | null;
  currency: string;
  defaultLanguage: "en" | "ar";
  id: string;
  logoPath: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  restaurantNameAr: string;
  restaurantNameEn: string;
  taglineAr: string | null;
  taglineEn: string | null;
  updatedAt: string;
};

export type AdminSettingsResult =
  | { settings: AdminSettings; status: "ready" }
  | { status: "error" | "missing" };

/** The singleton read repeats authorization so it stays safe when reused. */
export async function getAdminSettings(): Promise<AdminSettingsResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select(
      "banner_path, currency, default_language, id, logo_path, primary_color, restaurant_name_ar, restaurant_name_en, tagline_ar, tagline_en, updated_at",
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load CMS restaurant settings.", error);
    return { status: "error" };
  }
  if (!data) {
    return { status: "missing" };
  }

  return {
    settings: {
      bannerPath: data.banner_path,
      bannerUrl: data.banner_path
        ? supabase.storage.from("menu-images").getPublicUrl(data.banner_path)
            .data.publicUrl
        : null,
      currency: data.currency,
      defaultLanguage: data.default_language === "ar" ? "ar" : "en",
      id: data.id,
      logoPath: data.logo_path,
      logoUrl: data.logo_path
        ? supabase.storage.from("menu-images").getPublicUrl(data.logo_path)
            .data.publicUrl
        : null,
      primaryColor: data.primary_color,
      restaurantNameAr: data.restaurant_name_ar,
      restaurantNameEn: data.restaurant_name_en,
      taglineAr: data.tagline_ar,
      taglineEn: data.tagline_en,
      updatedAt: data.updated_at,
    },
    status: "ready",
  };
}
