import "server-only";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export type AdminMenuCategory = {
  id: string;
  nameAr: string;
  nameEn: string;
};

export type AdminMenuItem = {
  available: boolean;
  categoryId: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  id: string;
  imagePath: string | null;
  imageUrl: string | null;
  nameAr: string;
  nameEn: string;
  price: number;
  sortOrder: number;
};

export type AdminMenuItemsResult =
  | { categories: AdminMenuCategory[]; items: AdminMenuItem[]; status: "ready" }
  | { status: "error" };

/** Repeats authorization so this protected query remains safe when reused. */
export async function getAdminMenuItems(): Promise<AdminMenuItemsResult> {
  await requireAdmin();

  const supabase = await createClient();
  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name_ar, name_en")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true }),
    supabase
      .from("menu_items")
      .select(
        "available, category_id, description_ar, description_en, id, image_path, name_ar, name_en, price, sort_order",
      )
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true }),
  ]);

  if (categoriesResult.error || itemsResult.error) {
    console.error(
      "Failed to load CMS menu items.",
      categoriesResult.error ?? itemsResult.error,
    );
    return { status: "error" };
  }

  return {
    categories: categoriesResult.data.map((category) => ({
      id: category.id,
      nameAr: category.name_ar,
      nameEn: category.name_en,
    })),
    items: itemsResult.data.map((item) => ({
      available: item.available,
      categoryId: item.category_id,
      descriptionAr: item.description_ar,
      descriptionEn: item.description_en,
      id: item.id,
      imagePath: item.image_path,
      imageUrl: item.image_path
        ? supabase.storage.from("menu-images").getPublicUrl(item.image_path)
            .data.publicUrl
        : null,
      nameAr: item.name_ar,
      nameEn: item.name_en,
      price: item.price,
      sortOrder: item.sort_order,
    })),
    status: "ready",
  };
}
