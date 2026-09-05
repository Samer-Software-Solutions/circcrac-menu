import "server-only";

import type { CornerDotType, CornerSquareType, DotType } from "qr-code-styling";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

const dotTypes: readonly DotType[] = [
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "square",
  "extra-rounded",
];
const cornerTypes: readonly (CornerSquareType & CornerDotType)[] = [
  "dot",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "square",
  "extra-rounded",
];

function asDotType(value: string): DotType {
  return (dotTypes as readonly string[]).includes(value) ? (value as DotType) : "square";
}

function asCornerType(value: string): CornerSquareType & CornerDotType {
  return (cornerTypes as readonly string[]).includes(value)
    ? (value as CornerSquareType & CornerDotType)
    : "square";
}

export type AdminSettings = {
  bannerPath: string | null;
  bannerUrl: string | null;
  currency: string;
  defaultLanguage: "en" | "ar";
  id: string;
  logoPath: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  qrBackgroundColor: string;
  qrCornerDotType: CornerDotType;
  qrCornerSquareType: CornerSquareType;
  qrDotColor: string;
  qrDotType: DotType;
  qrLogoPath: string | null;
  qrLogoSize: number;
  qrLogoUrl: string | null;
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
      "banner_path, currency, default_language, id, logo_path, primary_color, qr_background_color, qr_corner_dot_type, qr_corner_square_type, qr_dot_color, qr_dot_type, qr_logo_path, qr_logo_size, restaurant_name_ar, restaurant_name_en, tagline_ar, tagline_en, updated_at",
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
      qrBackgroundColor: data.qr_background_color,
      qrCornerDotType: asCornerType(data.qr_corner_dot_type),
      qrCornerSquareType: asCornerType(data.qr_corner_square_type),
      qrDotColor: data.qr_dot_color,
      qrDotType: asDotType(data.qr_dot_type),
      qrLogoPath: data.qr_logo_path,
      qrLogoSize: data.qr_logo_size,
      qrLogoUrl: data.qr_logo_path
        ? supabase.storage.from("menu-images").getPublicUrl(data.qr_logo_path)
            .data.publicUrl
        : null,
      restaurantNameAr: data.restaurant_name_ar,
      restaurantNameEn: data.restaurant_name_en,
      taglineAr: data.tagline_ar,
      taglineEn: data.tagline_en,
      updatedAt: data.updated_at,
    },
    status: "ready",
  };
}
