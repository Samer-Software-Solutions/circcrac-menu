import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { createPublicClient } from "@/lib/supabase/public";

export const PUBLIC_MENU_CACHE_TAG = "public-menu";

type PublicMenuSettings = {
  currency: string;
  defaultLanguage: "en" | "ar";
  logoUrl: string | null;
  primaryColor: string | null;
  restaurantNameAr: string;
  restaurantNameEn: string;
};

export type PublicMenuItem = {
  available: boolean;
  descriptionAr: string | null;
  descriptionEn: string | null;
  id: string;
  imageUrl: string | null;
  nameAr: string;
  nameEn: string;
  price: number;
};

export type PublicMenuCategory = {
  id: string;
  items: PublicMenuItem[];
  nameAr: string;
  nameEn: string;
};

export type PublicMenuData = {
  categories: PublicMenuCategory[];
  settings: PublicMenuSettings;
};

export type PublicMenuResult =
  | { data: PublicMenuData; status: "ready" }
  | { status: "error" };

class PublicMenuQueryError extends Error {
  constructor(resource: string, detail: string) {
    super(`Could not load public menu ${resource}: ${detail}`);
    this.name = "PublicMenuQueryError";
  }
}

async function queryPublicMenu(): Promise<PublicMenuData> {
  const supabase = createPublicClient();
  const [settingsResult, categoriesResult] = await Promise.all([
    supabase
      .from("settings")
      .select(
        "currency, default_language, logo_path, primary_color, restaurant_name_ar, restaurant_name_en",
      )
      .limit(1)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, name_ar, name_en, sort_order")
      .eq("enabled", true)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true }),
  ]);

  if (settingsResult.error) {
    throw new PublicMenuQueryError("settings", settingsResult.error.message);
  }

  if (!settingsResult.data) {
    throw new PublicMenuQueryError("settings", "the singleton row is missing");
  }

  if (categoriesResult.error) {
    throw new PublicMenuQueryError(
      "categories",
      categoriesResult.error.message,
    );
  }

  const categories = categoriesResult.data;
  const categoryIds = categories.map((category) => category.id);
  const itemsResult =
    categoryIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from("menu_items")
          .select(
            "available, category_id, description_ar, description_en, id, image_path, name_ar, name_en, price, sort_order",
          )
          .in("category_id", categoryIds)
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });

  if (itemsResult.error) {
    throw new PublicMenuQueryError("items", itemsResult.error.message);
  }

  const publicImageUrl = (path: string | null) =>
    path
      ? supabase.storage.from("menu-images").getPublicUrl(path).data.publicUrl
      : null;

  const itemsByCategory = new Map<string, PublicMenuItem[]>();

  for (const item of itemsResult.data) {
    const categoryItems = itemsByCategory.get(item.category_id) ?? [];
    categoryItems.push({
      available: item.available,
      descriptionAr: item.description_ar,
      descriptionEn: item.description_en,
      id: item.id,
      imageUrl: publicImageUrl(item.image_path),
      nameAr: item.name_ar,
      nameEn: item.name_en,
      price: item.price,
    });
    itemsByCategory.set(item.category_id, categoryItems);
  }

  return {
    settings: {
      currency: settingsResult.data.currency,
      defaultLanguage:
        settingsResult.data.default_language === "ar" ? "ar" : "en",
      logoUrl: publicImageUrl(settingsResult.data.logo_path),
      primaryColor: settingsResult.data.primary_color,
      restaurantNameAr: settingsResult.data.restaurant_name_ar,
      restaurantNameEn: settingsResult.data.restaurant_name_en,
    },
    categories: categories.map((category) => ({
      id: category.id,
      items: itemsByCategory.get(category.id) ?? [],
      nameAr: category.name_ar,
      nameEn: category.name_en,
    })),
  };
}

const getCachedPublicMenu = unstable_cache(
  queryPublicMenu,
  [PUBLIC_MENU_CACHE_TAG],
  {
    // CMS mutations can invalidate this tag immediately; the short lifetime is
    // a fallback for changes made outside the application. Failed reads throw
    // and are not stored in the persistent data cache.
    revalidate: 300,
    tags: [PUBLIC_MENU_CACHE_TAG],
  },
);

// generateMetadata and the page share one result during a render pass. Keeping
// graceful error mapping here lets the next request retry a transient failure.
export const getPublicMenu = cache(
  async (): Promise<PublicMenuResult> => {
    try {
      return { data: await getCachedPublicMenu(), status: "ready" };
    } catch (error) {
      console.error("Failed to load the public menu.", error);
      return { status: "error" };
    }
  },
);
